import { Router } from 'express';
import Groq from 'groq-sdk';
import prisma from '../utils/prisma.js';
import { requireAuth } from '../middlewares/auth.js';
import { runFullMlAnalysis } from '../utils/ml.js';
import { localAssistant } from '../utils/assistant.js';

const router = Router();
router.use(requireAuth);

// ─── GROQ CLIENT ─────────────────────────────────────────────────────────────
const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;
const GROQ_MODEL = 'openai/gpt-oss-120b';

// ─── CRISIS DETECTION KEYWORDS ──────────────────────────────────────────────────
const CRISIS_KEYWORDS = [
  'suicide', 'suicidal', 'kill myself', 'end my life', 'want to die',
  'self-harm', 'self harm', 'hurt myself', 'cutting', 'no reason to live',
  'hopeless', 'give up on everything', "can't go on", "can't take it anymore",
];

function detectCrisis(text) {
  const lower = (text || '').toLowerCase();
  return CRISIS_KEYWORDS.some((kw) => lower.includes(kw));
}

const CRISIS_RESPONSE = `I hear you, and I want you to know that what you're feeling matters deeply. You are not alone in this.

**If you are in immediate danger, please reach out right now:**
- 🆘 **988 Suicide & Crisis Lifeline**: Call or text **988** (US)
- 📱 **Crisis Text Line**: Text **HOME** to **741741**
- 🌍 **International Association for Suicide Prevention**: https://www.iasp.info/resources/Crisis_Centres/

You deserve support from someone trained to help. Please reach out — a real person is waiting to listen. I'm here too, whenever you're ready to talk.

[ACTION:BOOKING]`;

// ─── FALLBACK RESPONSE ──────────────────────────────────────────────────────────
const fallback = () =>
  `It makes sense that this feels heavy. From what you shared, a gentle next step could be to pause, name the most pressing thing, and choose one small action within your control. You deserve support — not just endurance. Would it help to make a short plan for the next hour?\n\n[ACTION:MEDITATION:reset]`;

// ─── TRAINED MODE INSTRUCTIONS ──────────────────────────────────────────────────
const modeInstructions = {
  deescalate: `**De-escalation Specialist Mode**
You are a trauma-informed de-escalation coach. The teacher just came from a difficult classroom moment.
- Lead with somatic grounding: guide a 4-7-8 breathing pattern or 5-4-3-2-1 sensory technique FIRST
- Validate the physiological stress response ("Your body is doing exactly what it should — fight-or-flight after a hard moment")
- Help them physically transition: suggest standing, moving to a different room, splashing cold water
- Only AFTER grounding, help them name what happened without judgment
- Close with one micro-boundary they can set before their next class
- Keep responses to 2-3 short paragraphs maximum — they need brevity right now`,

  prioritize: `**Workload Triage Specialist Mode**
You are an executive-function coach who understands teacher workloads.
- Ask them to brain-dump everything that feels urgent RIGHT NOW
- Help them apply the Eisenhower Matrix: categorize into urgent-important, important-not-urgent, delegate, delete
- Choose EXACTLY ONE thing for the next 30 minutes
- Name what can wait (and give permission for it to wait)
- If grading is the issue: suggest batch-grading strategies (mark for completion vs. deep feedback)
- Normalize that "done is better than perfect" for administrative tasks
- Provide a specific, timed plan: "For the next 25 minutes, ONLY focus on [X]"`,

  vent: `**Compassionate Listener Mode**
You are a validating, non-judgmental emotional container.
- Your ONLY job for the first 2-3 exchanges is to LISTEN and VALIDATE
- Use reflective listening: "It sounds like..." "What I'm hearing is..."
- Do NOT offer advice, solutions, or silver linings unless explicitly asked
- Validate the emotion AND the situation: "That sounds genuinely frustrating — and it makes complete sense given what you're dealing with"
- If they express guilt about venting, normalize it: "Needing to let it out is healthy — holding it in is what causes burnout"
- Only after they feel fully heard, gently ask if they'd like support finding a next step
- Never minimize with "at least..." or "it could be worse..."`,

  recovery: `**Evening Recovery Architect Mode**
You are a boundary-setting and recovery planning specialist.
- Help them create a clear transition ritual from "teacher mode" to "human mode"
- Suggest a specific 15-minute recovery micro-plan (e.g., 5 min phone-free silence, 5 min gentle movement, 5 min something pleasurable)
- Address common teacher traps: working from home, answering parent emails at night, planning lessons until midnight
- Help them name ONE boundary for tonight (e.g., "No school email after 7pm")
- If they mention physical symptoms (headache, tension, fatigue): address those first with rest/hydration/movement
- Close with a permission statement: "You have done enough today. The remaining work will still be there tomorrow."`,

  emotional: `**Emotional Intelligence Companion Mode**
You are trained in emotion-focused therapy techniques for educators.
- Help them NAME the emotion precisely (use emotion wheels: move from "bad" → "frustrated" → "unappreciated for my effort")
- Normalize the emotion: "This is a completely valid response to..."
- Explore the unmet need underneath: "When you feel [emotion], it often means you need [need]"
- Gently explore whether this is a pattern or a specific incident
- If they mention compassion fatigue (caring too much for students while depleting themselves), name it explicitly
- Help them identify ONE small act of emotional refueling before tomorrow
- Use warmth, never clinical detachment`,

  strategy: `**Classroom Strategy Consultant Mode**
You are a veteran teaching mentor with expertise in evidence-based classroom management.
- Ask clarifying questions about the specific situation (grade level, subject, class size, what they've already tried)
- Offer 1-2 specific, research-backed strategies they can implement TOMORROW
- Reference specific techniques: positive narration, strategic ignoring, proximity control, 2x10 relationship strategy, non-verbal cues
- Frame strategies as experiments, not mandates: "You might try..."
- Address the emotional toll alongside the practical solution
- If the issue is systemic (admin pressure, lack of resources), validate that AND still offer what's in their control
- End with "You don't have to solve this alone — this is a system issue, not a you issue" when appropriate`,
};

// ─── CONVERSATION CONTEXT WITH EMOTIONAL PRESERVATION ───────────────────────────
async function getConversationContext(userId, previousMessages) {
  if (!previousMessages.length) return [];

  if (previousMessages.length > 20) {
    const recentMessages = previousMessages.slice(-12);

    if (groq) {
      try {
        const olderMessages = previousMessages.slice(0, previousMessages.length - 12);
        const chatText = olderMessages
          .map((m) => `${m.role === 'assistant' ? 'AI' : 'Teacher'}: ${m.content}`)
          .join('\n');

        const summaryPrompt = `Summarize this teacher support conversation preserving EMOTIONAL context. Return 3-5 bullet points that capture:
1. The teacher's primary emotional state and how it evolved
2. Key stressors or triggers they mentioned
3. Any coping strategies or interventions that were suggested
4. The teacher's receptiveness to support
5. Any recurring themes or patterns

Conversation:\n${chatText}`;

        const completion = await groq.chat.completions.create({
          model: GROQ_MODEL,
          messages: [{ role: 'user', content: summaryPrompt }],
          temperature: 0.5,
          max_tokens: 400,
        });

        const summary = completion.choices[0].message.content.trim();
        return [{ role: 'assistant', content: `[Earlier conversation memory]\n${summary}` }, ...recentMessages];
      } catch (err) {
        console.error('Conversation summarization fallback:', err.message);
      }
    }
    return recentMessages;
  }
  return previousMessages;
}

// ─── BUILD USER PROFILE SNAPSHOT ────────────────────────────────────────────────
async function buildUserProfileSnapshot(userId) {
  const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

  const [teacher, recentMoods, recentJournals, recentMessages] = await Promise.all([
    prisma.teacher.findUnique({ where: { userId } }),
    prisma.moodEntry.findMany({
      where: { userId, createdAt: { gte: fourteenDaysAgo } },
      orderBy: { createdAt: 'desc' },
      take: 7,
    }),
    prisma.journal.findMany({
      where: { userId, createdAt: { gte: fourteenDaysAgo } },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.chatMessage.findMany({
      where: { userId, role: 'assistant', detectedEmotion: { not: null }, createdAt: { gte: fourteenDaysAgo } },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
  ]);

  const moodSummary = recentMoods.length > 0
    ? recentMoods.map((m) => `${m.mood}${m.aiDetectedMood ? ` (AI: ${m.aiDetectedMood})` : ''}${m.note ? ` — "${m.note.slice(0, 60)}"` : ''}`).join('; ')
    : 'No recent mood data';

  const journalSummary = recentJournals.length > 0
    ? recentJournals.map((j) => `"${j.title}" — ${j.sentiment || 'unknown'} sentiment, stress: ${j.stressScore ?? '?'}/100${j.emotionalExhaustionLevel ? `, exhaustion: ${j.emotionalExhaustionLevel}` : ''}`).join('; ')
    : 'No recent journals';

  const emotionHistory = recentMessages
    .filter((m) => m.detectedEmotion)
    .map((m) => m.detectedEmotion)
    .join(', ') || 'none detected yet';

  const mlInsights = recentMoods.length >= 3
    ? runFullMlAnalysis({ note: '', score: recentMoods[0]?.score || 3, mood: recentMoods[0]?.mood || 'NEUTRAL', history: [...recentMoods].reverse(), journals: recentJournals, teacher })
    : null;

  return {
    teacher,
    latestMood: recentMoods[0] || null,
    mlInsights,
    profile: `
═══ USER WELLBEING PROFILE (Live Context — Last 14 Days) ═══

METRICS:
• Stress Score: ${teacher?.stressScore ?? 'unknown'}%
• Wellness Score: ${teacher?.wellnessScore ?? 'unknown'}/100
• Burnout Risk: ${teacher?.burnoutRisk ?? 'unknown'}%

RECENT MOOD CHECK-INS (newest first):
${moodSummary}

RECENT JOURNAL REFLECTIONS:
${journalSummary}

DETECTED EMOTIONS FROM RECENT AI SESSIONS:
${emotionHistory}

${mlInsights ? `ML ANALYSIS:
• Mood Trend: ${mlInsights.trend.trendDirection} (predicted next: ${mlInsights.trend.predictedMood}, confidence: ${mlInsights.trend.confidence}%)
• Mood Volatility: ${mlInsights.trend.volatilityScore}/100
• Burnout Probability: ${mlInsights.burnout.burnoutProbability}% (${mlInsights.burnout.riskLevel})
• Risk Factors: ${mlInsights.burnout.riskFactors.join('; ')}
• Protective Factors: ${mlInsights.burnout.protectiveFactors.join('; ')}
• Best Day: ${mlInsights.patterns.bestDay || 'unknown'} | Worst Day: ${mlInsights.patterns.worstDay || 'unknown'}` : ''}
═══════════════════════════════════════════════════════════`,
  };
}

// ─── ADAPTIVE TONE SELECTOR ─────────────────────────────────────────────────────
function getAdaptiveToneInstruction(stressScore, burnoutRisk) {
  if (stressScore > 70 || burnoutRisk > 65) {
    return `TONE DIRECTIVE: The user is under HIGH stress/burnout risk. Use an ultra-calming, gentle, slower-paced tone. Shorter sentences. More validation, less advice. Lead with "I see you" energy. Do not overwhelm with options.`;
  }
  if (stressScore > 40 || burnoutRisk > 35) {
    return `TONE DIRECTIVE: The user is moderately stressed. Balance warmth with practical support. Validate first, then offer 1-2 gentle suggestions. Keep a supportive but not clinical tone.`;
  }
  return `TONE DIRECTIVE: The user appears relatively well. You can be warmer, more celebratory, and forward-looking. Reinforce positive habits. Ask growth-oriented questions. It's okay to be a bit more playful and energizing.`;
}

// ─── ROUTES ─────────────────────────────────────────────────────────────────────

router.get('/history', async (req, res, next) => {
  try {
    res.json(
      await prisma.chatMessage.findMany({
        where: { userId: req.auth.sub },
        orderBy: { createdAt: 'asc' },
        take: 100,
      })
    );
  } catch (e) {
    next(e);
  }
});

router.get('/insights', async (req, res, next) => {
  try {
    const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

    const [moods, journals, messages, teacher] = await Promise.all([
      prisma.moodEntry.findMany({
        where: { userId: req.auth.sub, createdAt: { gte: twoWeeksAgo } },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.journal.findMany({
        where: { userId: req.auth.sub, createdAt: { gte: twoWeeksAgo } },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.chatMessage.findMany({
        where: {
          userId: req.auth.sub,
          role: 'assistant',
          detectedEmotion: { not: null },
          createdAt: { gte: twoWeeksAgo },
        },
        orderBy: { createdAt: 'asc' },
        take: 50,
      }),
      prisma.teacher.findUnique({ where: { userId: req.auth.sub } }),
    ]);

    const triggerCounts = {};
    moods.forEach((m) => {
      if (m.primaryTrigger) {
        triggerCounts[m.primaryTrigger] = (triggerCounts[m.primaryTrigger] || 0) + 1;
      }
    });
    const commonTriggers = Object.entries(triggerCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([trigger, count]) => ({ trigger, count }));

    const moodTrend = moods.map((m) => ({
      date: m.createdAt.toISOString().split('T')[0],
      mood: m.mood,
      score: m.score,
      detected: m.aiDetectedMood,
    }));

    const journalStressTrend = journals.map((j) => ({
      date: j.createdAt.toISOString().split('T')[0],
      stressScore: j.stressScore ?? 35,
      permaPillar: j.permaPillar,
      exhaustionLevel: j.emotionalExhaustionLevel,
      sentiment: j.sentiment,
    }));

    const permaDistribution = {};
    journals.forEach((j) => {
      if (j.permaPillar) {
        permaDistribution[j.permaPillar] = (permaDistribution[j.permaPillar] || 0) + 1;
      }
    });

    const exhaustionLevels = {};
    journals.forEach((j) => {
      if (j.emotionalExhaustionLevel) {
        exhaustionLevels[j.emotionalExhaustionLevel] = (exhaustionLevels[j.emotionalExhaustionLevel] || 0) + 1;
      }
    });

    const emotionCounts = {};
    messages.forEach((m) => {
      if (m.detectedEmotion) {
        const key = m.detectedEmotion.toLowerCase();
        emotionCounts[key] = (emotionCounts[key] || 0) + 1;
      }
    });
    const topEmotions = Object.entries(emotionCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([emotion, count]) => ({ emotion, count }));

    const actionCounts = {};
    messages.forEach((m) => {
      if (m.suggestedAction) {
        actionCounts[m.suggestedAction] = (actionCounts[m.suggestedAction] || 0) + 1;
      }
    });

    const insights = {
      teacher: teacher
        ? {
          stressScore: teacher.stressScore,
          wellnessScore: teacher.wellnessScore,
          burnoutRisk: teacher.burnoutRisk,
        }
        : null,
      commonTriggers,
      moodTrend,
      journalStressTrend,
      permaDistribution,
      exhaustionLevels,
      topEmotions,
      recommendedActions: actionCounts,
    };

    res.json(insights);
  } catch (e) {
    next(e);
  }
});

// ─── AI CHAT ENDPOINT ───────────────────────────────────────────────────────────
router.post('/chat', async (req, res, next) => {
  try {
    const message = String(req.body.message || '').trim();
    const mode = String(req.body.mode || 'general');
    if (!message) return res.status(400).json({ message: 'A message is required.' });

    // ── Crisis Detection Gate ──
    if (detectCrisis(message)) {
      await prisma.chatMessage.create({
        data: { userId: req.auth.sub, role: 'user', content: message },
      });
      const crisisMsg = await prisma.chatMessage.create({
        data: {
          userId: req.auth.sub,
          role: 'assistant',
          content: CRISIS_RESPONSE,
          detectedEmotion: 'crisis',
          stressLevel: 95,
          suggestedAction: 'BOOKING',
        },
      });
      return res.json(crisisMsg);
    }

    // ── Fetch contextual data ──
    const [profileData, allPrevious] = await Promise.all([
      buildUserProfileSnapshot(req.auth.sub),
      prisma.chatMessage.findMany({
        where: { userId: req.auth.sub },
        orderBy: { createdAt: 'asc' },
        take: 40,
      }),
    ]);

    // Save user message
    await prisma.chatMessage.create({
      data: { userId: req.auth.sub, role: 'user', content: message },
    });

    const previousMessages = await getConversationContext(req.auth.sub, allPrevious);

    // ── Default: local ML-driven assistant (no API key needed) ──
    const local = localAssistant(message, mode, {
      latestMood: profileData.latestMood,
      burnout: profileData.mlInsights?.burnout || null,
      trend: profileData.mlInsights?.trend || null,
      stressScore: profileData.teacher?.stressScore ?? 35,
      burnoutRisk: profileData.teacher?.burnoutRisk ?? 15,
    });
    let reply = local.reply;
    let detectedEmotion = local.detectedEmotion;
    let stressLevel = local.stressLevel;
    let suggestedAction = local.suggestedAction;

    if (groq) {
      try {
        const adaptiveTone = getAdaptiveToneInstruction(
          profileData.teacher?.stressScore ?? 35,
          profileData.teacher?.burnoutRisk ?? 15
        );

        const systemInstruction = `
You are **StressShield AI** — an expert, empathetic wellbeing companion purpose-built for teachers and school staff.

═══ YOUR TRAINING & EXPERTISE ═══

You are trained in the following evidence-based frameworks:
1. **Maslach Burnout Inventory (MBI)** — You understand the three dimensions of burnout: emotional exhaustion, depersonalization, and reduced personal accomplishment. You recognize early warning signs before teachers do.
2. **PERMA Model (Seligman)** — You support flourishing through Positive Emotion, Engagement, Relationships, Meaning, and Accomplishment. You help teachers identify which pillar needs attention.
3. **Cognitive Behavioral Therapy (CBT) Techniques** — You can guide cognitive reframing, thought challenging, and behavioral activation without being clinical.
4. **Compassion Fatigue Research (Figley)** — You understand that teachers who care deeply about students are at risk of secondary traumatic stress. You name this when you see it.
5. **Polyvagal Theory** — You understand the nervous system's role in stress responses and can suggest body-based regulation techniques.
6. **Teacher-Specific Stressors** — You deeply understand: classroom management pressure, standardized testing anxiety, parent communication stress, administrative overload, emotional labor of caring for 25-150+ young people daily, imposter syndrome in teaching, the Sunday Scaries, and the "martyrdom" culture in education.

═══ LIVE USER CONTEXT ═══
${profileData.profile}

═══ CONVERSATION MODE ═══
${modeInstructions[mode] || `**General Support Mode**
Provide warm, balanced, practical wellbeing support. Read the user's emotional state from context and respond accordingly. Validate first, support second, advise third (and only when welcome).`}

${adaptiveTone}

═══ VARIETY DIRECTIVE ═══
Avoid repeating the same phrasing, sentence openers, or structure you've used in earlier turns of this conversation. Vary your validation language, sentence rhythm, and word choice each time — do not fall into a template.

═══ RESPONSE FORMAT ═══
You MUST respond with a valid JSON object (no markdown fences, no backticks around the JSON) matching this schema:
{
  "reply": "Your empathetic response (2-4 paragraphs max). Include ONE [ACTION:TYPE:PARAM] tag at the end when appropriate. Types: [ACTION:MEDITATION:reset], [ACTION:JOURNAL], [ACTION:BOOKING]",
  "detectedEmotion": "precise emotion word (e.g., overwhelmed, anxious, exhausted, hopeful, calm, frustrated, drained, proud, worried, grateful, conflicted, numb, resentful)",
  "stressLevel": number_0_to_100,
  "suggestedAction": "MEDITATION | JOURNAL | BOOKING"
}

═══ CORE RULES ═══
1. **Validate before advising.** Always acknowledge the emotion and situation before offering ANY suggestion.
2. **Use the user's context.** Reference their recent moods, journal themes, or stress trends naturally — show you KNOW them.
3. **Be concise.** Teachers are time-poor. 2-4 paragraphs maximum. No walls of text.
4. **Never diagnose.** You are not a licensed clinician. For serious mental health concerns, direct to professional support or crisis resources.
5. **Teacher-specific language.** Use terms they relate to: "bell-to-bell", "prep period", "grading mountain", "admin emails", "IEP meetings", "parent conferences".
6. **No toxic positivity.** Never say "just be positive" or "everything happens for a reason". Acknowledge that teaching is genuinely hard.
7. **Detect escalation patterns.** If stress levels have been rising across sessions or burnout risk is high, proactively name it: "I've noticed your stress has been trending upward this week..."
`;

        // Build OpenAI-style message history for Groq
        const chatMessages = [{ role: 'system', content: systemInstruction }];

        for (const m of previousMessages) {
          const text = m.content ?? (m.parts && m.parts[0]?.text) ?? '';
          const role = m.role === 'assistant' ? 'assistant' : 'user';
          chatMessages.push({ role, content: text });
        }
        chatMessages.push({ role: 'user', content: message });

        const completion = await groq.chat.completions.create({
          model: GROQ_MODEL,
          messages: chatMessages,
          temperature: 0.9,
          max_tokens: 700,
          response_format: { type: 'json_object' },
        });

        const rawText = completion.choices[0].message.content;

        // Parse JSON response
        try {
          const jsonMatch = rawText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            if (parsed.reply) reply = String(parsed.reply);
            if (parsed.detectedEmotion) detectedEmotion = String(parsed.detectedEmotion).toLowerCase();
            if (typeof parsed.stressLevel === 'number') {
              stressLevel = Math.min(100, Math.max(0, Math.round(parsed.stressLevel)));
            }
            if (parsed.suggestedAction) {
              const action = String(parsed.suggestedAction).toUpperCase();
              if (['MEDITATION', 'JOURNAL', 'BOOKING'].includes(action)) suggestedAction = action;
            }
          }
        } catch (parseErr) {
          console.error('Groq JSON parse error, using raw text:', parseErr.message);
          reply = rawText;
        }
      } catch (groqError) {
        console.error('Groq API error in AI agent route:', groqError.message);
      }
    }

    const assistant = await prisma.chatMessage.create({
      data: {
        userId: req.auth.sub,
        role: 'assistant',
        content: reply,
        detectedEmotion,
        stressLevel,
        suggestedAction,
      },
    });

    res.json(assistant);
  } catch (e) {
    next(e);
  }
});

// ─── AI FEEDBACK ENDPOINT ───────────────────────────────────────────────────────
router.post('/feedback', async (req, res, next) => {
  try {
    const { messageId, helpful } = req.body;
    if (!messageId || typeof helpful !== 'boolean') {
      return res.status(400).json({ message: 'messageId and helpful (boolean) are required.' });
    }

    const feedback = await prisma.aiFeedback.upsert({
      where: { userId_messageId: { userId: req.auth.sub, messageId } },
      create: { userId: req.auth.sub, messageId, helpful },
      update: { helpful },
    });

    res.json(feedback);
  } catch (e) {
    next(e);
  }
});

export default router;