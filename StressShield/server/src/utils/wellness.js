import prisma from './prisma.js';
import { predictBurnoutRisk } from './ml.js';

export async function recalculateTeacherMetrics(userId) {
  const teacher = await prisma.teacher.findUnique({ where: { userId } });
  if (!teacher) return null;

  const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

  const [moods, journals] = await Promise.all([
    prisma.moodEntry.findMany({
      where: { userId, createdAt: { gte: fourteenDaysAgo } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.journal.findMany({
      where: { userId, createdAt: { gte: fourteenDaysAgo } },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  // Mood Score Calculation (Scale 1 to 5)
  let avgMoodScore = 3.0;
  let lowMoodCount = 0;
  if (moods.length > 0) {
    const sum = moods.reduce((acc, m) => {
      if (m.score <= 2) lowMoodCount += 1;
      return acc + m.score;
    }, 0);
    avgMoodScore = sum / moods.length;
  }
  const moodWellnessPercent = ((avgMoodScore - 1) / 4) * 100;

  // Journal Stress Calculation (Scale 0 to 100)
  let avgJournalStress = 30;
  if (journals.length > 0) {
    const journalStressSum = journals.reduce((acc, j) => acc + (j.stressScore ?? 35), 0);
    avgJournalStress = journalStressSum / journals.length;
  }

  // Combined Metrics Formula
  const wellnessScore = Math.min(100, Math.max(0, Math.round(moodWellnessPercent * 0.65 + (100 - avgJournalStress) * 0.35)));
  const stressScore = Math.min(100, Math.max(0, Math.round((100 - moodWellnessPercent) * 0.5 + avgJournalStress * 0.5)));

  // ML-enhanced burnout risk: blend formula-based with ML predictor
  const formulaBurnout = Math.min(100, Math.max(0, Math.round(stressScore * 0.55 + Math.min(45, lowMoodCount * 12))));

  let burnoutRisk = formulaBurnout;
  if (moods.length >= 3) {
    const mlBurnout = predictBurnoutRisk({ moods: [...moods].reverse(), journals: [...journals].reverse(), teacher });
    // Blend: 40% formula, 60% ML predictor (ML has more signals)
    burnoutRisk = Math.min(100, Math.max(0, Math.round(formulaBurnout * 0.4 + mlBurnout.burnoutProbability * 0.6)));
  }

  const updatedTeacher = await prisma.teacher.update({
    where: { id: teacher.id },
    data: {
      wellnessScore,
      stressScore,
      burnoutRisk,
    },
  });

  return updatedTeacher;
}
