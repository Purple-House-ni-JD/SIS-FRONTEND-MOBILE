import React, { createContext, useContext, useState } from "react";
import { router } from "expo-router";
import {
  login as apiLogin,
  logout as apiLogout,
  getCurrentUser,
  User,
} from "../services/api";

const AuthContext = createContext<any>(null);

export function AuthProvider({ children }: any) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function login(username: string, password: string) {
    setLoading(true);
    setError(null);
    try {
      // Call real backend login
      await apiLogin(username, password);

      // Fetch actual user data from backend
      const userData = await getCurrentUser();
      setUser(userData);

      // Navigate to dashboard
      router.replace("/dashboard");
    } catch (err: any) {
      setError(err.message || "Login failed");
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    try {
      await apiLogout();
      setUser(null);
      router.replace("/");
    } catch (err) {
      console.error("Logout error:", err);
    }
  }

  async function refreshUser() {
    try {
      const userData = await getCurrentUser();
      setUser(userData);
    } catch (err) {
      console.error("Refresh user error:", err);
    }
  }

  return (
    <AuthContext.Provider
      value={{ user, login, logout, refreshUser, loading, error }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
