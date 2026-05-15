// GUYS PLEASE NOTE NGA MALI NI AND ILISANAN PANIG ACTUAL DATA

import React, { createContext, useContext, useState } from "react";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { login as apiLogin } from "../services/api";

const AuthContext = createContext<any>(null);

export function AuthProvider({ children }: any) {
  const [user, setUser] = useState<any>(null);

  async function login(username: string, password: string) {
    await apiLogin(username, password);

    // Inject the full mock user so ProfileScreen has everything it needs to render
    setUser({
      username: username,
      role: "student",
      first_name: "Justine Jude",
      last_name: "Bardinas",
      email: "justine@ustp.edu.ph",
      is_verified: true,
      student_profile: {
        student_id: "2024-0001",
        program: "BS Information Technology",
        year_level: 3,
      },
    });

    // Sending you to Dashboard as requested
    router.replace("/dashboard");
  }

  async function logout() {
    await SecureStore.deleteItemAsync("access");
    await SecureStore.deleteItemAsync("refresh");
    setUser(null);
    router.replace("/");
  }

  // Adding the missing refresh function expected by ProfileScreen
  async function refreshUser() {
    // Fake a 1-second network delay for the pull-to-refresh spinner
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
