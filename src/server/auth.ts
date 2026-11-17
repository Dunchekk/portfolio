import 'server-only';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createHash, randomBytes } from 'node:crypto';
import { db } from './db';
import { verifyPassword } from './password';
const COOKIE = 'portfolio_session';
const digest = (token: string) => createHash('sha256').update(token).digest('hex');
export async function isAdmin() {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return false;
  const session = await db().adminSession.findUnique({ where: { tokenHash: digest(token) } });
  return Boolean(session && session.expiresAt > new Date());
}
export async function requireAdmin() {
  if (!(await isAdmin())) redirect('/admin/login');
}
