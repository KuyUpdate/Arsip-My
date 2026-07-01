import { supabaseAdmin } from "./supabase";

export async function uploadToStorage(
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<{ fileUrl: string; fileId: string }> {
  const timestamp = Date.now();
  const path = `uploads/${timestamp}_${fileName}`;

  const { error } = await supabaseAdmin().storage
    .from("arsip-files")
    .upload(path, fileBuffer, { contentType: mimeType, upsert: false });

  if (error) throw error;

  const { data: publicUrl } = supabaseAdmin().storage
    .from("arsip-files")
    .getPublicUrl(path);

  return { fileUrl: publicUrl.publicUrl, fileId: path };
}
