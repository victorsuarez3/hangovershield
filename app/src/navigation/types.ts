/**
 * Navigation types for TypeScript
 */

import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { PaywallSourceType } from '../constants/paywallSources';

export type RootStackParamList = {
  HomeMain: undefined;
  CheckIn: undefined;
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

export type TabParamList = {
  Home: undefined;
  SmartPlan: undefined;
  Tools: undefined;
  Progress: undefined;
  Settings: undefined;
};

export type AuthFlowParamList = {
  Login: undefined;
};

export type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'HomeMain'>;
export type CheckInScreenProps = NativeStackScreenProps<RootStackParamList, 'CheckIn'>;
export type SmartPlanScreenProps = NativeStackScreenProps<RootStackParamList, 'SmartPlan'>;
export type ToolsScreenProps = NativeStackScreenProps<RootStackParamList, 'Tools'>;
export type ProgressScreenProps = NativeStackScreenProps<RootStackParamList, 'Progress'>;
export type ProfileScreenProps = NativeStackScreenProps<RootStackParamList, 'ProfileMain'>;
export type SettingsScreenProps = NativeStackScreenProps<RootStackParamList, 'Settings'>;

