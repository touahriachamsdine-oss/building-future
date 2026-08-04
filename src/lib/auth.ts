'use server';

import crypto from 'node:crypto';
import { cookies } from 'next/headers';
import { query } from './neon';
import {
  SESSION_COOKIE_NAME,
  createSessionToken,
  verifySessionToken,
} from './session';
import type { SessionUser } from './session';

const PBKDF2_ITERATIONS = 600_000;
const LEGACY_PBKDF2_ITERATIONS = 1_000;

// Password hashing helper using standard Node PBKDF2 (async, OWASP-recommended iterations)
// Format: "iterations:salt:hash" (new) or "salt:hash" (legacy, 1000 iterations)
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = await new Promise<string>((resolve, reject) => {
    crypto.pbkdf2(password, salt, PBKDF2_ITERATIONS, 64, 'sha512', (err, derivedKey) => {
      if (err) reject(err);
      else resolve(derivedKey.toString('hex'));
    });
  });
  return `${PBKDF2_ITERATIONS}:${salt}:${hash}`;
}

// Password verification helper (backward compatible with legacy 1000-iteration hashes)
async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const parts = storedHash.split(':');
  let iterations = LEGACY_PBKDF2_ITERATIONS;
  let salt: string | undefined;
  let hash: string | undefined;

  if (parts.length === 3) {
    iterations = Number(parts[0]) || LEGACY_PBKDF2_ITERATIONS;
    salt = parts[1];
    hash = parts[2];
  } else if (parts.length === 2) {
    salt = parts[0];
    hash = parts[1];
  }

  if (!salt || !hash) return false;

  const verifyHash = await new Promise<string>((resolve, reject) => {
    crypto.pbkdf2(password, salt, iterations, 64, 'sha512', (err, derivedKey) => {
      if (err) reject(err);
      else resolve(derivedKey.toString('hex'));
    });
  });

  const expectedBuf = Buffer.from(hash, 'utf8');
  const actualBuf = Buffer.from(verifyHash, 'utf8');
  if (expectedBuf.length !== actualBuf.length) return false;
  return crypto.timingSafeEqual(expectedBuf, actualBuf);
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
  if (!sessionCookie) return null;
  return verifySessionToken(sessionCookie.value);
}

export async function requireAdmin(): Promise<SessionUser | null> {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') return null;
  return user;
}

export async function signInAction(email: string, password: string) {
  try {
    // 1. Fetch user from auth.users
    const users = await query('SELECT id, email, password_hash FROM auth.users WHERE email = $1', [email]);
    if (users.length === 0) {
      return { success: false, error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' };
    }
    
    const user = users[0];
    const passwordHash = user.password_hash as string | undefined;
    
    // 2. If password_hash is null or verification fails
    if (!passwordHash || !(await verifyPassword(password, passwordHash))) {
      return { success: false, error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' };
    }
    
    // 3. Fetch role + is_verified from public.profiles
    const profiles = await query('SELECT role, is_verified FROM public.profiles WHERE id = $1', [user.id]);
    const role = profiles.length > 0 ? String(profiles[0].role || 'CLIENT') : 'CLIENT';
    const is_verified = profiles.length > 0 ? Boolean(profiles[0].is_verified) : true;
    
    // 4. Create session
    const expiresAt = Date.now() + 1000 * 60 * 60 * 24 * 7; // 7 days
    const token = createSessionToken({ id: String(user.id), email: String(user.email), role, is_verified }, expiresAt);
    
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });
    
    return { success: true, user: { id: user.id, email: user.email, role } };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'حدث خطأ أثناء تسجيل الدخول';
    console.error('Sign in error:', err);
    return { success: false, error: message };
  }
}

export async function signUpAction(
  fullName: string,
  email: string,
  password: string,
  role: string,
  extra?: {
    phone?: string;
    wilaya?: number;
    baladia?: string;
    provider_type?: string;
    specialty?: string;
    bio?: string;
  }
) {
  try {
    // Check if user already exists
    const existing = await query('SELECT id FROM auth.users WHERE email = $1', [email]);
    if (existing.length > 0) {
      return { success: false, error: 'البريد الإلكتروني مستخدم بالفعل' };
    }
    
    const userId = crypto.randomUUID();
    const pwdHash = await hashPassword(password);

    // Providers need admin approval unless auto_approve is on
    let is_verified = role !== 'PROVIDER';
    if (role === 'PROVIDER') {
      try {
        const { getSiteConfig } = await import('./db');
        const cfg = await getSiteConfig();
        if (cfg.auto_approve_providers) is_verified = true;
      } catch {
        is_verified = false;
      }
    }
    
    // Insert into auth.users and public.profiles inside a transaction
    const { pool } = await import('./neon');
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      await client.query(
        'INSERT INTO auth.users (id, email, password_hash, created_at) VALUES ($1, $2, $3, NOW())',
        [userId, email, pwdHash]
      );
      
      await client.query(
        `INSERT INTO public.profiles (id, full_name, role, phone, wilaya, baladia, provider_type, specialty, bio, is_verified, rating_avg, completed_jobs, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())`,
        [
          userId, fullName, role,
          extra?.phone || null,
          extra?.wilaya || null,
          extra?.baladia || null,
          extra?.provider_type || null,
          extra?.specialty || null,
          extra?.bio || null,
          is_verified, '5.0', 0
        ]
      );
      
      await client.query('COMMIT');
    } catch (txErr) {
      await client.query('ROLLBACK');
      throw txErr;
    } finally {
      client.release();
    }
    
    // Create session
    const expiresAt = Date.now() + 1000 * 60 * 60 * 24 * 7; // 7 days
    const token = createSessionToken({ id: userId, email, role, is_verified }, expiresAt);
    
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });
    
    return { success: true, user: { id: userId, email, role } };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'حدث خطأ أثناء إنشاء الحساب';
    console.error('Sign up error:', err);
    return { success: false, error: message };
  }
}

export async function signOutAction() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  return { success: true };
}

export async function changePasswordAction(currentPassword: string, newPassword: string) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'يجب تسجيل الدخول أولاً' };
    }

    // Fetch user's current password hash
    const users = await query('SELECT password_hash FROM auth.users WHERE id = $1', [user.id]);
    if (users.length === 0) {
      return { success: false, error: 'المستخدم غير موجود' };
    }

    const passwordHash = users[0].password_hash as string | undefined;
    if (!passwordHash || !(await verifyPassword(currentPassword, passwordHash))) {
      return { success: false, error: 'كلمة المرور الحالية غير صحيحة' };
    }

    // Hash the new password and update
    const newHash = await hashPassword(newPassword);
    await query('UPDATE auth.users SET password_hash = $1 WHERE id = $2', [newHash, user.id]);

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'حدث خطأ أثناء تغيير كلمة المرور';
    console.error('Change password error:', err);
    return { success: false, error: message };
  }
}
