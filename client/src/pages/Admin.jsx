import { useEffect, useState } from 'react';
import { Activity, CalendarDays, Sparkles, Users } from 'lucide-react';
import Portal from '../components/Portal';
import Metric from '../components/Metric';
import api from '../services/api';

export default function Admin() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api
      .get('/admin/analytics')
      .then((r) => setData(r.data))
      .catch(() => setData({ teachers: 0, appointments: 0, highRisk: 0, averageWellness: 0 }));
  }, []);

  return (
    <Portal
      title="School wellness"
      subtitle="Anonymous, aggregated insights to help your staff thrive."
    >
      <div className="admin-cards">
        <Metric
          icon={Users}
          label="Teachers supported"
          value={data?.teachers ?? '-'}
          note="Across your organization"
        />
        <Metric
          icon={Sparkles}
          label="Average wellness"
          value={data?.averageWellness ?? '-'}
          note="Out of 100"
        />
        <Metric
          icon={Activity}
          label="Needs attention"
          value={data?.highRisk ?? '-'}
          note="High-risk signals"
        />
        <Metric
          icon={CalendarDays}
          label="Sessions booked"
          value={data?.appointments ?? '-'}
          note="Counselor appointments"
        />
      </div>

      <section className="panel" style={{ marginTop: 18 }}>
        <h3>Privacy-first reporting</h3>
        <p className="muted">
          Only anonymous school-level trends are shown here. Personal journals, messages, and
          individual check-ins remain private.
        </p>
      </section>
    </Portal>
  );
}
