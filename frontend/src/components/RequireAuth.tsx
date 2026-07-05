import React from 'react';
import { Navigate } from 'react-router-dom';

interface RequireAuthProps {
  role: string;
  children: React.ReactElement;
}

const RequireAuth: React.FC<RequireAuthProps> = ({ role, children }) => {
  let currentUser: { role?: string } | null = null;
  try { currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null'); } catch { currentUser = null; }

  if (!currentUser) return <Navigate to="/login" replace />;
  // Landing ('/') is the universal home for every role — a mismatched-role access
  // attempt (e.g. a customer hitting /AdminHome directly) bounces there instead of a
  // per-role dashboard lookup, since Landing is always the right fallback now.
  if (currentUser.role !== role) return <Navigate to="/" replace />;

  return children;
};

export default RequireAuth;
