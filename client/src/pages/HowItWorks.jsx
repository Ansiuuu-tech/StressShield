import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Heart, BarChart3, MessageCircle, Wind, CalendarDays, Sparkles, Shield, Brain, Leaf } from 'lucide-react';
import Portal from '../components/Portal';

const STEPS = [
  {
    number: '01',
    title: 'Check in',
    description: 'A 60-second mood check-in captures how you\'re really doing. Our AI + ML analyzes sentiment, context, and patterns — not just a number.',
    icon: Heart,
    color: '#f472b6',
    bgTint: '#fdf2f8',
  },
  {
    number: '02',
    title: 'See your patterns',
    description: 'Your dashboard reveals stress trends, burnout risk, and journal insights over time. Weekly summaries show what\'s helping and what\'s not.',
    icon: BarChart3,
    color: '#60a5fa',
    bgTint: '#eff6ff',
  },
  {
    number: '03',
    title: 'Get support in the moment',
    description: 'AI chat with mode-specific coaching: de-escalation for tough moments, prioritization when overwhelmed, venting when you need to be heard, recovery for after.',
    icon: MessageCircle,
    color: '#a78bfa',
    bgTint: '#f5f3ff',
  },
  {
    number: '04',
    title: 'Take action',
    description: 'Guided meditation, journaling prompts, or book a counselor session — all matched to your current state. Small steps, consistently.',
    icon: Wind,
    color: '#4ade80',
    bgTint: '#f0fdf4',
  },
];

const FEATURES = [
  { icon: Shield, title: 'Private by design', desc: 'Your data never leaves your control. No ads, no selling, no surprises.' },
  { icon: Brain, title: 'ML-powered insights', desc: 'Sentiment analysis, burnout prediction, and personalized recommendations.' },
  { icon: Leaf, title: 'Built for educators', desc: 'Designed around school schedules, stressors, and the reality of the job.' },
  { icon: Sparkles, title: 'Always available', desc: 'No waitlists. No office hours. Support when you need it, 24/7.' },
];

export default function HowItWorks() {
  return (
    <Portal title="How it works" subtitle="Four simple steps to sustainable wellbeing.">
      <section style={{ padding: '80px 0 40px' }}>
        <div style={{ textAlign: 'center', maxWidth: '48ch', margin: '0 auto 60px' }}>
          <motion.span
            className="eyebrow"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 16 }}
          >
            <Sparkles size={13} /> How StressShield works
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', lineHeight: 1.1, marginBottom: 16 }}
          >
            Four steps to a more sustainable career
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="muted"
            style={{ fontSize: '1.1rem', maxWidth: '50ch', margin: '0 auto' }}
          >
            We built this around how teachers actually work — not how wellness apps think you should work.
          </motion.p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 32, maxWidth: '900px', margin: '0 auto' }}>
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.article
                key={step.number}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'auto 1fr',
                  gap: 32,
                  alignItems: 'start',
                  padding: '32px',
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--r-lg)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div style={{ position: 'absolute', top: 0, left: 0, width: 6, height: '100%', background: step.color }} />
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: step.bgTint,
                  flexShrink: 0,
                }}>
                  <Icon size={32} style={{ color: step.color }} />
                </div>
                <div>
                  <div style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: step.color,
                    marginBottom: 8,
                  }}>
                    Step {step.number}
                  </div>
                  <h2 style={{ fontSize: '1.75rem', marginBottom: 12, color: 'var(--ink)' }}>{step.title}</h2>
                  <p className="muted" style={{ fontSize: '1.05rem', lineHeight: 1.7, color: 'var(--ink-soft)' }}>{step.description}</p>
                </div>
              </motion.article>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.8 }}
          style={{ marginTop: 60, padding: '48px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', textAlign: 'center' }}
        >
          <span className="eyebrow" style={{ marginBottom: 16, display: 'inline-block' }}>Why teachers choose StressShield</span>
          <h2 style={{ marginBottom: 32 }}>Designed for the reality of school life</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginTop: 32 }}>
            {FEATURES.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.9 + i * 0.1 }}
                  style={{ textAlign: 'left', padding: '20px' }}
                >
                  <div style={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    background: 'var(--surface-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 16,
                  }}>
                    <Icon size={22} style={{ color: 'var(--ink)' }} />
                  </div>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: 8 }}>{feature.title}</h3>
                  <p className="muted" style={{ fontSize: '0.9rem' }}>{feature.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 1.2 }}
          style={{ marginTop: 48, textAlign: 'center' }}
        >
          <Link className="btn" to="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '16px 32px', fontSize: '1.05rem' }}>
            Begin your check-in <ArrowRight size={18} />
          </Link>
          <p className="muted" style={{ marginTop: 16, fontSize: '0.9rem' }}>
            Free to start · No credit card · Built with privacy at its core
          </p>
        </motion.div>
      </section>
    </Portal>
  );
}