import * as SecureStore from "expo-secure-store";

const BASE_URL = "http://192.168.1.47:8000";

export async function login(username: string, password: string) {
  const res = await fetch(`${BASE_URL}/auth/jwt/create/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) throw new Error("Invalid credentials");

  const data = await res.json();

  await SecureStore.setItemAsync("access", data.access);
  await SecureStore.setItemAsync("refresh", data.refresh);

  return data;
}
