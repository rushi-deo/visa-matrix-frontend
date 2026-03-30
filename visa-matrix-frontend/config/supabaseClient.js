import { fileURLToPath } from "node:url";
import { config as loadEnv } from "dotenv";
import { createClient } from "@supabase/supabase-js";

loadEnv({
  path: fileURLToPath(new URL("../.env", import.meta.url)),
  override: false,
  quiet: true,
});

const SUPABASE_URL = process.env.SUPABASE_URL?.trim();
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY?.trim();

const maskSensitiveValue = (value, visibleStart = 6, visibleEnd = 4) => {
  if (!value) {
    return null;
  }

  if (value.length <= visibleStart + visibleEnd) {
    return `${value.slice(0, 2)}***`;
  }

  return `${value.slice(0, visibleStart)}...${value.slice(-visibleEnd)}`;
};

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

export const getSupabaseConfigStatus = () => ({
  status: isSupabaseConfigured ? "configured" : "missing_env",
  url: maskSensitiveValue(SUPABASE_URL),
  anonKey: maskSensitiveValue(SUPABASE_ANON_KEY),
});

if (isSupabaseConfigured) {
  console.info("[Supabase] Client configured.", getSupabaseConfigStatus());
} else {
  console.warn("[Supabase] Missing SUPABASE_URL or SUPABASE_ANON_KEY.", getSupabaseConfigStatus());
}

export const supabase = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;
