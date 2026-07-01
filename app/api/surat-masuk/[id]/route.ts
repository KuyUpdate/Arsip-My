import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { mapSuratMasuk } from "@/lib/types";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await req.json();

    const updates: Record<string, unknown> = {};
    if (body.tanggalDiterima !== undefined) updates.tanggal_diterima = body.tanggalDiterima;
    if (body.asalPengirim !== undefined) updates.asal_pengirim = body.asalPengirim;
    if (body.penerimaPertama !== undefined) updates.penerima_pertama = body.penerimaPertama;
    if (body.perihal !== undefined) updates.perihal = body.perihal;
    if (body.nomorSurat !== undefined) updates.nomor_surat = body.nomorSurat;
    if (body.fileUrl !== undefined) updates.file_url = body.fileUrl;
    if (body.fileName !== undefined) updates.file_name = body.fileName;
    if (body.fileId !== undefined) updates.file_id = body.fileId;
    if (body.disposisiGuru !== undefined) updates.disposisi_guru = body.disposisiGuru;
    if (body.disposisiCatatan !== undefined) updates.disposisi_catatan = body.disposisiCatatan;

    const { data, error } = await supabaseAdmin()
      .from("surat_masuk")
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

    return NextResponse.json({ success: true, data: mapSuratMasuk(data) });
  } catch (error) {
    console.error("PUT /api/surat-masuk/[id] error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const { error } = await supabaseAdmin()
      .from("surat_masuk")
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
    console.error("DELETE /api/surat-masuk/[id] error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
