import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { toast } from "sonner-native";
import { mapUserResponseToUser, useAuth } from "../providers/AuthProvider";
import AuthService from "../services/AuthService";

export const ModifyProfile: React.FC = () => {
  const authService = AuthService.getInstance(); 
  const { user , setUser } = useAuth();
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [email, setEmail] = useState(user?.email || "");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [loadingForm, setLoadingForm] = useState<"profile" | "password" | null>(null);

  const handleUpdateProfile = async () => {
    if (!firstName || !lastName || !email) {
      toast.error("Please fill out all profile fields.");
      return;
    }

    setLoadingForm("profile");
    try {
      const res = await authService.updateProfile({ firstName, lastName, email });
      setUser(mapUserResponseToUser(res));
      toast.success("Profile updated successfully!");
    } catch (err : any) {
      toast.error(err.message || "Failed to update profile. Please try again.");
    } finally {
      setLoadingForm(null);
    }
  };

  const handleUpdatePassword = async () => {
    if (!newPassword || !currentPassword) {
      toast.error("Please fill out both password fields.");
      return;
    }

    setLoadingForm("password");
    try {
      const res = await authService.updateProfile({ currentPassword, newPassword });
      setUser(mapUserResponseToUser(res));
      toast.success("Password updated successfully!");
      setNewPassword("");
      setCurrentPassword("");
    } catch (err : any) {
      toast.error(err.message || "Failed to update password. Password might be too weak.");
    } finally {
      setLoadingForm(null);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        
        {/* Form 1: Profile Information */}
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Profile Information</Text>

          <Text style={styles.label}>First Name</Text>
          <TextInput
            style={styles.input}
            value={firstName}
            onChangeText={setFirstName}
            placeholder="John"
            autoCapitalize="words"
          />

          <Text style={styles.label}>Last Name</Text>
          <TextInput
            style={styles.input}
            value={lastName}
            onChangeText={setLastName}
            placeholder="Doe"
            autoCapitalize="words"
          />

          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="john.doe@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TouchableOpacity
            style={styles.violetButton}
            onPress={handleUpdateProfile}
            disabled={loadingForm !== null}
          >
            {loadingForm === "profile" ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Save Profile</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Form 2: Password Update */}
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Security</Text>

          <Text style={styles.label}>Current Password</Text>
          <TextInput
            style={styles.input}
            value={currentPassword}
            onChangeText={setCurrentPassword}
            placeholder="x@1A"
            secureTextEntry
            autoCapitalize="none"
          />

          <Text style={styles.label}>New Password</Text>
          <TextInput
            style={styles.input}
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="x@1A"
            secureTextEntry
            autoCapitalize="none"
          />

          <TouchableOpacity
            style={styles.violetButton}
            onPress={handleUpdatePassword}
            disabled={loadingForm !== null}
          >
            {loadingForm === "password" ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Update Password</Text>
            )}
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  scrollContainer: {
    padding: 20,
    paddingTop: 40,
  },
  formCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#4b5563",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: "#1f2937",
    marginBottom: 16,
    backgroundColor: "#fff",
  },
  violetButton: {
    backgroundColor: "#6d28d9", // Rich violet / purple 700
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  errorText: {
    color: "#dc2626",
    backgroundColor: "#fee2e2",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    textAlign: "center",
    fontWeight: "500",
  },
  successText: {
    color: "#16a34a",
    backgroundColor: "#dcfce7",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    textAlign: "center",
    fontWeight: "500",
  },
});