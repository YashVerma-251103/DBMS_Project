import React from 'react';
import { Navigate } from 'react-router-dom';
import { DASHBOARD_PATH } from '../types';

interface RequireAuthProps {
  role: string;
  children: React.ReactElement;
}

const RequireAuth: React.FC<RequireAuthProps> = ({ role, children }) => {
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');

  if (!currentUser) return <Navigate to="/login" replace />;
  if (currentUser.role !== role) return <Navigate to={DASHBOARD_PATH[currentUser.role] || '/login'} replace />;

  return children;
};

export default RequireAuth;
