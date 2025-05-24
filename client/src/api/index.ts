import axios from 'axios';
import {
  User,
  RegisterDto,
  LoginDto,
  Share,
  CreateShareDto,
  UpdateShareDto,
  Comment,
  CreateCommentDto,
  Like,
  Notification,
  ApiResponse,
  PaginatedResponse,
  AuthResponse,
  SuiLoginDto,
} from '../types/api';

const API_BASE_URL = 'http://localhost:3001/api';

// 创建axios实例
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器：添加token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  console.log("api interceptor token => ", token);
  if (token) {
    config.headers = {
      ...config.headers,
      'Authorization': `Bearer ${token}`
    };
    console.log("api interceptor headers => ", config.headers);
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// 响应拦截器：处理token过期
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // token过期或无效，清除token并重定向到登录页
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// 用户相关接口
export const userApi = {
  // 用户注册
  register: (data: RegisterDto) =>
    api.post<ApiResponse<AuthResponse>>('/users/register', data),
  
  // 用户登录
  login: (data: LoginDto) =>
    api.post<ApiResponse<AuthResponse>>('/auth/login', data),
  
  // SUI钱包登录
  suiLogin: (data: SuiLoginDto) =>
    api.post<ApiResponse<AuthResponse>>('/auth/sui-login', data),
  
  // 获取用户资料
  getProfile: () => api.get<User>('/users/profile'),
  
  // 更新用户资料
  updateProfile: (data: Partial<User>) => 
    api.post<ApiResponse<User>>('/users/profile', data),
};

// 分享相关接口
export const shareApi = {
  // 获取分享列表
  getList: (params?: { page?: number; limit?: number; search?: string; sort?: string; category?: string }) => 
    api.get<Share[]>('/shares', { params }),
  
  // 获取单个分享
  getById: (id: string) => 
    api.get<Share>(`/shares/${id}`),
  
  // 创建分享
  create: (data: CreateShareDto) => 
    api.post<ApiResponse<Share>>('/shares', data),
  
  // 更新分享
  update: (id: string, data: UpdateShareDto) => 
    api.put<ApiResponse<Share>>(`/shares/${id}`, data),
  
  // 删除分享
  delete: (id: string) => 
    api.delete<ApiResponse<void>>(`/shares/${id}`),
  
  // 点赞分享
  like: (id: string) => 
    api.post<ApiResponse<Like>>(`/shares/${id}/like`),
  
  // 取消点赞
  unlike: (id: string) => 
    api.delete<ApiResponse<void>>(`/shares/${id}/like`),
};

// 评论相关接口
export const commentApi = {
  // 获取分享的评论
  getByShareId: (shareId: string) => 
    api.get<Comment[]>(`/comments/share/${shareId}`),
  
  // 添加评论
  create: (shareId: string, data: CreateCommentDto) =>
    api.post<ApiResponse<Comment>>(`/comments/share/${shareId}`, data),
  
  // 删除评论
  delete: (shareId: string, commentId: string) => 
    api.delete<ApiResponse<void>>(`/shares/${shareId}/comments/${commentId}`),
};

// 点赞相关接口
export const likeApi = {
  // 检查是否已点赞
  check: (shareId: string) => 
    api.post<ApiResponse<{ liked: boolean }>>(`/likes/share/${shareId}/check`),
};

// 通知相关接口
export const notificationApi = {
  // 获取通知列表
  getList: (params?: { page?: number; limit?: number; type?: string }) => 
    api.get<Notification[]>('/notifications', { params }),
  
  // 标记通知为已读
  markAsRead: (id: string) => 
    api.post<ApiResponse<void>>(`/notifications/${id}/read`),
  
  // 标记所有通知为已读
  markAllAsRead: () => 
    api.post<ApiResponse<void>>('/notifications/read-all'),
};

export default api; 