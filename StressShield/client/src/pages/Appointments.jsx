import { useEffect, useState } from 'react';
import Portal from '../components/Portal';
import api from '../services/api';

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [counselors, setCounselors] = useState([]);
  const [booked, setBooked] = useState(false);

  const loadAppointments = () => api.get('/appointments').then((r) => setAppointments(r.data));

  useEffect(() => {
    loadAppointments();
    api.get('/appointments/counselors').then((r) => setCounselors(r.data));
  }, []);

  const book = async (counselorId) => {
    const date = new Date();
    date.setDate(date.getDate() + 3);
    date.setHours(15, 0, 0, 0);

    await api.post('/appointments', {
      counselorId,
      scheduledAt: date.toISOString(),
      note: 'Wellness check-in',
    });

    setBooked(true);
    loadAppointments();
  };

  return (
    <Portal
      title="Counselor sessions"
      subtitle="Confidential support from people who understand school life."
    >
      <div className="page-grid">
        {/* Available counselors */}
        <section className="panel">
          <h3>Available counselors</h3>
          {counselors.length ? (
            counselors.map((c) => (
              <div className="counselor" key={c.id}>
                <div className="avatar">
                  {c.user.name
                    .split(' ')
                    .map((w) => w[0])
                    .join('')}
                </div>
                <div style={{ flex: 1 }}>
                  <h3>{c.user.name}</h3>
                  <p>{c.specialty}</p>
                  <span className="muted">{c.bio}</span>
                </div>
                <button className="btn light" onClick={() => book(c.id)}>
                  Book
                </button>
              </div>
            ))
          ) : (
            <div className="empty">Counselors will appear here once added.</div>
          )}
        </section>

        {/* Session history */}
        <section className="panel">
          <h3>Session history</h3>
          {appointments.length ? (
            appointments.map((a) => (
              <div className="appointment" key={a.id}>
                <div className="time">{new Date(a.scheduledAt).toLocaleDateString()}</div>
                <div>
                  <b>{a.counselor.user.name}</b>
                  <span>
                    {a.status.toLowerCase()} · {a.duration} mins
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="empty">No sessions yet.</div>
          )}
        </section>

        {booked && <div className="toast">Your session request is on its way.</div>}
      </div>
    </Portal>
  );
}
