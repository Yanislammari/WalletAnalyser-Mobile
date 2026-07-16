import { useEffect } from "react";
import { View, Image, Text, StyleSheet, ActivityIndicator } from "react-native";
import BootSplash from 'react-native-bootsplash';

function FirstScreen() {
  useEffect(() => {
    BootSplash.hide({ fade: true });
  }, []);
  
  return (
    <View style={styles.container}>
      <Image
        source={require("../../assets/logo.png")}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.appName}>Wallet analyser</Text>
      <ActivityIndicator style={styles.spinner} size="small" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff", // match your splash/theme color
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 16,
  },
  appName: {
    fontSize: 22,
    fontWeight: "600",
    color: "#9900ff",
  },
  spinner: {
    marginTop: 24,
  },
});

export default FirstScreen;