import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Portal from '../components/Portal';
import api from '../services/api';

export default function Settings() {
  const { user, setUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [status, setStatus] = useState('');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setStatus('');
    setSaving(true);
    try {
      const response = await api.patch('/auth/me', { name, email });
      setUser(response.data.user);
      setStatus('Your profile has been saved.');
    } catch (error) {
      setStatus(error.response?.data?.message || 'Unable to save your profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Portal title="Settings" subtitle="Manage your account and notification preferences.">
      <section className="panel" style={{ maxWidth: 680 }}>
        <h3>Profile</h3>
        <div className="field">
          <label htmlFor="settings-name">Full name</label>
          <input id="settings-name" value={name} onChange={(event) => setName(event.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="settings-email">Email address</label>
          <input id="settings-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
        </div>
        <button className="btn" onClick={save} disabled={saving}>
          {saving ? 'Saving...' : 'Save changes'}
        </button>
        {status && <p className="muted" style={{ marginTop: 14 }}>{status}</p>}
      </section>
    </Portal>
  );
}