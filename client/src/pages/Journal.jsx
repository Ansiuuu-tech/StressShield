import { useEffect, useState } from 'react';
import { ArrowRight, BookOpen, Sparkles, Brain, ShieldCheck } from 'lucide-react';
import Portal from '../components/Portal';
import api from '../services/api';

const PROMPT_STARTERS = [
  {
    label: '🌟 Small Win',
    title: 'A meaningful moment today',
    text: 'One moment where I felt connected or proud today was...',
    pillar: 'Accomplishment',
    mbi: 'Personal Accomplishment',
  },
  {
    label: '🛑 Boundary Reset',
    title: 'Protecting my evening',
    text: 'The hardest boundary to hold today was... Tomorrow I will protect...',
    pillar: 'Relationships',
    mbi: 'Depersonalization',
  },
  {
    label: '💭 Class Unwind',
    title: 'Processing 5th period',
    text: 'What felt overwhelming about class today was... What I can control is...',
    pillar: 'Emotional Recovery',
    mbi: 'Emotional Exhaustion',
  },
  {
    label: '🧠 Meaning Spark',
    title: 'Why I teach',
    text: 'A moment today that reminded me why I became a teacher was...',
    pillar: 'Meaning',
    mbi: 'Personal Accomplishment',
  },
  {
    label: '🫂 Connection Check',
    title: 'My people',
    text: 'A colleague or student connection today that lifted me was...',
    pillar: 'Relationships',
    mbi: 'Depersonalization',
  },
];

const EXHAUSTION_COLORS = {
  Low: '#10b981',
  Moderate: '#f59e0b',
  High: '#ef4444',
};

const PERMA_COLORS = {
  'Positive Emotion': '#f59e0b',
  Engagement: '#8b5cf6',
  Relationships: '#ec4899',
  Meaning: '#06b6d4',
  Accomplishment: '#10b981',
};

export default function Journal() {
  const [entries, setEntries] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => api.get('/wellness/journals').then((r) => setEntries(r.data));

  useEffect(() => {
    load();
  }, []);

  const applyPrompt = (prompt) => {
    setTitle(prompt.title);
    setContent(prompt.text);
  };

  const save = async () => {
    if (!title || !content || saving) return;
    setSaving(true);
    try {
      await api.post('/wellness/journals', { title, content });
      setTitle('');
      setContent('');
      load();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const exhaustionColor = (level) => EXHAUSTION_COLORS[level] || '#8a8a8a';
  const permaColor = (pillar) => PERMA_COLORS[pillar] || '#8a8a8a';

  return (
    <Portal
      title="Daily Science-Backed Journal"
      subtitle="Reflections evaluated against Maslach Burnout & PERMA Teacher Resilience Frameworks."
    >
      {/* Prompt Starters */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 15 }}>
        {PROMPT_STARTERS.map((p) => (
          <button
            key={p.label}
            className="btn light"
            onClick={() => applyPrompt(p)}
            title={`Pillar: ${p.pillar} | MBI: ${p.mbi}`}
            style={{ fontSize: 13, padding: '7px 12px' }}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="page-grid">
        {/* Write entry */}
        <section className="panel">
          <div className="field">
            <label>Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="A small win, a hard moment…"
            />
          </div>
          <div className="field">
            <label>What's on your mind?</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows="11"
              placeholder="Write freely. AI will analyze sentiment, stress indicators, and resilience pillars..."
            />
          </div>
          <button className="btn" onClick={save} disabled={saving || !title || !content}>
            {saving ? 'Analyzing & Saving...' : 'Save & Analyze Reflection'} <ArrowRight size={16} />
          </button>
        </section>

        {/* Past entries with AI Framework Insights */}
        <section className="panel">
          <div className="panel-header">
            <h3>Recent reflections</h3>
            <BookOpen size={17} />
          </div>
          <div className="journal-list">
            {entries.length ? (
              entries.map((x) => (
                <div className="journal-item" key={x.id} style={{ padding: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <b>{x.title}</b>
                    <span className="badge" style={{ background: 'var(--surface-muted)', color: 'var(--ink-soft)' }}>
                      {x.sentiment || 'Reflective'}
                    </span>
                  </div>
                  <p style={{ margin: '8px 0', fontSize: 14, color: 'var(--ink-soft)' }}>
                    {x.content.length > 140 ? `${x.content.slice(0, 140)}...` : x.content}
                  </p>

                  {x.aiSuggestion && (
                    <div style={{ background: 'var(--surface-muted)', padding: 10, borderRadius: 8, marginTop: 10, borderLeft: '3px solid var(--ink)' }}>
                      <small style={{ color: 'var(--ink)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Sparkles size={13} /> Science Insight:
                      </small>
                      <small style={{ color: 'var(--ink-soft)', display: 'block', marginTop: 2 }}>{x.aiSuggestion}</small>
                    </div>
                  )}

                  {/* PERMA Pillar + Emotional Exhaustion badges */}
                  {(x.permaPillar || x.emotionalExhaustionLevel) && (
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
                      {x.permaPillar && (
                        <span
                          style={{
                            fontSize: 11,
                            background: permaColor(x.permaPillar) + '1a',
                            color: permaColor(x.permaPillar),
                            padding: '3px 10px',
                            borderRadius: 10,
                            fontWeight: 600,
                          }}
                        >
                          <Brain size={11} style={{ verticalAlign: '-2px', marginRight: 3 }} />
                          PERMA: {x.permaPillar}
                        </span>
                      )}
                      {x.emotionalExhaustionLevel && (
                        <span
                          style={{
                            fontSize: 11,
                            background: exhaustionColor(x.emotionalExhaustionLevel) + '1a',
                            color: exhaustionColor(x.emotionalExhaustionLevel),
                            padding: '3px 10px',
                            borderRadius: 10,
                            fontWeight: 600,
                          }}
                        >
                          <ShieldCheck size={11} style={{ verticalAlign: '-2px', marginRight: 3 }} />
                          Exhaustion: {x.emotionalExhaustionLevel}
                        </span>
                      )}
                    </div>
                  )}

                  {x.emotions?.length > 0 && (
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
                      {x.emotions.map((e, idx) => (
                        <span key={idx} style={{ fontSize: 11, background: 'var(--surface-muted)', color: 'var(--ink)', padding: '2px 8px', borderRadius: 10 }}>
                          #{e}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="empty">Your thoughts and AI framework insights will gather here.</div>
            )}
          </div>
        </section>
      </div>
    </Portal>
  );
}