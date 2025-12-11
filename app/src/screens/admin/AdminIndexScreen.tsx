/**
 * Admin Index Screen
 * Main admin dashboard
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { AdminGuard } from '../../components/AdminGuard';
import { useTheme } from '../../hooks/useTheme';
import { useNavigation } from '@react-navigation/native';

export const AdminIndexScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const styles = createStyles(theme);

  return (
    <AdminGuard>
      <View style={styles.container}>
        <Text style={styles.title}>Admin Panel</Text>
        
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            (navigation as any).navigate('AdminEvents');
          }}
        >
          <Text style={styles.buttonText}>Manage Events</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            (navigation as any).navigate('AdminMembers');
          }}
        >
          <Text style={styles.buttonText}>Review Members</Text>
        </TouchableOpacity>
      </View>
    </AdminGuard>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      padding: theme.spacing.lg,
    },
    title: {
      ...theme.typography.sectionTitle,
      color: theme.colors.text,
      marginBottom: theme.spacing.xl,
    },
    button: {
      backgroundColor: theme.colors.primary,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      marginBottom: theme.spacing.md,
    },
    buttonText: {
      ...theme.typography.label,
      color: theme.colors.pureBlack,
      textAlign: 'center',
      fontWeight: '600',
    },
  });

