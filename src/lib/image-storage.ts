/**
 * Client-safe image validation.
 *
 * This module is imported by "use client" components, so it must never touch
 * node:crypto, Buffer, or the database. The actual persistence lives in
 * ./image-storage.server.ts and is only reachable through the server action in
 * src/app/actions/images.ts.
 */

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB
export const MAX_IMAGES_PER_REQUEST = 5;

/**
 * Combined budget for one upload request. Server actions reject the whole body
 * (4 MB configured, 4.5 MB on Vercel) before any of it reaches this code, so an
 * oversized batch has to be caught client-side first.
 */
export const MAX_UPLOAD_BYTES = 3.5 * 1024 * 1024; // 3.5 MB

const COMPRESS_MAX_EDGE = 1600;
const COMPRESS_QUALITY = 0.82;
const COMPRESS_THRESHOLD = 400 * 1024; // leave already-small files untouched

const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

export const ALLOWED_IMAGE_TYPES = Array.from(ALLOWED_MIME);

export class ImageValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ImageValidationError';
  }
}

export class ImageNotFoundError extends Error {
  constructor() {
    super('Image not found');
    this.name = 'ImageNotFoundError';
  }
}

/**
 * Validates an image file before it is persisted. Throws ImageValidationError
 * with a user-facing message rather than silently dropping the file.
 */
export function assertValidImage(file: File): void {
  if (!ALLOWED_MIME.has(file.type)) {
    throw new ImageValidationError('صيغة الصورة غير مدعومة. الصيغ المقبولة: JPG, PNG, WEBP, GIF');
  }
  if (file.size <= 0) {
    throw new ImageValidationError('الملف فارغ');
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new ImageValidationError('حجم الصورة يتجاوز 5 ميغابايت');
  }
}

/**
 * Validates a whole selection up-front so the user sees every problem before
 * any row is written.
 */
export function assertValidImageSet(files: File[]): void {
  if (files.length > MAX_IMAGES_PER_REQUEST) {
    throw new ImageValidationError(`يمكنك رفع ${MAX_IMAGES_PER_REQUEST} صور كحد أقصى`);
  }
  files.forEach((f) => assertValidImage(f));

  const total = files.reduce((sum, f) => sum + f.size, 0);
  if (total > MAX_UPLOAD_BYTES) {
    throw new ImageValidationError('مجموع حجم الصور كبير جداً. أعد المحاولة بصور أقل أو أصغر.');
  }
}

/**
 * Downscales and re-encodes a photo in the browser before it is uploaded.
 *
 * Phone cameras produce 3–8 MB files but a server action accepts only a few MB
 * for the entire batch, so raw photos fail at the transport layer. Resizing to
 * 1600px and re-encoding to JPEG typically brings a photo down to 200–600 KB.
 * Files that are already small, and animated GIFs (which would lose their
 * animation), are returned untouched.
 */
export async function compressImage(file: File): Promise<File> {
  if (file.type === 'image/gif') return file;
  if (typeof document === 'undefined' || typeof createImageBitmap !== 'function') return file;

  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
    const edge = Math.max(bitmap.width, bitmap.height);
    const scale = Math.min(1, COMPRESS_MAX_EDGE / edge);

    if (scale === 1 && file.size <= COMPRESS_THRESHOLD) {
      bitmap.close();
      return file;
    }

    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      bitmap.close();
      return file;
    }

    const type = file.type === 'image/webp' ? 'image/webp' : 'image/jpeg';
    if (type === 'image/jpeg') {
      // PNGs may carry transparency; JPEG has none, so flatten onto white
      // instead of letting it turn black.
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, COMPRESS_QUALITY));
    if (!blob || blob.size >= file.size) return file;

    const name = `${file.name.replace(/\.[^.]+$/, '')}.${type === 'image/webp' ? 'webp' : 'jpg'}`;
    return new File([blob], name, { type, lastModified: file.lastModified });
  } catch {
    // Decoding can fail on exotic formats; let the server decide.
    return file;
  }
}

/**
 * Prepares a selection for upload: compresses every image in parallel so the
 * whole batch fits inside one server-action body.
 */
export async function prepareImages(files: File[]): Promise<File[]> {
  return Promise.all(files.map((file) => compressImage(file)));
}