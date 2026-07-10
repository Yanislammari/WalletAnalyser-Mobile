import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { toast } from "sonner-native";
import { useAuth } from "../providers/AuthProvider";
import GoogleAuthButton from "../components/button/GoogleAuthButton";
import { RootStackParamList } from "../nav/ScreenParams";
import { LoginStyles } from "../styles/Login_style";
import Icon from "react-native-vector-icons/Ionicons";
import { trackButtonClick } from "../utils/FirebaseTracking";

type LoginNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const getErrorMessage = (backendMessage: string): string => {
  switch (backendMessage) {
    case "Invalid email credentials":
      return "Email not found. Please check your email.";
    case "Password not set for this user":
      return "This account does not have a password set yet.";
    case "Invalid password credentials":
      return "Incorrect password. Please try again.";
    case "Email already exists":
      return "An account with this email already exists.";
    case "Username already exists":
      return "This username is already taken.";
    default:
      return "Something went wrong. Please try again later.";
  }
};

const Login: React.FC = () => {
  const navigation = useNavigation<LoginNavigationProp>();
  const { login } = useAuth();

  const [email, setEmail] = useState("aa@aa.com");
  const [password, setPassword] = useState("MoiMeme94@");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email && !password) {
      toast.error("Email and password are required.");
      return;
    }
    if (!email) {
      toast.error("Email is required.");
      return;
    }
    if (!password) {
      toast.error("Password is required.");
      return;
    }

    trackButtonClick("Login",{screen : "Login"});
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Login successful!");
      navigation.reset({
        index: 0,
        routes: [{ name: "App" }],
      });
    } catch (error: any) {
      toast.error(getErrorMessage(error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={LoginStyles.background}>
      <View style={[LoginStyles.blob, LoginStyles.blobTopLeft]} />
      <View style={[LoginStyles.blob, LoginStyles.blobBottomRight]} />

      <KeyboardAvoidingView
        style={LoginStyles.kav}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={LoginStyles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          {loading ? (
            <ActivityIndicator size={96} color="#9333ea" />
          ) : (
            <View style={LoginStyles.card}>
              <View style={LoginStyles.header}>
                <Text style={LoginStyles.title}>
                  Login to Wallet
                  <Text style={LoginStyles.titleAccent}>Analyser</Text>
                </Text>
              </View>

              <TextInput
                style={LoginStyles.input}
                placeholder="Email"
                placeholderTextColor="#9ca3af"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={email}
                onChangeText={setEmail}
              />
              <View style={LoginStyles.passwordWrapper}>
                <TextInput
                  style={LoginStyles.passwordInput}
                  placeholder="Password"
                  placeholderTextColor="#9ca3af"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword((v) => !v)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                <Icon
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color="#9ca3af"
                />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={LoginStyles.forgotContainer}
                onPress={() => navigation.navigate("ForgottenPassword")}
              >
                <Text style={LoginStyles.forgotText}>Forgotten Password?</Text>
              </TouchableOpacity>

              {/* Login button */}
              <TouchableOpacity
                style={[LoginStyles.loginBtn, loading && LoginStyles.loginBtnDisabled]}
                onPress={handleLogin}
                disabled={loading}
                activeOpacity={0.85}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={LoginStyles.loginBtnText}>Login</Text>
                )}
              </TouchableOpacity>

              {/* Divider */}
              <View style={LoginStyles.divider}>
                <View style={LoginStyles.dividerLine} />
                <Text style={LoginStyles.dividerText}>OR</Text>
                <View style={LoginStyles.dividerLine} />
              </View>

              {/* Google auth */}
              <GoogleAuthButton />

              {/* Sign up */}
              <TouchableOpacity
                style={LoginStyles.signupBtn}
                onPress={() => navigation.navigate("Register")}
                activeOpacity={0.85}
              >
                <Text style={LoginStyles.signupBtnText}>No account? Sign up here!</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default Login;
