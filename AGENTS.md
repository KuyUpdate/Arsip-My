# My Arsip — AI Studio App (Next.js 15)

## Stack
- Next.js 15 App Router, React 19, TypeScript 5.9, Tailwind CSS 4.1
- **Supabase** (PostgreSQL + Storage via `@supabase/supabase-js`)
- Firebase tools (devDependency, untuk hosting/deploy)

## Commands
- `npm run dev` — dev server
- `npm run build` — production build
- `npm run lint` — ESLint
- `npm run clean` — hapus `.next/` cache
- `npm run start` — start production server
- `npx tsx scripts/seed.ts` — seed Supabase auth user + teachers

## Architecture
- SPA with 4 tabs: Dashboard, Surat Masuk, Surat Keluar, Settings
- **Database**: Supabase PostgreSQL (snake_case columns, mapped to camelCase in API)
- **File storage**: Supabase Storage (bucket `arsip-files`, public)
- **Auth**: Supabase Auth (email `islamiyah@myarsip.sch.id` / `mistaku12345`)
- **Session**: Supabase Auth session (bukan localStorage custom)
- Path alias: `@/*` → project root

## Env Vars
| Var | Where | Required |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Vercel + local `.env` | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Vercel + local `.env` | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Vercel + local `.env` | ✅ |

| `APP_URL` | Vercel + local `.env` | ✅ |

## Key Modules
- `lib/supabase.ts` — lazy-loaded Supabase client (`supabase()` / `supabaseAdmin()`)
- `lib/supabaseStorage.ts` — upload file ke Supabase Storage (`uploadToStorage`)
- `lib/types.ts` — interfaces `SuratMasuk`, `SuratKeluar` + snake→camel mappers
- `lib/components/Toast.tsx` — notifikasi
- `lib/components/ConfirmModal.tsx` — konfirmasi dialog
- `lib/components/Pagination.tsx` — pagination
- `lib/components/TableSkeleton.tsx` — loading skeleton

## Conventions
- `"use client"` di semua komponen interaktif
- Tailwind v4 via `@import "tailwindcss"` di `globals.css`, theme `madrasah-*`
- Font: Inter (sans), Playfair Display (display) via CSS variables
- Print: kelas `.no-print` / `.print-only`
- Tanggal: format `id-ID` locale
- File upload: kompresi gambar client-side ke 1600px / JPEG 80%
- Notifikasi: pakai `useToast()` — jangan pakai `alert()`
- Konfirmasi: pakai `<ConfirmModal>` — jangan pakai `confirm()`
- Modal: `role="dialog" aria-modal="true"` + unique `aria-labelledby`

## Gotchas
- **Supabase client lazy** — `supabase()` / `supabaseAdmin()` dipanggil fungsi, bukan objek, agar build bisa jalan tanpa env vars
- **Snake→camel mapping** — API routes map `snake_case` DB columns → `camelCase` frontend lewat `mapSuratMasuk()` / `mapSuratKeluar()`
- **Tidak ada `/api/auth`** — auth via Supabase client-side (`signInWithPassword` / `signOut`)
- **Tidak ada `data/db.json`** — sudah migrasi penuh ke Supabase
- **`fileId`** — setiap upload menyimpan path file di Supabase Storage
- **Supabase Storage** — bucket `arsip-files`, public; upload via `supabaseAdmin()`
- **Komponen utama >500 baris** — refactor butuh hati-hati
- **`DISABLE_HMR` env** untuk AI Studio — bedakan dengan dev lokal
- **`penerimaPertama` default `"-"`** di form — field ini perlu manual diisi nama guru
