import { useState, useEffect, useRef } from 'react';
import {
  Clock, Music, Sun, Wind, Play, Pause, X, CheckCircle,
  Heart, Moon, Leaf, Sparkles, Waves, Brain, Flame, Droplet,
  Volume2, VolumeX, Settings, ChevronDown, ChevronUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Portal from '../components/Portal';
import FeatureIcon from '../components/FeatureIcon';

const SESSION_CATEGORIES = [
  { id: 'breathing', name: 'Breathing', icon: Wind, color: '#8bcfef' },
  { id: 'body', name: 'Body Scan', icon: Heart, color: '#f5a9a9' },
  { id: 'sleep', name: 'Sleep', icon: Moon, color: '#a8c5e8' },
  { id: 'focus', name: 'Focus', icon: Brain, color: '#c5e8a8' },
  { id: 'emergency', name: 'Quick Reset', icon: Flame, color: '#f5d6a9' },
];

const SESSIONS = [
  // Breathing
  { id: 'box', category: 'breathing', name: 'Box Breathing', duration: 240, label: '4 min', desc: 'Steady 4-4-4-4 rhythm for busy moments', icon: Wind, phases: ['Inhale', 'Hold', 'Exhale', 'Hold'], phaseSec: 4, pattern: [4, 4, 4, 4] },
  { id: '478', category: 'breathing', name: '4-7-8 Breath', duration: 300, label: '5 min', desc: 'Calming 4-7-8 pattern for anxiety relief', icon: Wind, phases: ['Inhale', 'Hold', 'Exhale'], phaseSec: 4, pattern: [4, 7, 8] },
  { id: 'coherent', category: 'breathing', name: 'Coherent Breathing', duration: 360, label: '6 min', desc: '5 breaths/min for heart-rate coherence', icon: Waves, phases: ['Inhale', 'Exhale'], phaseSec: 6, pattern: [6, 6] },

  // Body Scan
  { id: 'bodyscan', category: 'body', name: 'Body Scan', duration: 600, label: '10 min', desc: 'Progressive relaxation from head to toe', icon: Heart, phases: ['Scan', 'Release', 'Rest'], phaseSec: 15, pattern: [15, 10, 5] },
  { id: 'bodyshort', category: 'body', name: 'Micro Body Scan', duration: 180, label: '3 min', desc: 'Quick tension check for busy days', icon: Heart, phases: ['Scan', 'Release'], phaseSec: 10, pattern: [10, 5] },

  // Sleep
  { id: 'sleep', category: 'sleep', name: 'Evening Unwind', duration: 600, label: '10 min', desc: 'Release the day with gentle 4-7-8 breathing', icon: Moon, phases: ['Breathe', 'Relax', 'Drift'], phaseSec: 10, pattern: [10, 10, 10] },
  { id: 'sleepless', category: 'sleep', name: 'Can\'t Sleep', duration: 300, label: '5 min', desc: 'For racing thoughts at bedtime', icon: Sparkles, phases: ['Count', 'Breathe', 'Let go'], phaseSec: 8, pattern: [8, 8, 8] },

  // Focus
  { id: 'focus', category: 'focus', name: 'Focus Anchor', duration: 300, label: '5 min', desc: 'Breath counting for sustained attention', icon: Brain, phases: ['Count', 'Notice', 'Return'], phaseSec: 12, pattern: [12, 6, 6] },
  { id: 'focusshort', category: 'focus', name: 'Pre-Class Center', duration: 120, label: '2 min', desc: 'Quick centering before your next class', icon: Sun, phases: ['Inhale', 'Hold', 'Exhale'], phaseSec: 4, pattern: [4, 4, 4] },

  // Emergency/Quick
  { id: 'panic', category: 'emergency', name: 'Panic Reset', duration: 180, label: '3 min', desc: 'Extended exhale for acute stress', icon: Flame, phases: ['Inhale', 'Long Exhale'], phaseSec: 4, pattern: [4, 8] },
  { id: 'grounding', category: 'emergency', name: '5-4-3-2-1 Grounding', duration: 300, label: '5 min', desc: 'Sensory grounding for overwhelm', icon: Droplet, phases: ['See', 'Touch', 'Hear', 'Smell', 'Taste'], phaseSec: 15, pattern: [15, 15, 15, 15, 15] },
];

const AMBIENT_SOUNDS = [
  { id: 'none', name: 'Silence', icon: VolumeX },
  { id: 'rain', name: 'Rain', icon: Droplet },
  { id: 'waves', name: 'Ocean Waves', icon: Waves },
  { id: 'forest', name: 'Forest', icon: Leaf },
  { id: 'whitenoise', name: 'White Noise', icon: Volume2 },
];

function ParticleBackground({ className, color = '#262626', count = 30 }) {
  const particlesRef = useRef([]);
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const newParticles = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      speedX: (Math.random() - 0.5) * 0.3,
      speedY: (Math.random() - 0.5) * 0.3,
      opacity: Math.random() * 0.4 + 0.1,
      delay: Math.random() * 5,
    }));
    setParticles(newParticles);
  }, [count]);

  return (
    <div className={className} style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', borderRadius: 'inherit' }}>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            borderRadius: '50%',
            background: color,
            opacity: p.opacity,
          }}
          animate={{
            x: [0, p.speedX * 100, 0],
            y: [0, p.speedY * 100, 0],
            opacity: [p.opacity, p.opacity * 0.5, p.opacity],
          }}
          transition={{
            duration: 15 + Math.random() * 10,
            repeat: Infinity,
            ease: 'linear',
            delay: p.delay,
          }}
        />
      ))}
    </div>
  );
}

function BreathingCircle({ phase, progress, pattern, color = '#262626' }) {
  const [scale, setScale] = useState(1);
  const [opacity, setOpacity] = useState(0.3);

  useEffect(() => {
    if (!pattern.length) return;

    const totalDuration = pattern.reduce((a, b) => a + b, 0) * 1000;
    let currentPhase = 0;
    let phaseElapsed = 0;

    const interval = setInterval(() => {
      phaseElapsed += 100;
      if (phaseElapsed >= pattern[currentPhase] * 1000) {
        phaseElapsed = 0;
        currentPhase = (currentPhase + 1) % pattern.length;
      }

      const phaseProgress = phaseElapsed / (pattern[currentPhase] * 1000);
      const isInhale = currentPhase % 2 === 0;

      if (isInhale) {
        setScale(0.85 + phaseProgress * 0.35);
        setOpacity(0.3 + phaseProgress * 0.5);
      } else {
        setScale(1.2 - phaseProgress * 0.35);
        setOpacity(0.8 - phaseProgress * 0.5);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [pattern]);

  return (
    <div
      style={{
        width: 200,
        height: 200,
        borderRadius: '50%',
        background: `radial-gradient(circle at center, ${color}22 0%, ${color}44 50%, ${color}11 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        boxShadow: `
          0 0 60px ${color}33,
          0 0 120px ${color}22,
          inset 0 0 60px ${color}11
        `,
      }}
    >
      <motion.div
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          background: `radial-gradient(circle at center, ${color}44 0%, ${color}22 50%, transparent 70%)`,
          transform: `scale(${scale})`,
          opacity,
        }}
        animate={{ scale, opacity }}
        transition={{ duration: 0.1, ease: 'linear' }}
      />
      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', color: color, fontWeight: 600 }}>
        <div style={{ fontSize: 28, fontWeight: 700 }}>{phase}</div>
        <div style={{ fontSize: 14, opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{pattern[0] > 5 ? 'Slow' : 'Steady'}</div>
      </div>
    </div>
  );
}

function SoundPicker({ selected, onChange }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="sound-picker" style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        className="btn light"
        style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', minHeight: 'auto', fontSize: '0.9rem' }}
      >
        <Volume2 size={16} />
        {AMBIENT_SOUNDS.find(s => s.id === selected)?.name || 'Silence'}
        <ChevronDown size={14} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{
              position: 'absolute',
              bottom: '100%',
              left: 0,
              marginBottom: 8,
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--r-md)',
              boxShadow: 'var(--shadow-lg)',
              padding: 8,
              zIndex: 10,
              minWidth: 180,
            }}
          >
            {AMBIENT_SOUNDS.map(sound => (
              <button
                key={sound.id}
                onClick={() => { onChange(sound.id); setOpen(false); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  width: '100%',
                  padding: '10px 12px',
                  border: 'none',
                  background: selected === sound.id ? 'var(--primary-tint)' : 'transparent',
                  borderRadius: 'var(--r-sm)',
                  color: selected === sound.id ? 'var(--ink)' : 'var(--ink-soft)',
                  fontSize: '0.9rem',
                  fontWeight: selected === sound.id ? 600 : 500,
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 150ms ease',
                }}
              >
                <sound.icon size={16} />
                {sound.name}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Meditation() {
  const [activeCategory, setActiveCategory] = useState('breathing');
  const [activeSession, setActiveSession] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [breathPhase, setBreathPhase] = useState('Inhale');
  const [completedCount, setCompletedCount] = useState(3);
  const [sessionProgress, setSessionProgress] = useState(0);
  const [selectedSound, setSelectedSound] = useState('none');
  const [showSettings, setShowSettings] = useState(false);

  const session = activeSession ? SESSIONS.find(s => s.id === activeSession) : null;
  const pattern = session?.pattern || [4, 4, 4, 4];

  useEffect(() => {
    let timer;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          const newTime = prev - 1;
          if (session) {
            setSessionProgress(1 - newTime / session.duration);
          }
          return newTime;
        });
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      setCompletedCount(prev => prev + 1);
      setSessionProgress(1);
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft, session]);

  useEffect(() => {
    let breathInterval;
    if (isRunning && pattern.length > 0) {
      let phaseIndex = 0;
      let phaseTimer = 0;

      breathInterval = setInterval(() => {
        phaseTimer += 1;
        if (phaseTimer >= pattern[phaseIndex]) {
          phaseTimer = 0;
          phaseIndex = (phaseIndex + 1) % pattern.length;
          setBreathPhase(session?.phases[phaseIndex] || 'Inhale');
        }
      }, 1000);
    }
    return () => clearInterval(breathInterval);
  }, [isRunning, pattern, session?.phases]);

  const startSession = (sessionId) => {
    const s = SESSIONS.find(s => s.id === sessionId);
    if (!s) return;
    setActiveSession(sessionId);
    setTimeLeft(s.duration);
    setIsRunning(true);
    setBreathPhase(s.phases[0]);
    setSessionProgress(0);
    setShowSettings(false);
  };

  const closeSession = () => {
    setIsRunning(false);
    setActiveSession(null);
    setSessionProgress(0);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const filteredSessions = SESSIONS.filter(s => s.category === activeCategory);

  return (
    <Portal title="Meditation & Reset" subtitle="A few quiet minutes can change the shape of your day.">
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
          {SESSION_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 16px',
                borderRadius: 'var(--r-pill)',
                border: '1px solid var(--border)',
                background: activeCategory === cat.id ? cat.color : 'var(--surface)',
                color: activeCategory === cat.id ? '#1a1a1a' : 'var(--ink-soft)',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 150ms ease',
              }}
            >
              <cat.icon size={14} />
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <div className="meditation-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 18 }}>
        {filteredSessions.map((session) => {
          const Icon = session.icon;
          return (
            <motion.article
              key={session.id}
              className="med-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--r-lg)',
                padding: '24px',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <ParticleBackground color={session.color || '#262626'} count={15} />
              <div style={{ position: 'relative', zIndex: 1 }}>
                <FeatureIcon style={{ margin: '0 auto 16px', background: session.color + '22' }}>
                  <Icon size={21} style={{ color: session.color || '#262626' }} />
                </FeatureIcon>
                <h3 style={{ marginBottom: 6 }}>{session.name}</h3>
                <p className="muted" style={{ marginBottom: 16, fontSize: '0.88rem' }}>{session.desc}</p>
                <button
                  className="btn light"
                  onClick={() => startSession(session.id)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 8, width: '100%' }}
                >
                  <Clock size={14} /> {session.label}
                </button>
              </div>
            </motion.article>
          );
        })}
      </div>

      <motion.section className="panel" style={{ marginTop: 20 }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <h3>Your Practice</h3>
        <p className="muted">
          You've completed <b>{completedCount}</b> mindful pauses this week. Small care counts.
        </p>
      </motion.section>

      {activeSession && session && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(38, 38, 38, 0.7)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 20,
          }}
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            className="panel"
            style={{
              width: '100%',
              maxWidth: 520,
              textAlign: 'center',
              padding: '36px 28px',
              borderRadius: 24,
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
              background: '#ffffff',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <ParticleBackground color="#262626" count={20} />

            <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <button
                onClick={closeSession}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#8a8a8a',
                  padding: 8,
                }}
              >
                <X size={20} />
              </button>
              <SoundPicker selected={selectedSound} onChange={setSelectedSound} />
            </div>

            <h3 style={{ marginBottom: 4 }}>{session.name}</h3>
            <span className="muted" style={{ display: 'block', marginBottom: 30 }}>{session.label} Guided Session</span>

            <BreathingCircle
              phase={breathPhase}
              progress={sessionProgress}
              pattern={pattern}
              color={session.color || '#262626'}
            />

            <motion.div
              style={{ fontSize: 36, fontWeight: 700, margin: '20px 0', color: '#262626', fontVariantNumeric: 'tabular-nums' }}
              animate={{ scale: isRunning ? 1.02 : 1 }}
              transition={{ duration: 1, repeat: Infinity, repeatType: 'reverse' }}
            >
              {formatTime(timeLeft)}
            </motion.div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 20 }}>
              {session.phases.map((phase, i) => (
                <motion.span
                  key={phase}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 'var(--r-pill)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    background: breathPhase === phase ? (session.color || '#262626') : 'var(--surface-muted)',
                    color: breathPhase === phase ? '#fff' : 'var(--ink-soft)',
                    border: '1px solid var(--border)',
                  }}
                  animate={{ scale: breathPhase === phase ? 1.05 : 1 }}
                >
                  {phase}
                </motion.span>
              ))}
            </div>

            {timeLeft === 0 ? (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <CheckCircle size={48} style={{ color: '#22c55e', marginBottom: 16 }} />
                <p style={{ color: '#262626', fontWeight: 600, fontSize: '1.1rem', marginBottom: 8 }}>
                  Session Completed!
                </p>
                <p className="muted" style={{ marginBottom: 20 }}>
                  Great job taking time for yourself.
                </p>
                <button className="btn" onClick={closeSession} style={{ width: '100%' }}>
                  Continue
                </button>
              </motion.div>
            ) : (
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  className="btn"
                  onClick={() => setIsRunning(!isRunning)}
                  style={{ flex: 1, minWidth: 140 }}
                >
                  {isRunning ? <Pause size={18} /> : <Play size={18} />}
                  {isRunning ? 'Pause' : 'Resume'}
                </button>
                <button className="btn light" onClick={closeSession} style={{ flex: 1, minWidth: 140 }}>
                  End Early
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </Portal>
  );
}