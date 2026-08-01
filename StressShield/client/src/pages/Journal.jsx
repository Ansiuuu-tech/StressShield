import { useEffect, useState } from 'react';
import { ArrowRight, BookOpen } from 'lucide-react';
import Portal from '../components/Portal';
import api from '../services/api';

export default function Journal() {
  const [entries, setEntries] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const load = () => api.get('/wellness/journals').then((r) => setEntries(r.data));

  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    if (!title || !content) return;
    await api.post('/wellness/journals', { title, content });
    setTitle('');
    setContent('');
    load();
  };

  return (
    <Portal
      title="Daily journal"
      subtitle="Put the day into words. You don't have to make it polished."
    >
      <div className="page-grid">
        {/* Write entry */}
        <section className="panel">
          <div className="field">
            <label>Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="A small win, a hard moment…"
            />
          </div>
          <div className="field">
            <label>What's on your mind?</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows="11"
              placeholder="Write freely. This space is yours."
            />
          </div>
          <button className="btn" onClick={save}>
            Save reflection <ArrowRight size={16} />
          </button>
        </section>

        {/* Past entries */}
        <section className="panel">
          <div className="panel-header">
            <h3>Recent reflections</h3>
            <BookOpen size={17} />
          </div>
          <div className="journal-list">
            {entries.length ? (
              entries.map((x) => (
                <div className="journal-item" key={x.id}>
                  <b>{x.title}</b>
                  <p>{x.content.slice(0, 100)}</p>
                  <span className="badge">{x.sentiment || 'Reflective'}</span>
                </div>
              ))
            ) : (
              <div className="empty">Your thoughts will gather here.</div>
            )}
          </div>
        </section>
      </div>
    </Portal>
  );
}
