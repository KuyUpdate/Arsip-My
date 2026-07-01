-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Surat Masuk (Incoming Mail)
CREATE TABLE IF NOT EXISTS surat_masuk (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tanggal_diterima date NOT NULL,
  asal_pengirim text NOT NULL,
  penerima_pertama text NOT NULL DEFAULT '-',
  perihal text NOT NULL,
  nomor_surat text NOT NULL DEFAULT '-',
  file_url text,
  file_name text,
  file_id text,
  disposisi_guru text,
  disposisi_catatan text,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by text NOT NULL
);

-- 2. Surat Keluar (Outgoing Mail)
CREATE TABLE IF NOT EXISTS surat_keluar (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nomor_surat text NOT NULL,
  tanggal_keluar date NOT NULL,
  perihal text NOT NULL,
  pembuat_surat text NOT NULL,
  file_url text,
  file_name text,
  file_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by text NOT NULL
);

-- 3. Teachers (Daftar Guru)
CREATE TABLE IF NOT EXISTS teachers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nama text NOT NULL
);

-- Seed data teachers
INSERT INTO teachers (nama) VALUES
  ('KUNIN ERNI MUZAUWIDAH S.Ag'),
  ('ABDUL AZIZ, S.Pd'),
  ('ANIM BAROROH'),
  ('DUWI CITRA NINGSIH, S.Pd'),
  ('HANIK WAFIROTU NI`AM, S.Pd'),
  ('KHUROTUL A`YUNI S.Pd.I'),
  ('MAULIDA DWI MAHARDIKA, S.Pd'),
  ('MOHAMAD JAENURI S.Pd.I'),
  ('NONOT SUGIANTO'),
  ('SEPTI DIA PERTIWI, S.Pd.'),
  ('SITI NUR HAMIDAH S.Pd.I')
ON CONFLICT DO NOTHING;

-- Enable Row Level Security (aman karena API pake service_role key)
ALTER TABLE surat_masuk ENABLE ROW LEVEL SECURITY;
ALTER TABLE surat_keluar ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
