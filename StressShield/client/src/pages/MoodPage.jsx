import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import Portal from '../components/Portal';
import api from '../services/api';

const MOODS = [
  ['TERRIBLE', ':(', 'Rough'],
  ['LOW', ':(', 'Low'],
  ['NEUTRAL', ':|', 'Okay'],
  ['GOOD', ':)', 'Good'],
  ['GREAT', ':D', 'Great'],
];

export default function MoodPage() {
  const [selected, setSelected] = useState(null);
  const [note, setNote] = useState('');
  const [saved, setSaved] = useState(false);

  const save = async () => {
    if (!selected) return;
    await api.post('/wellness/moods', {
      mood: selected[0],
      score: MOODS.indexOf(selected) + 1,
      note,
    });
    setSaved(true);
  };

  return (
    <Portal
      title="How are you feeling?"
      subtitle="There's no right answer. Just notice what's here."
    >
      <div className="page-grid">
        <section className="panel">
          <h3>Choose the feeling that fits best</h3>
          <p className="muted">Your check-in stays private and helps you see your patterns.</p>

          <div className="mood-options" style={{ margin: '25px 0' }}>
            {MOODS.map((m) => (
              <button
                key={m[0]}
                className={'mood-option ' + (selected === m ? 'selected' : '')}
                onClick={() => setSelected(m)}
              >
                <b>{m[1]}</b>
                {m[2]}
              </button>
            ))}
          </div>

          <div className="field">
            <label>
              Add a note <span className="muted">optional</span>
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows="4"
              placeholder="What's influencing your day?"
            />
          </div>

          <button className="btn" onClick={save}>
            Save today's check-in <CheckCircle2 size={16} />
          </button>
        </section>

        <section className="panel">
          <h3>A small reminder</h3>
          <p className="muted" style={{ lineHeight: 1.7 }}>
            Feelings are information, not a report card. Every check-in is a moment of care for the
            person behind the teacher.
          </p>
        </section>

        {saved && <div className="toast">Your check-in is saved. Thank you for noticing.</div>}
      </div>
    </Portal>
  );
}
