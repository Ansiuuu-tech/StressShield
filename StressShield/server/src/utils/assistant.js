/**
 * StressShield Local AI Assistant Engine
 *
 * A deterministic, ML-informed fallback assistant that runs entirely on-device
 * (no external API key required). It uses the same ML utilities as the Gemini
 * path — sentiment analysis, mood trend, burnout risk — and combines them with
 * topic detection, mode-specific coaching, and context-aware reply generation.
 *
 * It returns the same schema as the Gemini path so the API layer is identical:
 * { reply, detectedEmotion, stressLevel, suggestedAction }
 */

import { analyzeSentiment } from './ml.js';

// ─── CRISIS KEYWORDS ────────────────────────────────────────────────────────────
export const CRISIS_KEYWORDS = [
    'suicide', 'suicidal', 'kill myself', 'end my life', 'want to die',
    'self-harm', 'self harm', 'hurt myself', 'cutting', 'no reason to live',
    'hopeless', 'give up on everything', "can't go on", "can't take it anymore",
];

export function detectCrisis(text) {
    const lower = (text || '').toLowerCase();
    return CRISIS_KEYWORDS.some((kw) => lower.includes(kw));
}

export const CRISIS_RESPONSE = `I hear you, and I want you to know that what you're feeling matters deeply. You are not alone in this.

**If you are in immediate danger, please reach out right now:**
- 🆘 **988 Suicide & Crisis Lifeline**: Call or text **988** (US)
- 📱 **Crisis Text Line**: Text **HOME** to **741741**
- 🌍 **International Association for Suicide Prevention**: https://www.iasp.info/resources/Crisis_Centres/

You deserve support from someone trained to help. Please reach out — a real person is waiting to listen. I'm here too, whenever you're ready to talk.

[ACTION:BOOKING]`;

// ─── TOPIC DETECTION LEXICONS ───────────────────────────────────────────────────

const TOPIC_LEXICONS = {
    workload: [
        'grading', 'paperwork', 'admin', 'emails', 'email', 'lesson plan', 'lesson planning',
        'meeting', 'meetings', 'deadline', 'deadlines', 'overload', 'pile', 'stack', 'triage',
        'prep period', 'syllabus', 'curriculum', 'reports', 'data entry', 'schedule',
        'overworked', 'behind', 'documentation', 'planning', 'paper mountain',
    ],
    classroom: [
        'class', 'classroom', 'student', 'students', 'period', 'behavior', 'behaviour',
        'discipline', 'disruption', 'disruptive', '5th period', 'first period', 'bell',
        'lesson', 'taught', 'teaching', 'lesson plan', 'curriculum', 'i taught', 'my class',
    ],
    fatigue: [
        'tired', 'exhausted', 'drained', 'fatigue', 'burnout', 'burned out', 'no energy',
        'sleep', 'insomnia', 'can\'t sleep', 'waking up', 'physically', 'headache',
        'sore throat', 'sick', 'run down', 'depleted', 'empty tank', 'wiped out',
    ],
    relationships: [
        'parent', 'parents', 'colleague', 'colleagues', 'principal', 'administrator',
        'admin', 'coworker', 'team', 'staff', 'partner', 'spouse', 'family', 'friend',
        'argument', 'conflict', 'fought', 'argued', 'unappreciated', 'undervalued',
    ],
    emotional: [
        'anxious', 'anxiety', 'worried', 'stressed', 'overwhelmed', 'sad', 'crying',
        'lonely', 'frustrated', 'angry', 'guilty', 'imposter', 'not good enough',
        'numb', 'hopeless', 'helpless', 'resentful', 'afraid', 'fear', 'panic',
        'on edge', 'irritable', 'snapped', 'lost it', 'stuck',
    ],
    recovery: [
        'home', 'evening', 'night', 'weekend', 'rest', 'sleep', 'unwind', 'switch off',
        'boundary', 'boundaries', 'work-life', 'recover', 'break', 'vacation', 'time off',
        'can\'t stop working', 'work from home',
    ],
};

// ─── EMOTION LEXICON (expanded) ─────────────────────────────────────────────────

const EMOTION_KEYWORDS = {
    overwhelmed: ['overwhelmed', 'too much', 'drowning', 'can\'t keep up', 'snowed', 'swamped', 'spread thin'],
    anxious: ['anxious', 'anxiety', 'worried', 'nervous', 'fear', 'afraid', 'panic', 'dread'],
    exhausted: ['exhausted', 'tired', 'fatigue', 'drained', 'wiped', 'depleted', 'burned out', 'burnout'],
    frustrated: ['frustrated', 'annoyed', 'irritated', 'fed up', 'snapped', 'lost it'],
    sad: ['sad', 'crying', 'cried', 'down', 'depressed', 'miserable', 'heartbroken', 'disappointed'],
    angry: ['angry', 'mad', 'rage', 'furious', 'resentful', 'bitter'],
    stressed: ['stressed', 'pressure', 'tension', 'tense', 'tight', 'stretched'],
    hopeless: ['hopeless', 'helpless', 'no point', 'give up', 'numb', 'empty', 'meaningless'],
    guilty: ['guilty', 'guilt', 'should have', 'my fault', 'blame'],
    lonely: ['lonely', 'alone', 'isolated', 'unconnected', 'no one'],
    unappreciated: ['unappreciated', 'undervalued', 'taken for granted', 'not valued', 'invisible'],
    hopeful: ['hopeful', 'hopeful', 'optimistic', 'encouraged', 'positive'],
    calm: ['calm', 'peaceful', 'relaxed', 'settled', 'centered', 'grounded'],
    proud: ['proud', 'accomplished', 'achieved', 'did it', 'won', 'success'],
    grateful: ['grateful', 'thankful', 'appreciative', 'blessed', 'lucky'],
    conflicted: ['conflicted', 'torn', 'unsure', 'ambivalent', 'mixed', 'confused'],
};

// ─── MODE-SPECIFIC LOCAL COACHING ───────────────────────────────────────────────

const MODE_STRATEGIES = {
    deescalate: {
        emotion: 'overwhelmed',
        reply: (topic, name) =>
            `Let's take one slow breath together. In for 4... hold for 7... out for 8. Good. You don't have to solve the whole day right now — just this moment.

It sounds like ${topic || 'a really difficult moment'} just happened, and your nervous system is doing exactly what it should: bracing for threat. That's not weakness — it's biology.

Before we go further, notice three things you can see, two you can hear, one you can touch. Feel your feet on the floor. You're here, and you're safe.

When you're ready, name the single most present feeling without judging it. I'll hold it with you.`,
    },
    prioritize: {
        emotion: 'overwhelmed',
        reply: (topic) =>
            `Let's get this out of your head and onto paper. Brain-dump everything urgent — grading, prep, emails, meetings. Don't filter, just list.

Now let's triage: what has a hard deadline today? What only feels urgent but can wait until tomorrow? What could be delegated or deleted entirely?

Choose EXACTLY ONE thing for the next 25 minutes — one small, completable task. Set a timer and do only that. Permission granted: done is better than perfect, especially for ${topic || 'administrative work'}.

What's the one task you'll start with?`,
    },
    vent: {
        emotion: 'frustrated',
        reply: (topic) =>
            `I'm here, and I'm listening. No solutions needed right now — just whatever's in your chest.

It sounds like ${topic || 'this situation'} has been genuinely hard. That's not an overreaction; that's a real response to a real load. Needing to let it out is healthy — holding it in is what feeds burnout.

Take your time. What's the moment that's sticking with you most? What did it feel like in your body?`,
    },
    recovery: {
        emotion: 'drained',
        reply: (topic) =>
            `You've given a full day to others. Now let's build a bridge back to you.

A 15-minute recovery micro-plan: 5 minutes of silence with no phone, 5 minutes of gentle movement or stretching, 5 minutes of something you genuinely enjoy. That's it. That's enough.

Name ONE boundary for tonight: no work emails after 7pm, no lesson planning in bed, no laptop in the living room. Pick one — not all.

The work will still be there tomorrow. ${topic ? `Tonight, ${topic} can wait.` : 'You have done enough today.'} You have permission to rest.`,
    },
    emotional: {
        emotion: 'anxious',
        reply: (topic) =>
            `Let's get precise about what you're feeling. "Bad" is too vague for something this real. Is it frustration, disappointment, fear, exhaustion, or something else?

What you described about ${topic || 'this situation'} makes complete sense to feel [that]. This isn't a personal failing — it's an unmet need. When we feel [emotion], it often means we need [recognition, rest, support, or control].

If this feeling has shown up before, that's worth noticing — not as a problem, but as a pattern. What's one small act of emotional refueling you could give yourself before tomorrow?`,
    },
    strategy: {
        emotion: 'frustrated',
        reply: (topic) =>
            `Let's think like the experienced mentor you deserve.

Tell me a bit more: grade level, subject, class size, and what you've already tried with ${topic || 'this situation'}. That context changes the strategy.

A few evidence-based options to consider as experiments (not mandates):
- Positive narration — name what students ARE doing right, loudly and specifically
- Strategic ignoring — starve minor off-task behavior of attention
- Proximity control — physically move closer to the student, no words needed
- The 2x10 strategy — 2 minutes a day for 10 days connecting with the student

Try one as a small experiment tomorrow. You don't have to solve this alone — this is a system issue, not a you issue.`,
    },
    general: {
        emotion: 'overwhelmed',
        reply: (topic) =>
            `Thank you for trusting me with this. ${topic ? `What you're carrying around ${topic} sounds genuinely heavy.` : 'What you\'re carrying sounds genuinely heavy.'}

It makes complete sense that this feels hard right now. Teaching asks a lot — and the weight of caring for so many young people while also being human is real.

A gentle next step: pause, name the single most pressing thing, and choose one small action within your control. Not the whole mountain — just one stone.

Would it help to make a short plan for the next hour? I'm right here.`,
    },
};

// ─── LOCAL ANALYTICS ────────────────────────────────────────────────────────────

/**
 * Detect the dominant topic(s) in a message.
 * @returns {{ topic: string|null, matched: string[] }}
 */
function detectTopic(text) {
    const lower = (text || '').toLowerCase();
    let best = null;
    let bestScore = 0;
    const matched = [];

    for (const [topic, keywords] of Object.entries(TOPIC_LEXICONS)) {
        let score = 0;
        const hits = [];
        for (const kw of keywords) {
            if (lower.includes(kw)) {
                score += 1;
                hits.push(kw);
            }
        }
        if (score > bestScore) {
            bestScore = score;
            best = topic;
            matched.splice(0, matched.length, ...hits);
        }
    }
    return { topic: best, matched };
}

/**
 * Detect the dominant emotion using the emotion lexicon.
 * @returns {{ emotion: string, matched: string[] }}
 */
function detectEmotion(text) {
    const lower = (text || '').toLowerCase();
    let best = 'overwhelmed';
    let bestScore = 0;
    const matched = [];

    for (const [emotion, keywords] of Object.entries(EMOTION_KEYWORDS)) {
        let score = 0;
        const hits = [];
        for (const kw of keywords) {
            if (lower.includes(kw)) {
                score += 1;
                hits.push(kw);
            }
        }
        if (score > bestScore) {
            bestScore = score;
            best = emotion;
            matched.splice(0, matched.length, ...hits);
        }
    }
    return { emotion: best, matched };
}

/**
 * Estimate stress level (0-100) from sentiment + emotional intensity + user context.
 */
function estimateStressLevel({ message, sentiment, userContext }) {
    const base = 45;

    const sentimentShift = Math.round((1 - Math.max(-1, sentiment.sentimentScore)) * 20); // 0..40
    const intensityShift = Math.round(sentiment.emotionalIntensity / 5); // 0..20

    let ctxShift = 0;
    if (userContext) {
        const { stressScore = 35, burnoutRisk = 15 } = userContext;
        ctxShift = Math.round((stressScore - 35) * 0.25 + (burnoutRisk - 15) * 0.3);
    }

    return Math.min(96, Math.max(8, Math.round(base + sentimentShift + intensityShift + ctxShift)));
}

/**
 * Determine a suggested action based on emotion + topic.
 */
function suggestAction(emotion, topic, stressLevel) {
    if (stressLevel >= 80 || emotion === 'exhausted' || emotion === 'hopeless') return 'MEDITATION';
    if (emotion === 'overwhelmed' || emotion === 'anxious' || topic === 'workload') return 'JOURNAL';
    if (emotion === 'sad' || emotion === 'lonely' || topic === 'relationships') return 'BOOKING';
    return 'MEDITATION';
}

// ─── HUMANIZED TOPIC LABELS ─────────────────────────────────────────────────────

const TOPIC_LABELS = {
    workload: 'grading and administrative load',
    classroom: 'what happened in the classroom',
    fatigue: 'how physically depleted you are feeling',
    relationships: 'the strain in your relationships or interactions',
    emotional: 'the emotional weight you are carrying',
    recovery: 'the challenge of switching off and recovering',
};

// ─── USER CONTEXT INTERPOLATION ─────────────────────────────────────────────────

/**
 * Generate a short, personalized opener based on the user's live profile.
 */
function contextOpener(userContext, sentiment) {
    if (!userContext) return '';

    const parts = [];
    const { latestMood, burnout, trend } = userContext;

    if (latestMood?.mood) {
        parts.push(`I noticed your most recent check-in was "${latestMood.mood.toLowerCase()}"`);
    }

    if (trend?.trendDirection === 'declining') {
        parts.push('and your mood trend has been trending downward lately');
    } else if (trend?.trendDirection === 'improving') {
        parts.push('and I can see your mood trend is on the upswing — keep going');
    }

    if (burnout?.riskLevel === 'high') {
        parts.push('and your burnout signal is running high, so let\'s be gentle');
    }

    if (parts.length) return ` ${parts.join(' ')}. `;
    return ' ';
}

/**
 * Main entry point — build a local assistant reply.
 *
 * @param {string} message - user message
 * @param {string} mode - conversation mode (deescalate, prioritize, vent, recovery, emotional, strategy, general)
 * @param {object} userContext - { latestMood, burnout, trend, stressScore, burnoutRisk }
 * @returns {{ reply: string, detectedEmotion: string, stressLevel: number, suggestedAction: string }}
 */
export function localAssistant(message, mode = 'general', userContext = null) {
    const sentiment = analyzeSentiment(message || '');
    const { topic } = detectTopic(message);
    const { emotion } = detectEmotion(message);

    const stressLevel = estimateStressLevel({ message, sentiment, userContext });
    const suggestedAction = suggestAction(emotion, topic, stressLevel);

    const strategy = MODE_STRATEGIES[mode] || MODE_STRATEGIES.general;
    const humanTopic = TOPIC_LABELS[topic] || null;

    const opener = contextOpener(userContext, sentiment).trim();
    let reply = strategy.reply(humanTopic);
    reply = opener ? `${opener} ${reply}` : reply;

    // If sentiment is strongly positive, offer a warmer, strengths-based reply
    if (sentiment.sentimentScore > 0.35 && mode === 'general') {
        reply = `${opener}That's genuinely good to hear — let's capture what's working. What do you think made the difference today? Naming it helps your brain notice it more often.

And what's one small thing from today you want to carry into tomorrow?`;
    }

    // If strongly negative and general mode, prioritize validation
    if (sentiment.sentimentScore < -0.35 && mode === 'general') {
        reply = `${opener}That sounds really heavy, and I want you to know I'm not going to rush past it. Feeling this way after everything you're carrying is completely understandable.

If it helps, we could just sit with it for a minute — no fixing, no silver lining. What's the most present feeling right now?`;
    }

    return {
        reply,
        detectedEmotion: emotion,
        stressLevel,
        suggestedAction,
    };
}

