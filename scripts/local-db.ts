import EmbeddedPostgres from 'embedded-postgres';
import { access } from 'node:fs/promises';
const database = new EmbeddedPostgres({
  databaseDir: '.data/postgres',
  user: 'portfolio',
  password: 'portfolio',
  port: 5434,
  persistent: true,
  authMethod: 'scram-sha-256',
  autoRehydrateSymlinks: true,
  postgresFlags: ['-h', '127.0.0.1'],
  onLog: () => {},
  onError: console.error,
});
const exists = await access('.data/postgres/PG_VERSION').then(
  () => true,
  () => false,
);
if (!exists) await database.initialise();
await database.start();
if (!exists) await database.createDatabase('portfolio');
console.log(
  'Local PostgreSQL ready on 127.0.0.1:5434. Ctrl-C to stop; data persists in .data/postgres.',
);
for (const signal of ['SIGINT', 'SIGTERM'] as const)
  process.once(signal, async () => {
    await database.stop();
    process.exit(0);
  });
setInterval(() => {}, 60000);
