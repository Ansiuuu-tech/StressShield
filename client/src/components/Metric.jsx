import { motion } from 'framer-motion';

export default function Metric({ icon: Icon, label, value, note }) {
  return (
    <motion.div
      className="metric"
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      whileHover={{ y: -5 }}
    >
      <div className="metric-head">
        <span>{label}</span>
        <span className="metric-icon">
          <Icon size={16} />
        </span>
      </div>
      <motion.strong
        key={String(value)}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {value}
      </motion.strong>
      <small>{note}</small>
    </motion.div>
  );
}
