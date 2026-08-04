import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import Brand from './Brand';
import { useTheme } from '../contexts/ThemeContext';

export default function StickyHeader() {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY) {
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.header
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className={`sticky-header ${scrolled ? 'scrolled' : ''}`}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 6vw',
            background: 'color-mix(in srgb, var(--surface) 85%, transparent)',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid var(--border)',
            transition: 'all 0.3s ease',
          }}
        >
          <Brand />
          <nav className="navlinks" style={{ display: 'flex', gap: '30px', alignItems: 'center', flexShrink: 0 }}>
            <a href="/how-it-works" style={{ color: 'var(--ink-soft)', fontWeight: 500, fontSize: '0.92rem', whiteSpace: 'nowrap' }}>How it works</a>
            <a href="/support" style={{ color: 'var(--ink-soft)', fontWeight: 500, fontSize: '0.92rem', whiteSpace: 'nowrap' }}>Support</a>
            <a href="/team" style={{ color: 'var(--ink-soft)', fontWeight: 500, fontSize: '0.92rem', whiteSpace: 'nowrap' }}>Our Team</a>
            <button
              onClick={toggleTheme}
              className="iconbtn"
              style={{ marginLeft: 8, flexShrink: 0 }}
              aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
          </nav>
          <div className="nav-actions" style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0, whiteSpace: 'nowrap' }}>
            <Link to="/login" className="btn light" style={{ padding: '10px 20px', minHeight: 'auto', fontSize: '0.9rem' }}>
              Sign in
            </Link>
            <Link to="/register" className="btn" style={{ padding: '10px 20px', minHeight: 'auto', fontSize: '0.9rem' }}>
              Start feeling better
            </Link>
          </div>
        </motion.header>
      )}
    </AnimatePresence>
  );
}