/**
 * StressShield Local Mood Analysis Engine
 *
 * Deterministic, ML-informed analysis for mood check-ins when the Gemini API
 * key is not configured. Produces the same fields as the Gemini path:
 *   { aiInsight, primaryTrigger, recommendedAction, aiDetectedMood }
 *
 * Combines:
 *  - sentiment analysis (from ml.js)
 *  - trigger keyword classification
 *  - recommendation engine (mood + sentiment + burnout signals)
 *  - nuanced mood synthesis (selected mood + valence + intensity)
 */

// ─── TRIGGER CLASSIFICATION LEXICONS ────────────────────────────────────────────

const TRIGGER_LEXICONS = {
    'Classroom Dynamics': [
        'class', 'classroom', 'student', 'students', 'period', 'behavior', 'behaviour',
        'discipline', 'disruption', 'disruptive', 'lesson', 'taught', 'bell', '5th period',
        'noise', 'talkative', 'defiant', 'argued with student',
    ],
    'Workload & Grading': [
        'grading', 'paperwork', 'admin', 'emails', 'email', 'lesson plan', 'planning',
        'meeting', 'meetings', 'deadline', 'overload', 'pile', 'stack', 'reports',
        'curriculum', 'documentation', 'prep', 'behind', 'syllabus', 'mountain',
    ],
    'Physical Fatigue': [
        'tired', 'exhausted', 'drained', 'fatigue', 'burnout', 'sleep', 'insomnia',
        'headache', 'sick', 'no energy', 'run down', 'wiped', 'physically', 'sore',
    ],
    'Emotional Recovery': [
        'anxious', 'anxiety', 'worried', 'stressed', 'overwhelmed', 'sad', 'crying',
        'lonely', 'frustrated', 'angry', 'guilty', 'numb', 'hopeless', 'afraid', 'panic',
        'cried', 'dread', 'emotional', 'burned out',
    ],
};

const TRIGGER_DEFAULT = 'General Wellbeing';

// ─── DETECT PRIMARY TRIGGER ─────────────────────────────────────────────────────
export function classifyTrigger(note) {
    const lower = (note || '').toLowerCase();
    let best = TRIGGER_DEFAULT;
    let bestScore = 0;

    for (const [trigger, keywords] of Object.entries(TRIGGER_LEXICONS)) {
        let score = 0;
        for (const kw of keywords) {
            if (lower.includes(kw)) score += 1;
        }
        if (score > bestScore) {
            bestScore = score;
            best = trigger;
        }
    }
    return best;
}

// ─── RECOMMENDATION ENGINE ──────────────────────────────────────────────────────
export function recommendAction({ mood, score, sentiment, burnout }) {
    // High burnout / high risk → RESET (meditation)
    if (burnout?.riskLevel === 'high' || burnout?.burnoutProbability >= 60) return 'RESET';

    // Negative sentiment with meaningful intensity → JOURNAL to process
    if (sentiment?.sentimentScore < -0.15 || sentiment?.emotionalIntensity >= 60) return 'JOURNAL';

    // Low mood selected → UNWIND / RESET
    if (score <= 2 || mood === 'TERRIBLE' || mood === 'LOW') return 'RESET';

    // Neutral/good with negative note → JOURNAL
    if (sentiment?.emotionalValence === 'negative' || sentiment?.emotionalValence === 'mixed') return 'JOURNAL';

    // Otherwise positive → UNWIND (recreational break)
    return 'UNWIND';
}

// ─── NUANCED MOOD SYNTHESIS ─────────────────────────────────────────────────────
const MOOD_BASE = {
    TERRIBLE: { positive: 'heavy but reaching for light', negative: 'drowning in the dark', neutral: 'crushed but present' },
    LOW: { positive: 'fragile but flickering', negative: 'aching and low', neutral: 'quietly deflated' },
    NEUTRAL: { positive: 'flat but even', negative: 'weighed down and flat', neutral: 'steady but muted' },
    GOOD: { positive: 'lightly satisfied', negative: 'good on the surface, strained underneath', neutral: 'pleasantly steady' },
    GREAT: { positive: 'warmly energized', negative: 'bright but wired', neutral: 'calmly satisfied' },
};

const VALENCE_PREFIX = {
    positive: { adjective: 'gently', phrasing: 'with a quiet lift' },
    negative: { adjective: 'heavily', phrasing: 'with an undertone of strain' },
    mixed: { adjective: 'somewhat', phrasing: 'in a mixed but honest way' },
    neutral: { adjective: 'quietly', phrasing: 'in a steady, even way' },
};

export function synthesizeMood({ mood, sentiment }) {
    const valence = sentiment?.emotionalValence || 'neutral';
    const base = MOOD_BASE[mood]?.[valence] || 'present and aware';
    const prefix = VALENCE_PREFIX[valence] || VALENCE_PREFIX.neutral;

    // Intensity elevates the language
    if (sentiment?.emotionalIntensity >= 70) return `deeply ${base}`;
    if (sentiment?.emotionalIntensity <= 20 && valence === 'neutral') return `evenly ${base}`;

    return `${prefix.adjective} ${base} (${prefix.phrasing})`;
}

// ─── INSIGHT GENERATOR ──────────────────────────────────────────────────────────
export function buildInsight({ mood, score, sentiment, trend, burnout, patterns, note }) {
    const fragments = [];

    // Acknowledge the specific situation from the note
    const trigger = classifyTrigger(note);
    if (note && note.trim().length > 2) {
        fragments.push(`Thank you for naming what's weighing on you around ${trigger.toLowerCase()} — that takes honest self-awareness.`);
    } else {
        fragments.push('Thank you for taking a moment to check in with yourself.');
    }

    // Reference a relevant ML signal naturally
    if (trend) {
        if (trend.trendDirection === 'declining') {
            fragments.push(`I notice your mood trend has been gently sloping downward lately, and that's worth honoring rather than ignoring.`);
        } else if (trend.trendDirection === 'improving') {
            fragments.push(`Your recent trend is moving upward — notice what you're doing that's working and protect it.`);
        } else if (trend.volatilityScore >= 50) {
            fragments.push(`Your check-ins have been a bit up-and-down this week; that variability is a normal stress signal, not a failure.`);
        }
    }

    if (burnout) {
        if (burnout.riskLevel === 'high') {
            fragments.push(`Your burnout signal is elevated right now, so today calls for rest over productivity.`);
        } else if (burnout.riskLevel === 'moderate') {
            fragments.push(`There's a moderate burnout signal here — a small recovery action today could tip the balance.`);
        } else if (patterns?.currentStreak?.type === 'positive' && patterns.currentStreak.length >= 3) {
            fragments.push(`A ${patterns.currentStreak.length}-day positive streak is a real resilience signal — keep the rhythm.`);
        }
    }

    if (fragments.length === 1) {
        fragments.push('No matter how today feels, this check-in is data you can use to care for yourself tomorrow.');
    }

    return fragments.join(' ');
}

// ─── FULL LOCAL MOOD ANALYSIS ───────────────────────────────────────────────────
export function runLocalMoodAnalysis({ mood, score, note, sentiment, trend, patterns, burnout }) {
    const primaryTrigger = classifyTrigger(note);
    const recommendedAction = recommendAction({ mood, score, sentiment, burnout });
    const aiDetectedMood = synthesizeMood({ mood, sentiment });
    const aiInsight = buildInsight({ mood, score, sentiment, trend, burnout, patterns, note });

    return { aiInsight, primaryTrigger, recommendedAction, aiDetectedMood };
}

