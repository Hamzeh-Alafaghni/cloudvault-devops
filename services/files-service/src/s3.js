import { S3Client, GetObjectCommand, HeadBucketCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const REGION = process.env.S3_REGION || 'us-east-1';
const BUCKET = process.env.S3_BUCKET || 'cloudvault';
const FORCE_PATH_STYLE = String(process.env.S3_FORCE_PATH_STYLE || 'true') === 'true';

const credentials = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'test',
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'test',
};

// Internal client — used for control-plane ops inside the Docker network.
const internal = new S3Client({
  region: REGION,
  endpoint: process.env.S3_ENDPOINT || 'http://localstack:4566',
  forcePathStyle: FORCE_PATH_STYLE,
  credentials,
});

// Public client — used ONLY for presigning download URLs so the signature is
// valid against the host the browser actually talks to (localhost:4566 in dev,
// the real S3/CloudFront domain in the cloud).
const publicClient = new S3Client({
  region: REGION,
  endpoint: process.env.S3_PUBLIC_ENDPOINT || 'http://localhost:4566',
  forcePathStyle: FORCE_PATH_STYLE,
  credentials,
});

export async function presignDownload(key, expiresIn = 900) {
  if (!key) return null;
  const cmd = new GetObjectCommand({ Bucket: BUCKET, Key: key });
  return getSignedUrl(publicClient, cmd, { expiresIn });
}

export async function bucketReachable() {
  await internal.send(new HeadBucketCommand({ Bucket: BUCKET }));
}

export const bucket = BUCKET;
