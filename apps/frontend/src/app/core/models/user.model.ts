export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isAdmin: boolean;
  isActive: boolean;
  createdAt?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}
