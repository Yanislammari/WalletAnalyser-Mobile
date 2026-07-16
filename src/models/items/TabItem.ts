import type { TabType } from "../../enums/TabType";
import { KeyboardAvoidingView } from 'react-native';

export interface TabItem {
  key: TabType;
  label: string;
  icon: React.ReactNode;
  iconColor : string;
}
