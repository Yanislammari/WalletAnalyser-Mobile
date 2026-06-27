import { StatusBar, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { usePortfolio } from "../providers/PortfolioProvider";
import React from "react";
import Header from "../nav/Header";

const Dashboard: React.FC = () => {
  const { selectedPortfolio } = usePortfolio()
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Text>{selectedPortfolio?.name ?? "No one"}</Text>
    </SafeAreaView>
  );
}

export default Dashboard;