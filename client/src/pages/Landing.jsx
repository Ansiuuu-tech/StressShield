import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Sparkles,
  Sun,
  Activity,
} from 'lucide-react';
import Brand from '../components/Brand';
import StickyHeader from '../components/StickyHeader';

const FEATURES = [
  {
    label: 'Mood',
    title: 'Daily check-ins',
    desc: 'Simple, private check-ins turn how you feel into useful patterns.',
    image: 'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=800&q=80', // journal/notebook, warm light, hands writing
    to: '/mood',
  },
  {
    label: 'Support',
    title: 'AI companion',
    desc: 'A grounded, always-available conversation partner trained for school life.',
    image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80', // calm laptop/phone conversation scene, no visible face
    to: '/chat',
  },
  {
    label: 'Care',
    title: 'Counselor sessions',
    desc: 'Confidential sessions with people who understand the work you do.',
    image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=800&q=80', // warm two-person conversation, supportive setting
    to: '/appointments',
  },
];

export default function Landing() {
  return (
    <div className="landing" style={{ scrollSnapType: 'y mandatory', height: '100vh', overflowY: 'auto', msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
      <div className="glow warm" style={{ width: 520, height: 520, top: -160, right: -140 }} />
      <div className="glow cool" style={{ width: 460, height: 460, top: 520, left: -180 }} />
      <div className="glow mint" style={{ width: 400, height: 400, bottom: -140, right: 120 }} />

      <StickyHeader />

      <main style={{ position: 'relative', zIndex: 2, paddingTop: '80px' }}>
        {/* Hero — ambient light */}
        <section className="snap-section hero">
          <div className="snap-wrap">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <div className="hero-meta">
                <span className="eyebrow">
                  Hand-crafted for educators <span className="dot" /> Private by design
                </span>
              </div>
              <h1>
                Space to breathe in a demanding job.
              </h1>
              <p className="hero-lede">
                A calm, private place to notice how you're really doing — and find support
                before stress becomes burnout.
              </p>
              <div className="hero-actions">
                <Link className="btn" to="/register">
                  Begin your check-in <ArrowRight size={16} />
                </Link>
                <a className="btn light" href="#care">
                  Explore StressShield
                </a>
              </div>
              <div className="hero-note">From $0 · Built with privacy at its core</div>
            </motion.div>

            <motion.div
              className="hero-visual"
              initial={{ opacity: 0, scale: 0.86, rotate: -4 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 1, delay: 0.15, type: 'spring', stiffness: 80, damping: 18 }}
            >
              <motion.div
                className="hero-orbit"
                animate={{ rotate: 360 }}
                transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
              />
              <motion.div
                className="hero-core"
                animate={{
                  y: [0, -14, 0],
                  rotate: [0, 5, -3, 0],
                  borderRadius: [
                    '42% 58% 55% 45% / 45% 42% 58% 55%',
                    '58% 42% 45% 55% / 55% 58% 42% 45%',
                    '42% 58% 55% 45% / 45% 42% 58% 55%'
                  ]
                }}
                transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.div
                className="hero-status-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.6 }}
                whileHover={{ y: -6, scale: 1.02 }}
              >
                <div className="status-row">
                  <div>
                    <div className="eyebrow">Today</div>
                    <strong style={{ display: 'block', marginTop: 5, fontSize: '1.1rem' }}>
                      You’re in a good place.
                    </strong>
                  </div>
                  <span className="status-dot" />
                </div>
                <div style={{ marginTop: 16, height: 7, borderRadius: 99, background: 'var(--surface-muted)', overflow: 'hidden' }}>
                  <motion.div
                    style={{ height: '100%', borderRadius: 99, background: 'linear-gradient(90deg, var(--accent), var(--accent-2), var(--accent-3))' }}
                    initial={{ width: 0 }}
                    animate={{ width: '78%' }}
                    transition={{ delay: 1, duration: 1.1, ease: 'easeOut' }}
                  />
                </div>
                <small className="muted" style={{ display: 'block', marginTop: 9 }}>
                  Wellness score · 78
                </small>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Feature showcase — product-style */}
        <section id="care" className="snap-section">
          <div className="snap-wrap">
            <div style={{ marginBottom: 40 }}>
              <span className="eyebrow">
                Made for your real day <span className="dot" /> Small moments of care
              </span>
              <h2 style={{ marginTop: 12, maxWidth: '22ch' }}>
                Lasting support, designed to fit around the work.
              </h2>
            </div>
            <div className="showcase">
              {FEATURES.map((f, i) => (
                <motion.article
                  key={f.title}
                  className="showcase-card"
                  initial={{ opacity: 0, y: 26 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ duration: 0.55, delay: i * 0.1 }}
                  whileHover={{ y: -8 }}
                >
                  <div>
                    <div className="showcase-media">
                      <img
                        src={f.image}
                        alt={f.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                    <div className="showcase-label">{f.label}</div>
                    <h3>{f.title}</h3>
                    <p>{f.desc}</p>
                  </div>
                  <Link className="btn light" to={f.to}>
                    Learn more <ArrowRight size={14} />
                  </Link>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        {/* Quote / craft band */}
        <section id="support" className="snap-section">
          <div className="snap-wrap">
            <div className="quote-band">
              <motion.blockquote
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                "StressShield gave me permission to notice how I was doing — not just push through it."
              </motion.blockquote>
              <div style={{ textAlign: 'right' }}>
                <span className="pulse" style={{ width: 84, height: 84, marginBottom: 16 }}>
                  <Sun size={34} />
                </span>
                <p>— Elena M., middle school teacher</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section id="pricing" className="snap-section" style={{ minHeight: 'auto', padding: '80px 0' }}>
          <div className="snap-wrap">
            <div className="cta">
              <span className="eyebrow">
                <Sparkles size={13} /> A calmer school day starts here
              </span>
              <h2>Make space for your wellbeing.</h2>
              <p>Join a community of educators building more sustainable careers.</p>
              <Link className="btn" to="/register">
                Create your free account <ArrowRight size={16} />
              </Link>
              <div className="hero-note">
                <Activity size={12} style={{ verticalAlign: '-2px', marginRight: 4 }} />
                84% of educators feel more supported
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <Brand />
        <span>© 2026 StressShield · Made with care for educators</span>
      </footer>
    </div>
  );
}

