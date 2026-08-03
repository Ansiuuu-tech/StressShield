/**
 * StressShield ML Utility Module
 *
 * Implements client-side (server-local) machine learning features:
 * 1. Sentiment Analysis Engine — NLP keyword/pattern scoring
 * 2. Mood Trend Predictor — Weighted moving average + linear regression
 * 3. Pattern Recognition — Day-of-week patterns, streak detection
 * 4. Burnout Risk Predictor — Multi-signal weighted analysis
 */

// ─── 1. SENTIMENT ANALYSIS ENGINE ──────────────────────────────────────────────

const POSITIVE_WORDS = new Set([
  'happy', 'great', 'wonderful', 'excellent', 'amazing', 'good', 'love', 'enjoy',
  'proud', 'grateful', 'thankful', 'peaceful', 'calm', 'rested', 'refreshed',
  'energized', 'motivated', 'inspired', 'hopeful', 'confident', 'satisfied',
  'accomplished', 'productive', 'connected', 'supported', 'joyful', 'excited',
  'relaxed', 'comfortable', 'balanced', 'fulfilled', 'appreciated', 'valued',
  'optimistic', 'cheerful', 'content', 'thriving', 'strong', 'resilient',
]);

const NEGATIVE_WORDS = new Set([
  'stressed', 'overwhelmed', 'anxious', 'tired', 'exhausted', 'frustrated',
  'angry', 'sad', 'depressed', 'burned', 'burnout', 'drained', 'hopeless',
  'worried', 'fear', 'panic', 'terrible', 'awful', 'miserable', 'chaotic',
  'impossible', 'unbearable', 'failing', 'drowning', 'suffocating', 'crying',
  'breakdown', 'isolated', 'lonely', 'unsupported', 'undervalued', 'unappreciated',
  'overworked', 'underpaid', 'toxic', 'hostile', 'conflict', 'argument',
  'nightmare', 'disaster', 'worst', 'hate', 'quit', 'resign', 'leave',
]);

const INTENSIFIERS = new Set([
  'very', 'extremely', 'incredibly', 'absolutely', 'totally', 'completely',
  'utterly', 'so', 'really', 'truly', 'deeply', 'immensely', 'terribly',
]);

const NEGATORS = new Set([
  'not', "n't", 'no', 'never', 'neither', 'nor', 'hardly', 'barely', 'scarcely',
]);

/**
 * Analyze sentiment of a text string using keyword-based NLP scoring.
 * @param {string} text - The text to analyze
 * @returns {{ sentimentScore: number, emotionalValence: string, keywords: string[], emotionalIntensity: number }}
 */
export function analyzeSentiment(text) {
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return { sentimentScore: 0, emotionalValence: 'neutral', keywords: [], emotionalIntensity: 0 };
  }

  const words = text.toLowerCase().replace(/[^\w\s']/g, '').split(/\s+/);
  let score = 0;
  let positiveHits = 0;
  let negativeHits = 0;
  const detectedKeywords = [];
  let intensityMultiplier = 1;

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const prevWord = i > 0 ? words[i - 1] : '';
    const isNegated = NEGATORS.has(prevWord) || (prevWord && prevWord.endsWith("n't"));
    const isIntensified = INTENSIFIERS.has(prevWord);
    const multiplier = isIntensified ? 1.5 : 1;

    if (POSITIVE_WORDS.has(word)) {
      if (isNegated) {
        score -= 1 * multiplier;
        negativeHits++;
      } else {
        score += 1 * multiplier;
        positiveHits++;
      }
      detectedKeywords.push(isNegated ? `not ${word}` : word);
    } else if (NEGATIVE_WORDS.has(word)) {
      if (isNegated) {
        score += 0.5 * multiplier;
        positiveHits++;
      } else {
        score -= 1 * multiplier;
        negativeHits++;
      }
      detectedKeywords.push(isNegated ? `not ${word}` : word);
    }

    if (INTENSIFIERS.has(word)) {
      intensityMultiplier = Math.min(intensityMultiplier + 0.15, 2);
    }
  }

  // Normalize score to -1 to +1 range
  const totalHits = positiveHits + negativeHits;
  const normalizedScore = totalHits > 0
    ? Math.max(-1, Math.min(1, score / Math.max(totalHits, 3)))
    : 0;

  // Emotional intensity: 0-100 based on hit density and intensifiers
  const wordCount = words.length || 1;
  const hitDensity = totalHits / wordCount;
  const rawIntensity = hitDensity * 200 * intensityMultiplier;
  const emotionalIntensity = Math.min(100, Math.max(0, Math.round(rawIntensity)));

  // Valence classification
  let emotionalValence = 'neutral';
  if (normalizedScore > 0.15) emotionalValence = 'positive';
  else if (normalizedScore < -0.15) emotionalValence = 'negative';
  else if (totalHits > 0) emotionalValence = 'mixed';

  return {
    sentimentScore: Math.round(normalizedScore * 1000) / 1000,
    emotionalValence,
    keywords: [...new Set(detectedKeywords)].slice(0, 8),
    emotionalIntensity,
  };
}

// ─── 2. MOOD TREND PREDICTOR ────────────────────────────────────────────────────

/**
 * Predict the next mood using weighted moving average + simple linear regression.
 * @param {Array<{score: number, createdAt: string|Date}>} moodHistory - Ordered mood entries (oldest first)
 * @returns {{ predictedScore: number, predictedMood: string, confidence: number, trendDirection: string, volatilityScore: number, movingAverage: number }}
 */
export function predictMoodTrend(moodHistory) {
  const defaults = {
    predictedScore: 3,
    predictedMood: 'NEUTRAL',
    confidence: 0,
    trendDirection: 'stable',
    volatilityScore: 0,
    movingAverage: 3,
  };

  if (!moodHistory || moodHistory.length < 3) {
    return { ...defaults, confidence: 0 };
  }

  const scores = moodHistory.map((m) => m.score);
  const n = scores.length;

  // ── Weighted Moving Average (recent entries weighted more heavily) ──
  let weightedSum = 0;
  let weightTotal = 0;
  for (let i = 0; i < n; i++) {
    const weight = (i + 1) / n; // linear weight: older=low, newer=high
    weightedSum += scores[i] * weight;
    weightTotal += weight;
  }
  const wma = weightedSum / weightTotal;

  // ── Simple Linear Regression (y = mx + b) ──
  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += scores[i];
    sumXY += i * scores[i];
    sumXX += i * i;
  }
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX || 1);
  const intercept = (sumY - slope * sumX) / n;

  // Predict next score (index = n)
  const regressionPrediction = slope * n + intercept;

  // Blend WMA and regression (60% regression, 40% WMA for trend sensitivity)
  const blendedPrediction = regressionPrediction * 0.6 + wma * 0.4;
  const predictedScore = Math.max(1, Math.min(5, Math.round(blendedPrediction * 10) / 10));

  // ── Volatility Score ──
  const mean = sumY / n;
  const variance = scores.reduce((acc, s) => acc + Math.pow(s - mean, 2), 0) / n;
  const stdDev = Math.sqrt(variance);
  const volatilityScore = Math.min(100, Math.round(stdDev * 25)); // scale 0-100

  // ── Trend Direction ──
  let trendDirection = 'stable';
  if (slope > 0.08) trendDirection = 'improving';
  else if (slope < -0.08) trendDirection = 'declining';

  // ── Confidence ──
  // Based on data quantity, consistency, and how well regression fits
  const dataConfidence = Math.min(1, n / 14); // max at 14 entries
  const rSquared = 1 - scores.reduce((acc, s, i) => {
    const predicted = slope * i + intercept;
    return acc + Math.pow(s - predicted, 2);
  }, 0) / (scores.reduce((acc, s) => acc + Math.pow(s - mean, 2), 0) || 1);
  const confidence = Math.min(95, Math.max(10, Math.round(
    (dataConfidence * 0.4 + Math.max(0, rSquared) * 0.6) * 100
  )));

  // Map score to mood name
  const MOOD_MAP = { 1: 'TERRIBLE', 2: 'LOW', 3: 'NEUTRAL', 4: 'GOOD', 5: 'GREAT' };
  const predictedMood = MOOD_MAP[Math.round(Math.max(1, Math.min(5, predictedScore)))] || 'NEUTRAL';

  return {
    predictedScore: Math.round(predictedScore * 10) / 10,
    predictedMood,
    confidence,
    trendDirection,
    volatilityScore,
    movingAverage: Math.round(wma * 100) / 100,
  };
}

// ─── 3. PATTERN RECOGNITION ─────────────────────────────────────────────────────

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * Detect patterns in mood history: day-of-week averages, streaks, and time correlations.
 * @param {Array<{score: number, mood: string, createdAt: string|Date}>} moodHistory
 * @returns {{ dayOfWeekPatterns: object[], currentStreak: object, bestDay: string, worstDay: string, consistency: number }}
 */
export function detectPatterns(moodHistory) {
  const defaults = {
    dayOfWeekPatterns: [],
    currentStreak: { type: 'none', length: 0, mood: null },
    bestDay: null,
    worstDay: null,
    consistency: 0,
  };

  if (!moodHistory || moodHistory.length < 3) return defaults;

  // ── Day-of-Week Patterns ──
  const dayBuckets = Array.from({ length: 7 }, () => []);
  for (const entry of moodHistory) {
    const day = new Date(entry.createdAt).getDay();
    dayBuckets[day].push(entry.score);
  }

  const globalMean = moodHistory.reduce((a, m) => a + m.score, 0) / moodHistory.length;

  const dayOfWeekPatterns = dayBuckets
    .map((scores, dayIndex) => {
      if (scores.length === 0) return null;
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
      const deviationPercent = Math.round(((avg - globalMean) / globalMean) * 100);
      return {
        day: DAY_NAMES[dayIndex],
        dayIndex,
        averageScore: Math.round(avg * 100) / 100,
        entryCount: scores.length,
        deviationPercent,
        label: deviationPercent > 10 ? 'above average' : deviationPercent < -10 ? 'below average' : 'typical',
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.averageScore - a.averageScore);

  // Best and worst days
  const bestDay = dayOfWeekPatterns.length > 0 ? dayOfWeekPatterns[0].day : null;
  const worstDay = dayOfWeekPatterns.length > 0 ? dayOfWeekPatterns[dayOfWeekPatterns.length - 1].day : null;

  // ── Streak Detection ──
  const sorted = [...moodHistory].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  let streakType = 'none';
  let streakLength = 1;
  let streakMood = null;

  if (sorted.length >= 2) {
    const firstScore = sorted[0].score;
    const isPositive = firstScore >= 4;
    const isNegative = firstScore <= 2;

    if (isPositive || isNegative) {
      streakType = isPositive ? 'positive' : 'negative';
      streakMood = sorted[0].mood;

      for (let i = 1; i < sorted.length; i++) {
        const meetsCondition = isPositive ? sorted[i].score >= 4 : sorted[i].score <= 2;
        if (meetsCondition) {
          streakLength++;
        } else {
          break;
        }
      }
    }
  }

  // ── Consistency Score ──
  // How consistent the user is about checking in (based on date gaps)
  const dates = moodHistory.map((m) => new Date(m.createdAt).toDateString());
  const uniqueDates = [...new Set(dates)];
  if (uniqueDates.length >= 2) {
    const first = new Date(uniqueDates[0]);
    const last = new Date(uniqueDates[uniqueDates.length - 1]);
    const daySpan = Math.max(1, (last - first) / (1000 * 60 * 60 * 24));
    const consistency = Math.min(100, Math.round((uniqueDates.length / daySpan) * 100));
    defaults.consistency = consistency;
  }

  return {
    dayOfWeekPatterns,
    currentStreak: { type: streakType, length: streakLength, mood: streakMood },
    bestDay,
    worstDay,
    consistency: defaults.consistency,
  };
}

// ─── 4. BURNOUT RISK PREDICTOR ──────────────────────────────────────────────────

/**
 * Predict burnout risk using multi-signal weighted analysis.
 * Combines mood trends, journal exhaustion data, stress scores, and streak patterns.
 *
 * @param {{ moods: Array, journals: Array, teacher: object|null }} data
 * @returns {{ burnoutProbability: number, confidenceInterval: [number, number], riskLevel: string, riskFactors: string[], protectiveFactors: string[] }}
 */
export function predictBurnoutRisk({ moods = [], journals = [], teacher = null }) {
  const factors = [];
  const protective = [];
  let riskScore = 0;
  let totalWeight = 0;

  // ── Signal 1: Low Mood Frequency (weight: 0.25) ──
  const WEIGHT_MOOD_FREQ = 0.25;
  if (moods.length >= 3) {
    const lowMoods = moods.filter((m) => m.score <= 2).length;
    const lowMoodRatio = lowMoods / moods.length;
    const moodSignal = lowMoodRatio * 100;
    riskScore += moodSignal * WEIGHT_MOOD_FREQ;
    totalWeight += WEIGHT_MOOD_FREQ;

    if (lowMoodRatio > 0.5) factors.push(`${Math.round(lowMoodRatio * 100)}% of recent check-ins are low or terrible`);
    else if (lowMoodRatio < 0.15) protective.push('Consistently positive mood check-ins');
  }

  // ── Signal 2: Mood Trend Decline (weight: 0.20) ──
  const WEIGHT_TREND = 0.20;
  if (moods.length >= 5) {
    const trend = predictMoodTrend(moods);
    if (trend.trendDirection === 'declining') {
      riskScore += 70 * WEIGHT_TREND;
      factors.push('Mood trend is declining over recent entries');
    } else if (trend.trendDirection === 'improving') {
      riskScore += 15 * WEIGHT_TREND;
      protective.push('Mood trend is actively improving');
    } else {
      riskScore += 35 * WEIGHT_TREND;
    }
    totalWeight += WEIGHT_TREND;

    // Volatility bonus risk
    if (trend.volatilityScore > 60) {
      riskScore += 10;
      factors.push('High mood volatility detected — emotional instability signal');
    }
  }

  // ── Signal 3: Journal Emotional Exhaustion (weight: 0.20) ──
  const WEIGHT_EXHAUSTION = 0.20;
  if (journals.length >= 2) {
    const exhaustionMap = { 'High': 90, 'Moderate': 50, 'Low': 15 };
    const exhaustionScores = journals
      .filter((j) => j.emotionalExhaustionLevel)
      .map((j) => exhaustionMap[j.emotionalExhaustionLevel] ?? 35);

    if (exhaustionScores.length > 0) {
      const avgExhaustion = exhaustionScores.reduce((a, b) => a + b, 0) / exhaustionScores.length;
      riskScore += avgExhaustion * WEIGHT_EXHAUSTION;
      totalWeight += WEIGHT_EXHAUSTION;

      const highCount = exhaustionScores.filter((s) => s >= 80).length;
      if (highCount >= 2) factors.push(`${highCount} journal entries flagged high emotional exhaustion`);
      else if (avgExhaustion < 30) protective.push('Journal entries show low emotional exhaustion');
    }
  }

  // ── Signal 4: Journal Stress Scores (weight: 0.20) ──
  const WEIGHT_JOURNAL_STRESS = 0.20;
  if (journals.length >= 2) {
    const stressScores = journals.filter((j) => j.stressScore != null).map((j) => j.stressScore);
    if (stressScores.length > 0) {
      const avgStress = stressScores.reduce((a, b) => a + b, 0) / stressScores.length;
      riskScore += avgStress * WEIGHT_JOURNAL_STRESS;
      totalWeight += WEIGHT_JOURNAL_STRESS;

      if (avgStress > 65) factors.push(`Average journal stress score is ${Math.round(avgStress)}/100`);
      else if (avgStress < 30) protective.push('Journal stress scores are consistently low');
    }
  }

  // ── Signal 5: Negative Streak (weight: 0.15) ──
  const WEIGHT_STREAK = 0.15;
  if (moods.length >= 3) {
    const patterns = detectPatterns(moods);
    if (patterns.currentStreak.type === 'negative' && patterns.currentStreak.length >= 3) {
      const streakSignal = Math.min(100, patterns.currentStreak.length * 20);
      riskScore += streakSignal * WEIGHT_STREAK;
      factors.push(`${patterns.currentStreak.length}-day negative mood streak detected`);
    } else if (patterns.currentStreak.type === 'positive' && patterns.currentStreak.length >= 3) {
      riskScore += 10 * WEIGHT_STREAK;
      protective.push(`${patterns.currentStreak.length}-day positive mood streak`);
    } else {
      riskScore += 30 * WEIGHT_STREAK;
    }
    totalWeight += WEIGHT_STREAK;
  }

  // ── Normalize and compute final probability ──
  const burnoutProbability = totalWeight > 0
    ? Math.min(98, Math.max(2, Math.round(riskScore / totalWeight)))
    : (teacher?.burnoutRisk ?? 15);

  // Confidence interval (wider with less data)
  const dataPoints = moods.length + journals.length;
  const intervalWidth = Math.max(5, Math.round(30 - Math.min(25, dataPoints)));
  const confidenceInterval = [
    Math.max(0, burnoutProbability - intervalWidth),
    Math.min(100, burnoutProbability + intervalWidth),
  ];

  // Risk level classification
  let riskLevel = 'low';
  if (burnoutProbability > 65) riskLevel = 'high';
  else if (burnoutProbability > 35) riskLevel = 'moderate';

  return {
    burnoutProbability,
    confidenceInterval,
    riskLevel,
    riskFactors: factors.length > 0 ? factors : ['No significant risk factors detected'],
    protectiveFactors: protective.length > 0 ? protective : ['Continue building healthy check-in habits'],
  };
}

/**
 * Run all ML analyses for a mood check-in. Convenience wrapper.
 * @param {{ note: string, score: number, mood: string, history: Array, journals: Array, teacher: object }} ctx
 * @returns {object} Combined ML insights
 */
export function runFullMlAnalysis({ note, score, mood, history = [], journals = [], teacher = null }) {
  const sentiment = analyzeSentiment(note || '');
  const trend = predictMoodTrend(history);
  const patterns = detectPatterns(history);
  const burnout = predictBurnoutRisk({ moods: history, journals, teacher });

  return {
    sentiment,
    trend,
    patterns,
    burnout,
  };
}
