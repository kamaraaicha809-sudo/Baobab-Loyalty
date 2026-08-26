/**
 * storage-upload
 * Uploads a file to Supabase Storage
 *
 * Auth: Required (JWT)
 * Method: POST (multipart/form-data)
 * Body: file (File), bucket (string), path? (string)
 */

import { requireAuth, getServiceClient } from "../_shared/auth.ts";
import { handleCors } from "../_shared/cors.ts";
import { success, errors } from "../_shared/response.ts";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf"];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return handleCors();

  try {
    const isDemoMode = Deno.env.get("DEMO_MODE") === "true";
    if (isDemoMode) return errors.forbidden("File upload is disabled in demo mode");

    const { user, userClient, error: authError } = await requireAuth(req);
    if (authError || !user || !userClient) return errors.unauthorized(authError || "Authentication required");

    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return errors.badRequest("Content-Type must be multipart/form-data");
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const bucket = formData.get("bucket") as string | null;
    const path = formData.get("path") as string | null;

    if (!file) return errors.badRequest("File is required");
    if (!bucket) return errors.badRequest("Bucket name is required");
    if (file.size > MAX_FILE_SIZE) return errors.badRequest("File too large (max 10 MB)");
    if (!ALLOWED_TYPES.includes(file.type)) return errors.badRequest("File type not allowed");

    // Security: user can only upload to their own path unless admin
    if (path && !path.startsWith(`${user.id}/`)) {
      const { data: profile } = await userClient
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role !== "admin") {
        return errors.forbidden("You can only upload to your own files");
      }
    }

    const filePath = path || `${user.id}/${Date.now()}_${file.name}`;
    const serviceClient = getServiceClient();

    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = new Uint8Array(arrayBuffer);

    const { data, error: uploadError } = await serviceClient.storage
      .from(bucket)
      .upload(filePath, fileBuffer, { contentType: file.type, upsert: true });

    if (uploadError) {
      console.error("storage-upload error:", uploadError);
      return errors.internal(`Upload failed: ${uploadError.message}`);
    }

    const { data: { publicUrl } } = serviceClient.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return success({ path: data.path, url: publicUrl, size: file.size, type: file.type });
  } catch (err) {
    console.error("storage-upload error:", err);
    return errors.internal(err instanceof Error ? err.message : "Upload failed");
  }
});
