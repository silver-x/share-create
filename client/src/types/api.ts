// 用户相关类型
export interface User {
  id: number;
  username: string;
  email: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RegisterDto extends LoginDto {
  confirmPassword: string;
}

export interface LoginDto {
  username: string;
  password: string;
}

// 分享相关类型
export interface Share {
  id: string;
  title: string;
  content: string;
  user: User;
  likes: number;
  comments: number;
  coverImage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateShareDto {
  title: string;
  content: string;
  tags?: string;
}

export interface UpdateShareDto {
  title?: string;
  content?: string;
}

// 评论相关类型
export interface Comment {
  id: string;
  content: string;
  author: User;
  shareId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCommentDto {
  content: string;
}

// 点赞相关类型
export interface Like {
  id: string;
  userId: string;
  shareId: string;
  createdAt: string;
}

// 通知相关类型
export interface Notification {
  id: string;
  type: 'like' | 'comment' | 'system';
  content: string;
  isRead: boolean;
  createdAt: string;
}

// API响应类型
export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export interface SuiLoginDto {
  address: string;
  message: string;
  signature: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
} 