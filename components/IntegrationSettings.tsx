"use client";

import React from "react";
import {
  Database,
  HardDrive,
  HelpCircle,
  ShieldCheck
} from "lucide-react";

export default function IntegrationSettings() {
  return (
    <div className="space-y-6 font-sans">
      <div>
        <h1 className="text-2xl font-display font-bold text-slate-800">Integrasi & Arsitektur Database</h1>
        <p className="text-xs text-slate-500 mt-0.5">Sistem Integrasi Multi-Database untuk efisiensi performa dan penyimpanan 100% gratis jangka panjang.</p>
      </div>

      {/* Connection Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Supabase PostgreSQL Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl">
                <Database className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 text-base">Supabase (PostgreSQL)</h3>
                <p className="text-xs text-slate-400">Database Utama Teks & Autentikasi</p>
              </div>
            </div>
            <span className="text-xs font-semibold bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full flex items-center gap-1">
              <HelpCircle className="h-3.5 w-3.5" /> Menunggu Konfigurasi
            </span>
          </div>

          <div className="text-sm text-slate-600 leading-relaxed space-y-2">
            <p>Menyimpan data teks terstruktur seperti nomor surat, tanggal, asal pengirim, penerima, disposisi kepala sekolah, dan data akuntabilitas petugas.</p>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 font-mono text-[11px] text-slate-500 space-y-1">
              <div>{"DATABASE_URL = \"postgresql://postgres:***@supabase.co:5432\""}</div>
              <div>{"AUTH_MODE = \"Satu Akun Guru Bersama (Praktis)\""}</div>
              <div>{"ESTIMATED_LIFE = \"Sangat Aman &gt;45 Tahun (Free Tier)\""}</div>
            </div>
          </div>
        </div>

        {/* Google Drive API Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-50 text-blue-700 rounded-xl">
                <HardDrive className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 text-base">Google Drive (Workspace)</h3>
                <p className="text-xs text-slate-400">Penyimpanan Berkas Digital (Fisik PDF/Scan)</p>
              </div>
            </div>
            <span className="text-xs font-semibold bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full flex items-center gap-1">
              <HelpCircle className="h-3.5 w-3.5" /> Menunggu Konfigurasi
            </span>
          </div>

          <div className="text-sm text-slate-600 leading-relaxed space-y-2">
            <p>Menyimpan berkas digital PDF/Foto hasil jepretan kamera HP guru dengan kompresi otomatis latar belakang di bawah 3 MB sebelum dikirim.</p>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 font-mono text-[11px] text-slate-500 space-y-1">
              <div>{"STORAGE_TYPE = \"Google Drive API (Gmail Sekolah)\""}</div>
              <div>{"FREE_LIMIT = \"15 GB Gratis (~50.000 Berkas)\""}</div>
              <div>{"AUTO_COMPRESS_HP_IMAGE = \"Ya, Aktif (&lt;3 MB)\""}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Architecture Benefits Panel */}
      <div className="bg-emerald-50/40 p-5 rounded-2xl border border-emerald-100 space-y-3">
        <h3 className="font-display font-bold text-emerald-900 text-base flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-emerald-700" />
          Mengapa Menggunakan Pendekatan Multi-Database Ini?
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-emerald-850">
          <div className="space-y-1 bg-white p-3.5 rounded-xl border border-emerald-100">
            <h4 className="font-bold">100% Bebas Biaya (Gratis)</h4>
            <p className="text-slate-500 leading-relaxed">Supabase free tier menyimpan teks sangat lama, dan Google Drive 15GB gratis bawaan akun sekolah memangkas biaya server VPS.</p>
          </div>
          <div className="space-y-1 bg-white p-3.5 rounded-xl border border-emerald-100">
            <h4 className="font-bold">Kerapian &amp; Aksesibilitas</h4>
            <p className="text-slate-500 leading-relaxed">Guru dapat membuka folder Google Drive secara terpisah di luar aplikasi melalui Gmail sekolah, sangat praktis.</p>
          </div>
          <div className="space-y-1 bg-white p-3.5 rounded-xl border border-emerald-100">
            <h4 className="font-bold">Performa Pencarian Kilat</h4>
            <p className="text-slate-500 leading-relaxed">Pencarian perihal atau nomor surat diselesaikan dalam milidetik karena query langsung menargetkan indeks teks Supabase.</p>
          </div>
        </div>
      </div>

      {/* Production Guide Panel */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4">
        <h3 className="font-display font-bold text-slate-800 text-base flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-slate-500" />
          Cara Menghubungkan Kunci API Asli di Lingkungan Deployed (Production)
        </h3>
        <p className="text-xs text-slate-500">
          Saat aplikasi dideploy ke layanan cloud atau hosting VPS sekolah, Anda cukup menambahkan variabel berikut di panel pengaturan lingkungan atau berkas <code className="bg-slate-100 px-1.5 py-0.5 rounded text-red-600 font-mono text-[11px]">.env</code>:
        </p>
        <div className="bg-slate-900 text-slate-200 rounded-xl p-4 font-mono text-[11px] leading-relaxed overflow-x-auto space-y-2 select-all">
          <div>{"# INTEGRASI DATABASE SUPABASE"}</div>
          <div>{"SUPABASE_URL=\"https://your-supabase-project.supabase.co\""}</div>
          <div>{"SUPABASE_ANON_KEY=\"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-key-here\""}</div>
          <div className="pt-2">{"# INTEGRASI GOOGLE DRIVE API"}</div>
          <div>{"GOOGLE_DRIVE_FOLDER_ID=\"your_shared_folder_id_here\""}</div>
          <div>{"GOOGLE_SERVICE_ACCOUNT_CREDENTIALS='{\"type\": \"service_account\", \"project_id\": \"...\", \"private_key\": \"...\", ...}'"}</div>
        </div>
        <div className="text-xs text-slate-400 italic">
          Catatan: Dalam lingkungan pratinjau AI Studio ini, seluruh berkas yang Anda unggah disimpan langsung di server lokal container dan dapat diakses/diunduh dengan cepat tanpa hambatan!
        </div>
      </div>
    </div>
  );
}
