import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ProtectedRoute = ({ allowedRoles = [], children }) => {
  const { user, loading } = useAuth();

  // Tant que user n’est pas encore chargé, on peut afficher un loader ou null
  if (loading) return null; // ou un spinner <div>Chargement...</div>

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />; // ou une page "Accès interdit"
  }

  return children;
};

export default ProtectedRoute;
