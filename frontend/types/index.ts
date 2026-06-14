export type UserRole = 'student' | 'verifier' | 'recruiter' | 'admin';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  bio?: string;
  skills?: string[];
  education?: Education[];
  githubUsername?: string;
  linkedinUrl?: string;
  badges?: Badge[];
  profileCompletion?: number;
  isSuspended?: boolean;
}

export interface Education {
  institution: string;
  degree: string;
  field?: string;
  startYear?: number;
  endYear?: number;
  current?: boolean;
}

export interface Project {
  _id: string;
  title: string;
  description: string;
  githubUrl?: string;
  liveUrl?: string;
  technologies?: string[];
  skills?: string[];
  summary?: string;
  verificationStatus: 'draft' | 'pending' | 'approved' | 'rejected';
  feedback?: string;
  submittedAt?: string;
  student?: User;
}

export interface Certificate {
  _id: string;
  title: string;
  issuer: string;
  issueDate: string;
  fileUrl?: string;
  skills?: string[];
  verificationStatus: 'draft' | 'pending' | 'approved' | 'rejected';
  feedback?: string;
  student?: User;
}

export interface Badge {
  _id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  category?: string;
}

export interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  data?: Record<string, unknown>;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages?: number;
}

export const ROLE_ROUTES: Record<UserRole, string> = {
  student: '/dashboard/student',
  verifier: '/dashboard/verifier',
  recruiter: '/dashboard/recruiter',
  admin: '/dashboard/admin',
};
