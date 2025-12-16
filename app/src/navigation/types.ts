/**
 * Navigation types for TypeScript
 */

import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PaywallSourceType } from '../constants/paywallSources';

export type RootStackParamList = {
  HomeMain: undefined;
  CheckIn: undefined;
  CheckInComplete: undefined;
  SmartPlan: undefined;
  Tools: undefined;
  Progress: undefined;
  ProfileMain: undefined;
  Settings: undefined;
  Paywall: {
    source: PaywallSourceType;
    contextScreen?: string;
  };
  PurchaseSuccess: undefined;
  EveningCheckIn: undefined;
  EveningCheckInLocked: undefined;
  DailyWaterLog: undefined;
};

// TabParamList removed - we use Stack Navigator only now
// AuthFlowParamList removed - not used

export type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'HomeMain'>;
export type CheckInScreenProps = NativeStackScreenProps<RootStackParamList, 'CheckIn'>;
export type SmartPlanScreenProps = NativeStackScreenProps<RootStackParamList, 'SmartPlan'>;
export type ToolsScreenProps = NativeStackScreenProps<RootStackParamList, 'Tools'>;
export type ProgressScreenProps = NativeStackScreenProps<RootStackParamList, 'Progress'>;
export type ProfileScreenProps = NativeStackScreenProps<RootStackParamList, 'ProfileMain'>;
export type SettingsScreenProps = NativeStackScreenProps<RootStackParamList, 'Settings'>;

