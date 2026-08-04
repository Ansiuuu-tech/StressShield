import { Route, Routes } from 'react-router-dom';
import Admin from './pages/Admin';
import Appointments from './pages/Appointments';
import AuthPage from './pages/AuthPage';
import Chat from './pages/Chat';
import Dashboard from './pages/Dashboard';
import HowItWorks from './pages/HowItWorks';
import Journal from './pages/Journal';
import Landing from './pages/Landing';
import Meditation from './pages/Meditation';
import MoodPage from './pages/MoodPage';
import NotFound from './pages/NotFound';
import Settings from './pages/Settings';
import Support from './pages/Support';
import Team from './pages/Team';
import Unwind from './pages/Unwind';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<AuthPage />} />
      <Route path="/register" element={<AuthPage register />} />
      <Route path="/how-it-works" element={<HowItWorks />} />
      <Route path="/support" element={<Support />} />
      <Route path="/team" element={<Team />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/mood" element={<ProtectedRoute><MoodPage /></ProtectedRoute>} />
      <Route path="/journal" element={<ProtectedRoute><Journal /></ProtectedRoute>} />
      <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
      <Route path="/meditation" element={<ProtectedRoute><Meditation /></ProtectedRoute>} />
      <Route path="/unwind" element={<ProtectedRoute><Unwind /></ProtectedRoute>} />
      <Route path="/appointments" element={<ProtectedRoute><Appointments /></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute roles={["ADMIN"]}><Admin /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}