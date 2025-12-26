import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

type Props = {
  adminOnly?: boolean;
};

const RequireAuth = ({ adminOnly = false }: Props) => {
  const { isAuthenticated, isAdmin } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/app/my-assets" replace />;
  }

  return <Outlet />;
};

export default RequireAuth;
