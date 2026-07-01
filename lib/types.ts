export interface SuratMasuk {
  id: string;
  tanggalDiterima: string;
  asalPengirim: string;
  penerimaPertama: string;
  perihal: string;
  nomorSurat: string;
  fileUrl: string | null;
  fileName: string | null;
  fileId: string | null;
  disposisiGuru?: string;
  disposisiCatatan?: string;
  created_at: string;
  created_by: string;
}

export interface SuratKeluar {
  id: string;
  nomorSurat: string;
  tanggalKeluar: string;
  perihal: string;
  pembuatSurat: string;
  fileUrl: string | null;
  fileName: string | null;
  fileId: string | null;
  created_at: string;
  created_by: string;
}

export interface DbSuratMasuk {
  id: string;
  tanggal_diterima: string;
  asal_pengirim: string;
  penerima_pertama: string;
  perihal: string;
  nomor_surat: string;
  file_url: string | null;
  file_name: string | null;
  file_id: string | null;
  disposisi_guru: string | null;
  disposisi_catatan: string | null;
  created_at: string;
  created_by: string;
}

export interface DbSuratKeluar {
  id: string;
  nomor_surat: string;
  tanggal_keluar: string;
  perihal: string;
  pembuat_surat: string;
  file_url: string | null;
  file_name: string | null;
  file_id: string | null;
  created_at: string;
  created_by: string;
}

export function mapSuratMasuk(row: DbSuratMasuk): SuratMasuk {
  return {
    id: row.id,
    tanggalDiterima: row.tanggal_diterima,
    asalPengirim: row.asal_pengirim,
    penerimaPertama: row.penerima_pertama,
    perihal: row.perihal,
    nomorSurat: row.nomor_surat,
    fileUrl: row.file_url ?? null,
    fileName: row.file_name ?? null,
    fileId: row.file_id ?? null,
    disposisiGuru: row.disposisi_guru ?? undefined,
    disposisiCatatan: row.disposisi_catatan ?? undefined,
    created_at: row.created_at,
    created_by: row.created_by,
  };
}

export function mapSuratKeluar(row: DbSuratKeluar): SuratKeluar {
  return {
    id: row.id,
    nomorSurat: row.nomor_surat,
    tanggalKeluar: row.tanggal_keluar,
    perihal: row.perihal,
    pembuatSurat: row.pembuat_surat,
    fileUrl: row.file_url,
    fileName: row.file_name,
    fileId: row.file_id,
    created_at: row.created_at,
    created_by: row.created_by,
  };
}
