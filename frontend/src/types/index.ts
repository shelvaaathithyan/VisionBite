// User types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'staff';
  isApproved: boolean;
}

// Auth context types
export interface AuthContextType {
  user: User | null;
  token: string | null;
  role: 'admin' | 'staff' | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, confirmPassword: string) => Promise<void>;
  logout: () => void;
}

// API Response types
export interface AuthResponse {
  message: string;
  token?: string;
  user?: User;
}

export interface PendingUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  isApproved: boolean;
  createdAt: string;
}

export interface PendingUsersResponse {
  count: number;
  users: PendingUser[];
}
