import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { toast } from "sonner-native";
import { useAuth } from "../providers/AuthProvider";
import AuthService  from "../services/AuthService";
import GoogleAuthButton from "../components/button/GoogleAuthButton";
import { LoginStyles } from "../styles/Login_style";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../nav/ScreenParams";
import { EMAIL_REGEX, PASSWORD_REGEX } from "../constants/regex"

const DEBOUNCE_DELAY = 600;
type RegisterNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const Register: React.FC = () => {
  const navigation = useNavigation<RegisterNavigationProp>();
  const { register } = useAuth();
  const authService = AuthService.getInstance();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [isEmailAvailable, setIsEmailAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    if (!EMAIL_REGEX.test(email)) {
      setIsEmailAvailable(null);
      return;
    }

    const delay = setTimeout(async () => {
      setIsCheckingEmail(true);
      try {
        const res = await authService.checkEmailAvailability(email);
        setIsEmailAvailable(res.available);
      } catch {
        setIsEmailAvailable(null);
      } finally {
        setIsCheckingEmail(false);
      }
    }, DEBOUNCE_DELAY);

    return () => clearTimeout(delay);
  }, [email]);

  const getBackendErrorMessage = (msg: string) => {
    switch (msg) {
      case "Email already exists":
        return "An account with this email already exists.";
      default:
        return "Something went wrong. Please try again later.";
    }
  };

  const emailBorderStyle = () => {
    if (isEmailAvailable === true) return styles.inputBorderGreen;
    if (isEmailAvailable === false) return styles.inputBorderRed;
    return styles.inputBorderDefault;
  };

  const EmailStatusIcon = () => {
    if (isCheckingEmail)
      return <ActivityIndicator size="small" color="#9333ea" />;
    if (isEmailAvailable === true)
      return <Icon name="checkmark-circle" size={18} color="#22c55e" />;
    if (isEmailAvailable === false)
      return <Icon name="close-circle" size={18} color="#ef4444" />;
    return null;
  };

  const handleRegister = async () => {
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      toast.error("All fields are required.");
      return;
    }
    if (!EMAIL_REGEX.test(email)) {
      toast.error("Invalid email format.");
      return;
    }
    if (isEmailAvailable === false) {
      toast.error("Email is already taken.");
      return;
    }
    if (!PASSWORD_REGEX.test(password)) {
      toast.error(
        "Password must be 8+ chars, include upper, lower, number & special char."
      );
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await register({ firstName, lastName, email, password });
      toast.success("Account created successfully!");
      navigation.reset({
        index: 0,
        routes: [{ name: "App" }],
      });
    } catch (error: any) {
      console.log(error)
      toast.error(getBackendErrorMessage(error.message));
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
                  Create a{" "}
                  <Text style={LoginStyles.titleAccent}>WalletAnalyser</Text>
                  {"\n"}account
                </Text>
              </View>

              {/* ── Name row ── */}
              <View style={styles.nameRow}>
                <TextInput
                  style={[LoginStyles.input, styles.nameInput]}
                  placeholder="First name"
                  placeholderTextColor="#9ca3af"
                  autoCapitalize="words"
                  autoCorrect={false}
                  value={firstName}
                  onChangeText={setFirstName}
                />
                <TextInput
                  style={[LoginStyles.input, styles.nameInput]}
                  placeholder="Last name"
                  placeholderTextColor="#9ca3af"
                  autoCapitalize="words"
                  autoCorrect={false}
                  value={lastName}
                  onChangeText={setLastName}
                />
              </View>

              {/* ── Email + availability indicator ── */}
              <View style={[LoginStyles.passwordWrapper, emailBorderStyle()]}>
                <TextInput
                  style={LoginStyles.passwordInput}
                  placeholder="Email"
                  placeholderTextColor="#9ca3af"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={email}
                  onChangeText={setEmail}
                />
                <EmailStatusIcon />
              </View>

              {/* Inline availability message */}
              {isEmailAvailable === false && !isCheckingEmail && (
                <Text style={styles.emailError}>
                  This email is already taken.
                </Text>
              )}
              {isEmailAvailable === true && !isCheckingEmail && (
                <Text style={styles.emailSuccess}>Email is available!</Text>
              )}

              {/* ── Password ── */}
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

              {/* ── Confirm password ── */}
              <View style={LoginStyles.passwordWrapper}>
                <TextInput
                  style={LoginStyles.passwordInput}
                  placeholder="Confirm password"
                  placeholderTextColor="#9ca3af"
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword((v) => !v)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Icon
                    name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color="#9ca3af"
                  />
                </TouchableOpacity>
              </View>

              {/* Password mismatch hint */}
              {confirmPassword.length > 0 && password !== confirmPassword && (
                <Text style={styles.emailError}>Passwords do not match.</Text>
              )}

              {/* ── Register button ── */}
              <TouchableOpacity
                style={[
                  LoginStyles.loginBtn,
                  loading && LoginStyles.loginBtnDisabled,
                ]}
                onPress={handleRegister}
                disabled={loading}
                activeOpacity={0.85}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={LoginStyles.loginBtnText}>Create account</Text>
                )}
              </TouchableOpacity>

              {/* ── Divider ── */}
              <View style={LoginStyles.divider}>
                <View style={LoginStyles.dividerLine} />
                <Text style={LoginStyles.dividerText}>OR</Text>
                <View style={LoginStyles.dividerLine} />
              </View>

              {/* ── Google ── */}
              <GoogleAuthButton />

              <TouchableOpacity
                style={LoginStyles.signupBtn}
                onPress={() => navigation.navigate("Login")}
                activeOpacity={0.85}
              >
                <Text style={LoginStyles.signupBtnText}>Go back to login</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

// ── Local-only styles (everything else is from LoginStyles) ────────────────
const styles = StyleSheet.create({
  nameRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 0, // LoginStyles.input already carries bottom margin
  },
  nameInput: {
    flex: 1,
    marginBottom: 12, // mirror LoginStyles.input spacing
  },
  inputBorderDefault: {
    borderColor: "#d1d5db",
  },
  inputBorderGreen: {
    borderColor: "#22c55e",
  },
  inputBorderRed: {
    borderColor: "#ef4444",
  },
  emailError: {
    color: "#ef4444",
    fontSize: 12,
    marginTop: -8,
    marginBottom: 8,
    marginLeft: 2,
  },
  emailSuccess: {
    color: "#22c55e",
    fontSize: 12,
    marginTop: -8,
    marginBottom: 8,
    marginLeft: 2,
  },
});

export default Register;
