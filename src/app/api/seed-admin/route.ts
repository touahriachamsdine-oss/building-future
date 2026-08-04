import { NextResponse, type NextRequest } from 'next/server';
import { pool } from '@/lib/neon';
import { hashPassword } from '@/lib/auth';
import { isSetupRequestAllowed } from '@/lib/setup-auth';
import crypto from 'crypto';

export async function GET(req: NextRequest) {
  if (!isSetupRequestAllowed(req)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  try {
    const client = await pool.connect();
    try {
      const existing = await client.query('SELECT id FROM auth.users WHERE email = $1', ['admin@binamostaqbal.dz']);
      if (existing.rows.length > 0) {
        return NextResponse.json({ message: 'Admin account already exists', id: existing.rows[0].id });
      }

      const id = crypto.randomUUID();
      const password = process.env.ADMIN_INITIAL_PASSWORD || 'admin123';
      const passwordHash = await hashPassword(password);
      const now = new Date().toISOString();

      await client.query('BEGIN');
      await client.query(
        'INSERT INTO auth.users (id, email, password_hash, created_at) VALUES ($1, $2, $3, $4)',
        [id, 'admin@binamostaqbal.dz', passwordHash, now]
      );
      await client.query(
        `INSERT INTO profiles (id, role, full_name, is_verified, rating_avg, completed_jobs, created_at, updated_at)
         VALUES ($1, 'ADMIN', 'مشرف المنصة', true, 5.0, 0, $2, $2)`,
        [id, now]
      );
      await client.query('COMMIT');

      return NextResponse.json({ message: 'Admin account created', id, email: 'admin@binamostaqbal.dz' });
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
