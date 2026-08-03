import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Send, CheckCircle, AlertCircle, Loader2, MessageSquare, User, Settings, HelpCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import Portal from '../components/Portal';

const CATEGORIES = [
  { value: 'technical', label: 'Technical issue', icon: Settings, desc: 'Bugs, errors, or something not working' },
  { value: 'account', label: 'Account help', icon: User, desc: 'Login, password, or profile issues' },
  { value: 'feedback', label: 'Feedback & suggestions', icon: MessageSquare, desc: 'Ideas, feature requests, or general feedback' },
  { value: 'other', label: 'Other', icon: HelpCircle, desc: 'Anything else you\'d like to tell us' },
];

export default function Support() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    category: 'feedback',
    message: '',
  });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle');
  const [submitError, setSubmitError] = useState('');

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'Name is required';
    if (!form.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = 'Please enter a valid email';
    if (!form.category) newErrors.category = 'Please select a category';
    if (!form.message.trim()) newErrors.message = 'Message is required';
    else if (form.message.trim().length < 10) newErrors.message = 'Message must be at least 10 characters';
    else if (form.message.trim().length > 5000) newErrors.message = 'Message must be under 5000 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setStatus('submitting');
    setSubmitError('');

    try {
      await api.post('/support/contact', {
        name: form.name.trim(),
        email: form.email.trim(),
        category: form.category,
        message: form.message.trim(),
      });
      setStatus('success');
      setForm({ name: form.name, email: form.email, category: 'feedback', message: '' });
    } catch (err) {
      setStatus('error');
      setSubmitError(err.response?.data?.message || 'Failed to send message. Please try again.');
    }
  };

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  return (
    <Portal title="Support" subtitle="We're here to help. Send us a message and we'll get back to you within 1-2 business days.">
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 32 }}>
            <span className="eyebrow">
              <Mail size={12} /> Get in touch
            </span>
            <h2>How can we help?</h2>
            <p className="muted">
              Whether it's a technical issue, account question, or just feedback — we read every message.
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--ink-soft)', marginBottom: 6 }}>
                Your name
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Your full name"
                disabled={status === 'submitting'}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: 'var(--r-sm)',
                  border: `1px solid ${errors.name ? 'var(--danger)' : 'var(--border)'}`,
                  background: 'var(--surface)',
                  color: 'var(--ink)',
                  fontSize: '0.95rem',
                  fontFamily: 'var(--font-body)',
                  minHeight: 44,
                  outline: 'none',
                  transition: 'border-color 150ms ease, box-shadow 150ms ease',
                }}
              />
              {errors.name && <p className="error" style={{ marginTop: 6, fontSize: '0.85rem', color: 'var(--danger)' }}>{errors.name}</p>}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--ink-soft)', marginBottom: 6 }}>
                Email address
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="your@email.com"
                disabled={status === 'submitting'}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: 'var(--r-sm)',
                  border: `1px solid ${errors.email ? 'var(--danger)' : 'var(--border)'}`,
                  background: 'var(--surface)',
                  color: 'var(--ink)',
                  fontSize: '0.95rem',
                  fontFamily: 'var(--font-body)',
                  minHeight: 44,
                  outline: 'none',
                  transition: 'border-color 150ms ease, box-shadow 150ms ease',
                }}
              />
              {errors.email && <p className="error" style={{ marginTop: 6, fontSize: '0.85rem', color: 'var(--danger)' }}>{errors.email}</p>}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--ink-soft)', marginBottom: 6 }}>
                Category
              </label>
              <select
                value={form.category}
                onChange={(e) => handleChange('category', e.target.value)}
                disabled={status === 'submitting'}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: 'var(--r-sm)',
                  border: `1px solid ${errors.category ? 'var(--danger)' : 'var(--border)'}`,
                  background: 'var(--surface)',
                  color: 'var(--ink)',
                  fontSize: '0.95rem',
                  fontFamily: 'var(--font-body)',
                  minHeight: 44,
                  outline: 'none',
                  transition: 'border-color 150ms ease, box-shadow 150ms ease',
                  cursor: 'pointer',
                }}
              >
                {CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
              {errors.category && <p className="error" style={{ marginTop: 6, fontSize: '0.85rem', color: 'var(--danger)' }}>{errors.category}</p>}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--ink-soft)', marginBottom: 6 }}>
                Message
              </label>
              <textarea
                value={form.message}
                onChange={(e) => handleChange('message', e.target.value)}
                placeholder="Tell us what's on your mind..."
                rows={6}
                disabled={status === 'submitting'}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: 'var(--r-sm)',
                  border: `1px solid ${errors.message ? 'var(--danger)' : 'var(--border)'}`,
                  background: 'var(--surface)',
                  color: 'var(--ink)',
                  fontSize: '0.95rem',
                  fontFamily: 'var(--font-body)',
                  minHeight: 120,
                  outline: 'none',
                  transition: 'border-color 150ms ease, box-shadow 150ms ease',
                  resize: 'vertical',
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: '0.8rem' }}>
                <span className="muted">{form.message.length}/5000 characters</span>
                {errors.message && <span style={{ color: 'var(--danger)' }}>{errors.message}</span>}
              </div>
            </div>

            {submitError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="error"
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px' }}
              >
                <AlertCircle size={18} />
                {submitError}
              </motion.div>
            )}

            <motion.button
              type="submit"
              disabled={status === 'submitting' || status === 'success'}
              className="btn"
              style={{ width: '100%', padding: '14px 28px', fontSize: '1rem' }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              {status === 'submitting' && <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />}
              {status === 'submitting' ? 'Sending...' : status === 'success' ? 'Message Sent!' : 'Send message'}
              {status !== 'submitting' && status !== 'success' && <Send size={18} />}
            </motion.button>

            {status === 'success' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '16px',
                  background: '#f0fdf4',
                  border: '1px solid #86efac',
                  borderRadius: 'var(--r-md)',
                  color: '#166534',
                }}
              >
                <CheckCircle size={20} />
                <div>
                  <p style={{ fontWeight: 600, marginBottom: 2 }}>Message sent successfully!</p>
                  <p className="muted" style={{ fontSize: '0.9rem' }}>We'll get back to you within 1-2 business days.</p>
                </div>
              </motion.div>
            )}

            <p className="muted" style={{ fontSize: '0.8rem', textAlign: 'center', marginTop: 8 }}>
              By submitting, you agree to our <a href="#" className="link">Privacy Policy</a> and allow us to contact you regarding your request.
            </p>
          </form>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={{ marginTop: 48, padding: '32px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)' }}
        >
          <h3 style={{ marginBottom: 20, textAlign: 'center' }}>Other ways to get help</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            <a href="/chat" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '20px', textAlign: 'center', color: 'var(--ink-soft)', textDecoration: 'none', borderRadius: 'var(--r-md)', background: 'var(--surface-muted)', transition: 'all 150ms ease' }}>
              <MessageSquare size={24} style={{ color: 'var(--ink)' }} />
              <span style={{ fontWeight: 500 }}>AI Support</span>
              <span className="muted" style={{ fontSize: '0.8rem' }}>Instant help, 24/7</span>
            </a>
            <a href="/how-it-works" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '20px', textAlign: 'center', color: 'var(--ink-soft)', textDecoration: 'none', borderRadius: 'var(--r-md)', background: 'var(--surface-muted)', transition: 'all 150ms ease' }}>
              <HelpCircle size={24} style={{ color: 'var(--ink)' }} />
              <span style={{ fontWeight: 500 }}>How It Works</span>
              <span className="muted" style={{ fontSize: '0.8rem' }}>Learn about features</span>
            </a>
            <a href="/unwind" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '20px', textAlign: 'center', color: 'var(--ink-soft)', textDecoration: 'none', borderRadius: 'var(--r-md)', background: 'var(--surface-muted)', transition: 'all 150ms ease' }}>
              <Sparkles size={24} style={{ color: 'var(--ink)' }} />
              <span style={{ fontWeight: 500 }}>Unwind</span>
              <span className="muted" style={{ fontSize: '0.8rem' }}>Calming videos & audio</span>
            </a>
          </div>
        </motion.div>

        <style jsx global>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </Portal>
  );
}