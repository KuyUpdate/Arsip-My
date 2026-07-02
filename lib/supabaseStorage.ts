import { supabaseAdmin } from "./supabase";
import { writeFileSync, existsSync, mkdirSync, unlinkSync } from "fs";
import { join } from "path";
import { isDevMode } from "./devDb";

export async function uploadToStorage(
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<{ fileUrl: string; fileId: string }> {
  if (isDevMode()) {
    const dir = join(process.cwd(), "public", "uploads");
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    const path = `${Date.now()}_${fileName}`;
    writeFileSync(join(dir, path), fileBuffer);
    return { fileUrl: `/uploads/${path}`, fileId: path };
  }

  const timestamp = Date.now();
  const path = `uploads/${timestamp}_${fileName}`;

  const { error } = await supabaseAdmin().storage
    .from("arsip-file")
    .upload(path, fileBuffer, { contentType: mimeType, upsert: false });

  if (error) throw error;

  const { data: publicUrl } = supabaseAdmin().storage
    .from("arsip-file")
    .getPublicUrl(path);

  return { fileUrl: publicUrl.publicUrl, fileId: path };
}

export async function deleteFromStorage(fileId: string): Promise<void> {
  if (isDevMode()) {
    try { unlinkSync(join(process.cwd(), "public", "uploads", fileId)); } catch {}
    return;
  }

  await supabaseAdmin().storage.from("arsip-file").remove([fileId]);
}
