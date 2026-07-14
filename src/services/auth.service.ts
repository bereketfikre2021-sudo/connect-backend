import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../database/prisma';
import { config } from '../config/env';
import { JwtPayload } from '../types';

export async function loginAdmin(
  email: string,
  password: string
): Promise<{ accessToken: string; refreshToken: string; admin: { id: string; email: string; name: string; role: string } }> {
  const admin = await prisma.admin.findUnique({ where: { email } });
  if (!admin) throw Object.assign(new Error('Invalid credentials'), { statusCode: 401 });

  const valid = await bcrypt.compare(password, admin.passwordHash);
  if (!valid) throw Object.assign(new Error('Invalid credentials'), { statusCode: 401 });

  const payload: JwtPayload = { adminId: admin.id, email: admin.email, role: admin.role };

  const accessToken = jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn as any,
  });
  const refreshToken = jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn as any,
  });

  return {
    accessToken,
    refreshToken,
    admin: { id: admin.id, email: admin.email, name: admin.name, role: admin.role },
  };
}

export function refreshAccessToken(
  refreshToken: string
): { accessToken: string } {
  try {
    const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret) as JwtPayload;
    const payload: JwtPayload = {
      adminId: decoded.adminId,
      email: decoded.email,
      role: decoded.role,
    };
    const accessToken = jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn as any,
    });
    return { accessToken };
  } catch {
    throw Object.assign(new Error('Invalid or expired refresh token'), { statusCode: 401 });
  }
}

export async function getAdminProfile(adminId: string) {
  const admin = await prisma.admin.findUnique({
    where: { id: adminId },
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  });
  if (!admin) throw Object.assign(new Error('Admin not found'), { statusCode: 404 });
  return admin;
}

export async function updateAdminProfile(
  adminId: string,
  data: { name?: string; email?: string; password?: string }
) {
  const update: any = {};
  if (data.name) update.name = data.name;
  if (data.email) update.email = data.email;
  if (data.password) update.passwordHash = await bcrypt.hash(data.password, 12);

  return prisma.admin.update({
    where: { id: adminId },
    data: update,
    select: { id: true, email: true, name: true, role: true, updatedAt: true },
  });
}
