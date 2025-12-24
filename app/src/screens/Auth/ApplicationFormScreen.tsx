/**
 * Application Form Screen - Casa Latina
 * Membership application form
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../hooks/useTheme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../components/Button';

export interface ApplicationFormData {
  position: string;
  company: string;
  industry: string;
  educationLevel: string;
  university?: string;
  incomeRange: string;
  city: string;
  age: string | number;
  instagramHandle: string;
  referralSource?: string;
}

interface ApplicationFormScreenProps {
  onSubmit: (data: ApplicationFormData) => void;
  loading?: boolean;
}

export const ApplicationFormScreen: React.FC<ApplicationFormScreenProps> = ({
  onSubmit,
  loading = false,
}) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [formData, setFormData] = useState<ApplicationFormData>({
    position: '',
    company: '',
    industry: '',
    educationLevel: '',
    university: '',
    incomeRange: '',
    city: '',
    age: '',
    instagramHandle: '',
    referralSource: '',
  });
  const styles = createStyles(theme, insets.bottom);

  const handleSubmit = () => {
    onSubmit(formData);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[theme.colors.background, theme.colors.richBlack]}
        style={styles.gradient}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <Text style={styles.title}>Membership Application</Text>
            <Text style={styles.subtitle}>
              Please fill out the form below to apply for membership
            </Text>

            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Position/Title *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Software Engineer"
                  value={formData.position}
                  onChangeText={(text) => setFormData({ ...formData, position: text })}
                  editable={!loading}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Company *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Tech Corp"
                  value={formData.company}
                  onChangeText={(text) => setFormData({ ...formData, company: text })}
                  editable={!loading}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Industry *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Technology"
                  value={formData.industry}
                  onChangeText={(text) => setFormData({ ...formData, industry: text })}
                  editable={!loading}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Education Level *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Bachelor's Degree"
                  value={formData.educationLevel}
                  onChangeText={(text) => setFormData({ ...formData, educationLevel: text })}
                  editable={!loading}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>University (Optional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. University Name"
                  value={formData.university}
                  onChangeText={(text) => setFormData({ ...formData, university: text })}
                  editable={!loading}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Annual Income Range *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. $50,000 - $100,000"
                  value={formData.incomeRange}
                  onChangeText={(text) => setFormData({ ...formData, incomeRange: text })}
                  editable={!loading}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>City *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Miami"
                  value={formData.city}
                  onChangeText={(text) => setFormData({ ...formData, city: text })}
                  editable={!loading}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Age *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 28"
                  value={formData.age.toString()}
                  onChangeText={(text) => setFormData({ ...formData, age: text })}
                  keyboardType="numeric"
                  editable={!loading}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Instagram Handle *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="username (without @)"
                  value={formData.instagramHandle}
                  onChangeText={(text) => setFormData({ ...formData, instagramHandle: text })}
                  autoCapitalize="none"
                  editable={!loading}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>How did you hear about us? (Optional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Social media, friend, etc."
                  value={formData.referralSource}
                  onChangeText={(text) => setFormData({ ...formData, referralSource: text })}
                  editable={!loading}
                />
              </View>

              <Button
                title="Submit Application"
                onPress={handleSubmit}
                loading={loading}
                style={styles.button}
              />
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
};

const createStyles = (theme: any, bottomInset: number) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    gradient: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      paddingBottom: bottomInset + 32,
    },
    content: {
      paddingHorizontal: 24,
      paddingTop: 60,
    },
    title: {
      fontSize: 32,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      marginBottom: 32,
    },
    form: {
      width: '100%',
    },
    inputGroup: {
      marginBottom: 20,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 8,
    },
    input: {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderRadius: 12,
      padding: 16,
      fontSize: 16,
      color: theme.colors.text,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    button: {
      marginTop: 8,
    },
  });






