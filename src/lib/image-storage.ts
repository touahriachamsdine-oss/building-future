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
}