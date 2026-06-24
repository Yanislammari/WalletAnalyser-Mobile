import { useNavigation } from "@react-navigation/native";
import { useState, useEffect } from "react";
import { ActivityIndicator, View, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { toast } from "sonner-native";
import AuthService from "../services/AuthService";
import { LoginStyles } from "../styles/Login_style";
import { EMAIL_REGEX } from "../constants/regex";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../nav/ScreenParams";

const ForgottenPassword: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const authService = AuthService.getInstance();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [isEmailValid, setIsEmailValid] = useState<boolean | null>(null);
  const DEBOUNCE_DELAY = 600;

  useEffect(() => {
    if (!EMAIL_REGEX.test(email)) {
      setIsEmailValid(null);
      return;
    }

    const delay = setTimeout(async () => {
      setIsCheckingEmail(true);
      try {
        const res = await authService.checkEmailAvailability(email);
        setIsEmailValid(!res.available);
      } catch {
        setIsEmailValid(null);
      } finally {
        setIsCheckingEmail(false);
      }
    }, DEBOUNCE_DELAY);

    return () => clearTimeout(delay);
  }, [email]);

  const handleResetPassword = async () => {
    if (!email) {
      toast.error("Email is required.");
      return;
    }
    if (!EMAIL_REGEX.test(email)) {
      toast.error("Invalid email format.");
      return;
    }
    if (isEmailValid === false) {
      toast.error("This email is not registered.");
      return;
    }

    setLoading(true);
    try {
      await authService.sendPasswordReset(email);
      toast.success("Password reset link sent! Check your inbox.");
    } catch {
      toast.error("Error sending reset link. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const EmailStatusIcon = () => {
    if (isCheckingEmail) return <ActivityIndicator size="small" color="#9333ea" />;
    if (isEmailValid === true) return <Icon name="checkmark-circle" size={18} color="#22c55e" />;
    if (isEmailValid === false) return <Icon name="close-circle" size={18} color="#ef4444" />;
    return null;
  };

  const emailBorderStyle = () => {
    if (isEmailValid === true) return { borderColor: "#22c55e" };
    if (isEmailValid === false) return { borderColor: "#ef4444" };
    return {};
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

              {/* Header */}
              <View style={LoginStyles.header}>
                <Text style={LoginStyles.title}>
                  Reset your{" "}
                  <Text style={LoginStyles.titleAccent}>password</Text>
                </Text>
                <Text style={LoginStyles.subtitle}>
                  Enter your email and we'll send you a reset link.
                </Text>
              </View>

              {/* Email field */}
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

              {isEmailValid === false && !isCheckingEmail && (
                <Text style={styles.emailError}>This email is not registered.</Text>
              )}
              {isEmailValid === true && !isCheckingEmail && (
                <Text style={styles.emailSuccess}>Email found!</Text>
              )}

              {/* Send button */}
              <TouchableOpacity
                style={[LoginStyles.loginBtn, loading && LoginStyles.loginBtnDisabled]}
                onPress={handleResetPassword}
                disabled={loading}
                activeOpacity={0.85}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={LoginStyles.loginBtnText}>Send reset link</Text>
                )}
              </TouchableOpacity>

              {/* Back to login */}
              <TouchableOpacity
                style={LoginStyles.signupBtn}
                onPress={() => navigation.navigate("Login")}
                activeOpacity={0.85}
              >
                <Text style={LoginStyles.signupBtnText}>Back to login</Text>
              </TouchableOpacity>

            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default ForgottenPassword;

const styles = StyleSheet.create({
  emailError: {
    color: "#ef4444",
    fontSize: 12,
    marginTop: -4,
    marginBottom: 8,
    marginLeft: 2,
  },
  emailSuccess: {
    color: "#22c55e",
    fontSize: 12,
    marginTop: -4,
    marginBottom: 8,
    marginLeft: 2,
  },
});