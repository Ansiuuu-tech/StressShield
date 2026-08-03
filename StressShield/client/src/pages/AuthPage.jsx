import { useState, useEffect } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { ArrowRight, Chrome } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Brand from '../components/Brand';

export default function AuthPage({ register = false }) {
  const { login, loginWithGoogle, user } = useAuth();
  const nav = useNavigate();
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    email: register ? '' : 'teacher@stressshield.app',
    password: register ? '' : 'Welcome123!',
  });
  const [googleReady, setGoogleReady] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.google?.accounts?.id) {
      setGoogleReady(true);
    } else {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        if (window.google?.accounts?.id) {
          window.google.accounts.id.initialize({
            client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
            callback: handleGoogleCredential,
            auto_select: false,
            cancel_on_tap_outside: true,
          });
          setGoogleReady(true);
        }
      };
      document.head.appendChild(script);
      return () => {
        if (script.parentNode) script.parentNode.removeChild(script);
      };
    }
  }, []);

  const handleGoogleCredential = async (response) => {
    try {
      await loginWithGoogle(response.credential);
      nav('/dashboard');
    } catch (e) {
      setError(e.response?.data?.message || 'Google sign-in failed. Please try again.');
    }
  };

  if (user) return <Navigate to="/dashboard" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (register && !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(form.password)) {
      setError('Password must be at least 8 characters and include an uppercase letter, a lowercase letter, and a number.');
      return;
    }
    try {
      await login(form, register ? 'register' : 'login');
      nav('/dashboard');
    } catch (e) {
      setError(e.response?.data?.message || 'Unable to sign in. Please try again.');
    }
  };

  const renderGoogleButton = () => {
    if (!googleReady || !window.google?.accounts?.id) return null;

    return (
      <div id="google-signin-button" style={{ marginTop: 16 }} />
    );
  };

  useEffect(() => {
    if (googleReady && window.google?.accounts?.id) {
      window.google.accounts.id.renderButton(
        document.getElementById('google-signin-button'),
        {
          theme: 'outline',
          size: 'large',
          width: '100%',
          text: register ? 'signup_with' : 'signin_with',
          shape: 'pill',
          logo_alignment: 'center',
        }
      );
    }
  }, [googleReady, register]);

  return (
    <div className="auth-wrap">
      <div className="glow warm" style={{ width: 440, height: 440, top: -140, right: -120 }} />
      <div className="glow cool" style={{ width: 420, height: 420, bottom: -160, left: -140 }} />

      <main>
        <form className="auth-card" onSubmit={submit}>
          <Brand />
          <h2>{register ? 'Create your account' : 'Welcome back'}</h2>
          <p>
            {register
              ? 'Start with a few mindful minutes today.'
              : "It's good to see you. Let's check in."}
          </p>

          {register && (
            <div className="field">
              <label>Your name</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Your full name"
              />
            </div>
          )}

          <div className="field">
            <label>Email address</label>
            <input
              required
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div className="field">
            <label>Password</label>
            <input
              required
              minLength="8"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$"
              title="At least 8 characters, with an uppercase letter, a lowercase letter, and a number."
            />
            {register && <span className="muted" style={{ fontSize: 12 }}>At least 8 characters, with uppercase, lowercase, and a number.</span>}
          </div>

          {!register && (
            <div className="form-row">
              <span>Demo: teacher@stressshield.app</span>
              <span className="muted">Contact your school administrator for password help.</span>
            </div>
          )}

          {error && <div className="error">{error}</div>}

          <button className="btn full" type="submit">
            {register ? 'Create account' : 'Sign in'} <ArrowRight size={16} />
          </button>

          <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            <span className="muted" style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>or continue with</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>

          {renderGoogleButton()}

          <p style={{ fontSize: 13, textAlign: 'center', marginTop: 20 }}>
            {register ? 'Already have an account? ' : 'New to StressShield? '}
            <Link className="link" to={register ? '/login' : '/register'}>
              {register ? 'Sign in' : 'Create an account'}
            </Link>
          </p>
        </form>
      </main>
    </div>
  );
}
