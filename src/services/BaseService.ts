import { DeviceEventEmitter } from "react-native";
import { BACKEND_BASE_URL } from "../constants/env";
import { AUTH_LOGOUT_EVENT, STORAGE_KEYS } from "../providers/AuthProvider";
import AsyncStorage from "@react-native-async-storage/async-storage";

abstract class BaseService {
  protected baseUrl: string;

  constructor() {
    this.baseUrl = BACKEND_BASE_URL;
  }

  protected async request<T>(path: string, options: RequestInit, isFormData = false): Promise<T> {
    let headers = options.headers || {};
    if (!isFormData) {
      const storedToken = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
      headers = {
        ...(options.headers as Record<string, string>),
        "Authorization" : `Bearer ${storedToken ?? ""}`,
        "Content-Type": "application/json",
      };
    }

    const res = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers,
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: "Request failed" }));
      const isAuthError =
        (res.status === 401 && error?.type === "NO_AUTH") ||
        (res.status === 400 && error?.type === "NO_AUTH")
      if (isAuthError) {
        DeviceEventEmitter.emit(AUTH_LOGOUT_EVENT);
        throw new Error(error.message || "Your session has expired. Please login again.");
      }
      throw new Error(error.message || "Request failed");
    }

    return res.json() as Promise<T>;
  }
}

export default BaseService;
