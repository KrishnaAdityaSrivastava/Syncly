import { config } from 'dotenv';

const nodeEnv = process.env.NODE_ENV || 'development';
const envFiles = [
  `.env.${nodeEnv}.local`,
  `.env.local`,
  `.env.${nodeEnv}`,
  '.env',
];

for (const path of envFiles) {
  config({ path, override: false, quiet: true });
}

const parseCsv = (value) =>
  value
    ? value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
    : [];

const normalizeOrigin = (value) => value?.replace(/\/$/, '');

const rawClientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
const clientUrl = normalizeOrigin(rawClientUrl);
const additionalCorsOrigins = parseCsv(process.env.CORS_ORIGINS).map(normalizeOrigin);
const corsOrigins = Array.from(
  new Set([
    clientUrl,
    'http://localhost:5173',
    'http://localhost:5500',
    ...additionalCorsOrigins,
  ].filter(Boolean))
);

const isProduction = nodeEnv === 'production';
const cookieSameSite = isProduction && process.env.COOKIE_SAME_SITE !== 'strict' ? 'none' : 'strict';
const cookieSecure = cookieSameSite === 'none' ? true : isProduction;

export const env = {
  PORT: process.env.PORT || 5500,
  NODE_ENV: nodeEnv,
  DB_URI: process.env.DB_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRE: process.env.JWT_EXPIRE || '7d',
  ARCJET_KEY: process.env.ARCJET_KEY,
  ARCJET_ENV: process.env.ARCJET_ENV,
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
  INVITE_SECRET: process.env.INVITE_SECRET,
  CLIENT_URL: clientUrl,
  CORS_ORIGINS: corsOrigins,
  COOKIE_SAME_SITE: cookieSameSite,
  COOKIE_SECURE: cookieSecure,
};

export const {
  PORT,
  NODE_ENV,
  DB_URI,
  JWT_SECRET,
  JWT_EXPIRE,
  ARCJET_KEY,
  ARCJET_ENV,
  EMAIL_PASSWORD,
  INVITE_SECRET,
  CLIENT_URL,
  CORS_ORIGINS,
  COOKIE_SAME_SITE,
  COOKIE_SECURE,
} = env;
