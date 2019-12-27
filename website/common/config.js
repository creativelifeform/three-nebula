// Some nextjs strangeness here, we cannot declare
// const ENV = process.env, it throws

const NODE_ENV = process.env.NODE_ENV;

export const __DEV__ = NODE_ENV === 'development';
export const __PROD__ = NODE_ENV === 'production';
export const __TEST__ = NODE_ENV === 'test';
export const API_URL = process.env.API_URL || 'http://example.com';
export const TEST_EMAIL = process.env.TEST_EMAIL || 'hello@example.com';
export const UA_ID = process.env.UA_ID || '';
export const SENTRY_DSN = process.env.SENTRY_DSN || '';
