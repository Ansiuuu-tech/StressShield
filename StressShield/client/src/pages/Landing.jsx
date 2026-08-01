import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Activity, ArrowRight, MessageCircle, Sparkles, Sun, Users, Heart } from 'lucide-react';
import Brand from '../components/Brand';
import FeatureIcon from '../components/FeatureIcon';

export default function Landing() {
  return (
    <div className="landing">
      <div className="orb one" />
      <div className="orb two" />

      <nav className="nav">
        <Brand />
        <div className="navlinks">
          <a href="#features">How it works</a>
          <a href="#support">Support</a>
          <a href="#pricing">For schools</a>
        </div>
        <div className="nav-actions">
          <Link to="/login" className="btn light">
            Sign in
          </Link>
          <Link to="/register" className="btn">
            Start feeling better <ArrowRight size={15} />
          </Link>
        </div>
      </nav>

      <main>
        {/* Hero */}
        <section className="hero">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="eyebrow">
              <Sparkles size={13} /> Wellness, designed for educators
            </span>
            <h1>
              Teaching is demanding.
              <br />
              <em>You don't have to carry it alone.</em>
            </h1>
            <p>
              A private, thoughtful place to understand your wellbeing, build resilient habits, and
              get support before stress becomes burnout.
            </p>
            <div className="hero-actions">
              <Link className="btn" to="/register">
                Begin your check-in <ArrowRight size={16} />
              </Link>
              <a className="btn light" href="#features">
                Explore StressShield
              </a>
            </div>
            <div className="hero-note">
              Free for individual educators · Built with privacy at its core
            </div>
          </motion.div>

          <motion.div
            className="hero-art"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7 }}
          >
            <div className="wellness-card">
              <div className="pulse">
                <Heart size={25} />
              </div>
              <b style={{ display: 'block', marginTop: 15 }}>Your wellbeing, today</b>
              <small className="muted">A gentle check-in can make a difference.</small>
              <div className="card-line green" />
              <div className="card-line" />
              <div className="card-line" style={{ width: '78%' }} />
            </div>
            <div className="float-pill">✦ You're making space for you</div>
          </motion.div>
        </section>

        {/* Stats */}
        <section className="stats">
          <div className="stat">
            <strong>84%</strong>
            <span>feel more supported</span>
          </div>
          <div className="stat">
            <strong>12 min</strong>
            <span>average daily check-in</span>
          </div>
          <div className="stat">
            <strong>4.9/5</strong>
            <span>educator rating</span>
          </div>
          <div className="stat">
            <strong>100%</strong>
            <span>private by default</span>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="section">
          <div className="section-heading">
            <span className="eyebrow">Made for your real day</span>
            <h2>Small moments of care. Lasting support.</h2>
            <p>
              StressShield meets you between classes, after hard conversations, and whenever the
              weight of the work follows you home.
            </p>
          </div>
          <div className="grid3">
            <article className="feature">
              <FeatureIcon>
                <Activity size={21} />
              </FeatureIcon>
              <h3>Know your patterns</h3>
              <p>
                Simple daily check-ins turn feelings into useful insight—without making wellness
                another task.
              </p>
            </article>
            <article className="feature">
              <FeatureIcon>
                <MessageCircle size={21} />
              </FeatureIcon>
              <h3>Talk it through</h3>
              <p>Get grounded, practical support from an always-available AI wellness companion.</p>
            </article>
            <article className="feature">
              <FeatureIcon>
                <Users size={21} />
              </FeatureIcon>
              <h3>Reach the right person</h3>
              <p>
                Book a confidential session with a counselor when you want a human conversation.
              </p>
            </article>
          </div>
        </section>

        {/* Testimonial */}
        <section className="section" id="support">
          <div className="quote">
            <div>
              <blockquote>
                "StressShield gave me permission to notice how I was doing—not just push through
                it."
              </blockquote>
              <p>— Elena M., middle school teacher</p>
            </div>
            <div
              className="pulse"
              style={{ justifySelf: 'end', alignSelf: 'center', width: 90, height: 90 }}
            >
              <Sun size={38} />
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="section" id="pricing">
          <div className="cta">
            <span className="eyebrow" style={{ background: '#f6ffc9' }}>
              A calmer school day starts here
            </span>
            <h2>Make space for your wellbeing.</h2>
            <p>Join a community of educators building more sustainable careers.</p>
            <Link className="btn" to="/register">
              Create your free account <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      </main>

      <footer className="footer">
        <Brand />
        <span>© 2026 StressShield. Made with care for educators.</span>
      </footer>
    </div>
  );
}
