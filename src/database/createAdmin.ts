/**
 * Creates the single admin account.
 * Run: npm run db:create-admin
 *
 * Set these env vars before running:
 *   ADMIN_EMAIL=your@email.com
 *   ADMIN_PASSWORD=yourStrongPassword
 *   ADMIN_NAME="Your Name"
 */

import bcrypt from 'bcryptjs';
import prisma from './prisma';
import { config } from '../config/env';

config;

async function createAdmin() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME || 'Admin';

  if (!email || !password) {
    console.error('❌  Set ADMIN_EMAIL and ADMIN_PASSWORD env vars before running this script.');
    process.exit(1);
  }

  const existing = await prisma.admin.findUnique({ where: { email } });
  if (existing) {
    console.log('⚠️  Admin with that email already exists.');
    await prisma.$disconnect();
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const admin = await prisma.admin.create({
    data: { email, passwordHash, name, role: 'admin' },
  });

  console.log(`✅  Admin created: ${admin.email} (id: ${admin.id})`);
  await prisma.$disconnect();
}

createAdmin().catch((e) => {
  console.error(e);
  process.exit(1);
});
