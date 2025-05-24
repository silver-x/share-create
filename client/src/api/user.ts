import axios from 'axios';
import { LoginDto, RegisterDto, User, SuiLoginDto, ApiResponse, AuthResponse } from '@/types/api';

export const userApi = {
  register: (data: RegisterDto) => {
    return axios.post<ApiResponse<AuthResponse>>('/api/auth/register', data);
  },

  login: (data: LoginDto) => {
    return axios.post<ApiResponse<AuthResponse>>('/api/auth/login', data);
  },

  suiLogin: (data: SuiLoginDto) => {
    return axios.post<ApiResponse<AuthResponse>>('/api/auth/sui-login', data);
  },

  getProfile: () => {
    return axios.get<ApiResponse<User>>('/api/user/profile');
  },

  updateProfile: (data: Partial<User>) => {
    return axios.put<ApiResponse<User>>('/api/user/profile', data);
  },
}; 