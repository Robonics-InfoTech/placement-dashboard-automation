import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

/**
 * Browser-safe Supabase client using the anon key.
 * Use this in Client Components and browser contexts.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
