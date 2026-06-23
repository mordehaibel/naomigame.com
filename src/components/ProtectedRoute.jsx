import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function ProtectedRoute({ children }) {
  const { currentUser, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-2xl font-bold">
        🎮 טוען...
      </div>
    );
  }
  if (!currentUser) return <Navigate to="/" replace />;
  return children;
}
