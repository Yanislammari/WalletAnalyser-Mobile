import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DeviceEventEmitter } from "react-native";
import { toast } from "sonner-native";
import type { NavigationContainerRef } from "@react-navigation/native";

import type { UserResponse } from "../responses/UserResponse";
import type { User } from "../models/User";
import type { RegisterPayload } from "../payloads/RegisterPayload";
import type { AuthResponse } from "../responses/AuthResponse";
import AuthService from "../services/AuthService";

export const navigationRef = React.createRef<NavigationContainerRef<any>>();
export const AUTH_LOGOUT_EVENT = "auth:logout";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<User>;
  loginWithGoogle: (idToken: string) => Promise<User>;
  logout: () => void;
  sendActivationEmail: () => Promise<void>;
}

export const STORAGE_KEYS = {
  TOKEN: "token",
  USER: "user",
  JUST_LOGGED_IN: "justLoggedIn",
  SHOW_ACTIVATION_BANNER: "showActivationBanner",
} as const;

const PUBLIC_ROUTES = ["Main", "Login", "Register"];
const mapUserResponseToUser = (u: UserResponse): User => ({
  id: u.id,
  email: u.email,
  firstName: u.firstName,
  lastName: u.lastName,
  googleId: u.googleId,
  googlePictureUrl: u.googlePictureUrl,
  ban: u.ban,
  userType: u.userType,
  subscribe: false,
  activated: u.activated,
  timeMsGift: u.timeMsGift,
  createdAt: new Date(u.createdAt),
  updatedAt: new Date(u.updatedAt),
});

const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const authService = AuthService.getInstance();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const isAuthenticated = !!token;

  useEffect(() => {
    const hydrate = async () => {
      try {
        const storedToken = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
        const storedUser  = await AsyncStorage.getItem(STORAGE_KEYS.USER);

        if (storedToken) setToken(storedToken);
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          setUser({
            ...parsed,
            createdAt: new Date(parsed.createdAt),
            updatedAt: new Date(parsed.updatedAt),
          } as User);
        }
      } catch {
        // corrupted storage — start fresh
      } finally {
        setIsAuthLoading(false);
      }
    };
    hydrate();
  }, []);

  const persistSession = async (authToken: string, mappedUser: User) => {
    setToken(authToken);
    setUser(mappedUser);
    await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, authToken);
    await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(mappedUser));
    await AsyncStorage.setItem(STORAGE_KEYS.JUST_LOGGED_IN, "true");
    await AsyncStorage.setItem(STORAGE_KEYS.SHOW_ACTIVATION_BANNER, "true");
  };

  const clearSession = async () => {
    setUser(null);
    setToken(null);
    setIsAuthLoading(false);
    await AsyncStorage.removeItem(STORAGE_KEYS.TOKEN);
    await AsyncStorage.removeItem(STORAGE_KEYS.USER);
    await AsyncStorage.removeItem(STORAGE_KEYS.JUST_LOGGED_IN);
    await AsyncStorage.removeItem(STORAGE_KEYS.SHOW_ACTIVATION_BANNER);
  };

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await authService.login({ email, password });
      const mappedUser = mapUserResponseToUser(response.user);
      await persistSession(response.token, mappedUser);
      if (!mappedUser.activated) {
        await authService.sendActivationEmail(mappedUser.email);
      }
    } catch (error: any) {
      throw new Error(error.message || "Login failed");
    }
  }, [authService]);

  const register = useCallback(async (payload: RegisterPayload) => {
    try {
      const response = await authService.register(payload);
      const mappedUser = mapUserResponseToUser(response.user);
      await persistSession(response.token, mappedUser);
      if (!mappedUser.activated) {
        await authService.sendActivationEmail(mappedUser.email);
      }
      return mappedUser;
    } catch (error: any) {
      throw new Error(error.message || "Registration failed");
    }
  }, [authService]);

  const loginWithGoogle = useCallback(async (idToken: string) => {
    setIsAuthLoading(true);
    try {
      const response: AuthResponse = await authService.authWithGoogle(idToken);
      const mappedUser = mapUserResponseToUser(response.user);
      await persistSession(response.token, mappedUser);
      if (!mappedUser.activated) {
        await authService.sendActivationEmail(mappedUser.email);
      }
      return mappedUser;
    } catch (error: any) {
      throw new Error(error.message || "Google login failed");
    } finally {
      setIsAuthLoading(false);
    }
  }, [authService]);

  const sendActivationEmail = useCallback(async () => {
    if (!user) return;
    await authService.sendActivationEmail(user.email);
  }, [authService, user]);

  const logout = useCallback(async () => {
    const currentRoute = navigationRef.current?.getCurrentRoute()?.name;
    const isOnPublicRoute = !currentRoute || PUBLIC_ROUTES.includes(currentRoute);

    if (!isOnPublicRoute) {
      toast.info("Your session has expired, please login again.");
      await clearSession();
      navigationRef.current?.reset({
        index: 0,
        routes: [{ name: "Login" }],
      });
    }
  }, []);

  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener(AUTH_LOGOUT_EVENT, logout);
    return () => subscription.remove();
  }, [logout]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isAuthLoading,
        login,
        register,
        loginWithGoogle,
        logout,
        sendActivationEmail,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
