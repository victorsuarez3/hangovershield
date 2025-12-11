/**
 * Protected Route Component
 * Simple wrapper that ensures user is authenticated
 * Note: Main authentication flow is handled in App.tsx
 */

import React from 'react';
import { useAuth } from '../providers/AuthProvider';
import { AuthNavigator } from '../navigation/AuthNavigator';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Protected Route that only allows authenticated users
 * Since authentication is handled in App.tsx, this is mainly a safety check
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();

  // Show loading while checking auth
  if (loading) {
    return null;
  }

  // Unauthenticated: redirect to auth (shouldn't happen as App.tsx handles this)
  if (!user) {
    return <AuthNavigator onAuthSuccess={() => {}} />;
  }

  // Authenticated: render children
  return <>{children}</>;
};

