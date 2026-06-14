export type Role = 'student' | 'verifier' | 'recruiter' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  isEmailVerified: boolean;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface Education {
  _id?: string;
  institution: string;
  degree: string;
  fieldOfStudy?: string;
  startYear: number;
  endYear: number;
}

export interface Skill {
  _id?: string;
  name: string;
  proficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

export interface Profile {
  _id: string;
  user: User | string;
  headline: string;
  bio: string;
  avatarUrl: string;
  education: Education[];
  skills: Skill[];
  profileCompletionPercentage: number;
}

export interface ProjectFile {
  url: string;
  publicId: string;
  originalName?: string;
  mimeType?: string;
}

export interface Project {
  _id: string;
  user: string;
  title: string;
  description: string;
  techStack: string[];
  githubUrl: string;
  files: ProjectFile[];
  createdAt: string;
}

export interface Certificate {
  _id: string;
  user: string;
  title: string;
  issuingOrganization: string;
  issueDate: string;
  expiryDate?: string;
  file: ProjectFile;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: { field: string; message: string }[];
}

export interface PaginatedProjects {
  projects: Project[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
