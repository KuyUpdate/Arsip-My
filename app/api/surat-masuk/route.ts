import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { mapSuratMasuk } from "@/lib/types";

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin()
      .from("surat_masuk")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ success: true, data: data.map(mapSuratMasuk) });
  } catch (error) {
    console.error("GET /api/surat-masuk error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.tanggalDiterima || !body.asalPengirim || !body.perihal || !body.created_by) {
      return NextResponse.json(
        { success: false, error: "Kolom wajib belum diisi lengkap" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin()
      .from("surat_masuk")
      .insert({
        tanggal_diterima: body.tanggalDiterima,
        asal_pengirim: body.asalPengirim,
        penerima_pertama: body.penerimaPertama || "-",
        perihal: body.perihal,
        nomor_surat: body.nomorSurat || "-",
        file_url: body.fileUrl || null,
        file_name: body.fileName || null,
        file_id: body.fileId || null,
        disposisi_guru: body.disposisiGuru || null,
        disposisi_catatan: body.disposisiCatatan || null,
        created_by: body.created_by,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, data: mapSuratMasuk(data) });
  } catch (error) {
    console.error("POST /api/surat-masuk error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
