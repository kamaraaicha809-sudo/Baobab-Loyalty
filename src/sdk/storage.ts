/**
 * Storage SDK module
 * Functions for file upload and management via Supabase Storage
 */

import { callEdgeFunction, SdkError } from "./_core";

export interface UploadResponse {
  path: string;
  url: string;
  size: number;
  type: string;
}

export interface DeleteResponse {
  deleted: boolean;
  path: string;
}

/**
 * Upload a file to Supabase Storage
 * @param file - File to upload
 * @param bucket - Storage bucket name
 * @param path - Optional custom path (default: user_id/timestamp_filename)
 */
export async function upload(
  file: File,
  bucket: string,
  path?: string
): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("bucket", bucket);
  if (path) {
    formData.append("path", path);
  }

  // Custom fetch for multipart/form-data
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl) {
    throw new SdkError("CONFIG_ERROR", "NEXT_PUBLIC_SUPABASE_URL is not configured");
  }

  // Get access token
  const { createClient } = await import("@/libs/supabase/client");
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new SdkError("UNAUTHORIZED", "Authentication required");
  }

  const response = await fetch(`${supabaseUrl}/functions/v1/storage-upload`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${session.access_token}`,
      ...(anonKey && { "apikey": anonKey }),
    },
    body: formData,
  });

  const data = await response.json();

  if (!data.ok) {
    throw new SdkError(data.error?.code || "UPLOAD_ERROR", data.error?.message || "Upload failed");
  }

  return data.data;
}

/**
 * Delete a file from Supabase Storage
 * @param bucket - Storage bucket name
 * @param path - File path to delete
 */
export async function deleteFile(
  bucket: string,
  path: string
): Promise<DeleteResponse> {
  return callEdgeFunction<DeleteResponse>("storage-delete", {
    method: "POST",
    body: { bucket, path },
  });
}

/**
 * Get the public URL for a file
 * @param bucket - Storage bucket name
 * @param path - File path
 */
export function getPublicUrl(bucket: string, path: string): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) {
    throw new SdkError("CONFIG_ERROR", "NEXT_PUBLIC_SUPABASE_URL is not configured");
  }
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`;
}

export const storage = {
  upload,
  delete: deleteFile,
  getPublicUrl,
};
