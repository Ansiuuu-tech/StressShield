import { useEffect, useState } from 'react';
import { Calendar, Clock, X, Check } from 'lucide-react';
import Portal from '../components/Portal';
import api from '../services/api';

const TIME_SLOTS = ['09:00', '11:00', '14:00', '16:00'];

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [counselors, setCounselors] = useState([]);
  const [selectedCounselor, setSelectedCounselor] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('14:00');
  const [note, setNote] = useState('Wellness check-in');
  const [submitting, setSubmitting] = useState(false);
  const [booked, setBooked] = useState(false);

  const minDate = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const loadAppointments = () => api.get('/appointments').then((r) => setAppointments(r.data));

  useEffect(() => {
    loadAppointments();
    api.get('/appointments/counselors').then((r) => setCounselors(r.data));
    setSelectedDate(minDate);
  }, []);

  const openBookingModal = (counselor) => {
    setSelectedCounselor(counselor);
    setBooked(false);
  };

  const handleBook = async (e) => {
    e.preventDefault();
    if (!selectedCounselor || !selectedDate || !selectedSlot) return;

    setSubmitting(true);
    try {
      const scheduledAt = new Date(`${selectedDate}T${selectedSlot}:00Z`).toISOString();
      await api.post('/appointments', {
        counselorId: selectedCounselor.id,
        scheduledAt,
        note,
      });

      setBooked(true);
      setSelectedCounselor(null);
      loadAppointments();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
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
                <button className="btn light" onClick={() => openBookingModal(c)}>
                  Book Session
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
                <div className="time">
                  {new Date(a.scheduledAt).toLocaleDateString()} at{' '}
                  {new Date(a.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div>
                  <b>{a.counselor.user.name}</b>
                  <span>
                    {a.status.toLowerCase()} · {a.duration} mins
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="empty">No sessions scheduled yet.</div>
          )}
        </section>

        {booked && <div className="toast">Your session request has been submitted.</div>}
      </div>

      {/* Booking Modal */}
      {selectedCounselor && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(38, 38, 38, 0.65)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 20,
          }}
        >
          <div
            className="panel"
            style={{
              width: '100%',
              maxWidth: 500,
              padding: 30,
              borderRadius: 20,
              background: '#ffffff',
              position: 'relative',
            }}
          >
            <button
              onClick={() => setSelectedCounselor(null)}
              style={{
                position: 'absolute',
                top: 18,
                right: 18,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#8a8a8a',
              }}
            >
              <X size={20} />
            </button>

            <h3>Book Session with {selectedCounselor.user.name}</h3>
            <span className="muted">{selectedCounselor.specialty}</span>

            <form onSubmit={handleBook} style={{ marginTop: 20 }}>
              <div className="field">
                <label>Select Date</label>
                <input
                  type="date"
                  min={minDate}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  required
                />
              </div>

              <div className="field">
                <label>Select Time Slot</label>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 6 }}>
                  {TIME_SLOTS.map((slot) => (
                    <button
                      type="button"
                      key={slot}
                      className={`btn ${selectedSlot === slot ? '' : 'light'}`}
                      onClick={() => setSelectedSlot(slot)}
                      style={{ flex: 1, minWidth: 90 }}
                    >
                      <Clock size={14} /> {slot}
                    </button>
                  ))}
                </div>
              </div>

              <div className="field" style={{ marginTop: 15 }}>
                <label>Note / Topic (Optional)</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows="3"
                  placeholder="What would you like to focus on?"
                />
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 24, justifyContent: 'flex-end' }}>
                <button type="button" className="btn light" onClick={() => setSelectedCounselor(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn" disabled={submitting}>
                  {submitting ? 'Booking...' : 'Confirm Appointment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Portal>
  );
}
