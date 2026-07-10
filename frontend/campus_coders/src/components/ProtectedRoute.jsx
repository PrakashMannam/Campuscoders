import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Wraps a route and redirects unauthenticated or wrong-role users.
 * @param {string} requiredRole - 'student' | 'admin' | undefined (any logged-in user)
 */
function ProtectedRoute({ children, requiredRole }) {
  const { user } = useAuth();

  if (!user) {
    // Not logged in → go to login
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    // Wrong role → redirect to their correct dashboard
    return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />;
  }

  return children;
}

export default ProtectedRoute;
