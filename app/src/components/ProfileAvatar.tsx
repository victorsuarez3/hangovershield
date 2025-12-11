/**
 * ProfileAvatar Component - Casa Latina Premium
 * 
 * A high-quality, reusable avatar component with:
 * - Long press to view enlarged image (Instagram-style)
 * - Image picker integration for changing photos
 * - Fallback to initials when no image
 * 
 * @author Casa Latina Engineering
 */

import React, { useState, useCallback, useRef, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Pressable,
  Image,
  ActivityIndicator,
  Dimensions,
  Platform,
  Animated,
} from 'react-native';
import { BlurView } from 'expo-blur';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { showAlert } from '../utils/alert';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ENLARGED_SIZE = Math.min(SCREEN_WIDTH - 48, 340);

interface ProfileAvatarProps {
  /** Image URL for the avatar */
  imageUrl?: string | null;
  /** User's full name for generating initials */
  name: string;
  /** Size of the avatar in pixels */
  size?: number;
  /** Whether the avatar is editable (shows camera icon) */
  editable?: boolean;
  /** Callback when a new image is selected */
  onImageSelected?: (uri: string) => Promise<void>;
  /** Theme object for styling */
  theme: any;
  /** Whether to show the enlarged view on long press */
  enableEnlarge?: boolean;
}

/**
 * ProfileAvatar - Premium avatar component with Instagram-style preview
 */
export const ProfileAvatar = memo(({
  imageUrl,
  name,
  size = 84,
  editable = false,
  onImageSelected,
  theme,
  enableEnlarge = true,
}: ProfileAvatarProps) => {
  const [isEnlarged, setIsEnlarged] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Animation values using React Native Animated (more stable in Expo Go)
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const modalOpacity = useRef(new Animated.Value(0)).current;
  const imageScale = useRef(new Animated.Value(0.8)).current;

  // Extract initials from name
  const initials = name
    ?.split(' ')
    .map(n => n.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U';

  const hasValidImage = imageUrl && !imageError;

  // Open enlarged view with animation
  const openEnlargedView = useCallback(() => {
    if (!hasValidImage || !enableEnlarge) return;
    
    setIsEnlarged(true);
    Animated.parallel([
      Animated.timing(modalOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.spring(imageScale, {
        toValue: 1,
        damping: 20,
        stiffness: 300,
        mass: 0.8,
        useNativeDriver: true,
      }),
    ]).start();
  }, [hasValidImage, enableEnlarge, modalOpacity, imageScale]);

  // Close enlarged view with animation
  const closeEnlargedView = useCallback(() => {
    Animated.parallel([
      Animated.timing(modalOpacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(imageScale, {
        toValue: 0.8,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsEnlarged(false);
    });
  }, [modalOpacity, imageScale]);

  // Handle long press
  const handleLongPress = useCallback(() => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    
    openEnlargedView();
  }, [scaleAnim, openEnlargedView]);

  // Handle press in/out for visual feedback
  const handlePressIn = useCallback(() => {
    Animated.timing(scaleAnim, {
      toValue: 0.96,
      duration: 100,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 100,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  // Handle image picking
  const handlePickImage = useCallback(async () => {
    if (!editable || !onImageSelected) return;

    try {
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        showAlert(
          'Permission Required',
          'Please allow access to your photo library to change your profile picture.',
          'info'
        );
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]?.uri) {
        setIsLoading(true);
        setImageError(false);
        
        try {
          await onImageSelected(result.assets[0].uri);
        } catch (error: any) {
          // Show specific error message from StorageError
          const title = getErrorTitle(error?.code);
          const message = error?.message || 'Unable to update your profile picture. Please try again.';

          showAlert(title, message, 'error');
        } finally {
          setIsLoading(false);
        }
      }
    } catch (error) {
      console.error('Image picker error:', error);
      showAlert(
        'Error',
        'Could not open photo library. Please try again.',
        'error'
      );
    }
  }, [editable, onImageSelected]);

  // Get appropriate error title based on error code
  const getErrorTitle = (code?: string): string => {
    switch (code) {
      case 'file-too-large':
        return 'Image Too Large';
      case 'invalid-file-type':
        return 'Invalid Image';
      case 'unauthorized':
        return 'Permission Denied';
      case 'network-error':
        return 'Connection Error';
      default:
        return 'Upload Failed';
    }
  };

  const styles = createStyles(theme, size);

  return (
    <>
      <View style={styles.container}>
        <Pressable
          onLongPress={handleLongPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          delayLongPress={400}
        >
          <Animated.View style={[styles.avatarContainer, { transform: [{ scale: scaleAnim }] }]}>
            {isLoading ? (
              <View style={styles.avatar}>
                <ActivityIndicator size="small" color={theme.colors.primary} />
              </View>
            ) : hasValidImage ? (
              <Image
                source={{ uri: imageUrl }}
                style={styles.avatarImage}
                onError={() => setImageError(true)}
              />
            ) : (
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
            )}
          </Animated.View>
        </Pressable>

        {/* Edit button overlay */}
        {editable && (
          <TouchableOpacity
            style={styles.editButton}
            onPress={handlePickImage}
            activeOpacity={0.8}
          >
            <View style={styles.editButtonInner}>
              <Ionicons name="camera" size={14} color={theme.colors.background} />
            </View>
          </TouchableOpacity>
        )}
      </View>

      {/* Enlarged Image Modal */}
      <Modal
        visible={isEnlarged}
        transparent
        animationType="none"
        statusBarTranslucent
        onRequestClose={closeEnlargedView}
      >
        <TouchableWithoutFeedback onPress={closeEnlargedView}>
          <View style={styles.modalContainer}>
            <Animated.View style={[StyleSheet.absoluteFill, { opacity: modalOpacity }]}>
              <BlurView
                intensity={Platform.OS === 'ios' ? 80 : 120}
                tint="dark"
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.darkOverlay} />
            </Animated.View>

            <TouchableWithoutFeedback>
              <Animated.View 
                style={[
                  styles.enlargedContainer, 
                  { 
                    transform: [{ scale: imageScale }],
                    opacity: imageScale.interpolate({
                      inputRange: [0.8, 1],
                      outputRange: [0, 1],
                    }),
                  }
                ]}
              >
                {/* User name above image */}
                <Text style={styles.enlargedName}>{name}</Text>
                
                {/* Enlarged image with gold border */}
                <View style={styles.enlargedImageWrapper}>
                  <Image
                    source={{ uri: imageUrl! }}
                    style={styles.enlargedImage}
                    resizeMode="cover"
                  />
                </View>

                {/* Hint text */}
                <Text style={styles.hintText}>Tap anywhere to close</Text>
              </Animated.View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
});

ProfileAvatar.displayName = 'ProfileAvatar';

const createStyles = (theme: any, size: number) =>
  StyleSheet.create({
    container: {
      position: 'relative',
      width: size,
      height: size,
    },
    avatarContainer: {
      width: size,
      height: size,
      borderRadius: size / 2,
      overflow: 'hidden',
    },
    avatar: {
      width: '100%',
      height: '100%',
      borderRadius: size / 2,
      backgroundColor: theme.colors.softCream + '15',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: theme.colors.warmGold,
    },
    avatarImage: {
      width: '100%',
      height: '100%',
      borderRadius: size / 2,
      borderWidth: 1,
      borderColor: theme.colors.warmGold,
    },
    avatarText: {
      ...theme.typography.heroTitle,
      color: theme.colors.softCream,
      fontSize: size * 0.45,
    },
    editButton: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      width: size * 0.33,
      height: size * 0.33,
      borderRadius: (size * 0.33) / 2,
      backgroundColor: theme.colors.background,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: theme.colors.background,
    },
    editButtonInner: {
      width: '100%',
      height: '100%',
      borderRadius: (size * 0.33) / 2,
      backgroundColor: theme.colors.warmGold,
      alignItems: 'center',
      justifyContent: 'center',
    },
    // Modal styles
    modalContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    darkOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    enlargedContainer: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    enlargedName: {
      ...theme.typography.sectionTitle,
      color: theme.colors.text,
      fontSize: 24,
      marginBottom: 20,
      textShadowColor: 'rgba(0, 0, 0, 0.5)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 4,
    },
    enlargedImageWrapper: {
      width: ENLARGED_SIZE,
      height: ENLARGED_SIZE,
      borderRadius: ENLARGED_SIZE / 2,
      borderWidth: 2,
      borderColor: theme.colors.warmGold,
      overflow: 'hidden',
      shadowColor: theme.colors.warmGold,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.4,
      shadowRadius: 20,
      elevation: 20,
    },
    enlargedImage: {
      width: '100%',
      height: '100%',
    },
    hintText: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
      marginTop: 24,
      opacity: 0.8,
    },
  });

export default ProfileAvatar;

