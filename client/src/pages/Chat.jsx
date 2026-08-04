import { useEffect, useState } from 'react';
import {
  Send,
  Wind,
  NotebookPen,
  CalendarDays,
  Sparkles,
  HeartHandshake,
  CheckSquare,
  Coffee,
  ShieldAlert,
  Smile,
  Lightbulb,
  Gauge,
  ThumbsUp,
  ThumbsDown,
  Brain,
  Activity,
  AlertTriangle,
  Heart,
  Eye,
  X,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Portal from '../components/Portal';
import api from '../services/api';

const MODES = [
  { id: 'deescalate', label: 'Quick De-escalation', icon: Wind, desc: 'Ground after a hard class' },
  { id: 'prioritize', label: 'Workload Prioritizer', icon: CheckSquare, desc: 'Organize grading/prep load' },
  { id: 'vent', label: 'Unwind & Vent', icon: Coffee, desc: 'Safe emotional listening' },
  { id: 'recovery', label: '15-Min Recovery Plan', icon: HeartHandshake, desc: 'Evening boundary plan' },
  { id: 'emotional', label: 'Emotion Check-in', icon: Smile, desc: 'Name and process feelings' },
  { id: 'strategy', label: 'Classroom Strategy', icon: Lightbulb, desc: 'Practical teaching solutions' },
];

const SUGGESTIONS = [
  "I'm feeling overwhelmed after my last period",
  'Help me prioritize my grading pile today',
  'I need a quick 2-minute mental reset',
  'How can I transition smoothly from work to home tonight?',
];

const EMOTION_STYLES = {
  overwhelmed: '#f43f5e',
  anxious: '#f59e0b',
  stressed: '#f97316',
  exhausted: '#8b5cf6',
  drained: '#6366f1',
  frustrated: '#ef4444',
  worried: '#f59e0b',
  calm: '#10b981',
  hopeful: '#22c55e',
  proud: '#14b8a6',
  crisis: '#dc2626',
  grateful: '#10b981',
  conflicted: '#f59e0b',
  numb: '#6b7280',
  resentful: '#ef4444',
};

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [mode, setMode] = useState('general');
  const [busy, setBusy] = useState(false);
  const [feedbackState, setFeedbackState] = useState({}); // { messageId: 'up'|'down' }
  const [burnoutAlert, setBurnoutAlert] = useState(null); // ML burnout data
  const [contextLoaded, setContextLoaded] = useState(false);
  const [showBurnoutBanner, setShowBurnoutBanner] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Load chat history
    api
      .get('/ai/history')
      .then((r) => {
        setMessages(r.data);
        setContextLoaded(true);
      })
      .catch(() => {
        setMessages([
          {
            id: 'hello',
            role: 'assistant',
            content: "Hi, I'm your StressShield AI companion — trained in teacher-specific wellbeing support. I know your recent mood trends and stress patterns. What's feeling most present for you today?",
          },
        ]);
        setContextLoaded(true);
      });

    // Load ML burnout data for alert banner
    api
      .get('/wellness/moods/ml-insights')
      .then((r) => {
        if (r.data.available && r.data.burnout?.riskLevel !== 'low') {
          setBurnoutAlert(r.data.burnout);
        }
      })
      .catch(() => { });
  }, []);

  const send = async (input) => {
    const msg = input || text;
    if (!msg.trim() || busy) return;

    setMessages((prev) => [...prev, { id: Date.now(), role: 'user', content: msg }]);
    setText('');
    setBusy(true);

    try {
      const r = await api.post('/ai/chat', { message: msg, mode });
      setMessages((prev) => [...prev, r.data]);
    } finally {
      setBusy(false);
    }
  };

  const sendFeedback = async (messageId, helpful) => {
    const key = helpful ? 'up' : 'down';
    setFeedbackState((prev) => ({ ...prev, [messageId]: key }));
    try {
      await api.post('/ai/feedback', { messageId, helpful });
    } catch (err) {
      console.error('Feedback error:', err);
    }
  };

  const renderActionButton = (actionType) => {
    if (actionType === 'MEDITATION') {
      return (
        <button className="btn light" style={{ fontSize: 13, gap: 6 }} onClick={() => navigate('/meditation')}>
          <Wind size={15} /> Launch Guided Reset
        </button>
      );
    }
    if (actionType === 'JOURNAL') {
      return (
        <button className="btn light" style={{ fontSize: 13, gap: 6 }} onClick={() => navigate('/journal')}>
          <NotebookPen size={15} /> Write Journal Reflection
        </button>
      );
    }
    if (actionType === 'BOOKING') {
      return (
        <button className="btn light" style={{ fontSize: 13, gap: 6 }} onClick={() => navigate('/appointments')}>
          <CalendarDays size={15} /> Connect with Counselor
        </button>
      );
    }
    return null;
  };

  const renderMessageContent = (m) => {
    let cleanText = m.content || '';
    const actionMatch = cleanText.match(/\[ACTION:(MEDITATION|JOURNAL|BOOKING)(?::(\w+))?\]/);

    if (actionMatch) {
      cleanText = cleanText.replace(/\[ACTION:[^\]]+\]/g, '').trim();
    }

    const emotionColor = m.role === 'assistant' && m.detectedEmotion
      ? EMOTION_STYLES[m.detectedEmotion.toLowerCase()] || '#8a8a8a'
      : null;

    return (
      <div>
        <p style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{cleanText}</p>

        {/* AI insights chips (emotion, stress level) */}
        {m.role === 'assistant' && (m.detectedEmotion || typeof m.stressLevel === 'number') && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
            {m.detectedEmotion && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  fontSize: 11,
                  padding: '3px 10px',
                  borderRadius: 20,
                  background: emotionColor + '18',
                  color: emotionColor,
                  fontWeight: 600,
                }}
              >
                <Sparkles size={12} /> Feeling: {m.detectedEmotion}
              </span>
            )}
            {typeof m.stressLevel === 'number' && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  fontSize: 11,
                  padding: '3px 10px',
                  borderRadius: 20,
                  background: 'var(--surface-muted)',
                  color: 'var(--ink)',
                  fontWeight: 600,
                }}
              >
                <Gauge size={12} /> Stress: {m.stressLevel}/100
              </span>
            )}
          </div>
        )}

        {actionMatch && (
          <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--border)' }}>
            {renderActionButton(actionMatch[1])}
          </div>
        )}

        {/* Feedback buttons */}
        {m.role === 'assistant' && m.id && m.id !== 'hello' && (
          <div style={{
            marginTop: 10, paddingTop: 8, borderTop: '1px solid var(--border)',
            display: 'flex', gap: 6, alignItems: 'center',
          }}>
            <span style={{ fontSize: 10, color: 'var(--muted-fg)', marginRight: 4 }}>Was this helpful?</span>
            <button
              onClick={() => sendFeedback(m.id, true)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 3,
                padding: '3px 8px', borderRadius: 6, border: '1px solid',
                borderColor: feedbackState[m.id] === 'up' ? '#10b981' : 'var(--border)',
                background: feedbackState[m.id] === 'up' ? 'rgba(16,185,129,0.15)' : 'transparent',
                color: feedbackState[m.id] === 'up' ? '#10b981' : 'var(--muted-fg)',
                fontSize: 11, cursor: 'pointer', fontWeight: 600,
                transition: 'all 0.2s',
              }}
              disabled={!!feedbackState[m.id]}
            >
              <ThumbsUp size={12} /> Yes
            </button>
            <button
              onClick={() => sendFeedback(m.id, false)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 3,
                padding: '3px 8px', borderRadius: 6, border: '1px solid',
                borderColor: feedbackState[m.id] === 'down' ? '#ef4444' : 'var(--border)',
                background: feedbackState[m.id] === 'down' ? 'rgba(239,68,68,0.15)' : 'transparent',
                color: feedbackState[m.id] === 'down' ? '#ef4444' : 'var(--muted-fg)',
                fontSize: 11, cursor: 'pointer', fontWeight: 600,
                transition: 'all 0.2s',
              }}
              disabled={!!feedbackState[m.id]}
            >
              <ThumbsDown size={12} /> No
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <Portal title="AI Support Agent" subtitle="A private, empathetic space tailored to educator life.">

      {/* ── Burnout Alert Banner ── */}
      {burnoutAlert && showBurnoutBanner && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12, padding: '12px 18px',
          borderRadius: 14, marginBottom: 16,
          background: burnoutAlert.riskLevel === 'high'
            ? 'linear-gradient(135deg, rgba(239,68,68,0.10) 0%, rgba(239,68,68,0.16) 100%)'
            : 'linear-gradient(135deg, rgba(245,158,11,0.08) 0%, rgba(245,158,11,0.14) 100%)',
          border: `1px solid ${burnoutAlert.riskLevel === 'high' ? 'rgba(239,68,68,0.35)' : 'rgba(245,158,11,0.35)'}`,
        }}>
          <AlertTriangle size={20} color={burnoutAlert.riskLevel === 'high' ? '#ef4444' : '#f59e0b'} />
          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: 13, fontWeight: 700,
              color: burnoutAlert.riskLevel === 'high' ? '#ef4444' : '#f59e0b',
            }}>
              {burnoutAlert.riskLevel === 'high'
                ? '⚠️ Elevated Burnout Risk Detected'
                : '⚡ Moderate Burnout Risk Flagged'}
            </div>
            <div style={{
              fontSize: 12,
              color: 'var(--ink-soft)',
              marginTop: 2,
            }}>
              ML analysis shows {burnoutAlert.burnoutProbability}% burnout probability.
              {burnoutAlert.riskFactors?.[0] && ` ${burnoutAlert.riskFactors[0]}.`}
              {' '}Consider talking with the AI or booking a counselor session.
            </div>
          </div>
          <button
            onClick={() => setShowBurnoutBanner(false)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: 4, borderRadius: 6, color: 'var(--muted-fg)',
            }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* ── Context Awareness Indicator ── */}
      {contextLoaded && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12,
          padding: '8px 14px', borderRadius: 10,
          background: 'var(--surface-muted)',
          border: '1px solid var(--border)',
        }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%',
            background: '#10b981',
            boxShadow: '0 0 6px #10b981',
            animation: 'pulse 2s infinite',
          }} />
          <span style={{ fontSize: 11, color: 'var(--ink)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Brain size={13} /> AI has context from your mood check-ins, journal entries, and stress data
          </span>
          <span style={{ fontSize: 10, color: 'var(--muted-fg)', marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Eye size={11} /> Trained: MBI • PERMA • CBT
          </span>
        </div>
      )}

      {/* Mode Selectors */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 15 }}>
        {MODES.map((m) => {
          const Icon = m.icon;
          const isSelected = mode === m.id;
          return (
            <button
              key={m.id}
              onClick={() => setMode(isSelected ? 'general' : m.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 14px',
                borderRadius: 20,
                border: isSelected ? '1px solid var(--ink)' : '1px solid var(--border)',
                background: isSelected ? 'var(--surface-muted)' : 'var(--surface)',
                color: isSelected ? 'var(--ink)' : 'var(--ink-soft)',
                fontSize: 13,
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <Icon size={15} /> {m.label}
            </button>
          );
        })}
      </div>

      <section className="panel chat">
        <div className="messages">
          {messages.map((m) => (
            <div key={m.id} className={'message ' + m.role}>
              {renderMessageContent(m)}
            </div>
          ))}
          {busy && (
            <div className="message assistant">
              <span className="typing-dots">
                <span className="dot" />
                <span className="dot" />
                <span className="dot" />
              </span>
              <span style={{ marginLeft: 6 }}>Thinking with you…</span>
            </div>
          )}
        </div>

        <div className="suggestions">
          {SUGGESTIONS.map((s) => (
            <button key={s} className="suggestion" onClick={() => send(s)}>
              {s}
            </button>
          ))}
        </div>

        <div className="chat-input">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            placeholder={
              mode !== 'general'
                ? `Mode: ${MODES.find((m) => m.id === mode)?.label} - Share what's on your mind...`
                : "Share what's on your mind…"
            }
          />
          <button className="send" onClick={() => send()}>
            <Send size={18} />
          </button>
        </div>
      </section>
    </Portal>
  );
}