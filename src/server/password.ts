import { randomBytes, scrypt as nodeScrypt, timingSafeEqual } from 'node:crypto';
const params = { N: 131072, r: 8, p: 1, maxmem: 256 * 1024 * 1024 };
const derive = (password: string, salt: string) =>
  new Promise<Buffer>((resolve, reject) =>
    nodeScrypt(password, salt, 64, params, (error, key) => (error ? reject(error) : resolve(key))),
  );
export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  return `scrypt:${salt}:${(await derive(password, salt)).toString('hex')}`;
}
export async function verifyPassword(password: string, hash: string) {
  const [algorithm, salt, expected] = hash.split(':');
  if (
    algorithm !== 'scrypt' ||
    !/^[a-f0-9]{32}$/.test(salt ?? '') ||
    !/^[a-f0-9]{128}$/.test(expected ?? '')
  )
    return false;
  return timingSafeEqual(await derive(password, salt), Buffer.from(expected, 'hex'));
}
