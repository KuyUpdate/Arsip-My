"use client";

import React from "react";
import { 
  Mail, 
  Send, 
  MailCheck, 
  ArrowRight, 
  PlusCircle,
  FileText
} from "lucide-react";
import { SuratMasuk, SuratKeluar } from "@/lib/types";

interface DashboardProps {
  suratMasuk: SuratMasuk[];
  suratKeluar: SuratKeluar[];
  onNavigate: (tab: string) => void;
  onOpenInputMasuk: () => void;
  onOpenInputKeluar: () => void;
  currentUser: string;
}

export default function Dashboard({
  suratMasuk,
  suratKeluar,
  onNavigate,
  onOpenInputMasuk,
  onOpenInputKeluar,
  currentUser
}: DashboardProps) {
  // Calculate stats for current month
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const masukBulanIni = suratMasuk.filter(item => {
    const d = new Date(item.tanggalDiterima);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  }).length;

  const keluarBulanIni = suratKeluar.filter(item => {
    const d = new Date(item.tanggalKeluar);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  }).length;

  // Recent unprocessed incoming mail (no disposition)
  const belumDiproses = suratMasuk
    .filter(item => !item.disposisiGuru || item.disposisiGuru.trim() === "")
    .slice(0, 5);

  const totalMasuk = suratMasuk.length;
  const totalKeluar = suratKeluar.length;

  // Dynamic greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 11) return "Selamat Pagi";
    if (hour < 15) return "Selamat Siang";
    if (hour < 18) return "Selamat Sore";
    return "Selamat Malam";
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-madrasah-700 text-white rounded-3xl p-8 border-4 border-madrasah-800 hover:shadow-xl hover:shadow-madrasah-900/10 transition-all relative overflow-hidden">
        {/* Decorative subtle background icon */}
        <div className="absolute right-0 bottom-0 top-0 opacity-10 flex items-center justify-center p-8 pointer-events-none">
          <Mail className="h-64 w-64 rotate-12 stroke-1" />
        </div>
        <div className="relative z-10 max-w-2xl space-y-2">
          <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tight">
            {getGreeting()}, {currentUser}!
          </h1>
          <p className="text-madrasah-100 text-sm md:text-base leading-relaxed font-light">
            Selamat datang di portal My Arsip MIS Islamiyah Tanjungrejo. Kelola arsip surat masuk dan keluar secara digital dengan mudah, tertib, dan aman.
          </p>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Masuk Bulan Ini</span>
            <div className="p-2 bg-madrasah-50 text-madrasah-750 rounded-xl">
              <Mail className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl md:text-4xl font-display font-bold text-madrasah-700 tracking-tight">{masukBulanIni}</h3>
            <p className="text-[11px] text-slate-400 mt-1 uppercase font-semibold tracking-wider">Total: {totalMasuk} surat</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Keluar Bulan Ini</span>
            <div className="p-2 bg-blue-50 text-blue-700 rounded-xl">
              <Send className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl md:text-4xl font-display font-bold text-madrasah-700 tracking-tight">{keluarBulanIni}</h3>
            <p className="text-[11px] text-slate-400 mt-1 uppercase font-semibold tracking-wider">Total: {totalKeluar} surat</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs flex flex-col justify-between col-span-2 md:col-span-2 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Sistem Berkas</span>
            <span className="text-[10px] bg-madrasah-100 text-madrasah-800 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">100% Aktif</span>
          </div>
          <div className="mt-4 flex items-center gap-4">
            <div className="flex-1">
              <div className="text-sm font-bold text-slate-800">Penyimpanan Terintegrasi</div>
              <div className="text-xs text-slate-400 mt-0.5">Database Lokal & File Server Aktif</div>
            </div>
            <button 
              onClick={() => onNavigate("settings")}
              className="text-xs text-madrasah-700 hover:text-madrasah-800 font-bold flex items-center gap-1 cursor-pointer"
            >
              Pengaturan <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Action Shortcuts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={onOpenInputMasuk}
          className="flex items-center justify-between p-6 bg-white hover:bg-emerald-50/30 border border-slate-100 hover:border-emerald-200 rounded-2xl shadow-xs transition-all text-left group cursor-pointer"
        >
          <div className="flex items-start gap-4">
            <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl group-hover:scale-105 transition-transform">
              <PlusCircle className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-800 text-base">Arsipkan Surat Masuk Baru</h4>
              <p className="text-xs text-slate-500 mt-0.5">Catat tanggal terima, instansi pengirim, perihal, dan unggah berkas surat masuk.</p>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-slate-400 group-hover:translate-x-1 transition-transform shrink-0 ml-4" />
        </button>

        <button
          onClick={onOpenInputKeluar}
          className="flex items-center justify-between p-6 bg-white hover:bg-blue-50/30 border border-slate-100 hover:border-blue-200 rounded-2xl shadow-xs transition-all text-left group cursor-pointer"
        >
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-100 text-blue-700 rounded-xl group-hover:scale-105 transition-transform">
              <PlusCircle className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-800 text-base">Arsipkan Surat Keluar Baru</h4>
              <p className="text-xs text-slate-500 mt-0.5">Catat nomor agenda resmi, tanggal keluar, perihal, dan unggah berkas digital.</p>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-slate-400 group-hover:translate-x-1 transition-transform shrink-0 ml-4" />
        </button>
      </div>

      {/* Mini Table of Unprocessed Letters */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h3 className="font-display font-semibold text-slate-800 text-base">Surat Masuk Terbaru Belum Disposisi</h3>
            <p className="text-xs text-slate-400 mt-0.5">Arsip masuk terbaru yang memerlukan petunjuk disposisi Kepala Madrasah.</p>
          </div>
          <button
            onClick={() => onNavigate("surat-masuk")}
            className="text-xs text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1 cursor-pointer"
          >
            Lihat Semua <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {belumDiproses.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <MailCheck className="h-10 w-10 mx-auto text-emerald-500/60 mb-2" />
            <p className="text-sm font-medium">Semua surat masuk telah didisposisikan!</p>
            <p className="text-xs text-slate-400 mt-1">Sistem arsip berjalan tertib dan bersih.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase border-b border-slate-100">
                  <th className="px-5 py-3">Tanggal Terima</th>
                  <th className="px-5 py-3">Asal Pengirim</th>
                  <th className="px-5 py-3">Perihal</th>
                  <th className="px-5 py-3 text-right">Penerima</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
                {belumDiproses.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3.5 font-medium whitespace-nowrap">
                      {new Date(item.tanggalDiterima).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric"
                      })}
                    </td>
                    <td className="px-5 py-3.5 font-medium text-slate-800 max-w-[180px] truncate">
                      {item.asalPengirim}
                    </td>
                    <td className="px-5 py-3.5 max-w-[250px] truncate">
                      {item.perihal}
                    </td>
                    <td className="px-5 py-3.5 text-right whitespace-nowrap text-xs text-slate-500">
                      {item.penerimaPertama.split(" ")[0]} ...
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
