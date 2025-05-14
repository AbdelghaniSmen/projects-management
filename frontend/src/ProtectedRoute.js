import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';

const ProtectedRoute = () => {
  const { isAuthenticated } = useAuth();

  // Rediriger vers la page de connexion si non authentifié
  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  // Afficher le composant demandé si authentifié
  return <Outlet />;
};

export default ProtectedRoute;