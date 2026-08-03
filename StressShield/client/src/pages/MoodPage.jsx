import { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Sparkles,
  Wind,
  NotebookPen,
  ArrowRight,
  CalendarDays,
  TrendingUp,
  TrendingDown,
  Minus,
  Brain,
  Gauge,
  ShieldAlert,
  Activity,
  BarChart3,
  Zap,
  Eye,
  Target,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Portal from '../components/Portal';
import api from '../services/api';

const MOODS = [
  ['TERRIBLE', '😞', 'Rough'],
  ['LOW', '🙁', 'Low'],
  ['NEUTRAL', '😐', 'Okay'],
  ['GOOD', '🙂', 'Good'],
  ['GREAT', '😄', 'Great'],
];

const ACTION_META = {
  RESET: { label: 'Launch Guided Reset', icon: Wind, path: '/meditation' },
  JOURNAL: { label: 'Write Journal Reflection', icon: NotebookPen, path: '/journal' },
  UNWIND: { label: 'Take an Unwind Break', icon: CalendarDays, path: '/meditation' },
};

const MOOD_EMOJI_MAP = { TERRIBLE: '😞', LOW: '🙁', NEUTRAL: '😐', GOOD: '🙂', GREAT: '😄' };

export default function MoodPage() {
  const [selected, setSelected] = useState(null);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [mlInsights, setMlInsights] = useState(null);
  const [existingMlInsights, setExistingMlInsights] = useState(null);
  const navigate = useNavigate();

  // Load existing ML insights on mount
  useEffect(() => {
    api.get('/wellness/moods/ml-insights')
      .then((r) => { if (r.data.available) setExistingMlInsights(r.data); })
      .catch(() => { });
  }, []);

  const save = async () => {
    if (!selected || saving) return;
    setSaving(true);
    try {
      const res = await api.post('/wellness/moods', {
        mood: selected[0],
        score: MOODS.indexOf(selected) + 1,
        note,
      });
      // The response now includes both AI analysis and mlInsights
      const { mlInsights: ml, ...rest } = res.data;
      setAiAnalysis(rest);
      setMlInsights(ml);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const action = aiAnalysis?.recommendedAction
    ? ACTION_META[aiAnalysis.recommendedAction] || ACTION_META.RESET
    : null;

  const activeMl = mlInsights || (existingMlInsights ? {
    sentiment: existingMlInsights.sentiment,
    trend: existingMlInsights.trend,
    patterns: existingMlInsights.patterns,
    burnout: existingMlInsights.burnout,
  } : null);

  const TrendIcon = activeMl?.trend?.trendDirection === 'improving'
    ? TrendingUp
    : activeMl?.trend?.trendDirection === 'declining'
      ? TrendingDown
      : Minus;

  const trendColor = activeMl?.trend?.trendDirection === 'improving'
    ? '#10b981'
    : activeMl?.trend?.trendDirection === 'declining'
      ? '#ef4444'
      : '#8a8a8a';

  const burnoutColor = activeMl?.burnout?.riskLevel === 'high'
    ? '#ef4444'
    : activeMl?.burnout?.riskLevel === 'moderate'
      ? '#f59e0b'
      : '#10b981';

  return (
    <Portal title="How are you feeling?" subtitle="There's no right answer. Just notice what's here.">
      <div className="page-grid">
        {/* Left column: Check-in form */}
        <section className="panel">
          <h3>Choose the feeling that fits best</h3>
          <p className="muted">Your check-in stays private and helps you see your patterns over time.</p>

          <div className="mood-options" style={{ margin: '25px 0' }}>
            {MOODS.map((m) => (
              <button
                key={m[0]}
                className={'mood-option ' + (selected === m ? 'selected' : '')}
                onClick={() => setSelected(m)}
              >
                <b style={{ fontSize: 28 }}>{m[1]}</b>
                <span>{m[2]}</span>
              </button>
            ))}
          </div>

          <div className="field">
            <label>
              What's influencing your day? <span className="muted">(optional note for AI + ML analysis)</span>
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows="4"
              placeholder="E.g., 5th period class was chaotic, grading mountain, feeling rested today..."
            />
          </div>

          <button className="btn" onClick={save} disabled={saving || !selected}>
            {saving ? (
              <>
                <span className="typing-dots" style={{ display: 'inline-flex', gap: 3 }}>
                  <span className="dot" /><span className="dot" /><span className="dot" />
                </span>
                {' '}Analyzing with AI + ML...
              </>
            ) : (
              <>Save today's check-in <CheckCircle2 size={16} /></>
            )}
          </button>
        </section>

        {/* Right column: AI Check-in Insight */}
        <section className="panel">
          <h3>AI Check-in Insight</h3>
          {aiAnalysis ? (
            <div style={{ background: 'var(--surface-muted)', padding: 20, borderRadius: 16, border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--ink)', fontWeight: 600, marginBottom: 8 }}>
                <Sparkles size={18} /> Instant Micro-Validation
              </div>
              <p style={{ margin: 0, color: 'var(--ink-soft)', fontSize: 15, lineHeight: 1.6 }}>{aiAnalysis.aiInsight}</p>

              {/* AI Detected Mood badge */}
              {aiAnalysis.aiDetectedMood && (
                <div style={{ marginTop: 12, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <span
                    className="badge"
                    style={{ background: 'var(--border-soft)', color: 'var(--ink)', fontSize: 12, padding: '6px 12px' }}
                  >
                    ✨ AI Detected Mood: {aiAnalysis.aiDetectedMood}
                  </span>
                </div>
              )}

              {aiAnalysis.primaryTrigger && (
                <div style={{ marginTop: 8, display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span className="badge" style={{ background: 'var(--accent-tint)', color: 'var(--accent)', fontSize: 12, padding: '6px 12px' }}>
                    Primary Focus: {aiAnalysis.primaryTrigger}
                  </span>
                </div>
              )}

              <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
                {action && (
                  <button
                    className="btn light"
                    style={{ fontSize: 13, gap: 6 }}
                    onClick={() => navigate(action.path)}
                  >
                    <action.icon size={15} /> {action.label} <ArrowRight size={14} />
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div>
              <p className="muted" style={{ lineHeight: 1.7 }}>
                Select your mood above and save your check-in to unlock instant AI micro-validation and a tailored wellness recommendation.
              </p>
            </div>
          )}
        </section>
      </div>

      {/* ─── ML INSIGHTS SECTION ───────────────────────────────────────────── */}
      {activeMl && (
        <div style={{ marginTop: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <Brain size={22} color="var(--ink)" />
            <h3 style={{ margin: 0 }}>Machine Learning Insights</h3>
            <span className="badge" style={{
              background: 'var(--surface-muted)', color: 'var(--ink)', fontSize: 11, padding: '4px 10px',
              display: 'inline-flex', alignItems: 'center', gap: 4,
            }}>
              <Zap size={11} /> ML Powered
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>

            {/* ── Sentiment Analysis Card ── */}
            {activeMl.sentiment && (
              <div className="panel" style={{ margin: 0, padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: activeMl.sentiment.emotionalValence === 'positive' ? 'rgba(16,185,129,0.15)' : activeMl.sentiment.emotionalValence === 'negative' ? 'rgba(239,68,68,0.15)' : 'var(--surface-muted)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Eye size={18} color={activeMl.sentiment.emotionalValence === 'positive' ? '#10b981' : activeMl.sentiment.emotionalValence === 'negative' ? '#ef4444' : 'var(--muted-fg)'} />
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>Sentiment Analysis</h4>
                    <small className="muted">NLP analysis of your note</small>
                  </div>
                </div>

                {/* Sentiment score bar */}
                <div style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                    <span>Negative</span>
                    <span style={{ fontWeight: 700, color: activeMl.sentiment.sentimentScore > 0 ? '#10b981' : activeMl.sentiment.sentimentScore < 0 ? '#ef4444' : 'var(--muted-fg)' }}>
                      {activeMl.sentiment.sentimentScore > 0 ? '+' : ''}{activeMl.sentiment.sentimentScore}
                    </span>
                    <span>Positive</span>
                  </div>
                  <div style={{ height: 8, borderRadius: 4, background: 'var(--border)', position: 'relative', overflow: 'hidden' }}>
                    <div style={{
                      position: 'absolute',
                      left: '50%',
                      width: `${Math.abs(activeMl.sentiment.sentimentScore) * 50}%`,
                      height: '100%',
                      borderRadius: 4,
                      background: activeMl.sentiment.sentimentScore >= 0
                        ? 'linear-gradient(90deg, #86efac, #10b981)'
                        : 'linear-gradient(270deg, #fca5a5, #ef4444)',
                      transform: activeMl.sentiment.sentimentScore >= 0 ? 'none' : 'translateX(-100%)',
                      transition: 'width 0.6s ease',
                    }} />
                    <div style={{
                      position: 'absolute', left: '50%', top: 0, bottom: 0,
                      width: 2, background: 'var(--muted-fg)', transform: 'translateX(-1px)',
                    }} />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                  <span className="badge" style={{
                    fontSize: 11, padding: '4px 10px',
                    background: activeMl.sentiment.emotionalValence === 'positive' ? 'rgba(16,185,129,0.15)' : activeMl.sentiment.emotionalValence === 'negative' ? 'rgba(239,68,68,0.15)' : 'var(--surface-muted)',
                    color: activeMl.sentiment.emotionalValence === 'positive' ? '#10b981' : activeMl.sentiment.emotionalValence === 'negative' ? '#ef4444' : 'var(--ink-soft)',
                  }}>
                    Valence: {activeMl.sentiment.emotionalValence}
                  </span>
                  <span className="badge" style={{ fontSize: 11, padding: '4px 10px', background: 'var(--border-soft)', color: 'var(--ink)' }}>
                    Intensity: {activeMl.sentiment.emotionalIntensity}/100
                  </span>
                </div>

                {activeMl.sentiment.keywords?.length > 0 && (
                  <div style={{ marginTop: 8 }}>
                    <small className="muted" style={{ fontSize: 11 }}>Detected keywords:</small>
                    <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 4 }}>
                      {activeMl.sentiment.keywords.map((kw) => (
                        <span key={kw} style={{
                          fontSize: 10, padding: '3px 8px', borderRadius: 6,
                          background: 'var(--surface-muted)', border: '1px solid var(--border)', color: 'var(--ink-soft)',
                        }}>
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── Mood Trend Forecast Card ── */}
            {activeMl.trend && (
              <div className="panel" style={{ margin: 0, padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: trendColor + '18',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <TrendIcon size={18} color={trendColor} />
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>Mood Trend Forecast</h4>
                    <small className="muted">Predicted from your history</small>
                  </div>
                </div>

                {/* Predicted mood */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: 14,
                  background: trendColor + '10', borderRadius: 12, marginBottom: 12,
                }}>
                  <span style={{ fontSize: 32 }}>{MOOD_EMOJI_MAP[activeMl.trend.predictedMood] || '😐'}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>
                      Predicted Next: {activeMl.trend.predictedMood}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--muted-fg)' }}>
                      Score: {activeMl.trend.predictedScore}/5 • Confidence: {activeMl.trend.confidence}%
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <span className="badge" style={{
                    fontSize: 11, padding: '4px 10px', background: trendColor + '18', color: trendColor,
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                  }}>
                    <TrendIcon size={12} />
                    Trend: {activeMl.trend.trendDirection}
                  </span>
                  <span className="badge" style={{ fontSize: 11, padding: '4px 10px', background: 'var(--border-soft)', color: 'var(--ink)' }}>
                    Volatility: {activeMl.trend.volatilityScore}/100
                  </span>
                  <span className="badge" style={{ fontSize: 11, padding: '4px 10px', background: 'var(--surface-muted)', color: 'var(--muted-fg)' }}>
                    Avg: {activeMl.trend.movingAverage}/5
                  </span>
                </div>
              </div>
            )}

            {/* ── Pattern Insights Card ── */}
            {activeMl.patterns && (
              <div className="panel" style={{ margin: 0, padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10, background: 'var(--border-soft)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <BarChart3 size={18} color="var(--ink)" />
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>Pattern Recognition</h4>
                    <small className="muted">Day-of-week & streak analysis</small>
                  </div>
                </div>

                {/* Best/Worst days */}
                {(activeMl.patterns.bestDay || activeMl.patterns.worstDay) && (
                  <div style={{
                    display: 'flex', gap: 10, marginBottom: 12,
                  }}>
                    {activeMl.patterns.bestDay && (
                      <div style={{
                        flex: 1, padding: 10, borderRadius: 10,
                        background: 'rgba(16,185,129,0.15)', textAlign: 'center',
                      }}>
                        <div style={{ fontSize: 11, color: '#10b981', fontWeight: 600 }}>Best Day</div>
                        <div style={{ fontSize: 16, fontWeight: 800, color: '#10b981' }}>{activeMl.patterns.bestDay}</div>
                      </div>
                    )}
                    {activeMl.patterns.worstDay && (
                      <div style={{
                        flex: 1, padding: 10, borderRadius: 10,
                        background: 'rgba(239,68,68,0.15)', textAlign: 'center',
                      }}>
                        <div style={{ fontSize: 11, color: '#ef4444', fontWeight: 600 }}>Hardest Day</div>
                        <div style={{ fontSize: 16, fontWeight: 800, color: '#ef4444' }}>{activeMl.patterns.worstDay}</div>
                      </div>
                    )}
                  </div>
                )}

                {/* Day-of-week mini chart */}
                {activeMl.patterns.dayOfWeekPatterns?.length > 0 && (
                  <div style={{ marginBottom: 12 }}>
                    <small className="muted" style={{ fontSize: 11 }}>Day-of-week mood averages:</small>
                    <div style={{ display: 'flex', gap: 4, marginTop: 6, alignItems: 'end', height: 50 }}>
                      {activeMl.patterns.dayOfWeekPatterns
                        .sort((a, b) => a.dayIndex - b.dayIndex)
                        .map((d) => (
                          <div key={d.day} style={{ flex: 1, textAlign: 'center' }}>
                            <div style={{
                              height: `${Math.max(8, d.averageScore * 9)}px`,
                              borderRadius: '4px 4px 2px 2px',
                              background: d.label === 'above average' ? '#86efac' : d.label === 'below average' ? '#fca5a5' : 'var(--border)',
                              transition: 'height 0.4s ease',
                              margin: '0 auto',
                              width: '80%',
                            }} />
                            <div style={{ fontSize: 9, color: 'var(--muted-fg)', marginTop: 2 }}>{d.day.slice(0, 3)}</div>
                          </div>
                        ))
                      }
                    </div>
                  </div>
                )}

                {/* Streak info */}
                {activeMl.patterns.currentStreak?.type !== 'none' && (
                  <div style={{
                    padding: '8px 12px', borderRadius: 8,
                    background: activeMl.patterns.currentStreak.type === 'positive' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                    display: 'flex', alignItems: 'center', gap: 6, fontSize: 12,
                    color: activeMl.patterns.currentStreak.type === 'positive' ? '#10b981' : '#ef4444',
                    fontWeight: 600,
                  }}>
                    <Activity size={14} />
                    {activeMl.patterns.currentStreak.length}-day {activeMl.patterns.currentStreak.type} streak
                  </div>
                )}

                <div style={{ marginTop: 8 }}>
                  <span className="badge" style={{ fontSize: 11, padding: '4px 10px', background: 'var(--surface-muted)', color: 'var(--muted-fg)' }}>
                    Check-in consistency: {activeMl.patterns.consistency}%
                  </span>
                </div>
              </div>
            )}

            {/* ── Burnout Risk Gauge Card ── */}
            {activeMl.burnout && (
              <div className="panel" style={{ margin: 0, padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: burnoutColor + '18',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <ShieldAlert size={18} color={burnoutColor} />
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>Burnout Risk Assessment</h4>
                    <small className="muted">Multi-signal ML analysis</small>
                  </div>
                </div>

                {/* Circular gauge */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                  <div style={{ position: 'relative', width: 120, height: 120 }}>
                    <svg viewBox="0 0 120 120" style={{ width: 120, height: 120, transform: 'rotate(-90deg)' }}>
                      <circle cx="60" cy="60" r="50" fill="none" stroke="var(--border)" strokeWidth="10" />
                      <circle
                        cx="60" cy="60" r="50" fill="none"
                        stroke={burnoutColor}
                        strokeWidth="10"
                        strokeDasharray={`${(activeMl.burnout.burnoutProbability / 100) * 314} 314`}
                        strokeLinecap="round"
                        style={{ transition: 'stroke-dasharray 1s ease' }}
                      />
                    </svg>
                    <div style={{
                      position: 'absolute', inset: 0,
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center',
                    }}>
                      <span style={{ fontSize: 28, fontWeight: 800, color: burnoutColor }}>
                        {activeMl.burnout.burnoutProbability}%
                      </span>
                      <span style={{ fontSize: 10, color: 'var(--muted-fg)', textTransform: 'uppercase', fontWeight: 600 }}>
                        {activeMl.burnout.riskLevel} risk
                      </span>
                    </div>
                  </div>
                </div>

                {/* Confidence interval */}
                <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--muted-fg)', marginBottom: 12 }}>
                  Confidence range: {activeMl.burnout.confidenceInterval?.[0]}% – {activeMl.burnout.confidenceInterval?.[1]}%
                </div>

                {/* Risk factors */}
                {activeMl.burnout.riskFactors?.length > 0 && (
                  <div style={{ marginBottom: 8 }}>
                    <small style={{ fontWeight: 600, color: '#ef4444', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Target size={11} /> Risk Factors
                    </small>
                    <ul style={{ margin: '4px 0 0', paddingLeft: 16, fontSize: 12, color: 'var(--ink-soft)', lineHeight: 1.7 }}>
                      {activeMl.burnout.riskFactors.map((f, i) => <li key={i}>{f}</li>)}
                    </ul>
                  </div>
                )}

                {/* Protective factors */}
                {activeMl.burnout.protectiveFactors?.length > 0 && (
                  <div>
                    <small style={{ fontWeight: 600, color: '#10b981', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <ShieldAlert size={11} /> Protective Factors
                    </small>
                    <ul style={{ margin: '4px 0 0', paddingLeft: 16, fontSize: 12, color: 'var(--ink-soft)', lineHeight: 1.7 }}>
                      {activeMl.burnout.protectiveFactors.map((f, i) => <li key={i}>{f}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </Portal>
  );
}