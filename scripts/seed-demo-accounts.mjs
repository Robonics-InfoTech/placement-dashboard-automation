/**
 * scripts/seed-demo-accounts.mjs
 *
 * Creates all demo auth users in Supabase Auth (with email auto-confirmed),
 * then inserts the public schema profile rows for each.
 *
 * Usage:
 *   node scripts/seed-demo-accounts.mjs
 *
 * Requires: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

// ── Load .env.local ───────────────────────────────────────────────────────────
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "../.env.local");
const envVars = Object.fromEntries(
  readFileSync(envPath, "utf-8")
    .split("\n")
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => {
      const [k, ...v] = l.split("=");
      return [k.trim(), v.join("=").trim()];
    })
);

const SUPABASE_URL = envVars["NEXT_PUBLIC_SUPABASE_URL"];
const SERVICE_KEY  = envVars["SUPABASE_SERVICE_ROLE_KEY"];

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("❌  Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const DEMO_COLLEGE_ID = "00000000-0000-0000-0000-000000000001";
const PASSWORD        = "Demo@1234";

// ── Demo account definitions ──────────────────────────────────────────────────
const ACCOUNTS = [
  {
    email: "arjun@demo.placementhub.in",
    role: "student",
    profile: async (uid) => {
      await upsert("users", {
        id: uid, email: "arjun@demo.placementhub.in",
        full_name: "Arjun Kumar", role: "student",
        college_id: DEMO_COLLEGE_ID, is_active: true,
      });
      await upsert("student_profiles", {
        user_id: uid, college_id: DEMO_COLLEGE_ID,
        enrollment_number: "DIT2021CSE001",
        branch: "CSE", course: "B.Tech",
        graduation_year: 2025, cgpa: 8.5,
        full_name: "Arjun Kumar", placement_status: "eligible",
      });
    },
  },
  {
    email: "sneha@demo.placementhub.in",
    role: "student",
    profile: async (uid) => {
      await upsert("users", {
        id: uid, email: "sneha@demo.placementhub.in",
        full_name: "Sneha Sharma", role: "student",
        college_id: DEMO_COLLEGE_ID, is_active: true,
      });
      await upsert("student_profiles", {
        user_id: uid, college_id: DEMO_COLLEGE_ID,
        enrollment_number: "DIT2021ECE001",
        branch: "ECE", course: "B.Tech",
        graduation_year: 2025, cgpa: 8.1,
        full_name: "Sneha Sharma", placement_status: "eligible",
      });
    },
  },
  {
    email: "priya@demo.placementhub.in",
    role: "alumni",
    profile: async (uid) => {
      await upsert("users", {
        id: uid, email: "priya@demo.placementhub.in",
        full_name: "Priya Nair", role: "alumni",
        college_id: DEMO_COLLEGE_ID, is_active: true,
      });
      await upsert("alumni_profiles", {
        user_id: uid, tenant_id: DEMO_COLLEGE_ID,
        full_name: "Priya Nair", graduation_year: 2023,
        branch: "CSE", course: "B.Tech",
        current_company: "Infosys", current_position: "Software Engineer",
      });
    },
  },
  {
    email: "hr@techcorp.demo",
    role: "employer",
    profile: async (uid) => {
      await upsert("users", {
        id: uid, email: "hr@techcorp.demo",
        full_name: "TechCorp HR", role: "employer", is_active: true,
      });
      await upsert("employer_profiles", {
        user_id: uid, company_name: "TechCorp Solutions",
        industry: "Information Technology",
        website: "https://techcorp.demo",
        company_size: "201-500",
        contact_person: "HR Manager", designation: "HR Manager",
        verified: true, approval_status: "approved",
      });
    },
  },
  {
    email: "admin@iit.demo",
    role: "college_admin",
    profile: async (uid) => {
      await upsert("users", {
        id: uid, email: "admin@iit.demo",
        full_name: "Dr. Rajesh Kumar", role: "college_admin",
        college_id: DEMO_COLLEGE_ID, is_active: true,
      });
      await upsert("college_admin_profiles", {
        user_id: uid, college_id: DEMO_COLLEGE_ID,
        employee_id: "EMP-ADMIN-001",
        designation: "Placement Officer",
        department: "Training & Placement",
      });
    },
  },
  {
    email: "committee@iit.demo",
    role: "placement_committee",
    profile: async (uid) => {
      await upsert("users", {
        id: uid, email: "committee@iit.demo",
        full_name: "Committee Member", role: "placement_committee",
        college_id: DEMO_COLLEGE_ID, is_active: true,
      });
      await upsert("committee_members", {
        user_id: uid, college_id: DEMO_COLLEGE_ID,
        full_name: "Committee Member",
        designation: "Placement Coordinator", is_active: true,
      });
    },
  },
  {
    email: "superadmin@placementhub.in",
    role: "super_admin",
    profile: async (uid) => {
      await upsert("users", {
        id: uid, email: "superadmin@placementhub.in",
        full_name: "Platform Admin", role: "super_admin", is_active: true,
      });
    },
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
async function upsert(table, row) {
  const { error } = await admin.from(table).upsert(row, { onConflict: "id,user_id".split(",")[0] === "id" ? "id" : "user_id" });
  if (error) console.warn(`    ⚠  ${table} upsert:`, error.message);
}

async function ensureDemoCollege() {
  const { error } = await admin.from("colleges").upsert(
    {
      id: DEMO_COLLEGE_ID,
      name: "Demo Institute of Technology",
      code: "DIT-DEMO",
      city: "Bangalore", state: "Karnataka", country: "India",
      status: "active",
    },
    { onConflict: "id" }
  );
  if (error) console.warn("  ⚠  colleges upsert:", error.message);
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log("🌱  Seeding demo accounts...\n");

  await ensureDemoCollege();
  console.log("  ✅  Demo college ensured\n");

  for (const account of ACCOUNTS) {
    process.stdout.write(`  → ${account.email} (${account.role}) ... `);

    // Check if auth user already exists
    const { data: existing } = await admin.auth.admin.listUsers();
    const existingUser = existing?.users?.find((u) => u.email === account.email);

    let uid;
    if (existingUser) {
      uid = existingUser.id;
      process.stdout.write("auth exists, ");
    } else {
      const { data, error } = await admin.auth.admin.createUser({
        email: account.email,
        password: PASSWORD,
        email_confirm: true,
        user_metadata: { role: account.role },
      });
      if (error) {
        console.error(`FAILED (auth): ${error.message}`);
        continue;
      }
      uid = data.user.id;
      process.stdout.write("auth created, ");
    }

    // Insert profile rows
    try {
      await account.profile(uid);
      console.log("profile ✅");
    } catch (err) {
      console.error(`profile FAILED: ${err.message}`);
    }
  }

  console.log("\n✅  Done. All demo accounts are ready.\n");
  console.log("Accounts:");
  for (const a of ACCOUNTS) {
    console.log(`  ${a.role.padEnd(22)} ${a.email}  /  ${PASSWORD}`);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
