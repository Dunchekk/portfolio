import { readFile, writeFile } from 'node:fs/promises';
import { randomBytes } from 'node:crypto';
import { hashPassword } from '../src/server/password';
const path = '.env';
let existing = await readFile(path, 'utf8').catch(() => '');
if (/^ADMIN_PASSWORD_HASH="?scrypt:/m.test(existing))
  throw new Error('Credentials already exist. Remove ADMIN_PASSWORD_HASH explicitly to rotate.');
if (!existing) existing = await readFile('.env.example', 'utf8');
const password = randomBytes(18).toString('base64url');
existing = existing.replace(
  /^ADMIN_PASSWORD_HASH=.*$/m,
  `ADMIN_PASSWORD_HASH="${await hashPassword(password)}"`,
);
await writeFile(path, existing, { mode: 0o600 });
console.log(
  `Admin login: ${existing.match(/^ADMIN_LOGIN="?([^"\n]+)/m)?.[1]}\nPassword: ${password}\nSave it in your password manager. The plaintext is not stored.`,
);
