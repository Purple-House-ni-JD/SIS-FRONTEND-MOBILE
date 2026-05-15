export interface User {
  id: number | string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  is_verified: boolean;
  student_profile?: {
    student_id: string;
    program: string;
    year_level: number;
  };
}

export interface Enrollment {
  id: number | string;
  course: {
    code: string;
    title: string;
    instructor_name: string;
  };
  grade: {
    score: number;
    remarks: string;
    updated_at: string;
  } | null;
  enrolled_at: string;
}
