import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

function getS3Config() {
  const region = process.env.AWS_REGION;
  const bucket = process.env.S3_BUCKET_NAME;

  if (!region || !bucket) {
    throw new Error("AWS_REGION and S3_BUCKET_NAME must be configured");
  }

  return {
    bucket,
    client: new S3Client({
      region,
      credentials:
        process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
          ? {
              accessKeyId: process.env.AWS_ACCESS_KEY_ID,
              secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            }
          : undefined,
    }),
  };
}

export async function getPresignedUploadUrl({
  contentType,
  key,
}: {
  contentType: string;
  key: string;
}) {
  const { bucket, client } = getS3Config();
  return getSignedUrl(
    client,
    new PutObjectCommand({
      Bucket: bucket,
      ContentType: contentType,
      Key: key,
    }),
    { expiresIn: 300 }
  );
}

export async function getPresignedReadUrl(key: string) {
  const { bucket, client } = getS3Config();
  return getSignedUrl(
    client,
    new GetObjectCommand({ Bucket: bucket, Key: key }),
    { expiresIn: 300 }
  );
}
