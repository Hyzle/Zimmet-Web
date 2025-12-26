import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const RedirectByRole = () => {
  const { isAdmin } = useAuth();
  return <Navigate to={isAdmin ? '/admin/users' : '/app/my-assets'} replace />;
};

export default RedirectByRole;
