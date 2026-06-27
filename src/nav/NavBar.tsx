import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Dashboard from "../screens/Dashboard";
import Icon from "react-native-vector-icons/Ionicons";
import Portfolios from "../screens/Portfolio";
import Metrics from "../screens/Metrics";
import Analysis from "../screens/Analysis";
import Badge from "../screens/Badge";
import Header from "./Header";

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
      <Tab.Screen name="Dashboard" component={Dashboard} options={{headerShown: true, header: () => <Header />}}/>
      <Tab.Screen name="Portfolio" component={Portfolios} options={{headerShown: true, header: () => <Header showChoice={false} />}}/>
      <Tab.Screen name="Metrics" component={Metrics} options={{headerShown: true, header: () => <Header/>}}/>
      <Tab.Screen name="Analysis" component={Analysis} options={{headerShown: true, header: () => <Header/>}}/>
      <Tab.Screen name="Badge" component={Badge} options={{headerShown: true, header: () => <Header/>}}/>
    </Tab.Navigator>
  );
}