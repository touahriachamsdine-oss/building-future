import { Pool } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined in environment variables');
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });

/**
 * Executes a SQL query using the connection pool.
 * Useful for single/standalone queries.
 */
export async function query<T = Record<string, unknown>>(text: string, params?: unknown[]): Promise<T[]> {
  const client = await pool.connect();
  try {
    const res = await client.query(text, params);
    return res.rows;
  } finally {
    client.release();
  }
}
