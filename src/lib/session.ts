import crypto from 'node:crypto';

export const SESSION_COOKIE_NAME = 'binaa_session';

export interface SessionUser {
  id: string;
  email: string;
  role: string;
  is_verified?: boolean;
}

function getSecret(): string {
  const secret = process.env.COOKIE_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('COOKIE_SECRET environment variable is not set');
    }
    return 'dev-only-insecure-session-secret-do-not-use-in-production';
  }
  return secret;
}

export function signPayload(payload: string): string {
  return crypto.createHmac('sha256', getSecret()).update(payload).digest('hex');
}

export function createSessionToken(user: SessionUser, expiresAt: number): string {
  const payload = JSON.stringify({ ...user, expiresAt });
  return `${payload}.${signPayload(payload)}`;
}

export function verifySessionToken(token: string): SessionUser | null {
  try {
    const parts = token.split('.');
    const signature = parts.pop();
    const payload = parts.join('.');
    const expected = signPayload(payload);

    const sigBuf = Buffer.from(signature ?? '', 'utf8');
    const expBuf = Buffer.from(expected, 'utf8');
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return null;
    }

    const data = JSON.parse(payload);
    if (Date.now() > data.expiresAt) {
      return null;
    }

    return {
      id: String(data.id),
      email: String(data.email),
      role: String(data.role),
      is_verified: data.is_verified === undefined ? undefined : Boolean(data.is_verified),
    };
  } catch {
    return null;
  }
}
