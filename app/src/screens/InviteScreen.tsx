/**
 * Invite Screen - Ultra-Premium Casa Latina
 * Ceremonial prestige membership moment
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ImageBackground,
  TouchableOpacity,
  Share,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useTheme } from '../hooks/useTheme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../providers/AuthProvider';
import { t } from '../i18n';
import { showAlert } from '../utils/alert';
import { ASSETS } from '../constants/assets';

export const InviteScreen: React.FC = () => {
  const { theme } = useTheme();
  const { userDoc } = useAuth();
  const insets = useSafeAreaInsets();
  const [copied, setCopied] = useState(false);
  const styles = createStyles(theme, insets.top, insets.bottom);

  const inviteCode = userDoc?.inviteCode || 'CL-0000';
  const inviteLink = `https://casalatinaclub.com/invite/${inviteCode}`;

  const handleCopyCode = async () => {
    try {
      await Clipboard.setStringAsync(inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      showAlert('Error', 'Unable to copy code', 'error');
    }
  };

  const handleShare = async (method: 'whatsapp' | 'messages' | 'link') => {
    try {
      const message = `I'm on Casa Latina, a private events club for Latinos. Use my code ${inviteCode} to apply: ${inviteLink}`;

      if (method === 'link') {
        await Clipboard.setStringAsync(inviteLink);
        showAlert('Success', t('invite_copied'), 'success');
      } else {
        await Share.share({
          message,
          title: t('invite_title'),
        });
      }
    } catch (error) {
      showAlert('Error', 'Unable to share', 'error');
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      bounces={true}
    >
      {/* Hero Section - Floating card with blur */}
      <View style={styles.headerWrapper}>
        <ImageBackground
          source={ASSETS.backgrounds.premiumLounge}
          style={styles.heroImage}
          resizeMode="cover"
        >
          {/* Vignette cinematográfico superior - Status bar fusion */}
          <LinearGradient
            colors={[
              'rgba(0,0,0,0.55)',
              'rgba(0,0,0,0.25)',
              'rgba(0,0,0,0.05)',
              'transparent',
            ]}
            locations={[0, 0.4, 0.7, 1]}
            style={styles.topVignette}
          />

          {/* Degradado inferior para efecto premium */}
          <LinearGradient
            colors={[
              'transparent',
              'rgba(0,0,0,0.20)',
              'rgba(0,0,0,0.55)',
              'rgba(0,0,0,0.75)',
            ]}
            locations={[0, 0.3, 0.7, 1]}
            style={styles.bottomGradient}
          />

          {/* Tarjeta glass floating - Apple Design Team level */}
          <View style={styles.cardContainer}>
            <BlurView intensity={50} tint="dark" style={styles.blur}>
              <LinearGradient
                colors={[
                  'rgba(243, 232, 209, 0.08)',
                  'rgba(243, 232, 209, 0.04)',
                  'rgba(0, 0, 0, 0.12)',
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.cardGradientOverlay}
              >
                <View style={styles.cardContent}>
                  <Text style={styles.heroTitle}>{t('invite_title')}</Text>
                  <Text style={styles.heroSubtitle}>{t('invite_subtitle')}</Text>

                  <View style={styles.heroDivider} />

                  <Text style={styles.heroNote}>Members only. Invite carefully.</Text>
                </View>
              </LinearGradient>
            </BlurView>
          </View>
        </ImageBackground>
      </View>

      {/* Invite Card - Ceremonial */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t('invite_code_label')}</Text>
        
        {/* Premium invite code box */}
        <View style={styles.codeContainer}>
          <View style={styles.codeGlow} />
          <Text style={styles.codeText}>{inviteCode}</Text>
        </View>

        <Text style={styles.cardHelper}>{t('invite_code_helper')}</Text>

        {/* Copy Button - Ceremonial */}
        <TouchableOpacity
          style={styles.copyButton}
          onPress={handleCopyCode}
          activeOpacity={0.85}
        >
          <Ionicons
            name={copied ? 'checkmark-circle' : 'copy-outline'}
            size={18}
            color={theme.colors.pureBlack}
          />
          <Text style={styles.copyButtonText}>
            {copied ? t('invite_copied') : t('invite_copy_button')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Share Options - Premium */}
      <View style={styles.shareSection}>
        <Text style={styles.shareTitle}>{t('invite_share_title')}</Text>
        <View style={styles.shareButtons}>
          <TouchableOpacity
            style={styles.shareButton}
            onPress={() => handleShare('whatsapp')}
            activeOpacity={0.85}
          >
            <Ionicons name="logo-whatsapp" size={22} color={theme.colors.softCream} />
            <Text style={styles.shareButtonText}>{t('invite_share_whatsapp')}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.shareButton}
            onPress={() => handleShare('messages')}
            activeOpacity={0.85}
          >
            <Ionicons name="chatbubble-outline" size={22} color={theme.colors.softCream} />
            <Text style={styles.shareButtonText}>{t('invite_share_messages')}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.shareButton}
            onPress={() => handleShare('link')}
            activeOpacity={0.85}
          >
            <Ionicons name="link-outline" size={22} color={theme.colors.softCream} />
            <Text style={styles.shareButtonText}>{t('invite_share_link')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const createStyles = (theme: any, topInset: number, bottomInset: number) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollContent: {
      paddingBottom: bottomInset + 140,
      flexGrow: 1,
    },
    headerWrapper: {
      width: '100%',
      height: 260,
      overflow: 'hidden',
      marginBottom: theme.spacing.xxl,
    },
    heroImage: {
      flex: 1,
      justifyContent: 'flex-end',
    },
    topVignette: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 160,
    },
    bottomGradient: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: 180,
    },
    cardContainer: {
      paddingHorizontal: 20,
      paddingBottom: 22,
    },
    blur: {
      borderRadius: 30,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: 'rgba(243, 232, 209, 0.20)',
      shadowColor: 'rgba(243, 232, 209, 0.3)',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.4,
      shadowRadius: 20,
      elevation: 10,
    },
    cardGradientOverlay: {
      borderRadius: 30,
    },
    cardContent: {
      paddingVertical: 24,
      paddingHorizontal: 24,
    },
    heroTitle: {
      ...theme.typography.heroTitle,
      fontSize: 26,
      lineHeight: 36,
      color: '#F3E8D1',
      fontWeight: '700',
      letterSpacing: 0.3,
      textShadowColor: 'rgba(0, 0, 0, 0.5)',
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 6,
    },
    heroSubtitle: {
      marginTop: 10,
      fontSize: 15,
      lineHeight: 23,
      color: 'rgba(243, 232, 209, 0.85)',
      fontFamily: 'Inter_400Regular',
      letterSpacing: 0.2,
      textShadowColor: 'rgba(0, 0, 0, 0.4)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 4,
    },
    heroDivider: {
      marginTop: 16,
      marginBottom: 2,
      height: 1,
      backgroundColor: 'rgba(243, 232, 209, 0.25)',
    },
    heroNote: {
      marginTop: 12,
      fontSize: 13,
      lineHeight: 19,
      color: 'rgba(243, 232, 209, 0.90)',
      fontFamily: 'Inter_600SemiBold',
      letterSpacing: 0.4,
      textShadowColor: 'rgba(0, 0, 0, 0.5)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 3,
    },
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.xl,
      padding: theme.spacing.xl + 8,
      marginHorizontal: theme.spacing.md,
      marginBottom: theme.spacing.xl,
      borderWidth: 1,
      borderColor: theme.colors.softCream + '20', // Cream stitching border
      ...theme.shadows.lg,
    },
    cardTitle: {
      ...theme.typography.sectionTitle,
      color: theme.colors.text,
      marginBottom: theme.spacing.xl,
    },
    codeContainer: {
      backgroundColor: theme.colors.background,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.xl + 8,
      alignItems: 'center',
      marginBottom: theme.spacing.lg,
      borderWidth: 1,
      borderColor: theme.colors.softCream + '40',
      borderStyle: 'dashed',
      position: 'relative',
      overflow: 'hidden',
    },
    codeGlow: {
      position: 'absolute',
      top: -20,
      left: -20,
      right: -20,
      bottom: -20,
      backgroundColor: theme.colors.softCream + '05', // 5% opacity glow
      borderRadius: theme.borderRadius.xl,
    },
    codeText: {
      ...theme.typography.heroTitle,
      color: theme.colors.softCream, // Large monospace-style invite code
      fontSize: 36,
      letterSpacing: 6,
      fontFamily: 'Inter_600SemiBold',
    },
    cardHelper: {
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary,
      lineHeight: 22,
      marginBottom: theme.spacing.xl + 4,
      textAlign: 'center',
    },
    copyButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacing.md + 4,
      gap: theme.spacing.sm,
      backgroundColor: theme.colors.softCream, // Cream fill
      borderRadius: theme.borderRadius.md,
      ...theme.shadows.glow, // Gold ring shadow
    },
    copyButtonText: {
      ...theme.typography.button,
      color: theme.colors.pureBlack,
    },
    shareSection: {
      marginHorizontal: theme.spacing.md,
    },
    shareTitle: {
      ...theme.typography.subsectionTitle,
      color: theme.colors.text,
      marginBottom: theme.spacing.lg,
    },
    shareButtons: {
      flexDirection: 'row',
      gap: theme.spacing.md,
    },
    shareButton: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacing.md + 4,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      gap: theme.spacing.xs + 2,
    },
    shareButtonText: {
      ...theme.typography.label,
      color: theme.colors.textSecondary,
      fontSize: 12,
    },
  });
