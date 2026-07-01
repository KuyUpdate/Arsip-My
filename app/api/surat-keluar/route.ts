import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { mapSuratKeluar } from "@/lib/types";

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin()
      .from("surat_keluar")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ success: true, data: data.map(mapSuratKeluar) });
  } catch (error) {
    console.error("GET /api/surat-keluar error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.nomorSurat || !body.tanggalKeluar || !body.perihal || !body.pembuatSurat || !body.created_by) {
      return NextResponse.json(
        { success: false, error: "Kolom wajib belum diisi lengkap" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin()
      .from("surat_keluar")
      .insert({
        nomor_surat: body.nomorSurat,
        tanggal_keluar: body.tanggalKeluar,
        perihal: body.perihal,
        pembuat_surat: body.pembuatSurat,
        file_url: body.fileUrl || null,
        file_name: body.fileName || null,
        file_id: body.fileId || null,
        created_by: body.created_by,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, data: mapSuratKeluar(data) });
  } catch (error) {
    console.error("POST /api/surat-keluar error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
