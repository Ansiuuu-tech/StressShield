import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="not-found">
      <div>
        <h1>404</h1>
        <p>That page has wandered off for a quiet moment.</p>
        <Link className="btn" to="/">
          Return home
        </Link>
      </div>
    </div>
  );
}
