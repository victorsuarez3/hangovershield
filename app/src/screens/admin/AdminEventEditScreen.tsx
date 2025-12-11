/**
 * Admin Event Edit Screen
 * Form to edit an existing event - matches CreateEvent design
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
  Pressable,
  Modal,
} from 'react-native';
import { AdminGuard } from '../../components/AdminGuard';
import { useTheme } from '../../hooks/useTheme';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { getEventById, updateEvent, deleteEvent, UpdateEventData } from '../../services/admin';
import { EventDoc } from '../../models/firestore';
import { Timestamp } from 'firebase/firestore';
import { showAlert } from '../../utils/alert';
import DateTimePicker from '@react-native-community/datetimepicker';
import { uploadEventPhoto } from '../../services/storageService';

// Event types for Casa Latina
const EVENT_TYPES = [
  { value: "INTIMATE_COCKTAIL", label: "Intimate Cocktail" },
  { value: "PRIVATE_DINNER", label: "Private Dinner" },
  { value: "YACHT_PARTY", label: "Yacht Party" },
  { value: "ROOFTOP_SOCIAL", label: "Rooftop Social" },
  { value: "WINE_TASTING", label: "Wine Tasting" },
  { value: "ART_GALLERY", label: "Art Gallery" },
  { value: "NETWORKING", label: "Networking Event" },
  { value: "BEACH_CLUB", label: "Beach Club" },
  { value: "CULTURAL", label: "Cultural Event" },
  { value: "WELLNESS", label: "Wellness & Fitness" },
  { value: "VIP_PARTY", label: "VIP Party" },
] as const;

export const AdminEventEditScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const { eventId } = route.params as { eventId: string };

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [event, setEvent] = useState<EventDoc | null>(null);
  const [formData, setFormData] = useState<UpdateEventData>({});
  const styles = createStyles(theme, insets.top, insets.bottom);

  useEffect(() => {
    loadEvent();
  }, [eventId]);

  const loadEvent = async () => {
    setLoading(true);
    const fetchedEvent = await getEventById(eventId);
    if (fetchedEvent) {
      setEvent(fetchedEvent);
      const eventDate = fetchedEvent.date instanceof Timestamp
        ? fetchedEvent.date.toDate()
        : new Date(fetchedEvent.date);

      setFormData({
        title: fetchedEvent.title,
        subtitle: fetchedEvent.subtitle,
        image: fetchedEvent.image || fetchedEvent.coverImageUrl || '',
        date: eventDate,
        location: fetchedEvent.location || fetchedEvent.locationName || '',
        price: fetchedEvent.price,
        capacity: fetchedEvent.capacity,
        city: fetchedEvent.city,
        type: fetchedEvent.type,
        membersOnly: fetchedEvent.membersOnly,
        description: fetchedEvent.description,
      });
    }
    setLoading(false);
  };

  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        showAlert(
          'Permission Required',
          'Please allow access to your photo library to upload event images.',
          'info'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setUploadingImage(true);
        try {
          const imageUrl = await uploadEventPhoto(eventId, result.assets[0].uri);
          setFormData({ ...formData, image: imageUrl });
          showAlert('Success', 'Image uploaded successfully', 'success');
        } catch (error: any) {
          showAlert(
            'Error',
            error?.message || 'Failed to upload image',
            'error'
          );
        } finally {
          setUploadingImage(false);
        }
      }
    } catch (error) {
      console.error('Image picker error:', error);
      showAlert('Error', 'Could not open photo library', 'error');
    }
  };

  const handleTypeSelect = (typeValue: string) => {
    setFormData({ ...formData, type: typeValue });
    setShowTypeDropdown(false);
  };

  const getSelectedTypeLabel = () => {
    const selectedType = EVENT_TYPES.find(type => type.value === formData.type);
    return selectedType ? selectedType.label : "Select Event Type";
  };

  const handleSave = async () => {
    if (!formData.title || !formData.location || !formData.capacity || !formData.type) {
      showAlert('Error', 'Please fill in all required fields', 'error');
      return;
    }

    if (!formData.image) {
      showAlert('Error', 'Please upload an event image', 'error');
      return;
    }

    setSaving(true);
    try {
      await updateEvent(eventId, formData);
      showAlert('Success', 'Event updated successfully', 'success');
      navigation.goBack();
    } catch (error) {
      showAlert('Error', 'Failed to update event', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteEvent(eventId);
      showAlert('Success', 'Event deleted successfully', 'success');
      navigation.goBack();
    } catch (error) {
      showAlert('Error', 'Failed to delete event', 'error');
    }
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

  if (!event) {
    return (
      <AdminGuard>
        <View style={styles.container}>
          <Text style={styles.errorText}>Event not found</Text>
        </View>
      </AdminGuard>
    );
  }

  return (
    <AdminGuard>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Event</Text>
          <View style={styles.backButton} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Event Image Upload - First */}
          <View style={styles.imageSection}>
            <Text style={styles.label}>Event Image *</Text>
            <Pressable
              style={styles.imageUploadContainer}
              onPress={handlePickImage}
              disabled={uploadingImage}
            >
              {formData.image ? (
                <>
                  <Image
                    source={{ uri: formData.image }}
                    style={styles.eventImage}
                  />
                  <View style={styles.imageOverlay}>
                    <Ionicons
                      name="camera"
                      size={32}
                      color={theme.colors.text}
                    />
                    <Text style={styles.imageOverlayText}>Change Image</Text>
                  </View>
                </>
              ) : (
                <View style={styles.imagePlaceholder}>
                  {uploadingImage ? (
                    <ActivityIndicator
                      size="large"
                      color={theme.colors.primary}
                    />
                  ) : (
                    <>
                      <Ionicons
                        name="image-outline"
                        size={48}
                        color={theme.colors.textSecondary}
                      />
                      <Text style={styles.imagePlaceholderText}>
                        Tap to upload image
                      </Text>
                      <Text style={styles.imagePlaceholderHint}>
                        16:9 aspect ratio recommended
                      </Text>
                    </>
                  )}
                </View>
              )}
            </Pressable>
          </View>

          {/* Form Fields */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Title *</Text>
            <TextInput
              style={styles.input}
              value={formData.title}
              onChangeText={(text) => setFormData({ ...formData, title: text })}
              placeholder="Event title"
              placeholderTextColor={theme.colors.textTertiary}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Subtitle</Text>
            <TextInput
              style={styles.input}
              value={formData.subtitle}
              onChangeText={(text) =>
                setFormData({ ...formData, subtitle: text })
              }
              placeholder="Event subtitle"
              placeholderTextColor={theme.colors.textTertiary}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Date & Time *</Text>
            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => setShowDatePicker(true)}
            >
              <Ionicons
                name="calendar-outline"
                size={20}
                color={theme.colors.primary}
              />
              <Text style={styles.dateText}>
                {formData.date instanceof Date
                  ? `${formData.date.toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })} · ${formData.date.toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit'
                    })}`
                  : 'Select date'}
              </Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={
                  formData.date instanceof Date
                    ? formData.date
                    : formData.date instanceof Timestamp
                    ? formData.date.toDate()
                    : formData.date
                    ? new Date(formData.date)
                    : new Date()
                }
                mode="datetime"
                display="default"
                themeVariant="dark"
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) {
                    setFormData({ ...formData, date: selectedDate });
                  }
                }}
              />
            )}
          </View>

          {/* Type Dropdown Modal */}
          <Modal
            visible={showTypeDropdown}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setShowTypeDropdown(false)}
          >
            <Pressable
              style={styles.modalOverlay}
              onPress={() => setShowTypeDropdown(false)}
            >
              <View style={styles.dropdownModal}>
                <Text style={styles.modalTitle}>Select Event Type</Text>
                <ScrollView showsVerticalScrollIndicator={false}>
                  {EVENT_TYPES.map((eventType) => (
                    <TouchableOpacity
                      key={eventType.value}
                      style={[
                        styles.dropdownOption,
                        formData.type === eventType.value && styles.dropdownOptionSelected
                      ]}
                      onPress={() => handleTypeSelect(eventType.value)}
                    >
                      <Text style={[
                        styles.dropdownOptionText,
                        formData.type === eventType.value && styles.dropdownOptionTextSelected
                      ]}>
                        {eventType.label}
                      </Text>
                      {formData.type === eventType.value && (
                        <Ionicons
                          name="checkmark"
                          size={20}
                          color={theme.colors.primary}
                        />
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </Pressable>
          </Modal>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Location *</Text>
            <TextInput
              style={styles.input}
              value={formData.location}
              onChangeText={(text) =>
                setFormData({ ...formData, location: text })
              }
              placeholder="Event location"
              placeholderTextColor={theme.colors.textTertiary}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>City</Text>
            <TextInput
              style={styles.input}
              value={formData.city}
              onChangeText={(text) => setFormData({ ...formData, city: text })}
              placeholder="Miami"
              placeholderTextColor={theme.colors.textTertiary}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Type *</Text>
            <TouchableOpacity
              style={styles.dropdownInput}
              onPress={() => setShowTypeDropdown(true)}
            >
              <Text style={[
                styles.dropdownText,
                !formData.type && { color: theme.colors.textTertiary }
              ]}>
                {getSelectedTypeLabel()}
              </Text>
              <Ionicons
                name="chevron-down"
                size={20}
                color={theme.colors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Price</Text>
            <TextInput
              style={styles.input}
              value={formData.price?.toString() || ""}
              onChangeText={(text) =>
                setFormData({
                  ...formData,
                  price: text ? parseFloat(text) : undefined,
                })
              }
              placeholder="0"
              keyboardType="numeric"
              placeholderTextColor={theme.colors.textTertiary}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Capacity *</Text>
            <TextInput
              style={styles.input}
              value={formData.capacity?.toString() || ""}
              onChangeText={(text) =>
                setFormData({
                  ...formData,
                  capacity: parseInt(text) || 0,
                })
              }
              placeholder="50"
              keyboardType="numeric"
              placeholderTextColor={theme.colors.textTertiary}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, { height: 100, textAlignVertical: "top" }]}
              value={formData.description}
              onChangeText={(text) =>
                setFormData({ ...formData, description: text })
              }
              placeholder="Event description"
              placeholderTextColor={theme.colors.textTertiary}
              multiline
              numberOfLines={4}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.submitButton,
              saving && styles.submitButtonDisabled,
            ]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color={theme.colors.pureBlack} />
            ) : (
              <Text style={styles.submitButtonText}>Save Changes</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDelete}
          >
            <Text style={styles.deleteButtonText}>Delete Event</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </AdminGuard>
  );
};

const createStyles = (theme: any, topInset: number, bottomInset: number) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingTop: topInset + 16,
      paddingHorizontal: theme.spacing.md,
      paddingBottom: theme.spacing.lg,
      backgroundColor: theme.colors.background,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    backButton: {
      width: 40,
      height: 40,
      alignItems: "center",
      justifyContent: "center",
    },
    headerTitle: {
      ...theme.typography.sectionTitle,
      color: theme.colors.text,
      fontSize: 20,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: theme.spacing.md,
      paddingTop: theme.spacing.lg,
      paddingBottom: bottomInset + 120,
    },
    imageSection: {
      marginBottom: theme.spacing.xl,
    },
    imageUploadContainer: {
      width: "100%",
      aspectRatio: 16 / 9,
      borderRadius: theme.borderRadius.lg,
      overflow: "hidden",
      backgroundColor: theme.colors.surface,
      borderWidth: 2,
      borderColor: theme.colors.border,
      borderStyle: "dashed",
    },
    eventImage: {
      width: "100%",
      height: "100%",
      resizeMode: "cover",
    },
    imageOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(0, 0, 0, 0.6)",
      alignItems: "center",
      justifyContent: "center",
      opacity: 0,
    },
    imageOverlayText: {
      ...theme.typography.label,
      color: theme.colors.text,
      marginTop: theme.spacing.xs,
    },
    imagePlaceholder: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: theme.spacing.xl,
    },
    imagePlaceholderText: {
      ...theme.typography.body,
      color: theme.colors.textSecondary,
      marginTop: theme.spacing.md,
      textAlign: "center",
    },
    imagePlaceholderHint: {
      ...theme.typography.caption,
      color: theme.colors.textTertiary,
      marginTop: theme.spacing.xs,
      textAlign: "center",
    },
    formGroup: {
      marginBottom: theme.spacing.lg,
    },
    label: {
      ...theme.typography.label,
      color: theme.colors.text,
      marginBottom: theme.spacing.sm,
      fontSize: 15,
      fontWeight: "600",
    },
    input: {
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md + 2,
      color: theme.colors.text,
      ...theme.typography.body,
      fontSize: 15,
    },
    dateInput: {
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md + 2,
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.sm,
    },
    dateText: {
      ...theme.typography.body,
      color: theme.colors.primary,
      fontSize: 15,
      flex: 1,
      fontWeight: '500',
    },
    submitButton: {
      backgroundColor: theme.colors.primary,
      padding: theme.spacing.md + 4,
      borderRadius: theme.borderRadius.md,
      marginTop: theme.spacing.xl,
      marginBottom: theme.spacing.md,
      ...theme.shadows.md,
    },
    submitButtonDisabled: {
      opacity: 0.5,
    },
    submitButtonText: {
      ...theme.typography.label,
      color: theme.colors.pureBlack,
      textAlign: "center",
      fontWeight: "600",
      fontSize: 16,
    },
    deleteButton: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: theme.colors.errorRed || '#CC5C6C',
      padding: theme.spacing.md + 4,
      borderRadius: theme.borderRadius.md,
      marginBottom: theme.spacing.md,
    },
    deleteButtonText: {
      ...theme.typography.label,
      color: theme.colors.errorRed || '#CC5C6C',
      textAlign: "center",
      fontWeight: "600",
      fontSize: 16,
    },
    dropdownInput: {
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md + 2,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    dropdownText: {
      ...theme.typography.body,
      color: theme.colors.text,
      fontSize: 15,
      flex: 1,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "center",
      alignItems: "center",
      padding: theme.spacing.lg,
    },
    dropdownModal: {
      backgroundColor: theme.colors.background,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      width: "100%",
      maxWidth: 400,
      maxHeight: "70%",
      ...theme.shadows.lg,
    },
    modalTitle: {
      ...theme.typography.sectionTitle,
      color: theme.colors.text,
      fontSize: 18,
      marginBottom: theme.spacing.lg,
      textAlign: "center",
    },
    dropdownOption: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      marginBottom: theme.spacing.xs,
    },
    dropdownOptionSelected: {
      backgroundColor: theme.colors.primary + "20",
    },
    dropdownOptionText: {
      ...theme.typography.body,
      color: theme.colors.text,
      fontSize: 15,
      flex: 1,
    },
    dropdownOptionTextSelected: {
      color: theme.colors.primary,
      fontWeight: "600",
    },
    errorText: {
      ...theme.typography.body,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginTop: theme.spacing.xl,
    },
  });
