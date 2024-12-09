// src/PrivateRoute.tsx

import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';

interface PrivateRouteProps {
  children: JSX.Element;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { auth, loading } = useContext(AuthContext);
  console.log(`PrivateRoute - Is Authenticated: ${auth.isAuthenticated}`);

  if (loading) {
    return <div>Carregando...</div>; // Exibe um indicador de carregamento
  }

  return auth.isAuthenticated ? children : <Navigate to="/" />;
};

export default PrivateRoute;
