import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Activity,
  CalendarDays,
  Heart,
  MessageCircle,
  NotebookPen,
  Sparkles,
  ShieldCheck,
  Wind,
  Brain,
  Gauge,
  TrendingUp,
} from 'lucide-react';
import Portal from '../components/Portal';
import Metric from '../components/Metric';
import api from '../services/api';

const MOOD_NAMES = {
  TERRIBLE: 'Rough',
  LOW: 'Low',
  NEUTRAL: 'Okay',
  GOOD: 'Good',
  GREAT: 'Great',
};

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [insights, setInsights] = useState(null);
  const go = useNavigate();

  useEffect(() => {
    api
      .get('/wellness/overview')
      .then((r) => setData(r.data))
      .catch(() => setData({}));
    api
      .get('/ai/insights')
      .then((r) => setInsights(r.data))
      .catch(() => setInsights(null));
  }, []);

  const moods =
    data?.moods
      ?.slice()
      .reverse()
      .map((m) => ({
        day: new Date(m.createdAt).toLocaleDateString('en-US', { weekday: 'short' }),
        mood: m.score,
      })) || [
      { day: 'Mon', mood: 3 },
      { day: 'Tue', mood: 4 },
      { day: 'Wed', mood: 3 },
      { day: 'Thu', mood: 4 },
      { day: 'Fri', mood: 5 },
      { day: 'Sat', mood: 3 },
      { day: 'Sun', mood: 5 },

    ];

  const latestMood = data?.moods?.[0]?.mood
    ? MOOD_NAMES[data.moods[0].mood] || 'Good'
    : 'Not set';

  const burnoutRiskScore = data?.teacher?.burnoutRisk ?? 0;
  const burnoutRiskLabel =
    burnoutRiskScore > 60 ? 'High' : burnoutRiskScore > 30 ? 'Moderate' : 'Low';

  // Wellbeing insights derived data
  const commonTriggers = insights?.commonTriggers || [];
  const topEmotions = insights?.topEmotions || [];
  const journalStressTrend = insights?.journalStressTrend || [];
  const permaDistribution = insights?.permaDistribution || {};
  const exhaustionLevels = insights?.exhaustionLevels || {};

  const avgJournalStress =
    journalStressTrend.length > 0
      ? Math.round(
        journalStressTrend.reduce((acc, j) => acc + (j.stressScore || 0), 0) /
        journalStressTrend.length
      )
      : null;

  const permaEntries = Object.entries(permaDistribution).sort((a, b) => b[1] - a[1]);
  const exhaustionEntries = Object.entries(exhaustionLevels).sort((a, b) => b[1] - a[1]);

  return (
    <Portal title="Good morning" subtitle="Here's a gentle view of your wellbeing today.">
      {/* Banner */}
      <div className="hero-banner">
        <h2>Take a breath. You're doing meaningful work.</h2>
        <p>A 60-second check-in can help you arrive for yourself today.</p>
      </div>

      {/* Metrics */}
      <div className="dash-grid">
        <Metric icon={Heart} label="Today's mood" value={latestMood} note="Based on recent check-in" />
        <Metric
          icon={Activity}
          label="Stress level"
          value={`${data?.teacher?.stressScore ?? 34}%`}
          note="In a manageable range"
        />
        <Metric
          icon={Sparkles}
          label="Wellness score"
          value={`${data?.teacher?.wellnessScore ?? 78}`}
          note="Calculated overall index"
        />
        <Metric
          icon={ShieldCheck}
          label="Burnout risk"
          value={burnoutRiskLabel}
          note={`Risk score: ${burnoutRiskScore}%`}
        />
      </div>

      {/* Content grid */}
      <div className="content-grid">
        {/* Mood chart */}
        <section className="panel">
          <div className="panel-header">
            <div>
              <h3>Your week at a glance</h3>
              <span className="muted">A little context, never judgment.</span>
            </div>
            <button className="btn light">Last 7 check-ins</button>
          </div>
          <div className="chart">
            <div
              style={{
                height: '100%',
                display: 'flex',
                alignItems: 'end',
                gap: 20,
                padding: '15px 15px 0',
              }}
            >
              {moods.map((m, i) => (
                <div key={i} style={{ flex: 1, textAlign: 'center' }}>
                  <div
                    style={{
                      height: `${m.mood * 18 + 35}px`,
                      borderRadius: '9px 9px 3px 3px',
                      background: i === moods.length - 1 ? 'var(--ink)' : 'var(--surface-muted)',
                      transition: 'height .3s',
                    }}
                  />
                  <small className="muted">{m.day}</small>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Upcoming sessions */}
        <section className="panel">
          <div className="panel-header">
            <h3>Upcoming support</h3>
            <Link className="link" to="/appointments">
              View all
            </Link>
          </div>
          {data?.appointments?.length ? (
            data.appointments.map((a) => (
              <div className="appointment" key={a.id}>
                <div className="time">{new Date(a.scheduledAt).toLocaleDateString()}</div>
                <div>
                  <b>{a.counselor.user.name}</b>
                  <span>{a.counselor.specialty}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="empty">
              No sessions scheduled yet.
              <br />
              <Link className="link" to="/appointments">
                Find a counselor
              </Link>
            </div>
          )}
        </section>
      </div>

      {/* Wellbeing Insights Panel */}
      {insights && (
        <section className="panel" style={{ marginTop: 18 }}>
          <div className="panel-header">
            <div>
              <h3>Wellbeing Insights</h3>
              <span className="muted">AI-traced patterns across your mood, journal, and AI sessions (last 14 days).</span>
            </div>
            <Brain size={20} color="var(--ink)" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            {/* Common triggers */}
            <div style={{ background: 'var(--surface-muted)', padding: 14, borderRadius: 12, border: '1px solid var(--border)' }}>
              <small style={{ fontWeight: 700, color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: 5 }}>
                <TrendingUp size={13} /> Common Triggers
              </small>
              {commonTriggers.length ? (
                <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {commonTriggers.map((t) => (
                    <span key={t.trigger} style={{ fontSize: 11, background: 'var(--border-soft)', color: 'var(--ink)', padding: '3px 10px', borderRadius: 10, fontWeight: 600 }}>
                      {t.trigger} ({t.count})
                    </span>
                  ))}
                </div>
              ) : (
                <p className="muted" style={{ marginTop: 8, fontSize: 12 }}>No trigger data yet. Check in to build this.</p>
              )}
            </div>

            {/* Journal stress */}
            <div style={{ background: 'var(--surface-muted)', padding: 14, borderRadius: 12, border: '1px solid var(--border)' }}>
              <small style={{ fontWeight: 700, color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: 5 }}>
                <Gauge size={13} /> Journal Stress Trend
              </small>
              {avgJournalStress !== null ? (
                <div style={{ marginTop: 8 }}>
                  <b style={{ fontSize: 22, color: avgJournalStress > 60 ? '#ef4444' : avgJournalStress > 30 ? '#f59e0b' : '#10b981' }}>
                    {avgJournalStress}
                  </b>
                  <small className="muted"> / 100 avg stress</small>
                  {journalStressTrend.length > 1 && (
                    <div style={{ marginTop: 6, fontSize: 11, color: 'var(--muted-fg)' }}>
                      {journalStressTrend[journalStressTrend.length - 1].stressScore >
                        journalStressTrend[0].stressScore
                        ? 'Trending upward — consider extra rest.'
                        : 'Trending downward — good signs.'}
                    </div>
                  )}
                </div>
              ) : (
                <p className="muted" style={{ marginTop: 8, fontSize: 12 }}>No journal stress data yet. Write a reflection.</p>
              )}
            </div>

            {/* PERMA pillars */}
            <div style={{ background: 'var(--surface-muted)', padding: 14, borderRadius: 12, border: '1px solid var(--border)' }}>
              <small style={{ fontWeight: 700, color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: 5 }}>
                <Brain size={13} /> PERMA Pillars
              </small>
              {permaEntries.length ? (
                <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {permaEntries.map(([pillar, count]) => (
                    <span key={pillar} style={{ fontSize: 11, background: 'var(--border-soft)', color: 'var(--ink)', padding: '3px 10px', borderRadius: 10, fontWeight: 600 }}>
                      {pillar} ({count})
                    </span>
                  ))}
                </div>
              ) : (
                <p className="muted" style={{ marginTop: 8, fontSize: 12 }}>No journal data yet.</p>
              )}
            </div>

            {/* Exhaustion levels */}
            <div style={{ background: 'var(--surface-muted)', padding: 14, borderRadius: 12, border: '1px solid var(--border)' }}>
              <small style={{ fontWeight: 700, color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: 5 }}>
                <ShieldCheck size={13} /> Exhaustion Pattern
              </small>
              {exhaustionEntries.length ? (
                <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {exhaustionEntries.map(([level, count]) => (
                    <span
                      key={level}
                      style={{
                        fontSize: 11,
                        background:
                          level === 'High' ? 'rgba(239,68,68,0.15)' : level === 'Moderate' ? 'rgba(245,158,11,0.15)' : 'rgba(16,185,129,0.15)',
                        color:
                          level === 'High' ? '#ef4444' : level === 'Moderate' ? '#f59e0b' : '#10b981',
                        padding: '3px 10px',
                        borderRadius: 10,
                        fontWeight: 600,
                      }}
                    >
                      {level} ({count})
                    </span>
                  ))}
                </div>
              ) : (
                <p className="muted" style={{ marginTop: 8, fontSize: 12 }}>No exhaustion data yet.</p>
              )}
            </div>
          </div>

          {/* Top emotions from AI sessions */}
          {topEmotions.length > 0 && (
            <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
              <small style={{ fontWeight: 700, color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: 5 }}>
                <Sparkles size={13} /> Emotions from AI Sessions
              </small>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
                {topEmotions.map((e) => (
                  <span key={e.emotion} style={{ fontSize: 12, background: 'var(--surface-muted)', color: 'var(--ink-soft)', padding: '4px 12px', borderRadius: 20, border: '1px solid var(--border)', fontWeight: 600 }}>
                    {e.emotion} <span style={{ color: 'var(--muted-fg)' }}>×{e.count}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Quick actions */}
      <section className="panel" style={{ marginTop: 18 }}>
        <div className="panel-header">
          <div>
            <h3>A little support, right now</h3>
            <span className="muted">Choose what feels useful.</span>
          </div>
        </div>
        <div className="quick-grid">
          <Link className="quick" to="/chat">
            <MessageCircle size={18} />
            <span>Talk with AI</span>
          </Link>
          <Link className="quick" to="/appointments">
            <CalendarDays size={18} />
            <span>Book a counselor</span>
          </Link>
          <Link className="quick" to="/journal">
            <NotebookPen size={18} />
            <span>Write it down</span>
          </Link>
          <Link className="quick" to="/meditation">
            <Wind size={18} />
            <span>Take a pause</span>
          </Link>
        </div>
      </section>
    </Portal>
  );
}