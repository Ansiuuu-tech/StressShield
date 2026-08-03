/**
 * StressShield Local Journal Analysis Engine
 *
 * Deterministic, ML-informed analysis for journal entries when the Gemini API
 * key is not configured. Produces the same fields as the Gemini path:
 *   { sentiment, emotions, stressScore, aiSuggestion, permaPillar, emotionalExhaustionLevel }
 *
 * Uses sentiment analytics (ml.js) + MBI/PERMA-oriented keyword classification.
 */

import { analyzeSentiment } from './ml.js';

// ─── CORE LEXICON SCORING ───────────────────────────────────────────────────────

const STRESS_WORDS = [
    'overwhelmed', 'anxious', 'anxiety', 'stressed', 'stressor', 'exhausted', 'exhaustion',
    'burnout', 'burned out', 'drained', 'pressure', 'deadline', 'grading', 'too much',
    'can\'t cope', 'struggling', 'drowning', 'failing', 'panic', 'tension', 'worry',
];

const POSITIVE_WORDS = [
    'proud', 'grateful', 'thankful', 'happy', 'joyful', 'connected', 'supported',
    'energized', 'hopeful', 'accomplished', 'loved', 'peaceful', 'calm', 'fun', 'excited',
    'meaningful', 'engaged', 'resilient', 'strength', 'win', 'success',
];

const PERMA_KEYWORDS = {
    'Positive Emotion': ['happy', 'joyful', 'grateful', 'thankful', 'peaceful', 'calm', 'smiled', 'pleasure', 'enjoyed', 'hope', 'happy moment'],
    Engagement: ['flow', 'absorbed', 'engaged', '"lost track of time"', 'focused', 'lesson', 'curious', 'in the zone', 'challenge', 'creative'],
    Relationships: ['colleague', 'student', 'friend', 'family', 'connected', 'supported', 'team', 'parent', 'together', 'helped me', 'thanked'],
    Meaning: ['purpose', 'meaning', 'why i teach', 'matters', 'difference', 'calling', 'values', 'impact', 'contribution', 'bigger'],
    Accomplishment: ['proud', 'achieved', 'accomplished', 'completed', 'finished', 'win', 'did it', 'success', 'mastered', 'progress', 'growth'],
};

const EXHAUSTION_KEYWORDS = {
    High: ['burned out', 'burnout', 'exhausted', 'can\'t go on', 'empty', 'drained', 'no energy',
        'give up', 'hopeless', 'crying', 'can\'t sleep', 'insomnia', 'depleted', 'physically sick',
        'took a sick day', 'numb', 'dead inside', 'snapped', 'breakdown'],
    Moderate: ['tired', 'fatigued', 'draining', 'worn out', 'run down', 'overwhelmed', 'wiped',
        'struggling', 'heavy', 'hard week', 'stress', 'anxious', 'sleepless'],
};

// ─── ANALYSIS FUNCTIONS ─────────────────────────────────────────────────────────

function detectPermaPillar(text) {
    const lower = text.toLowerCase();
    let best = 'Meaning';
    let bestScore = 0;
    for (const [pillar, keywords] of Object.entries(PERMA_KEYWORDS)) {
        let score = 0;
        for (const kw of keywords) {
            if (lower.includes(kw)) score += 1;
        }
        if (score > bestScore) {
            bestScore = score;
            best = pillar;
        }
    }
    return bestScore > 0 ? best : 'Meaning';
}

function detectExhaustionLevel(text, sentiment) {
    const lower = text.toLowerCase();
    let high = 0;
    let moderate = 0;
    for (const kw of EXHAUSTION_KEYWORDS.High) if (lower.includes(kw)) high += 1;
    for (const kw of EXHAUSTION_KEYWORDS.Moderate) if (lower.includes(kw)) moderate += 1;

    // Adjust by sentiment intensity and valence
    if (sentiment?.sentimentScore < -0.5) high += 1;
    else if (sentiment?.sentimentScore < -0.2) moderate += 1;

    if (high > 0) return 'High';
    if (moderate > 0) return 'Moderate';
    return 'Low';
}

function detectEmotions(text, sentiment) {
    const emotions = [];
    const lower = text.toLowerCase();

    const EMOTION_MAP = [
        ['anxious', ['anxious', 'anxiety', 'worried', 'nervous', 'panic', 'dread']],
        ['overwhelmed', ['overwhelmed', 'too much', 'drowning', 'swamped']],
        ['exhausted', ['exhausted', 'drained', 'fatigue', 'burnout', 'tired']],
        ['frustrated', ['frustrated', 'annoyed', 'irritated', 'fed up']],
        ['sad', ['sad', 'crying', 'down', 'lonely', 'disappointed']],
        ['angry', ['angry', 'mad', 'resentful', 'furious']],
        ['stressed', ['stressed', 'pressure', 'tension']],
        ['grateful', ['grateful', 'thankful', 'appreciative']],
        ['proud', ['proud', 'accomplished', 'achieved']],
        ['hopeful', ['hopeful', 'optimistic', 'encouraged']],
        ['calm', ['calm', 'peaceful', 'settled', 'relaxed']],
        ['connected', ['connected', 'supported', 'together', 'helped']],
    ];

    for (const [emotion, keywords] of EMOTION_MAP) {
        let hit = false;
        for (const kw of keywords) {
            if (lower.includes(kw)) {
                hit = true;
                break;
            }
        }
        if (hit) emotions.push(emotion);
    }

    // Fallback based on sentiment valence
    if (emotions.length === 0) {
        if (sentiment?.emotionalValence === 'positive') emotions.push('content');
        else if (sentiment?.emotionalValence === 'negative') emotions.push('reflective');
        else emotions.push('thoughtful');
    }

    return emotions.slice(0, 5);
}

function buildSuggestion({ sentiment, exhaustionLevel, permaPillar, stressScore }) {
    if (exhaustionLevel === 'High') {
        return 'Your reflections suggest significant emotional exhaustion today. Protect one 30-minute rest block and consider a counselor session this week.';
    }
    if (exhaustionLevel === 'Moderate') {
        return 'There is a moderate exhaustion signal here. Try protecting one 15-minute transition break tomorrow, away from screens.';
    }
    if (sentiment?.emotionalValence === 'positive') {
        return `This looks like a strong ${permaPillar} moment. Keep making time for the habits that are helping you flourish.`;
    }
    if (stressScore > 60) {
        return 'Your stress signals are elevated. Name one thing you can let wait until tomorrow — and actually let it wait.';
    }
    return 'Consider pairing this reflection with a quick mood check-in tomorrow morning to track how the day shifts.';
}

// ─── MAIN ENTRY ─────────────────────────────────────────────────────────────────

export function runLocalJournalAnalysis({ title, content }) {
    const text = `${title} ${content}`;
    const sentiment = analyzeSentiment(content);

    let stressWords = 0;
    const lower = text.toLowerCase();
    for (const kw of STRESS_WORDS) if (lower.includes(kw)) stressWords += 1;

    // Stress score from lexicon density + sentiment
    const wordCount = text.split(/\s+/).length || 1;
    const density = stressWords / wordCount;
    let stressScore = Math.round(density * 400 + (sentiment.sentimentScore + 1) * 30);
    stressScore = Math.min(95, Math.max(5, stressScore));

    // Sentiment category
    let sentimentCategory = 'Positive';
    if (sentiment.sentimentScore < -0.1) sentimentCategory = 'Reflective';
    if (sentiment.sentimentScore < -0.35) sentimentCategory = 'Stressed';
    if (stressScore > 60 && sentiment.sentimentScore < -0.2) sentimentCategory = 'Stressed';
    if (sentiment.sentimentScore < -0.15 && stressScore > 40 && stressScore < 70) sentimentCategory = 'Reflective';

    const permaPillar = detectPermaPillar(text);
    const exhaustionLevel = detectExhaustionLevel(text, sentiment);
    const emotions = detectEmotions(text, sentiment);
    const aiSuggestion = buildSuggestion({ sentiment, exhaustionLevel, permaPillar, stressScore });

    return {
        sentiment: sentimentCategory,
        emotions,
        stressScore,
        aiSuggestion,
        permaPillar,
        emotionalExhaustionLevel: exhaustionLevel,
    };
}

