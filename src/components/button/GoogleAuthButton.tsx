import React, { useState } from "react";
import { TouchableOpacity, Text, View, Image, StyleSheet, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { GoogleSignin, statusCodes } from "@react-native-google-signin/google-signin";
import { useAuth } from "../../providers/AuthProvider";
import { RootStackParamList } from "../../nav/ScreenParams";
import { toast } from "sonner-native";

const GoogleAuthButton: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { loginWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const idToken = userInfo.data?.idToken;

      if (!idToken) {
        toast.error("No Google token received.");
        return;
      }

      await loginWithGoogle(idToken);
      toast.success("Logged in with Google successfully!");
      navigation.navigate("Dashboard");
    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // user cancelled — do nothing
      } else if (error.code === statusCodes.IN_PROGRESS) {
        toast.error("Sign in already in progress.");
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        toast.error("Google Play Services not available.");
      } else {
        toast.error("Error logging in with Google.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={handleGoogleLogin}
      disabled={loading}
      activeOpacity={0.85}
    >
      {loading ? (
        <ActivityIndicator color="#374151" size="small" />
      ) : (
        <View style={styles.inner}>
          <Image
            source={{ uri: "https://www.svgrepo.com/show/355037/google.svg" }}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.label}>Continue with Google</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default GoogleAuthButton;

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#ffffff",
    borderWidth: 1.5,
    borderColor: "#d1d5db",
    borderRadius: 14,
    paddingVertical: 13,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  inner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  logo: {
    width: 20,
    height: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: "500",
    color: "#374151",
  },
});
