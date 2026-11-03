import { Navigate, Outlet, useLocation } from 'react-router';
import { useAppSelector } from '@/rtk-base/hooks';

// Wraps every signed-in route. Visitors without a session go to /login,
// which sends them back here after they sign in.
export default function RequireAuth() {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?next=${next}`} replace />;
  }

  return <Outlet />;
}
