import { PrismaClient, Role, Mood } from '@prisma/client';
import bcrypt from 'bcryptjs';
const prisma = new PrismaClient();
async function main() {
  const passwordHash = await bcrypt.hash('Welcome123!', 12);
  const department = await prisma.department.upsert({
    where: { name: 'Science' },
    update: {},
    create: { name: 'Science' },
  });
  const teacher = await prisma.user.upsert({
    where: { email: 'teacher@stressshield.app' },
    update: {},
    create: {
      name: 'Ava Williams',
      email: 'teacher@stressshield.app',
      passwordHash,
      role: Role.TEACHER,
      teacher: {
        create: {
          departmentId: department.id,
          wellnessScore: 78,
          stressScore: 34,
          burnoutRisk: 18,
        },
      },
    },
  });
  await prisma.user.upsert({
    where: { email: 'admin@stressshield.app' },
    update: {},
    create: {
      name: 'Jordan Lee',
      email: 'admin@stressshield.app',
      passwordHash,
      role: Role.ADMIN,
      admin: { create: {} },
    },
  });
  await prisma.user.upsert({
    where: { email: 'counselor@stressshield.app' },
    update: {},
    create: {
      name: 'Dr. Maya Patel',
      email: 'counselor@stressshield.app',
      passwordHash,
      role: Role.COUNSELOR,
      counselor: {
        create: {
          specialty: 'Teacher burnout & anxiety',
          bio: 'A compassionate counselor focused on sustainable educator wellbeing.',
        },
      },
    },
  });
  const existing = await prisma.moodEntry.count({ where: { userId: teacher.id } });
  if (!existing)
    await prisma.moodEntry.createMany({
      data: [0, 1, 2, 3, 4, 5, 6].map((days, i) => ({
        userId: teacher.id,
        mood: [Mood.GOOD, Mood.NEUTRAL, Mood.GREAT, Mood.LOW, Mood.GOOD, Mood.NEUTRAL, Mood.GREAT][
          i
        ],
        score: [4, 3, 5, 2, 4, 3, 5][i],
        createdAt: new Date(Date.now() - (6 - days) * 86400000),
      })),
    });
}
main().finally(() => prisma.$disconnect());
