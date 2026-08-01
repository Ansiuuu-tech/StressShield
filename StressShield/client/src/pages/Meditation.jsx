import { Clock, Music, Sun, Wind } from 'lucide-react';
import Portal from '../components/Portal';
import FeatureIcon from '../components/FeatureIcon';

const SESSIONS = [
  ['Box breathing', '4 minutes', 'A steady rhythm for busy moments', Wind],
  ['Evening unwind', '10 minutes', 'Release the day with a guided pause', Music],
  ['Reset between classes', '2 minutes', 'A quick return to your center', Sun],
];

export default function Meditation() {
  return (
    <Portal
      title="Meditation & reset"
      subtitle="A few quiet minutes can change the shape of your day."
    >
      <div className="meditation-grid">
        {SESSIONS.map(([name, time, description, Icon]) => (
          <article className="med-card" key={name}>
            <FeatureIcon>
              <Icon size={21} />
            </FeatureIcon>
            <h3>{name}</h3>
            <p className="muted">{description}</p>
            <button className="btn light">
              <Clock size={14} /> {time}
            </button>
          </article>
        ))}
      </div>

      <section className="panel" style={{ marginTop: 20 }}>
        <h3>Your practice</h3>
        <p className="muted">You've made 3 mindful pauses this week. Small care counts.</p>
      </section>
    </Portal>
  );
}
