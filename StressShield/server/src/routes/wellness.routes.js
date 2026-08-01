import { Router } from 'express';
import { z } from 'zod';
import prisma from '../utils/prisma.js';
import { requireAuth } from '../middlewares/auth.js';
const router = Router();
router.use(requireAuth);
router.get('/overview', async (req, res, next) => {
  try {
    const [teacher, moods, journals, appointments] = await Promise.all([
      prisma.teacher.findUnique({ where: { userId: req.auth.sub } }),
      prisma.moodEntry.findMany({
        where: { userId: req.auth.sub },
        orderBy: { createdAt: 'desc' },
        take: 7,
      }),
      prisma.journal.findMany({
        where: { userId: req.auth.sub },
        orderBy: { createdAt: 'desc' },
        take: 3,
      }),
      prisma.appointment.findMany({
        where: { teacher: { userId: req.auth.sub }, scheduledAt: { gte: new Date() } },
        include: { counselor: { include: { user: true } } },
        take: 3,
        orderBy: { scheduledAt: 'asc' },
      }),
    ]);
    res.json({ teacher, moods, journals, appointments });
  } catch (e) {
    next(e);
  }
});
router.get('/moods', async (req, res, next) => {
  try {
    res.json(
      await prisma.moodEntry.findMany({
        where: { userId: req.auth.sub },
        orderBy: { createdAt: 'asc' },
        take: 90,
      })
    );
  } catch (e) {
    next(e);
  }
});
router.post('/moods', async (req, res, next) => {
  try {
    const data = z
      .object({
        mood: z.enum(['TERRIBLE', 'LOW', 'NEUTRAL', 'GOOD', 'GREAT']),
        score: z.number().int().min(1).max(5),
        note: z.string().max(500).optional(),
      })
      .parse(req.body);
    const item = await prisma.moodEntry.create({ data: { ...data, userId: req.auth.sub } });
    res.status(201).json(item);
  } catch (e) {
    next(e);
  }
});
router.get('/journals', async (req, res, next) => {
  try {
    res.json(
      await prisma.journal.findMany({
        where: { userId: req.auth.sub },
        orderBy: { createdAt: 'desc' },
      })
    );
  } catch (e) {
    next(e);
  }
});
router.post('/journals', async (req, res, next) => {
  try {
    const data = z
      .object({ title: z.string().min(1).max(120), content: z.string().min(1).max(10000) })
      .parse(req.body);
    const sentiment = /overwhelmed|anxious|tired|stress/i.test(data.content)
      ? 'Reflective'
      : 'Positive';
    const item = await prisma.journal.create({
      data: {
        ...data,
        userId: req.auth.sub,
        sentiment,
        emotions: sentiment === 'Reflective' ? ['stressed', 'thoughtful'] : ['calm'],
        stressScore: sentiment === 'Reflective' ? 62 : 28,
        aiSuggestion:
          sentiment === 'Reflective'
            ? 'Try protecting one 15-minute transition break tomorrow.'
            : 'Keep making time for the habits that are helping.',
      },
    });
    res.status(201).json(item);
  } catch (e) {
    next(e);
  }
});
export default router;
