import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { HANGOVER_GRADIENT } from '../theme/gradients';
import { typography } from '../design-system/typography';

const SOURCES: { topic: string; items: { title: string; url: string }[] }[] = [
  {
    topic: 'Hydration',
    items: [
      { title: 'Mayo Clinic – Water: How much should you drink?', url: 'https://www.mayoclinic.org/healthy-lifestyle/nutrition-and-healthy-eating/expert-answers/water/faq-20058444' },
      { title: 'CDC – Alcohol and dehydration basics', url: 'https://www.cdc.gov/alcohol/faqs.htm' },
    ],
  },
  {
    topic: 'Sleep',
    items: [
      { title: 'Sleep Foundation – How alcohol affects sleep', url: 'https://www.sleepfoundation.org/nutrition/alcohol-and-sleep' },
      { title: 'NIH – Healthy sleep basics', url: 'https://www.nhlbi.nih.gov/health/sleep' },
    ],
  },
  {
    topic: 'Alcohol & recovery',
    items: [
      { title: 'NIAAA – Alcohol’s effects on your body', url: 'https://www.niaaa.nih.gov/alcohols-effects-health' },
      { title: 'NIAAA – Rethinking drinking', url: 'https://www.rethinkingdrinking.niaaa.nih.gov/' },
    ],
  },
  {
    topic: 'Nausea',
    items: [
      { title: 'Cleveland Clinic – Nausea overview', url: 'https://my.clevelandclinic.org/health/diseases/15786-nausea' },
      { title: 'MedlinePlus – Nausea and vomiting', url: 'https://medlineplus.gov/nauseaandvomiting.html' },
    ],
  },
  {
    topic: 'Headache',
    items: [
      { title: 'Johns Hopkins – Headache basics', url: 'https://www.hopkinsmedicine.org/health/conditions-and-diseases/headache' },
      { title: 'Mayo Clinic – Hangovers', url: 'https://www.mayoclinic.org/diseases-conditions/hangovers/symptoms-causes/syc-20373012' },
    ],
  },
];

export const SourcesScreen: React.FC = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const handleOpen = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      }
    } catch (error) {
      console.error('[SourcesScreen] Failed to open URL:', error);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={HANGOVER_GRADIENT}
        locations={[0, 1]}
        style={StyleSheet.absoluteFillObject}
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons name="chevron-back" size={22} color="#0A2F30" />
          </TouchableOpacity>
          <Text style={styles.title}>Sources</Text>
          <Text style={styles.subtitle}>Evidence informing our hydration, sleep, and recovery guidance.</Text>
        </View>

        {SOURCES.map((section) => (
          <View key={section.topic} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.topic}</Text>
            {section.items.map((item) => (
              <TouchableOpacity
                key={item.url}
                style={styles.sourceCard}
                onPress={() => handleOpen(item.url)}
                activeOpacity={0.85}
              >
                <View style={styles.sourceText}>
                  <Text style={styles.sourceTitle}>{item.title}</Text>
                  <Text style={styles.sourceUrl}>{item.url}</Text>
                </View>
                <Ionicons name="open-outline" size={18} color="#0A3F37" />
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default SourcesScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 28 },
  header: { marginBottom: 12 },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(0,0,0,0.08)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 6,
  },
  title: {
    ...typography.headingM,
    fontSize: 24,
    marginTop: 14,
    color: '#0A2F30',
  },
  subtitle: {
    ...typography.bodySmall,
    color: 'rgba(10,47,48,0.7)',
    marginTop: 6,
    lineHeight: 20,
  },
  section: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    shadowColor: 'rgba(0,0,0,0.06)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
  },
  sectionTitle: {
    ...typography.labelSmall,
    fontSize: 12,
    letterSpacing: 1,
    color: 'rgba(10,47,48,0.6)',
    marginBottom: 10,
  },
  sourceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(10,47,48,0.08)',
  },
  sourceText: { flex: 1, paddingRight: 10 },
  sourceTitle: {
    ...typography.body,
    fontSize: 15,
    color: '#0A3F37',
    marginBottom: 4,
  },
  sourceUrl: {
    ...typography.caption,
    color: 'rgba(10,47,48,0.55)',
  },
});

