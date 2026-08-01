import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

export default function Brand() {
  return (
    <Link className="brand" to="/">
      <span className="brand-mark">
        <ShieldCheck size={19} />
      </span>
      <span>StressShield</span>
    </Link>
  );
}
