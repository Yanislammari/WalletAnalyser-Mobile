import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Dashboard from "../../screens/Portfolio";
import Icon from "react-native-vector-icons/Ionicons";
import Portfolio from "../../screens/Portfolio";
import Metrics from "../../screens/Metrics";
import Analysis from "../../screens/Analysis";
import Badge from "../../screens/Badge";

type NavBarParamList = {
  Dashboard : undefined;
  Portfolio : undefined;
  Metrics : undefined;
  Badge : undefined;
  Analysis : undefined
};

const Tab = createBottomTabNavigator<NavBarParamList>();

const TAB_ICONS: Record<keyof NavBarParamList, string> = {
  Portfolio: "wallet-outline",
  Dashboard: "grid-outline",
  Metrics:   "bar-chart-outline",
  Analysis:  "analytics-outline",
  Badge:     "ribbon-outline",
};

export default function NavBar() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }: { color: string; size: number }) => (
          <Icon name={TAB_ICONS[route.name]} size={size} color={color} />
        ),
        tabBarActiveTintColor: "#6200ee",
        tabBarInactiveTintColor: "gray",
      })}
    >
      <Tab.Screen name="Portfolio" component={Portfolio} />
      <Tab.Screen name="Metrics" component={Metrics} />
      <Tab.Screen name="Dashboard" component={Dashboard} />
      <Tab.Screen name="Analysis" component={Analysis} />
      <Tab.Screen name="Badge" component={Badge} />
    </Tab.Navigator>
  );
}