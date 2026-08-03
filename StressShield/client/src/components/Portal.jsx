import { NavLink, useNavigate } from 'react-router-dom';
import {
  Activity,
  BarChart3,
  Bell,
  CalendarDays,
  Heart,
  Home,
  LogOut,
  MessageCircle,
  NotebookPen,
  Settings,
  Sun,
  Moon,
  Wind,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import Brand from './Brand';

const NAV_LINKS = [
  ['/dashboard', Home, 'Overview'],
  ['/mood', Heart, 'Mood check-in'],
  ['/journal', NotebookPen, 'Daily journal'],
  ['/chat', MessageCircle, 'AI support'],
  ['/meditation', Wind, 'Meditation'],
  ['/unwind', Sparkles, 'Unwind'],
  ['/appointments', CalendarDays, 'Counselor sessions'],
];

export default function Portal({ children, title, subtitle }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const go = useNavigate();

  return (
    <div className="portal">
      <aside className="sidebar">
        <Brand />
        <div className="menu-label">Wellness space</div>
        {NAV_LINKS.map(([url, Icon, label]) => (
          <NavLink
            key={url}
            className={({ isActive }) => 'menu-item ' + (isActive ? 'active' : '')}
            to={url}
          >
            <Icon size={17} />
            <span>{label}</span>
          </NavLink>
        ))}

        {user?.role === 'ADMIN' && (
          <>
            <div className="menu-label">Organization</div>
            <NavLink className="menu-item" to="/admin">
              <BarChart3 size={17} />
              <span>School insights</span>
            </NavLink>
          </>
        )}

        <div className="sidebar-bottom">
          <NavLink className="menu-item" to="/settings">
            <Settings size={17} />
            <span>Settings</span>
          </NavLink>
          <button
            className="menu-item"
            onClick={toggleTheme}
            style={{ border: 0, background: 'transparent', width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 10, color: 'var(--ink-soft)', fontWeight: 500, fontSize: '0.92rem', cursor: 'pointer', flexShrink: 0 }}
          >
            {theme === 'light' ? <Moon size={17} /> : <Sun size={17} />}
            <span>{theme === 'light' ? 'Dark mode' : 'Light mode'}</span>
          </button>
          <button
            className="menu-item"
            style={{ border: 0, background: 'transparent', width: '100%' }}
            onClick={() => {
              logout();
              go('/');
            }}
          >
            <LogOut size={17} />
            <span>Sign out</span>
          </button>
          <div className="user-chip">
            <div className="avatar">
              {user?.name
                ?.split(' ')
                .map((x) => x[0])
                .join('')
                .slice(0, 2)}
            </div>
            <div>
              <b>{user?.name}</b>
              <span>{user?.role?.toLowerCase()}</span>
            </div>
          </div>
        </div>
      </aside>

      <main className="portal-main">
        <div className="topbar">
          <div className="page-title">
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>
          <div className="top-actions">
            <button className="iconbtn">
              <Bell size={18} />
            </button>
            <button className="btn" onClick={() => go('/mood')}>
              Check in <Heart size={15} />
            </button>
          </div>
        </div>
        {children}
      </main>
    </div>
  );
}

