import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;

// Support both the legacy anon key name and the newer publishable key name
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

/**
 * Browser-safe Supabase client using the anon / publishable key.
 * Use this in Client Components and browser contexts.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
