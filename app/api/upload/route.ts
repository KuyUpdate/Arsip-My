import { NextRequest, NextResponse } from "next/server";
import { uploadToStorage } from "@/lib/supabaseStorage";

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "Tidak ada berkas diunggah" },
        { status: 400 }
      );
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: "Tipe berkas tidak didukung. Gunakan JPEG, PNG, WebP, atau PDF." },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: "Berkas terlalu besar. Maksimal 10MB." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const timestamp = Date.now();
    const safeName = `${timestamp}_${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;

    const { fileUrl, fileId } = await uploadToStorage(buffer, safeName, file.type);

    return NextResponse.json({
      success: true,
      fileUrl,
      fileId,
      fileName: file.name,
    });
  } catch (error) {
    console.error("Upload API error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengunggah berkas" },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
