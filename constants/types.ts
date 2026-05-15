export interface StudentProfile {
  student_id: string;
  program: string;
  year_level: number;
}

export interface InstructorProfile {
  employee_id: string;
  department: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: "student" | "instructor" | "admin";
  is_verified: boolean;
  student_profile?: StudentProfile;
  instructor_profile?: InstructorProfile;
}

export interface Course {
  id: number;
  code: string;
  title: string;
  description: string;
  instructor_id: number;
  created_at: string;
}

export interface Enrollment {
  id: number;
  student: number;
  student_name: string;
  course: number;
  course_title: string;
  enrolled_at: string;
}

export interface Grade {
  id: number;
  enrollment: number;
  student_name: string;
  course_title: string;
  score: number;
  remarks: string;
  updated_at: string;
}

export interface Announcement {
  id: number;
  title: string;
  content: string;
  created_by: number;
  created_by_name: string;
  created_at: string;
}
