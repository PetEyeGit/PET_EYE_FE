export interface ApiResponse<T> {
  code: number;
  message?: string;
  result?: T;
}

export interface AuthenticationResponse {
  authenticated: boolean;
  token: string;
}

export interface RoleResponse {
  id: number;
  name: string;
  description: string;
}

export interface UserResponse {
  id: number;
  email: string;
  fullName: string;
  phone: string;
  address: string;
  avatar: string;
  roles: RoleResponse[];
}
