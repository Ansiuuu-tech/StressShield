export default function Metric({ icon: Icon, label, value, note }) {
  return (
    <div className="metric">
      <div className="metric-head">
        <span>{label}</span>
        <span className="metric-icon">
          <Icon size={16} />
        </span>
      </div>
      <strong>{value}</strong>
      <small>{note}</small>
    </div>
  );
}

