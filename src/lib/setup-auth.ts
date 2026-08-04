import type { NextRequest } from 'next/server';

/**
 * Gates one-time setup routes (seed admin, DB migration) behind a
 * deployer-provided token. In production a token is required; without a
 * configured token the routes only work in non-production environments.
 */
export function isSetupRequestAllowed(req: NextRequest): boolean {
  const token = process.env.ADMIN_SETUP_TOKEN;

  if (process.env.NODE_ENV === 'production' && !token) return false;
  if (token && req.headers.get('x-admin-setup-token') !== token) return false;

  return true;
}
