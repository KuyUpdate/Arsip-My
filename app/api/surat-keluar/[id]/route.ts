import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { mapSuratKeluar } from "@/lib/types";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await req.json();

    const updates: Record<string, unknown> = {};
    if (body.nomorSurat !== undefined) updates.nomor_surat = body.nomorSurat;
    if (body.tanggalKeluar !== undefined) updates.tanggal_keluar = body.tanggalKeluar;
    if (body.perihal !== undefined) updates.perihal = body.perihal;
    if (body.pembuatSurat !== undefined) updates.pembuat_surat = body.pembuatSurat;
    if (body.fileUrl !== undefined) updates.file_url = body.fileUrl;
    if (body.fileName !== undefined) updates.file_name = body.fileName;
    if (body.fileId !== undefined) updates.file_id = body.fileId;

    const { data, error } = await supabaseAdmin()
      .from("surat_keluar")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ success: false, error: "Data tidak ditemukan" }, { status: 404 });
      }
      throw error;
    }

    return NextResponse.json({ success: true, data: mapSuratKeluar(data) });
  } catch (error) {
    console.error("PUT /api/surat-keluar/[id] error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const { error } = await supabaseAdmin()
      .from("surat_keluar")
      .delete()
      .eq("id", id);

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ success: false, error: "Data tidak ditemukan" }, { status: 404 });
      }
      throw error;
    }

    return NextResponse.json({ success: true, message: "Berhasil menghapus arsip" });
  } catch (error) {
    console.error("DELETE /api/surat-keluar/[id] error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
