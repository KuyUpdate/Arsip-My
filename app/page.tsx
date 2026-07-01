"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  LayoutDashboard,
  Mail,
  Send,
  Settings,
  LogOut,
  User,
  Lock,
  Menu,
  X,
  Clock
} from "lucide-react";
import { SupabaseClient, createClient } from "@supabase/supabase-js";
import { SuratMasuk, SuratKeluar } from "@/lib/types";
import Dashboard from "@/components/Dashboard";
import SuratMasukModule from "@/components/SuratMasukModule";
import SuratKeluarModule from "@/components/SuratKeluarModule";
import IntegrationSettings from "@/components/IntegrationSettings";

export default function Home() {
  // Auth states
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [user, setUser] = useState<{ email: string; name: string; role: string } | null>(null);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  // Supabase browser client
  const [supabase] = useState<SupabaseClient>(() =>
    createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  );

  // App navigation
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Data states
  const [suratMasukList, setSuratMasukList] = useState<SuratMasuk[]>([]);
  const [suratKeluarList, setSuratKeluarList] = useState<SuratKeluar[]>([]);
  const [teachers, setTeachers] = useState<string[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  // Modal communication states
  const [triggerInputMasuk, setTriggerInputMasuk] = useState(false);
  const [triggerInputKeluar, setTriggerInputKeluar] = useState(false);

  // Clock state
  const [currentTime, setCurrentTime] = useState("");

  // Restore session & listen for auth changes on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser({
          email: session.user.email!,
          name: session.user.user_metadata?.display_name || session.user.email!.split("@")[0],
          role: "Administrator",
        });
        setIsLoggedIn(true);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setUser({
          email: session.user.email!,
          name: session.user.user_metadata?.display_name || session.user.email!.split("@")[0],
          role: "Administrator",
        });
        setIsLoggedIn(true);
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        setIsLoggedIn(false);
      }
    });

    // Tick-tock clock
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false
        }) + " WIB"
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => {
      subscription.unsubscribe();
      clearInterval(interval);
    };
  }, [supabase]);

  // Fetch data from local API
  const fetchData = React.useCallback(async () => {
    if (!isLoggedIn) return;
    try {
      setLoadingData(true);
      
      // Fetch Surat Masuk
      const mas_res = await fetch("/api/surat-masuk");
      const mas_json = await mas_res.json();
      if (mas_json.success) {
        setSuratMasukList(mas_json.data);
      }

      // Fetch Surat Keluar
      const kel_res = await fetch("/api/surat-keluar");
      const kel_json = await kel_res.json();
      if (kel_json.success) {
        setSuratKeluarList(kel_json.data);
      }

      // Hardcoded high-quality list fallback
      setTeachers([
        "KUNIN ERNI MUZAUWIDAH S.Ag",
        "ABDUL AZIZ, S.Pd",
        "ANIM BAROROH",
        "DUWI CITRA NINGSIH, S.Pd",
        "HANIK WAFIROTU NI`AM, S.Pd",
        "KHUROTUL A`YUNI S.Pd.I",
        "MAULIDA DWI MAHARDIKA, S.Pd",
        "MOHAMAD JAENURI S.Pd.I",
        "NONOT SUGIANTO",
        "SEPTI DIA PERTIWI, S.Pd.",
        "SITI NUR HAMIDAH S.Pd.I"
      ]);

    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setLoadingData(false);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn) return;
    const timer = setTimeout(() => {
      fetchData();
    }, 0);
    return () => clearTimeout(timer);
  }, [isLoggedIn, fetchData]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    // Allow username-only login (auto-append domain)
    let email = loginEmail;
    if (!email.includes("@")) {
      email = `${email}@myarsip.sch.id`;
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: loginPassword,
      });

      if (error) {
        // Jika Supabase belum dikonfigurasi, coba dev fallback
        const isDevMode =
          !process.env.NEXT_PUBLIC_SUPABASE_URL ||
          process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder") ||
          process.env.NEXT_PUBLIC_SUPABASE_URL.includes("localhost");
        if (isDevMode && loginPassword === "mistaku12345") {
          setUser({ email, name: "MIS Islamiyah Tanjungrejo", role: "Administrator" });
          setIsLoggedIn(true);
        } else {
          setLoginError("Email atau Password salah");
        }
      }
    } catch (err) {
      // Jaringan error (Supabase tidak reachable) → fallback dev
      if (loginPassword === "mistaku12345") {
        setUser({ email, name: "MIS Islamiyah Tanjungrejo", role: "Administrator" });
        setIsLoggedIn(true);
      } else {
        setLoginError("Koneksi gagal. Gunakan password: mistaku12345");
      }
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setActiveTab("dashboard");
    setSuratMasukList([]);
    setSuratKeluarList([]);
    setTeachers([]);
  };

  // LOGIN PAGE DESIGN (Minimalist Clean White + Madrasah Green Accents)
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-slate-50 font-sans relative overflow-hidden border-8 border-madrasah-700">
        {/* Subtle background graphics */}
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-madrasah-50/50 blur-3xl -z-10" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-madrasah-50/50 blur-3xl -z-10" />

        <div className="w-full max-w-md bg-white border border-slate-100 rounded-3xl p-8 shadow-xs space-y-6">
          {/* School Banner & Logo */}
          <div className="text-center space-y-3">
            <div className="relative w-20 h-20 mx-auto overflow-hidden rounded-full border border-slate-100 shadow-xs">
              <Image
                src="/logo.png"
                alt="MIS Islamiyah Logo"
                fill
                className="object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="space-y-1">
              <h2 className="text-xs font-bold text-madrasah-700 uppercase tracking-widest">Portal Digital Madrasah</h2>
              <h1 className="text-xl md:text-2xl font-display font-bold text-madrasah-700">MIS ISLAMIYAH TANJUNGREJO</h1>
              <p className="text-xs text-slate-400">Aplikasi &quot;My Arsip&quot; - Manajemen Buku Besar Surat Masuk & Keluar</p>
            </div>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {loginError && (
              <div className="bg-red-50 text-red-600 border border-red-100 rounded-xl px-4 py-2.5 text-xs font-semibold text-center">
                {loginError}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Email Akun</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-4.5 w-4.5 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="islamiyah@myarsip.sch.id"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 focus:border-madrasah-500 focus:ring-1 focus:ring-madrasah-500 rounded-xl text-sm transition-all bg-slate-50/50"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Password Akses</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4.5 w-4.5 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="Masukkan password..."
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 focus:border-madrasah-500 focus:ring-1 focus:ring-madrasah-500 rounded-xl text-sm transition-all bg-slate-50/50"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-madrasah-700 hover:bg-madrasah-800 text-white font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
            >
              Masuk ke Aplikasi
            </button>
          </form>

          {/* Account info boxes for extremely smooth previewing */}
          <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4 space-y-2 text-xs text-slate-600">
            <h4 className="font-bold text-emerald-950 flex items-center gap-1">
              🔑 Akun Akses Madrasah:
            </h4>
            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
              <div>Email: <span className="font-bold text-slate-800 bg-white px-1 py-0.5 rounded border border-slate-100">islamiyah@myarsip.sch.id</span></div>
              <div>Password: <span className="font-bold text-slate-800 bg-white px-1 py-0.5 rounded border border-slate-100">mistaku12345</span></div>
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed italic pt-1 border-t border-emerald-100/50">
              *Akses gotong royong: Seluruh guru dan kepala sekolah menggunakan satu akun bersama.
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-8 text-xs text-slate-400 font-medium">
          © 2026 MIS ISLAMIYAH TANJUNGREJO - Semua Hak Cipta Dilindungi
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 text-slate-800 border-8 border-madrasah-700">
      {/* SIDEBAR NAVIGATION (Desktop) */}
      <aside className="no-print hidden md:flex flex-col w-64 bg-slate-50/60 border-r border-slate-100 shrink-0">
        {/* Sidebar Header */}
        <div className="p-6 border-b border-slate-100 space-y-3">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 overflow-hidden rounded-full border-2 border-madrasah-700 shadow-xs">
              <Image
                src="/logo.png"
                alt="MIS Islamiyah Logo"
                fill
                className="object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <h2 className="text-[10px] font-bold text-madrasah-700 uppercase tracking-widest">Arsip Digital</h2>
              <h1 className="text-base font-display font-bold text-madrasah-700">My Arsip</h1>
            </div>
          </div>
          <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold leading-tight">
            MIS Islamiyah Tanjungrejo
          </p>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all cursor-pointer border ${
              activeTab === "dashboard"
                ? "bg-madrasah-700 text-white shadow-xs font-semibold border-madrasah-700"
                : "text-slate-600 hover:bg-white hover:text-slate-900 hover:border-slate-100 border-transparent"
            }`}
          >
            <LayoutDashboard className="h-5 w-5" />
            <span>Dasbor</span>
          </button>

          <button
            onClick={() => setActiveTab("surat-masuk")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all cursor-pointer border ${
              activeTab === "surat-masuk"
                ? "bg-madrasah-700 text-white shadow-xs font-semibold border-madrasah-700"
                : "text-slate-600 hover:bg-white hover:text-slate-900 hover:border-slate-100 border-transparent"
            }`}
          >
            <Mail className="h-5 w-5" />
            <span>Surat Masuk</span>
          </button>

          <button
            onClick={() => setActiveTab("surat-keluar")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all cursor-pointer border ${
              activeTab === "surat-keluar"
                ? "bg-madrasah-700 text-white shadow-xs font-semibold border-madrasah-700"
                : "text-slate-600 hover:bg-white hover:text-slate-900 hover:border-slate-100 border-transparent"
            }`}
          >
            <Send className="h-5 w-5" />
            <span>Surat Keluar</span>
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all cursor-pointer border ${
              activeTab === "settings"
                ? "bg-madrasah-700 text-white shadow-xs font-semibold border-madrasah-700"
                : "text-slate-600 hover:bg-white hover:text-slate-900 hover:border-slate-100 border-transparent"
            }`}
          >
            <Settings className="h-5 w-5" />
            <span>Koneksi Database</span>
          </button>
        </nav>

        {/* Sidebar Footer with Logout & User */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 space-y-3">
          <div className="flex items-center gap-3 px-2">
            <div className="p-1.5 bg-emerald-100 text-emerald-800 rounded-lg">
              <User className="h-4 w-4" />
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-slate-800 truncate">{user?.name}</p>
              <p className="text-[10px] text-slate-400">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
          >
            <LogOut className="h-4 w-4" /> Log Keluar
          </button>
        </div>
      </aside>

      {/* MOBILE HEADER & NAVIGATION */}
      <header className="no-print md:hidden flex items-center justify-between p-4 bg-white border-b border-slate-100 shrink-0">
        <div className="flex items-center gap-2">
          <div className="relative w-8 h-8 overflow-hidden rounded-full border border-slate-100">
            <Image
              src="/logo.png"
              alt="MIS Islamiyah Logo"
              fill
              className="object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <h1 className="text-xs font-display font-black text-slate-800">MIS ISLAMIYAH</h1>
            <p className="text-[10px] text-slate-400">Arsip Digital</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Show short digital clock */}
          <div className="text-[11px] font-mono bg-slate-100 px-2 py-0.5 rounded font-semibold text-slate-600">
            {currentTime.split(" ")[0]}
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-slate-600 hover:bg-slate-50 rounded-lg cursor-pointer"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* MOBILE OVERLAY MENU */}
      {isMobileMenuOpen && (
        <div className="no-print md:hidden fixed inset-0 top-[61px] bg-slate-900/40 backdrop-blur-xs z-40 animate-in fade-in duration-200">
          <div className="bg-white px-4 py-6 border-b border-slate-100 space-y-2 animate-in slide-in-from-top-2 duration-200">
            <button
              onClick={() => { setActiveTab("dashboard"); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold ${
                activeTab === "dashboard" ? "bg-madrasah-50 text-madrasah-800" : "text-slate-600"
              }`}
            >
              <LayoutDashboard className="h-5 w-5" /> Dasbor
            </button>
            <button
              onClick={() => { setActiveTab("surat-masuk"); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold ${
                activeTab === "surat-masuk" ? "bg-madrasah-50 text-madrasah-800" : "text-slate-600"
              }`}
            >
              <Mail className="h-5 w-5" /> Surat Masuk
            </button>
            <button
              onClick={() => { setActiveTab("surat-keluar"); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold ${
                activeTab === "surat-keluar" ? "bg-madrasah-50 text-madrasah-800" : "text-slate-600"
              }`}
            >
              <Send className="h-5 w-5" /> Surat Keluar
            </button>
            <button
              onClick={() => { setActiveTab("settings"); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold ${
                activeTab === "settings" ? "bg-madrasah-50 text-madrasah-800" : "text-slate-600"
              }`}
            >
              <Settings className="h-5 w-5" /> Koneksi Database
            </button>
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <div className="text-xs">
                <p className="font-bold text-slate-800">{user?.name}</p>
                <p className="text-slate-400">{user?.email}</p>
              </div>
              <button
                onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 rounded-lg cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" /> Keluar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        {/* UPPER STATUS BAR (no-print, desktop) */}
        <div className="no-print hidden md:flex items-center justify-end gap-4 mb-6">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
            <Clock className="h-3.5 w-3.5" />
            <span>Jam Madrasah:</span>
            <span className="text-slate-600 font-mono">{currentTime || "Loading..."}</span>
          </div>
          <div className="h-4 w-[1px] bg-slate-200" />
          <div className="text-xs font-semibold text-slate-500 flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            MIS Islamiyah Tanjungrejo
          </div>
        </div>

        {/* MODULE CONDITIONAL RENDERING */}
        <div key={activeTab} className="animate-in fade-in duration-300">
        {activeTab === "dashboard" && (
          <Dashboard
            suratMasuk={suratMasukList}
            suratKeluar={suratKeluarList}
            onNavigate={(tab) => setActiveTab(tab)}
            onOpenInputMasuk={() => { setActiveTab("surat-masuk"); setTriggerInputMasuk(true); }}
            onOpenInputKeluar={() => { setActiveTab("surat-keluar"); setTriggerInputKeluar(true); }}
            currentUser={user?.name || "Guru"}
          />
        )}

        {activeTab === "surat-masuk" && (
          <SuratMasukModule
            data={suratMasukList}
            teachers={teachers}
            onRefresh={fetchData}
            onOpenInputModal={triggerInputMasuk}
            onCloseInputModal={() => setTriggerInputMasuk(false)}
            loading={loadingData}
          />
        )}

        {activeTab === "surat-keluar" && (
          <SuratKeluarModule
            data={suratKeluarList}
            teachers={teachers}
            onRefresh={fetchData}
            onOpenInputModal={triggerInputKeluar}
            onCloseInputModal={() => setTriggerInputKeluar(false)}
            loading={loadingData}
          />
        )}

        {activeTab === "settings" && <IntegrationSettings />}
        </div>
      </main>
    </div>
  );
}
