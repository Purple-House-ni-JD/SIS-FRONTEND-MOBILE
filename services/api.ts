import * as SecureStore from "expo-secure-store";

const BASE_URL = "http://192.168.1.6:8000";

// ============================================================================
// TOKEN MANAGEMENT
// ============================================================================

export async function setAccessToken(token: string) {
  await SecureStore.setItemAsync("access_token", token);
}

export async function getAccessToken() {
  return await SecureStore.getItemAsync("access_token");
}

export async function setRefreshToken(token: string) {
  await SecureStore.setItemAsync("refresh_token", token);
}

export async function getRefreshToken() {
  return await SecureStore.getItemAsync("refresh_token");
}

export async function clearTokens() {
  await SecureStore.deleteItemAsync("access_token");
  await SecureStore.deleteItemAsync("refresh_token");
}

// ============================================================================
// API REQUEST HELPER
// ============================================================================

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;

  const accessToken = await getAccessToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (options.headers) {
    Object.assign(headers, options.headers as Record<string, string>);
  }

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Handle 401 - but NOT for refresh endpoint to prevent infinite loop
  if (
    response.status === 401 &&
    !endpoint.includes("jwt/refresh") &&
    !endpoint.includes("jwt/create")
  ) {
    const refreshToken = await getRefreshToken();
    if (refreshToken) {
      const refreshed = await refreshAccessToken(refreshToken);
      if (refreshed) {
        return apiRequest(endpoint, options);
      }
    }
    await clearTokens();
    throw new Error("Session expired. Please log in again.");
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || `API Error: ${response.status}`);
  }

  return response.json();
}

// ============================================================================
// AUTH ENDPOINTS
// ============================================================================

export async function login(email: string, password: string) {
  const data = await apiRequest<{
    access: string;
    refresh: string;
  }>("/auth/jwt/create/", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  await setAccessToken(data.access);
  await setRefreshToken(data.refresh);

  return data;
}

async function refreshAccessToken(refreshToken: string) {
  try {
    const response = await fetch(`${BASE_URL}/auth/jwt/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (!response.ok) {
      await clearTokens();
      return false;
    }

    const data = await response.json();
    await setAccessToken(data.access);
    return true;
  } catch (error) {
    console.error("Token refresh failed:", error);
    await clearTokens();
    return false;
  }
}

export async function logout() {
  await clearTokens();
}

// ============================================================================
// USER ENDPOINTS
// ============================================================================

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: "student" | "instructor" | "admin";
  is_verified: boolean;
  student_profile?: {
    student_id: string;
    program: string;
    year_level: number;
  };
  instructor_profile?: {
    employee_id: string;
    department: string;
  };
}

export async function getCurrentUser(): Promise<User> {
  return apiRequest<User>("/auth/users/me/");
}

export async function updateCurrentUser(data: {
  first_name?: string;
  last_name?: string;
  email?: string;
}): Promise<User> {
  const user = await getCurrentUser();
  return apiRequest<User>(`/api/users/${user.id}/`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

// ============================================================================
// ENROLLMENT ENDPOINTS
// ============================================================================

export interface Enrollment {
  id: number;
  student: number;
  student_name: string;
  course: number;
  course_title: string;
  enrolled_at: string;
}

export async function getMyEnrollments(): Promise<Enrollment[]> {
  return apiRequest<Enrollment[]>("/api/enrollments/");
}

// ============================================================================
// ANNOUNCEMENT ENDPOINTS
// ============================================================================

export interface Announcement {
  id: number;
  title: string;
  content: string;
  created_by: number;
  created_by_name: string;
  created_at: string;
}

export async function getAnnouncements(): Promise<Announcement[]> {
  return apiRequest<Announcement[]>("/api/announcements/");
}

export async function createAnnouncement(data: {
  title: string;
  content: string;
}): Promise<Announcement> {
  return apiRequest<Announcement>("/api/announcements/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ============================================================================
// GRADE ENDPOINTS
// ============================================================================

export interface Grade {
  id: number;
  enrollment: number;
  student_name: string;
  course_title: string;
  score: number;
  remarks: string;
  updated_at: string;
}

export async function getGrades(): Promise<Grade[]> {
  return apiRequest<Grade[]>("/api/grades/");
}

export async function updateGrade(
  gradeId: number,
  data: { score: number; remarks: string },
): Promise<Grade> {
  return apiRequest<Grade>(`/api/grades/${gradeId}/`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

// ============================================================================
// COURSE ENDPOINTS
// ============================================================================

export interface Course {
  id: number;
  code: string;
  title: string;
  description: string;
  instructor_id: number;
  created_at: string;
}

export async function getCourses(): Promise<Course[]> {
  return apiRequest<Course[]>("/api/courses/");
}
