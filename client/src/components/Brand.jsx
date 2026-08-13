import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Brand() {
  return (
    <Link className="brand" to="/">
      <motion.span
        className="brand-mark"
        whileHover={{ rotate: 90, scale: 1.08 }}
        transition={{ type: 'spring', stiffness: 360, damping: 18 }}
      >
        ✦
      </motion.span>
      <span>StressShield</span>
    </Link>
  );
}
