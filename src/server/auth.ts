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
export async function signIn(login: string, password: string) {
  const hash = process.env.ADMIN_PASSWORD_HASH;
  if (!hash || !process.env.ADMIN_LOGIN) throw new Error('Admin credentials are not configured');
  // One account: a shared, atomic account-level budget. Do not trust spoofable IP headers.
  const window = Math.floor(Date.now() / 900000);
  const bucket = await db().loginWindow.upsert({
    where: { id: `admin:${window}` },
    create: { id: `admin:${window}`, attempts: 1, expiresAt: new Date((window + 1) * 900000) },
    update: { attempts: { increment: 1 } },
  });
  if (bucket.attempts > 10) return 'Слишком много попыток. Попробуйте через 15 минут.';
  const validPassword = await verifyPassword(password, hash);
  if (!validPassword || login !== process.env.ADMIN_LOGIN) return 'Неверный логин или пароль.';
  await db().loginWindow.deleteMany({ where: { expiresAt: { lt: new Date() } } });
  await db().adminSession.deleteMany({ where: { expiresAt: { lt: new Date() } } });
  const jar = await cookies();
  const previous = jar.get(COOKIE)?.value;
  if (previous) await db().adminSession.deleteMany({ where: { tokenHash: digest(previous) } });
  const token = randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 8 * 3600000);
  await db().adminSession.create({ data: { tokenHash: digest(token), expiresAt: expires } });
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.COOKIE_SECURE !== 'false',
    path: '/',
    expires,
  });
  return null;
}
export async function signOut() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token) await db().adminSession.deleteMany({ where: { tokenHash: digest(token) } });
  jar.delete(COOKIE);
}
