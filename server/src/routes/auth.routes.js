import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { z } from 'zod';
import { OAuth2Client } from 'google-auth-library';
import prisma from '../utils/prisma.js';
import { createTokens, requireAuth } from '../middlewares/auth.js';

const router = Router();

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters long.')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must include at least one uppercase letter, one lowercase letter, and one number.');

const credentials = z.object({ email: z.string().email(), password: passwordSchema });

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

const setRefreshCookie = (res, token) => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
};

const publicUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  avatarUrl: user.avatarUrl,
  teacher: user.teacher,
  counselor: user.counselor,
});

router.post('/register', async (req, res, next) => {
  try {
    const data = credentials.extend({ name: z.string().min(2).max(120) }).parse(req.body);
    if (await prisma.user.findUnique({ where: { email: data.email } })) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(data.password, 12);
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash,
        teacher: { create: {} },
      },
      include: { teacher: true },
    });
    const tokens = createTokens(user);
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: hashToken(tokens.refreshToken) },
    });
    setRefreshCookie(res, tokens.refreshToken);
    res.status(201).json({ user: publicUser(user), ...tokens });
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = credentials.parse(req.body);
    const user = await prisma.user.findUnique({
      where: { email },
      include: { teacher: true, counselor: true },
    });
    if (!user?.passwordHash || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const tokens = createTokens(user);
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: hashToken(tokens.refreshToken) },
    });
    setRefreshCookie(res, tokens.refreshToken);
    res.json({ user: publicUser(user), ...tokens });
  } catch (error) {
    next(error);
  }
});

router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.auth.sub },
      include: { teacher: true, counselor: true },
    });
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json({ user: publicUser(user) });
  } catch (error) {
    next(error);
  }
});

router.patch('/me', requireAuth, async (req, res, next) => {
  try {
    const data = z
      .object({ name: z.string().min(2).max(120).optional(), email: z.string().email().optional() })
      .refine((value) => value.name || value.email, { message: 'Provide a name or email to update.' })
      .parse(req.body);
    const user = await prisma.user.update({
      where: { id: req.auth.sub },
      data,
      include: { teacher: true, counselor: true },
    });
    res.json({ user: publicUser(user) });
  } catch (error) {
    next(error);
  }
});

router.post('/refresh', async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
    if (!refreshToken) return res.status(401).json({ message: 'Refresh token required.' });

    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const hashed = hashToken(refreshToken);

    const user = await prisma.user.findFirst({
      where: { id: payload.sub, refreshToken: hashed },
      include: { teacher: true, counselor: true },
    });
    if (!user) return res.status(401).json({ message: 'Invalid refresh token.' });

    const tokens = createTokens(user);
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: hashToken(tokens.refreshToken) },
    });
    setRefreshCookie(res, tokens.refreshToken);
    res.json({ user: publicUser(user), ...tokens });
  } catch (error) {
    res.status(401).json({ message: 'Invalid refresh token.' });
  }
});

router.post('/logout', requireAuth, async (req, res, next) => {
  try {
    await prisma.user.update({
      where: { id: req.auth.sub },
      data: { refreshToken: null },
    });
    res.clearCookie('refreshToken');
    res.json({ message: 'Logged out successfully.' });
  } catch (error) {
    next(error);
  }
});

router.post('/google', async (req, res, next) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ message: 'Google credential is required.' });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload?.email || !payload?.sub) {
      return res.status(400).json({ message: 'Invalid Google token.' });
    }

    const { email, name, sub: googleId, picture } = payload;

    let user = await prisma.user.findUnique({
      where: { email },
      include: { teacher: true, counselor: true },
    });

    if (user) {
      if (!user.googleId) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { googleId, avatarUrl: user.avatarUrl || picture },
          include: { teacher: true, counselor: true },
        });
      }
    } else {
      user = await prisma.user.create({
        data: {
          name: name || email.split('@')[0],
          email,
          googleId,
          avatarUrl: picture,
          teacher: { create: {} },
        },
        include: { teacher: true },
      });
    }

    const tokens = createTokens(user);
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: hashToken(tokens.refreshToken) },
    });
    setRefreshCookie(res, tokens.refreshToken);
    res.json({ user: publicUser(user), ...tokens });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(401).json({ message: 'Google authentication failed.' });
  }
});

export default router;