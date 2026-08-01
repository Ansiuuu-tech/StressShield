import { useEffect, useState } from 'react';
import { Send } from 'lucide-react';
import Portal from '../components/Portal';
import api from '../services/api';

const SUGGESTIONS = [
  "I'm feeling overwhelmed today",
  'Help me reset after a hard class',
  'How can I protect my energy?',
];

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api
      .get('/ai/history')
      .then((r) => setMessages(r.data))
      .catch(() =>
        setMessages([
          {
            id: 'hello',
            role: 'assistant',
            content: "Hi, I'm your StressShield companion. What's feeling most present today?",
          },
        ])
      );
  }, []);

  const send = async (input) => {
    const msg = input || text;
    if (!msg.trim() || busy) return;

    setMessages((prev) => [...prev, { id: Date.now(), role: 'user', content: msg }]);
    setText('');
    setBusy(true);

    try {
      const r = await api.post('/ai/chat', { message: msg });
      setMessages((prev) => [...prev, r.data]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Portal title="AI support" subtitle="A private space to think out loud, any time you need it.">
      <section className="panel chat">
        <div className="messages">
          {messages.map((m) => (
            <div key={m.id} className={'message ' + m.role}>
              {m.content}
            </div>
          ))}
          {busy && <div className="message assistant">Thinking with you…</div>}
        </div>

        <div className="suggestions">
          {SUGGESTIONS.map((s) => (
            <button key={s} className="suggestion" onClick={() => send(s)}>
              {s}
            </button>
          ))}
        </div>

        <div className="chat-input">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            placeholder="Share what's on your mind…"
          />
          <button className="send" onClick={() => send()}>
            <Send size={18} />
          </button>
        </div>
      </section>
    </Portal>
  );
}
