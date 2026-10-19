'use server';

import { persistImages, deleteImages } from '@/lib/image-storage.server';
import { ImageValidationError } from '@/lib/image-storage';

export type ImageUploadResult =
  | { ok: true; urls: string[] }
  | { ok: false; error: string };

/**
 * Server action used by "use client" upload forms.
 *
 * A "use server" file may only export async functions, so the implementation,
 * the constants and the error classes all stay in their own modules.
 *
 * Errors are returned rather than thrown: Next masks exceptions crossing the
 * server-action boundary in production, which would strip the validation
 * message the user needs to see.
 */
export async function saveImages(files: File[], prefix: string): Promise<ImageUploadResult> {
  try {
    return { ok: true, urls: await persistImages(files, prefix) };
  } catch (err) {
    if (err instanceof ImageValidationError) {
      return { ok: false, error: err.message };
    }
    console.error('[images] upload failed', err);
    return { ok: false, error: 'تعذّر رفع الصور. حاول مجدداً.' };
  }
}

/**
 * Rolls back an upload whose parent listing/request insert failed, so failed
 * submissions do not leak stored bytes.
 */
export async function rollbackImages(urls: string[]): Promise<void> {
  await deleteImages(urls);
}