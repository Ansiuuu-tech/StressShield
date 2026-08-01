import { Router } from 'express';
import prisma from '../utils/prisma.js';
import { requireAuth, requireRole } from '../middlewares/auth.js';
const router = Router();
router.use(requireAuth, requireRole('ADMIN'));
router.get('/analytics', async (req, res, next) => {
  try {
    const [teachers, appointments, moods] = await Promise.all([
      prisma.teacher.count(),
      prisma.appointment.count(),
      prisma.moodEntry.findMany({
        select: { score: true, createdAt: true },
        take: 90,
        orderBy: { createdAt: 'asc' },
      }),
    ]);
    const highRisk = await prisma.teacher.count({ where: { burnoutRisk: { gte: 60 } } });
    const wellness = await prisma.teacher.aggregate({ _avg: { wellnessScore: true } });
    res.json({
      teachers,
      appointments,
      highRisk,
      averageWellness: Math.round(wellness._avg.wellnessScore || 0),
      moods,
    });
  } catch (e) {
    next(e);
  }
});
export default router;
