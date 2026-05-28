import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';

export const RoleRoute = ({ allowedRoles }) => {
  const { user } = useAuth();
  const hasRole = user.roles.some((role) => allowedRoles.include(role));

  return hasRole ? <Outlet /> : <Navigate to="/unauthorized" replace />;
};
