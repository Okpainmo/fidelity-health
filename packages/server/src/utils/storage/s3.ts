import { DeleteObjectsCommand, GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Config } from '../../config/index.js';
import type { BucketConfig } from '../../config/_/s3.config.js';

/* S3 storage, following the XOps Maestros setup: two buckets, `images` (profile
   photos) and `files` (record attachments), each with its own credentials.

   Unlike XOps Maestros, nothing here returns a public URL. These are medical
   records, so both buckets stay private: we store the object key and hand out
   short-lived signed URLs, only after the caller's access has been checked. */

export type Bucket = 'images' | 'files';

export class StorageNotConfiguredError extends Error {
  constructor(bucket: Bucket) {
    super(`file storage (${bucket} bucket) is not configured`);
    this.name = 'StorageNotConfiguredError';
  }
}

const clients: Partial<Record<Bucket, { client: S3Client; bucketName: string }>> = {};

function isConfigured(config: BucketConfig) {
  return Boolean(config.enabled && config.accessKeyId && config.secretAccessKey && config.region && config.bucketName);
}

export function isStorageEnabled(bucket: Bucket): boolean {
  return isConfigured(s3Config[bucket]);
}

function bucketClient(bucket: Bucket) {
  const config = s3Config[bucket];
  if (!isConfigured(config)) throw new StorageNotConfiguredError(bucket);

  if (!clients[bucket]) {
    clients[bucket] = {
      client: new S3Client({
        region: config.region,
        credentials: { accessKeyId: config.accessKeyId as string, secretAccessKey: config.secretAccessKey as string }
      }),
      bucketName: config.bucketName as string
    };
  }
  return clients[bucket]!;
}

/** Uploads bytes to `key` in the bucket. */
export async function putObject(bucket: Bucket, key: string, body: Buffer, contentType: string) {
  const { client, bucketName } = bucketClient(bucket);
  await client.send(new PutObjectCommand({ Bucket: bucketName, Key: key, Body: body, ContentType: contentType }));
}

/**
 * A short-lived URL for one object. With `downloadName`, the browser downloads
 * the file under that name; otherwise it opens it in a tab (PDFs, images).
 */
export async function signedUrl(bucket: Bucket, key: string, options: { expiresIn?: number; downloadName?: string } = {}) {
  const { client, bucketName } = bucketClient(bucket);
  const disposition = options.downloadName ? `attachment; filename="${options.downloadName.replace(/"/g, '')}"` : 'inline';
  return getSignedUrl(client, new GetObjectCommand({ Bucket: bucketName, Key: key, ResponseContentDisposition: disposition }), {
    expiresIn: options.expiresIn ?? 600
  });
}

/** Deletes objects; failures are swallowed (used for clean-up). */
export async function deleteObjects(bucket: Bucket, keys: string[]) {
  if (keys.length === 0 || !isStorageEnabled(bucket)) return;
  try {
    const { client, bucketName } = bucketClient(bucket);
    await client.send(new DeleteObjectsCommand({ Bucket: bucketName, Delete: { Objects: keys.map((Key) => ({ Key })) } }));
  } catch {
    // Orphaned objects are harmless; never fail the request over clean-up.
  }
}

/** Safe object-key segment from a user-supplied file name. */
export function safeFileName(name: string) {
  const cleaned = name
    .normalize('NFKD')
    .replace(/[^\w.-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return cleaned.slice(-120) || 'file';
}
