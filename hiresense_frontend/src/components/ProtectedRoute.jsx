import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

export default function ProtectedRoute({ children, requiredRole, isDark = true }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className={`flex min-h-screen items-center justify-center ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-700'}`}>
        <div className="text-center">
          <div className={`mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-2 border-transparent ${isDark ? 'border-slate-600 border-t-sky-400' : 'border-slate-300 border-t-sky-500'}`} />
          <p className="text-lg font-medium">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    if (user.role === 'candidate') {
      return <Navigate to="/candidate/dashboard" replace />;
    }

    if (user.role === 'employer') {
      return <Navigate to="/employer/dashboard" replace />;
    }

    return <Navigate to="/login" replace />;
  }

  return children;
}
