
import crypto from 'node:crypto';
import { pool, query } from './neon';
import { assertValidImageSet, ImageNotFoundError } from './image-storage';

export { ImageNotFoundError } from './image-storage';

/**
 * Server-only image persistence backed by the same Postgres database the rest
 * of the app uses, so uploads require no third-party credentials.
 *
 * This file is NOT a "use server" module: it is only imported by server code
 * (route handlers and the images server action).
 */

function extensionFor(mime: string): string {
  switch (mime) {
    case 'image/jpeg':
      return 'jpg';
    case 'image/png':
      return 'png';
    case 'image/webp':
      return 'webp';
    case 'image/gif':
      return 'gif';
    default:
      return 'bin';
  }
}

/**
 * Persists a batch of images atomically.
 *
 * All rows are written inside a single transaction so a failure part-way
 * through cannot leave orphaned image rows behind — the client either gets a
 * full list of URLs or nothing at all.
 */
export async function persistImages(files: File[], prefix: string): Promise<string[]> {
  assertValidImageSet(files);

  const prepared = await Promise.all(
    files.map(async (file) => {
      const id = crypto.randomUUID();
      return {
        id,
        storagePath: `${prefix}/${id}.${extensionFor(file.type)}`,
        mimeType: file.type,
        size: file.size,
        buffer: Buffer.from(await file.arrayBuffer()),
      };
    })
  );

  if (prepared.length === 0) return [];

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    // One statement for the whole set keeps this to a single round trip.
    await client.query(
      `INSERT INTO images (id, storage_path, mime_type, size_bytes, data)
       SELECT * FROM UNNEST($1::uuid[], $2::text[], $3::text[], $4::int[], $5::bytea[])`,
      [
        prepared.map((p) => p.id),
        prepared.map((p) => p.storagePath),
        prepared.map((p) => p.mimeType),
        prepared.map((p) => p.size),
        prepared.map((p) => p.buffer),
      ]
    );
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }

  return prepared.map((p) => `/api/images/${p.id}`);
}

/**
 * Permanently removes stored images. Used to roll back an upload when the
 * surrounding listing/request insert fails.
 */
export async function deleteImages(urls: string[]): Promise<void> {
  const ids = urls
    .map((u) => u.match(/\/api\/images\/([0-9a-f-]{36})/i)?.[1])
    .filter((id): id is string => Boolean(id));
  if (ids.length === 0) return;
  await query('DELETE FROM images WHERE id = ANY($1::uuid[])', [ids]);
}

export async function getImage(id: string): Promise<{ data: Buffer; mimeType: string }> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) {
    throw new ImageNotFoundError();
  }

  const rows = await query('SELECT mime_type, data FROM images WHERE id = $1', [id]);
  if (rows.length === 0) {
    throw new ImageNotFoundError();
  }

  return {
    mimeType: rows[0].mime_type as string,
    data: Buffer.from(rows[0].data as Buffer),
  };
}