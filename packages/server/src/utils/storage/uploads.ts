import multer from 'multer';
import type { NextFunction, Request, RequestHandler, Response } from 'express';
import { errorHandler__400 } from '../errorHandlers/codedErrorHandlers.js';

/* Multipart upload middleware. Files are kept in memory (they're small and go
   straight on to S3) and checked for type and size before any controller runs. */

export const RECORD_FILE_MAX_MB = 25;
export const RECORD_FILES_MAX = 10;
export const PHOTO_MAX_MB = 5;

const RECORD_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png', '.dcm', '.doc', '.docx'];
const PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

function extensionOf(name: string) {
  const dot = name.lastIndexOf('.');
  return dot === -1 ? '' : name.slice(dot).toLowerCase();
}

// Turns multer's errors into the API's usual 400 response.
function withFriendlyErrors(middleware: RequestHandler): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    middleware(req, res, (error?: unknown) => {
      if (!error) return next();
      let message = error instanceof Error ? error.message : 'invalid upload';
      if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') message = 'A file is larger than the size limit.';
        else if (error.code === 'LIMIT_FILE_COUNT') message = 'Too many files.';
        else if (error.code === 'LIMIT_UNEXPECTED_FILE') message = 'Unexpected file field.';
      }
      errorHandler__400({ errorMessage: message }, res);
    });
  };
}

/** `files` (up to 10): record attachments. */
export const recordFilesUpload = withFriendlyErrors(
  multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: RECORD_FILE_MAX_MB * 1024 * 1024, files: RECORD_FILES_MAX },
    fileFilter: (_req, file, callback) => {
      if (RECORD_EXTENSIONS.includes(extensionOf(file.originalname))) return callback(null, true);
      callback(new Error(`${file.originalname}: file type not supported. Use PDF, JPG, PNG, DICOM or Word.`));
    }
  }).array('files', RECORD_FILES_MAX)
);

/** `photo` (one image): profile photos. */
export const profilePhotoUpload = withFriendlyErrors(
  multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: PHOTO_MAX_MB * 1024 * 1024, files: 1 },
    fileFilter: (_req, file, callback) => {
      if (PHOTO_TYPES.includes(file.mimetype)) return callback(null, true);
      callback(new Error('Use a JPG, PNG or WebP image.'));
    }
  }).single('photo')
);
