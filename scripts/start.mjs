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

function warnIfMissingEnv(name) {
  if (!process.env[name] || !String(process.env[name]).trim()) {
    console.warn(`[warn] Optional env var not set: ${name}`);
  }
}

function failIfMissingEnv(name) {
  if (!process.env[name] || !String(process.env[name]).trim()) {
    throw new Error(`Missing required env var: ${name}`);
  }
}

function validateProductionEnv() {
  if (process.env.NODE_ENV !== 'production') return;

  // Critical — app cannot function without these
  const required = [
    'DATABASE_URL',
    'APP_URL',
    'AUTH_SECRET',
    'EVOLUTION_BASE_URL',
    'EVOLUTION_API_KEY',
  ];

  for (const envName of required) {
    failIfMissingEnv(envName);
  }

  // Optional — warn but do not block startup
  warnIfMissingEnv('TYPEBOT_BASE_URL');
  warnIfMissingEnv('TYPEBOT_VIEWER_URL');
  warnIfMissingEnv('MAIL_FROM');
  warnIfMissingEnv('SMTP_HOST');
  warnIfMissingEnv('SMTP_PORT');
  warnIfMissingEnv('SMTP_USER');
  warnIfMissingEnv('SMTP_PASSWORD');

  const hasSsoSecret = Boolean(process.env.TYPEBOT_SSO_SECRET || process.env.FLUXOZAP_SSO_SECRET);
  if (!hasSsoSecret) {
    console.warn('[warn] TYPEBOT_SSO_SECRET / FLUXOZAP_SSO_SECRET not set — SSO editor disabled');
  }
}

validateProductionEnv();

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
