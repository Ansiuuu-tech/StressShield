import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Brand from '../components/Brand';

export default function AuthPage({ register = false }) {
  const { login, user } = useAuth();
  const nav = useNavigate();
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    email: 'teacher@stressshield.app',
    password: 'Welcome123!',
  });

  if (user) return <Navigate to="/dashboard" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(form, register ? 'register' : 'login');
      nav('/dashboard');
    } catch (e) {
      setError(e.response?.data?.message || 'Unable to sign in. Please try again.');
    }
  };

  return (
    <div className="auth-wrap">
      <aside className="auth-side">
        <Brand />
        <h1>Your wellbeing belongs in the lesson plan, too.</h1>
        <p>One calm, private place to check in with yourself and find meaningful support.</p>
      </aside>

      <main className="auth-main">
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
            />
          </div>

          {!register && (
            <div className="form-row">
              <span>Demo: teacher@stressshield.app</span>
              <span className="muted">Contact your school administrator for password help.</span>
            </div>
          )}

          {error && <div className="error">{error}</div>}

          <button className="btn full">
            {register ? 'Create account' : 'Sign in'} <ArrowRight size={16} />
          </button>

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
