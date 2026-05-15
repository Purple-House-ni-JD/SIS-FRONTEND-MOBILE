// GUYS PLEASE NOTE NGA MALI NI AND ILISANAN PANIG ACTUAL DATA

import * as SecureStore from "expo-secure-store";

export async function login(username: string, password: string) {
  // This fake a 1.5 second loading time so you can see your spinner
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const data = {
    access: "fake_access_token_123",
    refresh: "fake_refresh_token_456",
  };

  await SecureStore.setItemAsync("access", data.access);
  await SecureStore.setItemAsync("refresh", data.refresh);

  return data;
}

// --- Add this below your existing login function ---

// 1. Mock Fetch Enrollments
export async function getMyEnrollments() {
  // Fake a 1-second network delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Return some fake courses to show off your UI
  return [
    {
      id: 1,
      course: {
        code: "CS 101",
        title: "Introduction to Computing",
        instructor_name: "Prof. Alan Turing",
      },
      grade: {
        score: 95.5,
        remarks: "Excellent",
        updated_at: new Date().toISOString(),
      },
      enrolled_at: "2024-01-15T08:00:00Z",
    },
    {
      id: 2,
      course: {
        code: "MATH 201",
        title: "Calculus I",
        instructor_name: "Dr. Katherine Johnson",
      },
      grade: {
        score: 82.0,
        remarks: "Good",
        updated_at: new Date().toISOString(),
      },
      enrolled_at: "2024-01-16T10:30:00Z",
    },
    {
      id: 3,
      course: {
        code: "ENG 102",
        title: "Technical Writing",
        instructor_name: "Prof. William Strunk",
      },
      // No grade yet to test the empty state
      grade: null,
      enrolled_at: "2024-01-18T14:00:00Z",
    },
  ];
}

// 2. Mock Update User Profile
export async function updateCurrentUser(data: {
  first_name: string;
  last_name: string;
  email: string;
}) {
  // Fake a 1.5-second network delay for the save button spinner
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // Return a mock updated user
  return {
    id: 1,
    username: "justine.jude",
    role: "student",
    is_verified: true,
    first_name: data.first_name,
    last_name: data.last_name,
    email: data.email,
    student_profile: {
      student_id: "2021-0001",
      program: "BS Information Technology",
      year_level: 3,
    },
  };
}
