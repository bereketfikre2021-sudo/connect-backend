import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service';
import { AuthRequest } from '../types';
import { sendSuccess, sendError } from '../utils/apiResponse';

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.body;
    const result = await authService.loginAdmin(email, password);

    // Store refresh token in httpOnly cookie
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    sendSuccess(res, {
      accessToken: result.accessToken,
      admin: result.admin,
    }, 'Login successful');
  } catch (err) {
    next(err);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // Accept from cookie or body
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
    if (!refreshToken) {
      sendError(res, 'Refresh token required', 401);
      return;
    }
    const result = authService.refreshAccessToken(refreshToken);
    sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
}

export async function logout(_req: Request, res: Response): Promise<void> {
  res.clearCookie('refreshToken');
  sendSuccess(res, null, 'Logged out');
}

export async function getProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const admin = await authService.getAdminProfile(req.admin!.adminId);
    sendSuccess(res, admin);
  } catch (err) {
    next(err);
  }
}

export async function updateProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const admin = await authService.updateAdminProfile(req.admin!.adminId, req.body);
    sendSuccess(res, admin, 'Profile updated');
  } catch (err) {
    next(err);
  }
}
