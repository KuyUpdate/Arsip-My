import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";

const DATA_DIR = join(process.cwd(), "data");

function ensureDir() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
}

function readTable(table: string): Record<string, unknown>[] {
  ensureDir();
  const file = join(DATA_DIR, `${table}.json`);
  if (!existsSync(file)) return [];
  return JSON.parse(readFileSync(file, "utf-8"));
}

function writeTable(table: string, data: Record<string, unknown>[]) {
  ensureDir();
  writeFileSync(join(DATA_DIR, `${table}.json`), JSON.stringify(data, null, 2));
}

export function isDevMode(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  return url.includes("placeholder") || url.includes("localhost");
}

function devQuery(table: string) {
  const data = readTable(table);

  function save(rows: Record<string, unknown>[]) {
    writeTable(table, rows);
  }

  return {
    select() {
      return {
        order(_col: string, _opts?: { ascending?: boolean }) {
          return { data: [...data], error: null };
        },
      };
    },
    insert(values: Record<string, unknown>) {
      const newRecord = {
        id: crypto.randomUUID(),
        ...values,
        created_at: new Date().toISOString(),
      };
      data.unshift(newRecord);
      save(data);
      return {
        select() {
          return { single: () => ({ data: newRecord, error: null }) };
        },
      };
    },
    update(updates: Record<string, unknown>) {
      return {
        eq(col: string, val: unknown) {
          const idx = data.findIndex((r) => r[col] === val);
          let updated = null;
          if (idx !== -1) {
            data[idx] = { ...data[idx], ...updates };
            updated = data[idx];
            save(data);
          }
          return {
            select() {
              return {
                single: () => ({
                  data: updated,
                  error: idx === -1 ? { code: "PGRST116", message: "Not found" } : null,
                }),
              };
            },
          };
        },
      };
    },
    delete() {
      return {
        eq(col: string, val: unknown) {
          const filtered = data.filter((r) => r[col] !== val);
          save(filtered);
          return { error: null };
        },
      };
    },
  };
}

export function devSupabase() {
  return {
    from(table: string) {
      return devQuery(table);
    },
    storage: {
      from() {
        return {
          upload: async () => ({ error: null }),
          getPublicUrl: (path: string) => ({ data: { publicUrl: `/uploads/${path}` } }),
          remove: async () => ({ error: null }),
        };
      },
    },
  } as never;
}
