/**
 * Admin Members Screen
 * List all pending members
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { AdminGuard } from '../../components/AdminGuard';
import { useTheme } from '../../hooks/useTheme';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getPendingMembers } from '../../services/admin';
import { UserDoc } from '../../models/firestore';

type UserDocWithId = UserDoc & { id: string };
import { Timestamp } from 'firebase/firestore';

export const AdminMembersScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [members, setMembers] = useState<UserDocWithId[]>([]);
  const [loading, setLoading] = useState(true);
  const styles = createStyles(theme, insets.top);

  useFocusEffect(
    useCallback(() => {
      loadMembers();
    }, [])
  );

  const loadMembers = async () => {
    setLoading(true);
    const fetchedMembers = await getPendingMembers();
    setMembers(fetchedMembers as UserDocWithId[]);
    setLoading(false);
  };

  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    const d = date instanceof Timestamp ? date.toDate() : new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const renderMember = ({ item }: { item: UserDocWithId }) => {
    return (
      <TouchableOpacity
        style={styles.memberCard}
        onPress={() => {
          (navigation as any).navigate('AdminMemberDetail', { userId: item.id });
        }}
      >
        <View style={styles.memberInfo}>
          <Text style={styles.memberName}>{item.fullName || 'No name'}</Text>
          <Text style={styles.memberEmail}>{item.email}</Text>
          <Text style={styles.memberDate}>
            Applied: {formatDate(item.createdAt)}
          </Text>
        </View>
        <Text style={styles.arrow}>→</Text>
      </TouchableOpacity>
    );
  };

  return (
    <AdminGuard>
      <View style={styles.container}>
        <Text style={styles.title}>Review Members</Text>
        <Text style={styles.subtitle}>
          {members.length} pending application{members.length !== 1 ? 's' : ''}
        </Text>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : (
          <FlatList
            data={members}
            renderItem={renderMember}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No pending members</Text>
              </View>
            }
          />
        )}
      </View>
    </AdminGuard>
  );
};

const createStyles = (theme: any, topInset: number) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      paddingTop: topInset + theme.spacing.lg,
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: theme.spacing.lg,
    },
    title: {
      ...theme.typography.sectionTitle,
      color: theme.colors.text,
      marginBottom: theme.spacing.xs,
    },
    subtitle: {
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.lg,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    memberCard: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: theme.spacing.md,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      marginBottom: theme.spacing.sm,
    },
    memberInfo: {
      flex: 1,
    },
    memberName: {
      ...theme.typography.subsectionTitle,
      color: theme.colors.text,
      marginBottom: theme.spacing.xs / 2,
    },
    memberEmail: {
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.xs / 2,
    },
    memberDate: {
      ...theme.typography.caption,
      color: theme.colors.textTertiary,
    },
    arrow: {
      ...theme.typography.body,
      color: theme.colors.textSecondary,
      fontSize: 20,
    },
    emptyContainer: {
      padding: theme.spacing.xl,
      alignItems: 'center',
    },
    emptyText: {
      ...theme.typography.body,
      color: theme.colors.textSecondary,
    },
  });

