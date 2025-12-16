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
  /**
   * Allow guest/test mode navigation without authentication
   * When true, bypasses auth check (for development/testing)
   */
  allowGuestMode?: boolean;
}

/**
 * Protected Route that only allows authenticated users
 * Since authentication is handled in App.tsx, this is mainly a safety check
 * 
 * In guest/test mode (allowGuestMode=true), allows navigation without auth
 * This enables full app exploration during development
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowGuestMode = false 
}) => {
  const { user, loading } = useAuth();

  // Show loading while checking auth
  if (loading) {
    return null;
  }

  // Guest mode: allow navigation without authentication (for development/testing)
  if (allowGuestMode) {
    return <>{children}</>;
  }

  // Unauthenticated: redirect to auth (shouldn't happen as App.tsx handles this)
  if (!user) {
    return <AuthNavigator onAuthSuccess={() => {}} />;
  }

  // Authenticated: render children
  return <>{children}</>;
};

