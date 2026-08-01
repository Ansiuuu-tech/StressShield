import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import prisma from '../utils/prisma.js';
import { createTokens, requireAuth } from '../middlewares/auth.js';

const router = Router();
const credentials = z.object({ email: z.string().email(), password: z.string().min(8) });
const publicUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  avatarUrl: user.avatarUrl,
  teacher: user.teacher,
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
    await prisma.user.update({ where: { id: user.id }, data: { refreshToken: tokens.refreshToken } });
    res.status(201).json({ user: publicUser(user), ...tokens });
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = credentials.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email }, include: { teacher: true } });
    if (!user?.passwordHash || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const tokens = createTokens(user);
    await prisma.user.update({ where: { id: user.id }, data: { refreshToken: tokens.refreshToken } });
    res.json({ user: publicUser(user), ...tokens });
  } catch (error) {
    next(error);
  }
});

router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.auth.sub },
      include: { teacher: true },
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
      include: { teacher: true },
    });
    res.json({ user: publicUser(user) });
  } catch (error) {
    next(error);
  }
});

router.post('/refresh', async (req, res, next) => {
  try {
    const refreshToken = z.string().min(1).parse(req.body.refreshToken);
    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await prisma.user.findFirst({
      where: { id: payload.sub, refreshToken },
      include: { teacher: true },
    });
    if (!user) return res.status(401).json({ message: 'Invalid refresh token.' });

    const tokens = createTokens(user);
    await prisma.user.update({ where: { id: user.id }, data: { refreshToken: tokens.refreshToken } });
    res.json({ user: publicUser(user), ...tokens });
  } catch (error) {
    res.status(401).json({ message: 'Invalid refresh token.' });
  }
});

export default router;