import type { ObjectStoragePort } from "@corely/kernel/ports/object-storage.port";
import { createGcsClient } from "./gcs.client";
import { GcsObjectStorageAdapter } from "./gcs-object-storage.adapter";
import { VercelBlobObjectStorageAdapter } from "./vercel-blob-object-storage.adapter";

export type SupportedObjectStorageProvider = "gcs" | "vercel_blob";

export type ObjectStorageFactoryEnv = {
  STORAGE_PROVIDER?: string;
  STORAGE_BUCKET?: string;
  GOOGLE_CLOUD_PROJECT?: string;
  /** File path to the service account JSON (local dev) */
  GOOGLE_APPLICATION_CREDENTIALS?: string;
  /** Full service account JSON as a string (Vercel / cloud runtimes) */
  GOOGLE_APPLICATION_CREDENTIALS_JSON?: string;
  BLOB_READ_WRITE_TOKEN?: string;
  VERCEL_BLOB_ACCESS?: string;
  VERCEL_BLOB_HANDLE_UPLOAD_PATH?: string;
};

export function createObjectStorageFromEnv(
  env: ObjectStorageFactoryEnv = process.env as ObjectStorageFactoryEnv
): ObjectStoragePort {
  const provider = (env.STORAGE_PROVIDER ?? "gcs") as SupportedObjectStorageProvider;
  const bucketName = env.STORAGE_BUCKET?.trim();

  if (!bucketName) {
    throw new Error("STORAGE_BUCKET must be configured for object storage");
  }

  if (provider === "gcs") {
    // Prefer JSON string (Vercel/cloud) over file path (local dev)
    const credentialsValue =
      env.GOOGLE_APPLICATION_CREDENTIALS_JSON ?? env.GOOGLE_APPLICATION_CREDENTIALS;
    return new GcsObjectStorageAdapter(
      createGcsClient({
        ...(env.GOOGLE_CLOUD_PROJECT ? { projectId: env.GOOGLE_CLOUD_PROJECT } : {}),
        ...(credentialsValue ? { keyFilename: credentialsValue } : {}),
      }),
      bucketName
    );
  }

  if (provider === "vercel_blob") {
    return new VercelBlobObjectStorageAdapter({
      bucketName,
      access: env.VERCEL_BLOB_ACCESS === "public" ? "public" : "private",
      token: env.BLOB_READ_WRITE_TOKEN,
      handleUploadUrl: env.VERCEL_BLOB_HANDLE_UPLOAD_PATH || "/api/storage/blob/upload",
    });
  }

  throw new Error(`Unsupported STORAGE_PROVIDER: ${provider}`);
}
