/**
 * Admin Member Detail Screen
 * View member application and approve/reject
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { AdminGuard } from '../../components/AdminGuard';
import { useTheme } from '../../hooks/useTheme';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getUserById, approveMember, rejectMember } from '../../services/admin';
import { UserDoc } from '../../models/firestore';
import { Timestamp } from 'firebase/firestore';
import { showAlert } from '../../utils/alert';

export const AdminMemberDetailScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const { userId } = route.params as { userId: string };

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [user, setUser] = useState<UserDoc | null>(null);
  const styles = createStyles(theme, insets.top, insets.bottom);

  useEffect(() => {
    loadUser();
  }, [userId]);

  const loadUser = async () => {
    setLoading(true);
    const fetchedUser = await getUserById(userId);
    setUser(fetchedUser);
    setLoading(false);
  };

  const handleApprove = async () => {
    setProcessing(true);
    try {
      await approveMember(userId);
      showAlert('Success', 'Member approved successfully', 'success');
      navigation.goBack();
    } catch (error) {
      showAlert('Error', 'Failed to approve member', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    setProcessing(true);
    try {
      await rejectMember(userId);
      showAlert('Success', 'Member rejected', 'success');
      navigation.goBack();
    } catch (error) {
      showAlert('Error', 'Failed to reject member', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    const d = date instanceof Timestamp ? date.toDate() : new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <AdminGuard>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </AdminGuard>
    );
  }

    if (!user) {
      return (
        <AdminGuard>
          <View style={styles.scrollView}>
            <View style={{ paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.lg }}>
              <Text style={styles.errorText}>Member not found</Text>
            </View>
          </View>
        </AdminGuard>
      );
    }

  return (
    <AdminGuard>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Member Application</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Name</Text>
            <Text style={styles.fieldValue}>{user.fullName || 'N/A'}</Text>
          </View>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Email</Text>
            <Text style={styles.fieldValue}>{user.email}</Text>
          </View>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>City</Text>
            <Text style={styles.fieldValue}>{user.city || 'N/A'}</Text>
          </View>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Instagram</Text>
            <Text style={styles.fieldValue}>
              {user.instagramHandle || 'N/A'}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Application Details</Text>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Position</Text>
            <Text style={styles.fieldValue}>
              {user.positionTitle || 'N/A'}
            </Text>
          </View>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Company</Text>
            <Text style={styles.fieldValue}>{user.company || 'N/A'}</Text>
          </View>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Industry</Text>
            <Text style={styles.fieldValue}>{user.industry || 'N/A'}</Text>
          </View>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Education Level</Text>
            <Text style={styles.fieldValue}>
              {user.educationLevel || 'N/A'}
            </Text>
          </View>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>University</Text>
            <Text style={styles.fieldValue}>
              {user.university || 'N/A'}
            </Text>
          </View>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Annual Income Range</Text>
            <Text style={styles.fieldValue}>
              {user.annualIncomeRange || 'N/A'}
            </Text>
          </View>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Age</Text>
            <Text style={styles.fieldValue}>
              {user.age ? `${user.age} years old` : 'N/A'}
            </Text>
          </View>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>How did you hear about us?</Text>
            <Text style={styles.fieldValue}>
              {user.heardAboutUs || 'N/A'}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Application Status</Text>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Status</Text>
            <Text style={styles.fieldValue}>{user.membershipStatus}</Text>
          </View>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Applied On</Text>
            <Text style={styles.fieldValue}>
              {formatDate(user.createdAt)}
            </Text>
          </View>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[
              styles.approveButton,
              processing && styles.buttonDisabled,
            ]}
            onPress={handleApprove}
            disabled={processing}
          >
            {processing ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.approveButtonText}>Approve</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.rejectButton,
              processing && styles.buttonDisabled,
            ]}
            onPress={handleReject}
            disabled={processing}
          >
            {processing ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.rejectButtonText}>Reject</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </AdminGuard>
  );
};

const createStyles = (theme: any, topInset: number, bottomInset: number) =>
  StyleSheet.create({
    scrollView: {
      flex: 1,
      backgroundColor: theme.colors.background,
      paddingTop: topInset,
    },
    scrollContent: {
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: bottomInset + 120, // Extra space for tab bar
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.background,
    },
    title: {
      ...theme.typography.sectionTitle,
      color: theme.colors.text,
      marginBottom: theme.spacing.xl,
    },
    section: {
      marginBottom: theme.spacing.xl,
    },
    sectionTitle: {
      ...theme.typography.subsectionTitle,
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
    },
    field: {
      marginBottom: theme.spacing.md,
    },
    fieldLabel: {
      ...theme.typography.label,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.xs / 2,
    },
    fieldValue: {
      ...theme.typography.body,
      color: theme.colors.text,
    },
    buttonRow: {
      flexDirection: 'row',
      gap: theme.spacing.md,
      marginTop: theme.spacing.lg,
      marginBottom: theme.spacing.xl,
    },
    approveButton: {
      flex: 1,
      backgroundColor: theme.colors.successGreen || '#7AB48B',
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
    },
    rejectButton: {
      flex: 1,
      backgroundColor: theme.colors.errorRed || '#CC5C6C',
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
    },
    buttonDisabled: {
      opacity: 0.5,
    },
    approveButtonText: {
      ...theme.typography.label,
      color: '#FFFFFF',
      textAlign: 'center',
      fontWeight: '600',
    },
    rejectButtonText: {
      ...theme.typography.label,
      color: '#FFFFFF',
      textAlign: 'center',
      fontWeight: '600',
    },
    errorText: {
      ...theme.typography.body,
      color: theme.colors.textSecondary,
    },
  });



