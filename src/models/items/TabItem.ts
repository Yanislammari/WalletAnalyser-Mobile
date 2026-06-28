import type { TabType } from "../../enums/TabType";

export interface TabItem {
  key: TabType;
  label: string;
  icon: React.ReactNode;
}
