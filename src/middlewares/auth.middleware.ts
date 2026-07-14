import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { AuthRequest, JwtPayload } from '../types';
import { sendUnauthorized, sendForbidden } from '../utils/apiResponse';

export function authenticate(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    sendUnauthorized(res, 'Access token required');
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
    req.admin = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      sendUnauthorized(res, 'Access token expired');
    } else {
      sendUnauthorized(res, 'Invalid access token');
    }
  }
}

// Future-ready role middleware
export function requireRole(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.admin) {
      sendUnauthorized(res);
      return;
    }
    if (!roles.includes(req.admin.role)) {
      sendForbidden(res, 'Insufficient permissions');
      return;
    }
    next();
  };
}
