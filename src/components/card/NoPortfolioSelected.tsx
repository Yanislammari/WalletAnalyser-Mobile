import { View, Text, TouchableOpacity } from "react-native"
import Icon from "react-native-vector-icons/Ionicons";
import { stylesPortfolio } from "../../styles/Portfolio_style"
import { useNavigation } from "@react-navigation/native";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { NavBarParamList } from "../../nav/NavBar";

type NavigationProp = BottomTabNavigationProp<NavBarParamList>;

const NoPortfolioSelected = () => {
  const navigation = useNavigation<NavigationProp>();
  return (
    <View style={stylesPortfolio.emptyState}>
      <View style={stylesPortfolio.emptyIcon}>
        <Icon name="briefcase-outline" size={36} color="#a78bfa" />
      </View>
      <Text style={stylesPortfolio.emptyTitle}>No portfolios yet</Text>
      <Text style={stylesPortfolio.emptySubtitle}>Create your first portfolio to start tracking.</Text>
      <TouchableOpacity style={stylesPortfolio.addBtn}   onPress={() => navigation.navigate("Portfolio", { 
        screen: "PortfolioList",
        params : { openModal : true }
      })}>
        <Icon name="add" size={16} color="#fff" />
        <Text style={stylesPortfolio.addBtnText}>Create a portfolio</Text>
      </TouchableOpacity>
    </View>
  )
}

export default NoPortfolioSelected;