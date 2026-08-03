import { Router } from 'express';
import pkg from '@prisma/client';
const { AppointmentStatus } = pkg;
import { z } from 'zod';
import prisma from '../utils/prisma.js';
import { requireAuth, requireRole } from '../middlewares/auth.js';

const router = Router();
router.use(requireAuth);

router.get('/counselors', async (req, res, next) => {
  try {
    res.json(
      await prisma.counselor.findMany({
        include: { user: { select: { name: true, avatarUrl: true } } },
      })
    );
  } catch (error) {
    next(error);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const teacher = await prisma.teacher.findUnique({ where: { userId: req.auth.sub } });
    if (!teacher) return res.json([]);
    res.json(
      await prisma.appointment.findMany({
        where: { teacherId: teacher.id },
        include: { counselor: { include: { user: true } } },
        orderBy: { scheduledAt: 'desc' },
      })
    );
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const data = z
      .object({
        counselorId: z.string().min(1),
        scheduledAt: z.string().datetime(),
        note: z.string().max(500).optional(),
      })
      .parse(req.body);
    const scheduledAt = new Date(data.scheduledAt);
    if (scheduledAt <= new Date()) {
      return res.status(400).json({ message: 'Appointments must be scheduled in the future.' });
    }

    const [teacher, counselor] = await Promise.all([
      prisma.teacher.findUnique({ where: { userId: req.auth.sub } }),
      prisma.counselor.findUnique({ where: { id: data.counselorId } }),
    ]);
    if (!teacher) return res.status(403).json({ message: 'Teacher profile required.' });
    if (!counselor) return res.status(404).json({ message: 'Counselor not found.' });

    const item = await prisma.appointment.create({
      data: { teacherId: teacher.id, counselorId: counselor.id, scheduledAt, note: data.note },
      include: { counselor: { include: { user: true } } },
    });
    res.status(201).json(item);
  } catch (error) {
    next(error);
  }
});

router.patch('/:id', requireRole('ADMIN'), async (req, res, next) => {
  try {
    const data = z
      .object({
        status: z.nativeEnum(AppointmentStatus).optional(),
        scheduledAt: z.string().datetime().optional(),
      })
      .refine((value) => value.status || value.scheduledAt, { message: 'Provide an appointment update.' })
      .parse(req.body);
    if (data.scheduledAt && new Date(data.scheduledAt) <= new Date()) {
      return res.status(400).json({ message: 'Appointments must be scheduled in the future.' });
    }

    const item = await prisma.appointment.update({
      where: { id: req.params.id },
      data: { status: data.status, scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : undefined },
    });
    res.json(item);
  } catch (error) {
    next(error);
  }
});

export default router;