import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { isDevMode, devSupabase } from "./devDb";

let _supabase: SupabaseClient | null = null;
let _supabaseAdmin: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (!_supabase) {
    _supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return _supabase;
}

function getAdminClient(): SupabaseClient {
  if (isDevMode()) return devSupabase();
  if (!_supabaseAdmin) {
    _supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }
  return _supabaseAdmin;
}

export function supabase(): SupabaseClient {
  return getClient();
}

export function supabaseAdmin(): SupabaseClient {
  return getAdminClient();
}
