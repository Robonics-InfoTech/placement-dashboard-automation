import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser-safe Supabase client using the anon / publishable key.
 * Uses @supabase/ssr's createBrowserClient so the session is stored in
 * cookies (not just localStorage) — this is required for the middleware
 * to read the session and handle role-based redirects correctly.
 */
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);
