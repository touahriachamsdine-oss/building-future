import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { query } from '@/lib/neon';
import { createSessionToken, verifySessionToken } from '@/lib/session';

const SESSION_COOKIE_NAME = 'binaa_session';

export async function GET() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

  if (!sessionCookie) {
    return NextResponse.json({ approved: false });
  }

  const user = await verifySessionToken(sessionCookie.value);
  if (!user || user.role !== 'PROVIDER') {
    return NextResponse.json({ approved: true });
  }

  // Check DB for current is_verified status
  const rows = await query(
    'SELECT is_verified FROM public.profiles WHERE id = $1',
    [user.id]
  );

  const is_verified = rows.length > 0 ? Boolean(rows[0].is_verified) : false;

  if (is_verified) {
    // Refresh the session cookie with updated is_verified
    const expiresAt = Date.now() + 1000 * 60 * 60 * 24 * 7;
    const token = await createSessionToken({ ...user, is_verified: true }, expiresAt);
    cookieStore.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });
    return NextResponse.json({ approved: true });
  }

  return NextResponse.json({ approved: false });
}
