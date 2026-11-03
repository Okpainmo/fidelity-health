import validatedEnv from '../utils/base.js';

export type BucketConfig = {
  enabled: boolean;
  accessKeyId?: string;
  secretAccessKey?: string;
  region?: string;
  bucketName?: string;
};

// The two S3 buckets: `images` (profile photos) and `files` (record attachments).
export const s3Config: { images: BucketConfig; files: BucketConfig } = {
  images: {
    enabled: validatedEnv.AWS_IMAGES_ENABLED,
    accessKeyId: validatedEnv.AWS_IMAGES_ACCESS_KEY,
    secretAccessKey: validatedEnv.AWS_IMAGES_SECRET_ACCESS_KEY,
    region: validatedEnv.AWS_IMAGES_S3_BUCKET_REGION,
    bucketName: validatedEnv.AWS_IMAGES_S3_BUCKET_NAME
  },
  files: {
    enabled: validatedEnv.AWS_FILES_ENABLED,
    accessKeyId: validatedEnv.AWS_FILES_ACCESS_KEY,
    secretAccessKey: validatedEnv.AWS_FILES_SECRET_ACCESS_KEY,
    region: validatedEnv.AWS_FILES_S3_BUCKET_REGION,
    bucketName: validatedEnv.AWS_FILES_S3_BUCKET_NAME
  }
};

export default s3Config;
