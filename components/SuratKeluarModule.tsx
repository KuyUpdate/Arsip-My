"use client";

import React, { useState } from "react";
import {
  Search,
  Download,
  PlusCircle,
  FileText,
  Printer,
  Edit2,
  Trash2,
  Calendar,
  X,
  Upload,
  Clock,
  ExternalLink
} from "lucide-react";
import { SuratKeluar } from "@/lib/types";
import { useToast } from "@/lib/components/Toast";
import ConfirmModal from "@/lib/components/ConfirmModal";
import TableSkeleton from "@/lib/components/TableSkeleton";
import Pagination from "@/lib/components/Pagination";

// Helper for image compression before upload
async function compressImage(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) {
    return file;
  }
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        const MAX_DIM = 1600;

        if (width > MAX_DIM || height > MAX_DIM) {
          if (width > height) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          } else {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(file);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);
              return;
            }
            const compressedFile = new File([blob], file.name, {
              type: "image/jpeg",
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          },
          "image/jpeg",
          0.8
        );
      };
    };
    reader.onerror = () => resolve(file);
  });
}

interface SuratKeluarModuleProps {
  data: SuratKeluar[];
  teachers: string[];
  onRefresh: () => void;
  onOpenInputModal: boolean;
  onCloseInputModal: () => void;
  loading?: boolean;
}

export default function SuratKeluarModule({
  data,
  teachers,
  onRefresh,
  onOpenInputModal,
  onCloseInputModal,
  loading = false
}: SuratKeluarModuleProps) {
  // UI states
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");
  const [filterMaker, setFilterMaker] = useState("");

  // Modal forms states
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<SuratKeluar | null>(null);

  // Form Fields State
  const [formNomor, setFormNomor] = useState("");
  const [formTanggal, setFormTanggal] = useState("");
  const [formPerihal, setFormPerihal] = useState("");
  const [formPembuat, setFormPembuat] = useState("");
  const [isPembuatManual, setIsPembuatManual] = useState(false);
  const [formFileUrl, setFormFileUrl] = useState("");
  const [formFileName, setFormFileName] = useState("");
  const [formFileId, setFormFileId] = useState("");

  // Loading states
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Confirm delete state
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 15;

  const { showToast } = useToast();

  const resetForm = React.useCallback(() => {
    setFormNomor("");
    setFormTanggal(new Date().toISOString().split("T")[0]);
    setFormPerihal("");
    setFormPembuat(teachers[0] || "");
    setIsPembuatManual(false);
    setFormFileUrl("");
    setFormFileName("");
    setFormFileId("");
    setUploading(false);
  }, [teachers]);

  // Trigger modal from props if requested by parent (Dashboard shortcut)
  React.useEffect(() => {
    if (onOpenInputModal) {
      const timer = setTimeout(() => {
        resetForm();
        setIsNewModalOpen(true);
        onCloseInputModal();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [onOpenInputModal, onCloseInputModal, resetForm]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const finalFile = await compressImage(file);

      const formData = new FormData();
      formData.append("file", finalFile);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();
      if (result.success) {
        setFormFileUrl(result.fileUrl || "");
        setFormFileName(result.fileName || "");
        setFormFileId(result.fileId || "");
      } else {
        showToast({ type: "error", message: "Gagal mengunggah berkas: " + result.error });
      }
    } catch (err) {
      console.error(err);
      showToast({ type: "error", message: "Terjadi kesalahan pengunggahan." });
    } finally {
      setUploading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNomor || !formTanggal || !formPerihal || !formPembuat) {
      showToast({ type: "warning", message: "Mohon lengkapi semua kolom wajib!" });
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/surat-keluar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nomorSurat: formNomor,
          tanggalKeluar: formTanggal,
          perihal: formPerihal,
          pembuatSurat: formPembuat,
          fileUrl: formFileUrl || null,
          fileName: formFileName || null,
          fileId: formFileId || null,
          created_by: formPembuat,
        }),
      });

      const result = await res.json();
      if (result.success) {
        showToast({ type: "success", message: "Agenda surat keluar berhasil disimpan." });
        setIsNewModalOpen(false);
        resetForm();
        onRefresh();
      } else {
        showToast({ type: "error", message: "Gagal menyimpan: " + result.error });
      }
    } catch (err) {
      console.error(err);
      showToast({ type: "error", message: "Terjadi kesalahan koneksi database." });
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (item: SuratKeluar) => {
    setSelectedItem(item);
    setFormNomor(item.nomorSurat);
    setFormTanggal(item.tanggalKeluar);
    setFormPerihal(item.perihal);
    setFormPembuat(item.pembuatSurat);
    setFormFileUrl(item.fileUrl || "");
    setFormFileName(item.fileName || "");
    setFormFileId(item.fileId || "");
    setIsEditModalOpen(true);
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    try {
      setSubmitting(true);
      const res = await fetch(`/api/surat-keluar/${selectedItem.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nomorSurat: formNomor,
          tanggalKeluar: formTanggal,
          perihal: formPerihal,
          pembuatSurat: formPembuat,
          fileUrl: formFileUrl || null,
          fileName: formFileName || null,
          fileId: formFileId || null,
        }),
      });

      const result = await res.json();
      if (result.success) {
        showToast({ type: "success", message: "Data surat keluar berhasil diperbarui." });
        setIsEditModalOpen(false);
        setSelectedItem(null);
        onRefresh();
      } else {
        showToast({ type: "error", message: "Gagal memperbarui: " + result.error });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/surat-keluar/${id}`, {
        method: "DELETE",
      });

      const result = await res.json();
      if (result.success) {
        showToast({ type: "success", message: "Arsip surat keluar berhasil dihapus." });
        onRefresh();
      } else {
        showToast({ type: "error", message: "Gagal menghapus: " + result.error });
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Filter & Search Logic
  const filteredData = data.filter((item) => {
    const matchSearch =
      item.perihal.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.nomorSurat.toLowerCase().includes(searchQuery.toLowerCase());

    const matchMaker = !filterMaker || item.pembuatSurat === filterMaker;

    const date = new Date(item.tanggalKeluar);
    const start = filterStartDate ? new Date(filterStartDate) : null;
    const end = filterEndDate ? new Date(filterEndDate) : null;

    if (start) start.setHours(0,0,0,0);
    if (end) end.setHours(23,59,59,999);

    const matchStart = !start || date >= start;
    const matchEnd = !end || date <= end;

    return matchSearch && matchMaker && matchStart && matchEnd;
  });

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const safePage = Math.min(currentPage, Math.max(1, totalPages));
  const paginatedData = filteredData.slice(
    (safePage - 1) * ITEMS_PER_PAGE,
    safePage * ITEMS_PER_PAGE
  );

  const escapeCsv = (val: string) => `"${val.replace(/"/g, '""').replace(/\n/g, ' ').replace(/\r/g, ' ')}"`;

  // Export to Excel-friendly CSV
  const exportToExcel = () => {
    const headers = [
      "ID",
      "Nomor Surat",
      "Tanggal Keluar",
      "Perihal",
      "Pembuat Surat",
      "Penginput Data"
    ];

    const csvRows = [
      headers.join(","),
      ...filteredData.map((item) => {
        return [
          item.id,
          escapeCsv(item.nomorSurat),
          escapeCsv(item.tanggalKeluar),
          escapeCsv(item.perihal),
          escapeCsv(item.pembuatSurat),
          escapeCsv(item.created_by)
        ].join(",");
      })
    ];

    const csvContent = "\uFEFF" + csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Rekap_Surat_Keluar_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const printReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Title & Actions Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-800">Buku Agenda Surat Keluar</h1>
          <p className="text-xs text-slate-500 mt-0.5">Kelola seluruh nomor registrasi, perihal, guru pembuat, dan file berkas surat keluar resmi.</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={exportToExcel}
            className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 hover:border-slate-300 bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-xl transition-all cursor-pointer"
          >
            <Download className="h-4 w-4 text-slate-500" /> Excel
          </button>
          <button
            onClick={printReport}
            className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 hover:border-slate-300 bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-xl transition-all cursor-pointer"
          >
            <Printer className="h-4 w-4 text-slate-500" /> Cetak
          </button>
          <button
            onClick={() => { resetForm(); setIsNewModalOpen(true); }}
            className="flex items-center gap-1.5 px-4 py-2 bg-madrasah-700 hover:bg-madrasah-800 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
          >
            <PlusCircle className="h-4 w-4" /> Input Agenda
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Box */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari perihal atau nomor surat keluar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 focus:border-madrasah-500 focus:ring-1 focus:ring-madrasah-500 rounded-xl text-sm transition-all bg-slate-50/50"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Start Date */}
            <div className="flex items-center gap-2 border border-slate-200 bg-slate-50/50 px-3 py-1.5 rounded-xl text-xs text-slate-600">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              <span>Dari:</span>
              <input
                type="date"
                value={filterStartDate}
                onChange={(e) => setFilterStartDate(e.target.value)}
                className="bg-transparent border-none focus:outline-none focus:ring-0 p-0 text-slate-700"
              />
            </div>

            {/* End Date */}
            <div className="flex items-center gap-2 border border-slate-200 bg-slate-50/50 px-3 py-1.5 rounded-xl text-xs text-slate-600">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              <span>Smp:</span>
              <input
                type="date"
                value={filterEndDate}
                onChange={(e) => setFilterEndDate(e.target.value)}
                className="bg-transparent border-none focus:outline-none focus:ring-0 p-0 text-slate-700"
              />
            </div>

            {/* Creator Dropdown */}
            <select
              value={filterMaker}
              onChange={(e) => setFilterMaker(e.target.value)}
              className="border border-slate-200 bg-slate-50/50 px-3 py-1.5 rounded-xl text-xs text-slate-600 focus:outline-none max-w-[180px]"
            >
              <option value="">Semua Guru Pembuat</option>
              {teachers.map((t, idx) => (
                <option key={idx} value={t}>{t.split(" (")[0]}</option>
              ))}
            </select>

            {/* Reset Button */}
            {(searchQuery || filterStartDate || filterEndDate || filterMaker) && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setFilterStartDate("");
                  setFilterEndDate("");
                  setFilterMaker("");
                }}
                className="text-xs text-red-500 hover:text-red-600 font-medium flex items-center gap-1 cursor-pointer"
              >
                Clear <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
        {loading ? (
          <TableSkeleton rows={5} />
        ) : paginatedData.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <FileText className="h-12 w-12 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-medium">Tidak ada data agenda surat keluar yang cocok</p>
            <p className="text-xs text-slate-400 mt-1">Gunakan kata kunci atau filter penanggalan yang berbeda.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase border-b border-slate-100">
                  <th className="px-5 py-4">Nomor Agenda Surat</th>
                  <th className="px-5 py-4">Tanggal Keluar</th>
                  <th className="px-5 py-4">Perihal / Isi Surat</th>
                  <th className="px-5 py-4">Pembuat Surat (Akuntabilitas)</th>
                  <th className="px-5 py-4 text-center">Aksi Berantai</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
                {paginatedData.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-all">
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-xl inline-block">
                        No: {item.nomorSurat}
                      </div>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap font-semibold text-slate-800">
                      {new Date(item.tanggalKeluar).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric"
                      })}
                    </td>
                    <td className="px-5 py-4 max-w-[280px]">
                      <div className="font-medium text-slate-700 leading-snug line-clamp-2">{item.perihal}</div>
                    </td>
                    <td className="px-5 py-4 text-slate-500 whitespace-nowrap font-medium">
                      {item.pembuatSurat.split(" (")[0]}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Lihat file */}
                        {item.fileUrl ? (
                          <a
                            href={item.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 hover:bg-slate-100 text-emerald-700 hover:text-emerald-800 rounded-lg transition-colors cursor-pointer"
                            title="Lihat Berkas"
                            aria-label="Lihat Berkas"
                          >
                            <ExternalLink className="h-4.5 w-4.5" />
                          </a>
                        ) : (
                          <span className="p-1.5 text-slate-300 cursor-not-allowed" title="Berkas belum diunggah">-</span>
                        )}

                        {/* Download berkas */}
                        <button
                          onClick={() => { if (item.fileUrl) window.open(item.fileUrl, '_blank'); }}
                          disabled={!item.fileUrl}
                          className={`p-1.5 rounded-lg transition-colors ${
                            item.fileUrl
                              ? 'hover:bg-slate-100 text-blue-700 hover:text-blue-800 cursor-pointer'
                              : 'text-slate-300 cursor-not-allowed'
                          }`}
                          title={item.fileUrl ? 'Download Berkas' : 'Tidak ada berkas'}
                          aria-label="Download Berkas"
                        >
                          <Download className="h-4.5 w-4.5" />
                        </button>

                        {/* Edit data */}
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-1.5 hover:bg-slate-100 text-slate-600 hover:text-slate-800 rounded-lg transition-colors cursor-pointer"
                          title="Edit Data"
                          aria-label="Edit Data"
                        >
                          <Edit2 className="h-4.5 w-4.5" />
                        </button>

                        {/* Hapus data */}
                        <button
                          onClick={() => setConfirmDeleteId(item.id)}
                          className="p-1.5 hover:bg-red-50 text-red-600 hover:text-red-700 rounded-lg transition-colors cursor-pointer"
                          title="Hapus Data"
                          aria-label="Hapus Data"
                        >
                          <Trash2 className="h-4.5 w-4.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && paginatedData.length > 0 && (
        <Pagination
          currentPage={safePage}
          totalPages={totalPages}
          totalItems={filteredData.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setCurrentPage}
        />
      )}

      {/* PRINT-ONLY REPORT */}
      <div className="hidden print-only p-8 bg-white text-black text-sm font-sans">
        <div className="text-center space-y-2 border-b-2 border-double border-black pb-4 mb-6">
          <h2 className="text-xl font-bold uppercase tracking-wider">YAYASAN PENDIDIKAN ISLAMIYAH TANJUNGREJO</h2>
          <h1 className="text-2xl font-black uppercase">MIS ISLAMIYAH TANJUNGREJO</h1>
          <p className="text-xs">Alamat: Jl. KH. Wahid Hasyim No. 12, Tanjungrejo, Kabupaten Jember</p>
          <h3 className="text-base font-bold underline uppercase mt-4">BUKU AGENDA LAPORAN SURAT KELUAR</h3>
        </div>
        <div className="flex justify-between mb-4 text-xs font-semibold">
          <div>Tanggal Cetak: {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</div>
          <div>Filter: {filterMaker ? `Pembuat: ${filterMaker}` : "Semua Pembuat"}</div>
        </div>
        <table className="w-full border-collapse border border-slate-800 text-xs">
          <thead>
            <tr>
              <th className="border border-slate-800 p-2">No</th>
              <th className="border border-slate-800 p-2">Nomor Surat</th>
              <th className="border border-slate-800 p-2">Tanggal Keluar</th>
              <th className="border border-slate-800 p-2">Perihal</th>
              <th className="border border-slate-800 p-2">Pembuat Surat</th>
              <th className="border border-slate-800 p-2">Penginput</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item, index) => (
              <tr key={item.id}>
                <td className="border border-slate-800 p-2 text-center">{index + 1}</td>
                <td className="border border-slate-800 p-2 font-bold">{item.nomorSurat}</td>
                <td className="border border-slate-800 p-2">{item.tanggalKeluar}</td>
                <td className="border border-slate-800 p-2">{item.perihal}</td>
                <td className="border border-slate-800 p-2">{item.pembuatSurat.split(" (")[0]}</td>
                <td className="border border-slate-800 p-2">{item.created_by.split(" (")[0]}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-12 flex justify-end text-center">
          <div className="w-64 space-y-16">
            <div>
              <p>Mengetahui,</p>
              <p className="font-bold">Kepala Madrasah</p>
            </div>
            <div>
              <p className="font-bold underline">KUNIN ERNI MUZAUWIDAH S.Ag</p>
              <p>NIP. -</p>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: INPUT AGENDA SURAT KELUAR */}
      {isNewModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50" role="dialog" aria-modal="true" aria-labelledby="modal-keluar-input-title">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 id="modal-keluar-input-title" className="font-display font-bold text-slate-800">Arsip Agenda Surat Keluar Baru</h3>
              <button onClick={() => setIsNewModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Nomor Surat Keluar */}
                <div className="space-y-1 col-span-2 sm:col-span-1">
                  <label className="text-xs font-bold text-slate-700">Nomor Surat <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 045/MIS.ISL/TR/VI/2026"
                    value={formNomor}
                    onChange={(e) => setFormNomor(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 focus:border-madrasah-500 focus:ring-1 focus:ring-madrasah-500 rounded-xl text-sm font-semibold text-emerald-800"
                  />
                  <p className="text-[10px] text-slate-400">Guru menginput MANUAL nomor agenda asli.</p>
                </div>

                {/* Tanggal Keluar */}
                <div className="space-y-1 col-span-2 sm:col-span-1">
                  <label className="text-xs font-bold text-slate-700">Tanggal Keluar <span className="text-red-500">*</span></label>
                  <input
                    type="date"
                    required
                    value={formTanggal}
                    onChange={(e) => setFormTanggal(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 focus:border-madrasah-500 focus:ring-1 focus:ring-madrasah-500 rounded-xl text-sm"
                  />
                </div>
              </div>

              {/* Perihal */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Perihal / Isi Ringkas Surat Keluar <span className="text-red-500">*</span></label>
                <textarea
                  required
                  rows={3}
                  placeholder="Ringkasan isi / perihal surat keluar..."
                  value={formPerihal}
                  onChange={(e) => setFormPerihal(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 focus:border-madrasah-500 focus:ring-1 focus:ring-madrasah-500 rounded-xl text-sm"
                />
              </div>

              {/* Pembuat Surat / Dropdown Guru */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-700">Guru Pembuat Surat <span className="text-red-500">*</span></label>
                  <button 
                    type="button" 
                    onClick={() => {
                      setIsPembuatManual(!isPembuatManual);
                      setFormPembuat("");
                    }}
                    className="text-[11px] text-madrasah-700 hover:underline font-bold"
                  >
                    {isPembuatManual ? "Pilih dari Daftar" : "Ketik Manual"}
                  </button>
                </div>
                {isPembuatManual ? (
                  <input
                    type="text"
                    required
                    placeholder="Ketik nama pembuat..."
                    value={formPembuat}
                    onChange={(e) => setFormPembuat(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 focus:border-madrasah-500 focus:ring-1 focus:ring-madrasah-500 rounded-xl text-sm"
                  />
                ) : (
                  <select
                    value={formPembuat}
                    onChange={(e) => setFormPembuat(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 focus:border-madrasah-500 focus:ring-1 focus:ring-madrasah-500 rounded-xl text-sm"
                  >
                    {teachers.map((t, idx) => (
                      <option key={idx} value={t}>{t}</option>
                    ))}
                  </select>
                )}
              </div>

              {/* File Upload with Auto-Compress */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Unggah Berkas Scan yang Sudah Ditandatangani</label>
                <div className="flex gap-3 items-center">
                  <label className="flex items-center gap-2 px-4 py-2 border border-dashed border-slate-300 hover:border-madrasah-500 rounded-xl text-xs font-bold text-slate-600 hover:text-madrasah-700 cursor-pointer transition-all">
                    <Upload className="h-4 w-4" />
                    <span>Pilih Berkas / Scan HP</span>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                  <div className="text-xs text-slate-400">
                    {uploading ? (
                      <span className="text-yellow-600 font-medium animate-pulse">Mengompres & mengunggah...</span>
                    ) : formFileName ? (
                      <span className="text-emerald-700 font-semibold truncate max-w-[200px]">✓ {formFileName}</span>
                    ) : (
                      <span>Foto HP otomatis dikompres ke &lt;3MB</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting || uploading}
                  className="px-4 py-2 bg-madrasah-700 hover:bg-madrasah-800 text-white text-xs font-bold rounded-xl shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? "Menyimpan..." : "Simpan Agenda"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      <ConfirmModal
        isOpen={confirmDeleteId !== null}
        title="Hapus Arsip Surat Keluar"
        message="Apakah Anda yakin ingin menghapus arsip surat keluar ini secara permanen? Tindakan ini tidak dapat dibatalkan."
        confirmLabel="Hapus"
        variant="danger"
        onConfirm={() => {
          if (confirmDeleteId) handleDelete(confirmDeleteId);
          setConfirmDeleteId(null);
        }}
        onCancel={() => setConfirmDeleteId(null)}
      />

      {/* MODAL: EDIT AGENDA SURAT KELUAR */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50" role="dialog" aria-modal="true" aria-labelledby="modal-keluar-edit-title">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 id="modal-keluar-edit-title" className="font-display font-bold text-slate-800">Koreksi Agenda Surat Keluar</h3>
              <button onClick={() => { setIsEditModalOpen(false); setSelectedItem(null); }} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleEdit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Nomor Surat Keluar */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Nomor Surat <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={formNomor}
                    onChange={(e) => setFormNomor(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 focus:border-madrasah-500 focus:ring-1 focus:ring-madrasah-500 rounded-xl text-sm font-semibold text-emerald-800"
                  />
                </div>

                {/* Tanggal Keluar */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Tanggal Keluar <span className="text-red-500">*</span></label>
                  <input
                    type="date"
                    required
                    value={formTanggal}
                    onChange={(e) => setFormTanggal(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 focus:border-madrasah-500 focus:ring-1 focus:ring-madrasah-500 rounded-xl text-sm"
                  />
                </div>
              </div>

              {/* Perihal */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Perihal / Isi Ringkas Surat Keluar <span className="text-red-500">*</span></label>
                <textarea
                  required
                  rows={3}
                  value={formPerihal}
                  onChange={(e) => setFormPerihal(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 focus:border-madrasah-500 focus:ring-1 focus:ring-madrasah-500 rounded-xl text-sm"
                />
              </div>

              {/* Pembuat Surat / Dropdown Guru */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-700">Guru Pembuat Surat <span className="text-red-500">*</span></label>
                  <button 
                    type="button" 
                    onClick={() => {
                      setIsPembuatManual(!isPembuatManual);
                      setFormPembuat("");
                    }}
                    className="text-[11px] text-madrasah-700 hover:underline font-bold"
                  >
                    {isPembuatManual ? "Pilih dari Daftar" : "Ketik Manual"}
                  </button>
                </div>
                {isPembuatManual ? (
                  <input
                    type="text"
                    required
                    placeholder="Ketik nama pembuat..."
                    value={formPembuat}
                    onChange={(e) => setFormPembuat(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 focus:border-madrasah-500 focus:ring-1 focus:ring-madrasah-500 rounded-xl text-sm"
                  />
                ) : (
                  <select
                    value={formPembuat}
                    onChange={(e) => setFormPembuat(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 focus:border-madrasah-500 focus:ring-1 focus:ring-madrasah-500 rounded-xl text-sm"
                  >
                    {teachers.map((t, idx) => (
                      <option key={idx} value={t}>{t}</option>
                    ))}
                  </select>
                )}
              </div>

              {/* File Upload */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Ubah Berkas Scan</label>
                <div className="flex gap-3 items-center">
                  <label className="flex items-center gap-2 px-4 py-2 border border-dashed border-slate-300 hover:border-madrasah-500 rounded-xl text-xs font-bold text-slate-600 hover:text-madrasah-700 cursor-pointer transition-all">
                    <Upload className="h-4 w-4" />
                    <span>Ganti Berkas</span>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                  <div className="text-xs text-slate-400 truncate max-w-[200px]">
                    {uploading ? (
                      <span className="text-yellow-600 animate-pulse">Mengunggah...</span>
                    ) : formFileName ? (
                      <span>✓ {formFileName}</span>
                    ) : (
                      <span>Berkas lama dipertahankan</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => { setIsEditModalOpen(false); setSelectedItem(null); }}
                  className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting || uploading}
                  className="px-4 py-2 bg-madrasah-700 hover:bg-madrasah-800 text-white text-xs font-bold rounded-xl shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
