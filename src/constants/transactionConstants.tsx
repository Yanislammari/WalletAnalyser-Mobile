import Ionicons from "react-native-vector-icons/Ionicons";
import { TabType } from "../enums/TabType";
import type { TabAccent } from "../models/items/TabAccent";
import type { TabItem } from "../models/items/TabItem";

export const TABS: TabItem[] = [
  { 
    key: TabType.BUYS,
    label: "Buys",
    icon: <Ionicons name="trending-up-outline" size={15} />,
    iconColor: "#ccfcdb"
  },
  {
    key: TabType.SELLS,
    label: "Sells",
    icon: <Ionicons name="trending-down-outline" size={15} />,
    iconColor: "#ffc3c3"
  },
  {
    key: TabType.DIVIDENDS,
    label: "Dividends",
    icon: <Ionicons name="cash-outline" size={15} />,
    iconColor: "#c3ccff"
  },
];

export const tabAccent: Record<TabType, TabAccent> = {
  BUYS: {
    badge: "text-emerald-600 bg-emerald-50",
    btn: "bg-emerald-600 hover:bg-emerald-700",
    icon: "bg-emerald-100 text-emerald-600",
    dot: "bg-emerald-400"
  },
  SELLS: {
    badge: "text-red-500 bg-red-50",
    btn: "bg-red-500 hover:bg-red-600",
    icon: "bg-red-100 text-red-500",
    dot: "bg-red-400"
  },
  DIVIDENDS: {
    badge: "text-indigo-600 bg-indigo-50",
    btn: "bg-indigo-600 hover:bg-indigo-700",
    icon: "bg-indigo-100 text-indigo-600",
    dot: "bg-indigo-400"
  },
};

export const inputCls: string = "w-full px-3 py-2 text-sm text-gray-900 placeholder-gray-400 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition";
export const labelCls: string = "block text-xs font-medium text-gray-600 mb-1";
