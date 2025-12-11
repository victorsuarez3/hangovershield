/**
 * Navigation types for TypeScript
 */

import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

export type RootStackParamList = {
  HomeMain: undefined;
  CheckIn: undefined;
  SmartPlan: undefined;
  Tools: undefined;
  History: undefined;
  ProfileMain: undefined;
  Settings: undefined;
};

export type TabParamList = {
  Home: undefined;
  SmartPlan: undefined;
  Tools: undefined;
  History: undefined;
  Settings: undefined;
};

export type AuthFlowParamList = {
  Login: undefined;
};

export type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'HomeMain'>;
export type CheckInScreenProps = NativeStackScreenProps<RootStackParamList, 'CheckIn'>;
export type SmartPlanScreenProps = NativeStackScreenProps<RootStackParamList, 'SmartPlan'>;
export type ToolsScreenProps = NativeStackScreenProps<RootStackParamList, 'Tools'>;
export type HistoryScreenProps = NativeStackScreenProps<RootStackParamList, 'History'>;
export type ProfileScreenProps = NativeStackScreenProps<RootStackParamList, 'ProfileMain'>;
export type SettingsScreenProps = NativeStackScreenProps<RootStackParamList, 'Settings'>;

