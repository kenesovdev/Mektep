export type UserRole = 'ADMIN' | 'MANAGER' | 'TEACHER';

export interface School {
  id: number;
  name: string;
  city: string;
}

export interface AuthUser {
  id: number;
  email: string;
  role: UserRole;
  school: School | null;
  is_active: boolean;
  is_staff: boolean;
}

export interface AuthContextValue {
  user: AuthUser | null;
  role: UserRole | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  logout: () => void;
}
