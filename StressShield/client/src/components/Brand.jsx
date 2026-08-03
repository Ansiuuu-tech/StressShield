import { Link } from 'react-router-dom';

export default function Brand() {
  return (
    <Link className="brand" to="/">
      <span className="brand-mark">✦</span>
      <span>StressShield</span>
    </Link>
  );
}

