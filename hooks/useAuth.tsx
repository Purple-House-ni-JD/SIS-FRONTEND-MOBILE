import React, { createContext, useContext, useState } from 'react';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { login as apiLogin } from '../services/api';

const AuthContext = createContext<any>(null);

export function AuthProvider({ children }: any) {
  const [user, setUser] = useState(null);

  async function login(username: string, password: string) {
    await apiLogin(username, password);
    setUser({ username });
    router.replace('/profile');
  }

  async function logout() {
    await SecureStore.deleteItemAsync('access');
    await SecureStore.deleteItemAsync('refresh');
    setUser(null);
    router.replace('/');
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}