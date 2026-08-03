import { Router } from 'express';
import { z } from 'zod';
import Groq from 'groq-sdk';
import prisma from '../utils/prisma.js';
import { requireAuth } from '../middlewares/auth.js';
import { recalculateTeacherMetrics } from '../utils/wellness.js';
import { analyzeSentiment, predictMoodTrend, detectPatterns, predictBurnoutRisk, runFullMlAnalysis } from '../utils/ml.js';
import { runLocalMoodAnalysis } from '../utils/moodAnalysis.js';
import { runLocalJournalAnalysis } from '../utils/journalAnalysis.js';

const router = Router();
router.use(requireAuth);

// ─── GROQ CLIENT ─────────────────────────────────────────────────────────────
const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;
const GROQ_MODEL = 'openai/gpt-oss-120b';

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
        take: 5,
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

// ─── ML INSIGHTS ENDPOINT ───────────────────────────────────────────────────────
router.get('/moods/ml-insights', async (req, res, next) => {
  try {
    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

    const [moods, journals, teacher] = await Promise.all([
      prisma.moodEntry.findMany({
        where: { userId: req.auth.sub, createdAt: { gte: fourteenDaysAgo } },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.journal.findMany({
        where: { userId: req.auth.sub, createdAt: { gte: fourteenDaysAgo } },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.teacher.findUnique({ where: { userId: req.auth.sub } }),
    ]);

    if (moods.length < 3) {
      return res.json({
        available: false,
        message: 'Need at least 3 mood check-ins for ML analysis. Keep checking in!',
        checkInsNeeded: 3 - moods.length,
      });
    }

    const mlInsights = runFullMlAnalysis({
      note: moods[moods.length - 1]?.note || '',
      score: moods[moods.length - 1]?.score || 3,
      mood: moods[moods.length - 1]?.mood || 'NEUTRAL',
      history: moods,
      journals,
      teacher,
    });

    res.json({
      available: true,
      ...mlInsights,
      dataPoints: { moods: moods.length, journals: journals.length },
    });
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

    // ── ML Analysis: Sentiment on the note text ──
    const sentiment = analyzeSentiment(data.note || '');

    // ── ML Analysis: Fetch history for trend + pattern + burnout ──
    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    const [moodHistory, journals, teacher] = await Promise.all([
      prisma.moodEntry.findMany({
        where: { userId: req.auth.sub, createdAt: { gte: fourteenDaysAgo } },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.journal.findMany({
        where: { userId: req.auth.sub, createdAt: { gte: fourteenDaysAgo } },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.teacher.findUnique({ where: { userId: req.auth.sub } }),
    ]);

    // Add current entry to history for prediction
    const fullHistory = [...moodHistory, { score: data.score, mood: data.mood, createdAt: new Date() }];

    const trend = predictMoodTrend(fullHistory);
    const patterns = detectPatterns(fullHistory);
    const burnout = predictBurnoutRisk({ moods: fullHistory, journals, teacher });

    // AI Micro-Analysis for Mood Check-in (runs before saving to persist insights)
    // Default: deterministic ML-driven analysis (works without a Groq key)
    const localMood = runLocalMoodAnalysis({
      mood: data.mood,
      score: data.score,
      note: data.note || '',
      sentiment,
      trend,
      patterns,
      burnout,
    });
    let aiInsight = localMood.aiInsight;
    let primaryTrigger = localMood.primaryTrigger;
    let recommendedAction = localMood.recommendedAction;
    let aiDetectedMood = localMood.aiDetectedMood;

    if (groq) {
      try {
        const mlContext = `
ML Analysis Context:
- Sentiment Score: ${sentiment.sentimentScore} (${sentiment.emotionalValence})
- Detected Keywords: ${sentiment.keywords.join(', ') || 'none'}
- Emotional Intensity: ${sentiment.emotionalIntensity}/100
- Mood Trend: ${trend.trendDirection} (predicted next: ${trend.predictedMood})
- Volatility: ${trend.volatilityScore}/100
- Burnout Risk: ${burnout.burnoutProbability}% (${burnout.riskLevel})
- Current Streak: ${patterns.currentStreak.type} (${patterns.currentStreak.length} days)
- Best Day: ${patterns.bestDay || 'unknown'} | Worst Day: ${patterns.worstDay || 'unknown'}`;

        const prompt = `Analyze this teacher mood check-in using the ML analysis context below. Return ONLY a valid JSON object matching this schema:
{
  "aiInsight": "one gentle, validating 1-sentence observation that acknowledges their specific situation AND references one ML insight naturally (e.g., mention the trend, pattern, or burnout risk in a human way)",
  "primaryTrigger": "Classroom Dynamics" | "Workload & Grading" | "Physical Fatigue" | "Emotional Recovery" | "General Wellbeing",
  "recommendedAction": "RESET" | "JOURNAL" | "UNWIND",
  "aiDetectedMood": "a nuanced mood word beyond the selected option, inferred from both the selected mood AND the note text AND the ML sentiment (e.g., 'anxiously rushed', 'quietly proud', 'drained but hopeful', 'frazzled', 'calmly satisfied')"
}

Mood Selected: ${data.mood} (Score: ${data.score}/5)
Note: ${data.note || 'None provided'}
${mlContext}`;

        const completion = await groq.chat.completions.create({
          model: GROQ_MODEL,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.8,
          max_tokens: 300,
          response_format: { type: 'json_object' },
        });

        const rawText = completion.choices[0].message.content;
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed.aiInsight) aiInsight = String(parsed.aiInsight);
          if (parsed.primaryTrigger) primaryTrigger = String(parsed.primaryTrigger);
          if (parsed.recommendedAction) recommendedAction = String(parsed.recommendedAction).toUpperCase();
          if (parsed.aiDetectedMood) aiDetectedMood = String(parsed.aiDetectedMood);
        }
      } catch (err) {
        console.error('Groq mood check-in fallback:', err.message);
      }
    }

    // Persist the mood entry WITH AI + ML analysis fields
    const item = await prisma.moodEntry.create({
      data: {
        ...data,
        userId: req.auth.sub,
        aiInsight,
        primaryTrigger,
        recommendedAction,
        aiDetectedMood,
        // ML fields
        sentimentScore: sentiment.sentimentScore,
        emotionalIntensity: sentiment.emotionalIntensity,
        predictedNextMood: trend.predictedMood,
        trendDirection: trend.trendDirection,
        burnoutProbability: burnout.burnoutProbability,
      },
    });

    // Recalculate metrics in background
    await recalculateTeacherMetrics(req.auth.sub);

    // Return the mood entry + full ML insights to the frontend
    res.status(201).json({
      ...item,
      mlInsights: {
        sentiment,
        trend,
        patterns,
        burnout,
      },
    });
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

    // Default: deterministic ML-driven analysis (works without a Groq key)
    const localJournal = runLocalJournalAnalysis(data);
    let sentiment = localJournal.sentiment;
    let emotions = localJournal.emotions;
    let stressScore = localJournal.stressScore;
    let aiSuggestion = localJournal.aiSuggestion;
    let permaPillar = localJournal.permaPillar;
    let emotionalExhaustionLevel = localJournal.emotionalExhaustionLevel;

    // Groq Science-Backed Journal Analysis (MBI & PERMA)
    if (groq) {
      try {
        const prompt = `Analyze this teacher journal entry using evidence-based teacher wellbeing frameworks (Maslach Burnout Inventory & PERMA model).
Return ONLY a valid JSON object matching:
{
  "sentiment": "Positive" | "Reflective" | "Stressed" | "Encouraging",
  "emotions": ["emotion1", "emotion2", "emotion3"],
  "stressScore": number (0 to 100),
  "aiSuggestion": "one empathetic 1-sentence actionable suggestion",
  "permaPillar": "Positive Emotion" | "Engagement" | "Relationships" | "Meaning" | "Accomplishment",
  "emotionalExhaustionLevel": "Low" | "Moderate" | "High"
}

Title: ${data.title}
Content: ${data.content}`;

        const completion = await groq.chat.completions.create({
          model: GROQ_MODEL,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.8,
          max_tokens: 350,
          response_format: { type: 'json_object' },
        });

        const rawText = completion.choices[0].message.content;
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed.sentiment) sentiment = String(parsed.sentiment);
          if (Array.isArray(parsed.emotions)) emotions = parsed.emotions.map(String).slice(0, 5);
          if (typeof parsed.stressScore === 'number') stressScore = Math.min(100, Math.max(0, Math.round(parsed.stressScore)));
          if (parsed.aiSuggestion) aiSuggestion = String(parsed.aiSuggestion);
          if (parsed.permaPillar) permaPillar = String(parsed.permaPillar);
          if (parsed.emotionalExhaustionLevel) emotionalExhaustionLevel = String(parsed.emotionalExhaustionLevel);
        }
      } catch (groqError) {
        console.error('Groq journal analysis fallback used:', groqError.message);
      }
    }

    const item = await prisma.journal.create({
      data: {
        ...data,
        userId: req.auth.sub,
        sentiment,
        emotions,
        stressScore,
        aiSuggestion,
        permaPillar,
        emotionalExhaustionLevel,
      },
    });

    await recalculateTeacherMetrics(req.auth.sub);

    res.status(201).json(item);
  } catch (e) {
    next(e);
  }
});

export default router;