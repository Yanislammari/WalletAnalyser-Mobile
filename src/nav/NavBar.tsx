import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Dashboard from "../screens/Dashboard";
import Icon from "react-native-vector-icons/Ionicons";
import Portfolios from "../screens/Portfolio";
import Metrics from "../screens/Metrics";
import Analysis from "../screens/Analysis";
import Badge from "../screens/Badge";
import Header from "./Header";
import PortfolioDetail from "../screens/PortfolioDetail";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { usePortfolio } from "../providers/PortfolioProvider";
import { NavigatorScreenParams } from "@react-navigation/native";
import { RankingType } from "../enums/RankType";
import AnalysisDetail from "../screens/AnalysisDetail";
import { ModifyProfile } from "../screens/ModifyProfile";

const Stack = createNativeStackNavigator();

export type PortfolioStackParamList = {
  PortfolioList: { openModal : boolean };
  PortfolioDetail: { id: string, name : string };
};

export type AnalysisStackParamList = {
  AnalysisList: undefined
  AnalysisDetail : { id : string | undefined, type : RankingType, offset : number}
}

export type NavBarParamList = {
  Dashboard : undefined;
  Portfolio : NavigatorScreenParams<PortfolioStackParamList>;
  Metrics : undefined;
  Badge : undefined;
  Analysis : undefined;
  ModifyProfile : undefined;
};

function PortfolioStackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="PortfolioList" component={Portfolios} options={{
          headerShown: false,
          header: () => <Header showChoice={false} />,
        }}/>
      <Stack.Screen name="PortfolioDetail" component={PortfolioDetail} options={{
          headerShown: false,
          header: () => <Header showChoice={false} />,
        }}/>
    </Stack.Navigator>
  );
}

function AnalysisStackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="AnalysisList" component={Analysis} options={{
          headerShown: false,
          header: () => <Header/>,
        }}/>
      <Stack.Screen name="AnalysisDetail" component={AnalysisDetail} options={{
          headerShown: false,
          header: () => <Header/>,
        }}/>
    </Stack.Navigator>
  );
}

const Tab = createBottomTabNavigator<NavBarParamList>();

const TAB_ICONS: Partial<Record<keyof NavBarParamList, string>> = {
  Portfolio: "wallet-outline",
  Dashboard: "grid-outline",
  Metrics: "bar-chart-outline",
  Analysis: "analytics-outline",
  Badge: "ribbon-outline",
};

export default function NavBar() {
  const { selectedPortfolio } = usePortfolio();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }: { color: string; size: number }) => {
          if (route.name === "ModifyProfile") {
            return null;
          }
          else {
            return <Icon name={TAB_ICONS[route.name] || "ellipse-outline"} size={size} color={color} />;
          }
        },
        tabBarActiveTintColor: "#6200ee",
        tabBarInactiveTintColor: "gray",
      })}
    >
      <Tab.Screen name="Dashboard" component={Dashboard} options={{headerShown: true, header: () => <Header />}}/>
      <Tab.Screen
        name="Portfolio"
        component={PortfolioStackNavigator}
        options={{
          headerShown: true,
          header: () => <Header showChoice={false} />,
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault(); // block default tab behavior
            if (selectedPortfolio) {
              navigation.navigate('Portfolio', {
                screen: 'PortfolioDetail',
                params: { id: selectedPortfolio.id, name : selectedPortfolio.name }
              });
            } else {
              navigation.navigate('Portfolio', {
                screen: 'PortfolioList',
                params : { openModal : false }
              });
            }
          },
        })}
      />
      <Tab.Screen name="Metrics" component={Metrics} options={{headerShown: true, header: () => <Header/>}}/>
      <Tab.Screen name="Analysis" component={AnalysisStackNavigator} options={{headerShown: true, header: () => <Header/>}}/>
      <Tab.Screen name="Badge" component={Badge} options={{headerShown: true, header: () => <Header showChoice={false}/>}}/>
      <Tab.Screen
        name="ModifyProfile"
        component={ModifyProfile}
        options={{
          tabBarButton: () => null,
          tabBarItemStyle: { display: "none" },
          headerShown: true,
          header: () => <Header showChoice={false} />,
        }}
      />
    </Tab.Navigator>
  );
}