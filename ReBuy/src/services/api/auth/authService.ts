import apiClient from "../../client";

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatar_url?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: AuthUser;
}

export const register = async (
  data: RegisterRequest
): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>(
    "/auth/register",
    data
  );

  return response.data;
};

export const login = async (
  data: LoginRequest
): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>("/auth/login", data);

  if (__DEV__) {
    console.log("Login response:", response.status, response.data);
  }

  return response.data;
};

// Requires a signed-in session: the bearer token is attached by apiClient.
export const logout = async (): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>("/auth/logout");

  if (__DEV__) {
    console.log("Logout response:", response.status, response.data);
  }

  return response.data;
};
