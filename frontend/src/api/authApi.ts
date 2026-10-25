import api from './client';
import { ApiResponse, AuthResponse, User } from '../types';

export const register = async (
  name: string,
  email: string,
  password: string,
  flatNumber: string
): Promise<ApiResponse<AuthResponse>> => {
  const response = await api.post<ApiResponse<AuthResponse>>('/auth/register', {
    name,
    email,
    password,
    flatNumber,
  });
  return response.data;
};

export const login = async (
  email: string,
  password: string
): Promise<ApiResponse<AuthResponse>> => {
  const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', {
    email,
    password,
  });
  return response.data;
};

export const getMe = async (): Promise<ApiResponse<User>> => {
  const response = await api.get<ApiResponse<User>>('/auth/me');
  return response.data;
};

export default {
  register,
  login,
  getMe,
};
