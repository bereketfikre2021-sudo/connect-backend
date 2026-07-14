import { Request } from 'express';

// ─────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────
export interface JwtPayload {
  adminId: string;
  email: string;
  role: string;
}

export interface AuthRequest extends Request {
  admin?: JwtPayload;
}

// ─────────────────────────────────────────────
// API RESPONSE
// ─────────────────────────────────────────────
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  errors?: any[];
}

export interface PaginatedResponse<T = any> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ─────────────────────────────────────────────
// QUERY PARAMS
// ─────────────────────────────────────────────
export interface QueryParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  published?: boolean;
  featured?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ─────────────────────────────────────────────
// FILE UPLOAD
// ─────────────────────────────────────────────
export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
}

export interface UploadedFile {
  url: string;
  publicId: string;
}
