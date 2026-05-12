import { spawnSync } from 'node:child_process';

function run(command, args) {
  const result = spawnSync(command, args, {
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

run('npx', ['prisma', 'migrate', 'deploy']);

if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
  run('npm', ['run', 'admin:create']);
}

run('npx', [
  'next',
  'start',
  '--hostname',
  '0.0.0.0',
  '--port',
  process.env.PORT || '3000',
]);
