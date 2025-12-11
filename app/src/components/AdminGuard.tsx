/**
 * Admin Guard Component
 * Protects admin routes - only allows access if user.role === "admin"
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuth } from '../providers/AuthProvider';
import { useNavigation } from '@react-navigation/native';

interface AdminGuardProps {
  children: React.ReactNode;
}

/**
 * Admin Guard that redirects non-admin users to /home
 */
export const AdminGuard: React.FC<AdminGuardProps> = ({ children }) => {
  const { user, userDoc, loading } = useAuth();
  const navigation = useNavigation();

  useEffect(() => {
    if (!loading && userDoc) {
      // Check if user is admin
      if (userDoc.role !== 'admin') {
        // Redirect to home
        navigation.navigate('Home' as never);
      }
    }
  }, [userDoc, loading, navigation]);

  // Show loading while checking
  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#D5C4A1" />
      </View>
    );
  }

  // Not authenticated
  if (!user || !userDoc) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Access Denied</Text>
      </View>
    );
  }

  // Not admin
  if (userDoc.role !== 'admin') {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Admin Access Required</Text>
      </View>
    );
  }

  // Admin - allow access
  return <>{children}</>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
});



