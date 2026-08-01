import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Activity,
  CalendarDays,
  Heart,
  MessageCircle,
  NotebookPen,
  Sparkles,
  ShieldCheck,
  Wind,
} from 'lucide-react';
import Portal from '../components/Portal';
import Metric from '../components/Metric';
import api from '../services/api';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const go = useNavigate();

  useEffect(() => {
    api
      .get('/wellness/overview')
      .then((r) => setData(r.data))
      .catch(() => setData({}));
  }, []);

  const moods = data?.moods
    ?.slice()
    .reverse()
    .map((m, i) => ({
      day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
      mood: m.score,
    })) || [
    { day: 'Mon', mood: 3 },
    { day: 'Tue', mood: 4 },
    { day: 'Wed', mood: 3 },
    { day: 'Thu', mood: 4 },
    { day: 'Fri', mood: 5 },
  ];

  return (
    <Portal title="Good morning" subtitle="Here's a gentle view of your wellbeing today.">
      {/* Banner */}
      <div className="hero-banner">
        <h2>Take a breath. You're doing meaningful work.</h2>
        <p>A 60-second check-in can help you arrive for yourself today.</p>
      </div>

      {/* Metrics */}
      <div className="dash-grid">
        <Metric icon={Heart} label="Today's mood" value="Good" note="Steadier than yesterday" />
        <Metric
          icon={Activity}
          label="Stress level"
          value={`${data?.teacher?.stressScore || 34}%`}
          note="In a manageable range"
        />
        <Metric
          icon={Sparkles}
          label="Wellness score"
          value={`${data?.teacher?.wellnessScore || 78}`}
          note="6 points this month"
        />
        <Metric
          icon={ShieldCheck}
          label="Burnout risk"
          value="Low"
          note="Your recovery is trending well"
        />
      </div>

      {/* Content grid */}
      <div className="content-grid">
        {/* Mood chart */}
        <section className="panel">
          <div className="panel-header">
            <div>
              <h3>Your week at a glance</h3>
              <span className="muted">A little context, never judgment.</span>
            </div>
            <button className="btn light">Last 7 days</button>
          </div>
          <div className="chart">
            <div
              style={{
                height: '100%',
                display: 'flex',
                alignItems: 'end',
                gap: 20,
                padding: '15px 15px 0',
              }}
            >
              {moods.map((m, i) => (
                <div key={i} style={{ flex: 1, textAlign: 'center' }}>
                  <div
                    style={{
                      height: `${m.mood * 18 + 35}px`,
                      borderRadius: '9px 9px 3px 3px',
                      background: i === moods.length - 1 ? '#73b89c' : '#dcedE5',
                      transition: 'height .3s',
                    }}
                  />
                  <small className="muted">{m.day}</small>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Upcoming sessions */}
        <section className="panel">
          <div className="panel-header">
            <h3>Upcoming support</h3>
            <Link className="link" to="/appointments">
              View all
            </Link>
          </div>
          {data?.appointments?.length ? (
            data.appointments.map((a) => (
              <div className="appointment" key={a.id}>
                <div className="time">{new Date(a.scheduledAt).toLocaleDateString()}</div>
                <div>
                  <b>{a.counselor.user.name}</b>
                  <span>{a.counselor.specialty}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="empty">
              No sessions scheduled yet.
              <br />
              <Link className="link" to="/appointments">
                Find a counselor
              </Link>
            </div>
          )}
        </section>
      </div>

      {/* Quick actions */}
      <section className="panel" style={{ marginTop: 18 }}>
        <div className="panel-header">
          <div>
            <h3>A little support, right now</h3>
            <span className="muted">Choose what feels useful.</span>
          </div>
        </div>
        <div className="quick-grid">
          <Link className="quick" to="/chat">
            <MessageCircle size={18} />
            <span>Talk with AI</span>
          </Link>
          <Link className="quick" to="/appointments">
            <CalendarDays size={18} />
            <span>Book a counselor</span>
          </Link>
          <Link className="quick" to="/journal">
            <NotebookPen size={18} />
            <span>Write it down</span>
          </Link>
          <Link className="quick" to="/meditation">
            <Wind size={18} />
            <span>Take a pause</span>
          </Link>
        </div>
      </section>
    </Portal>
  );
}
