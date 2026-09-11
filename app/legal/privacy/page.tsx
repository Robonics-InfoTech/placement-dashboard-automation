import Link from "next/link";

export const metadata = {
  title: "Privacy Policy — PlacementHub",
  description: "How PlacementHub collects, uses, stores, and protects your personal data.",
};

export default function PrivacyPage() {
  const updated = "September 11, 2026";

  const section = (title: string, body: React.ReactNode) => (
    <section style={{ marginBottom: 32 }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", marginBottom: 12 }}>{title}</h2>
      <div style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.8 }}>{body}</div>
    </section>
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-secondary)", padding: "40px 20px" }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <div style={{ marginBottom: 36 }}>
          <Link href="/" style={{ fontSize: 13, color: "var(--accent-text)", textDecoration: "none", fontWeight: 600 }}>← Back to PlacementHub</Link>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--text-primary)", margin: "16px 0 6px" }}>Privacy Policy</h1>
          <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Last updated: {updated}</p>
        </div>

        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)", borderRadius: "var(--radius-xl)", padding: "36px 40px" }}>
          <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.8, marginBottom: 32 }}>
            <strong>PlacementHub</strong> ("we", "us", "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, store, share, and protect your personal information when you use our platform. By registering, you consent to the practices described here.
          </p>

          {section("1. Data We Collect", (
            <ul style={{ paddingLeft: 20 }}>
              <li><strong>Identity data:</strong> Full name, email address, phone number, profile photo.</li>
              <li><strong>Academic data (students):</strong> Institution, branch, batch year, CGPA, enrollment number, placement status.</li>
              <li><strong>Professional data (employers):</strong> Company name, industry, HR contact name, website, logo.</li>
              <li><strong>Application data:</strong> Job applications, interview records, offer letters, offer acceptance.</li>
              <li><strong>Document data:</strong> Uploaded resumes, marksheets, and certificates (stored securely in Supabase Storage).</li>
              <li><strong>Usage data:</strong> Pages visited, features used, device type, browser, IP address (anonymized).</li>
              <li><strong>Cookie data:</strong> Session tokens, theme preferences, cookie consent preference.</li>
            </ul>
          ))}

          {section("2. How We Use Your Data", (
            <ul style={{ paddingLeft: 20 }}>
              <li>To create and manage your account.</li>
              <li>To match students with relevant placement opportunities.</li>
              <li>To allow employers to review eligible student profiles.</li>
              <li>To send transactional notifications (application updates, offer alerts).</li>
              <li>To generate anonymized placement analytics for institutions.</li>
              <li>To improve platform features and fix issues.</li>
              <li>To comply with legal obligations.</li>
            </ul>
          ))}

          {section("3. Data Sharing", (
            <>
              <p>We do <strong>not</strong> sell your personal data. We may share data with:</p>
              <ul style={{ paddingLeft: 20, marginTop: 8 }}>
                <li><strong>Your institution (college admins):</strong> Aggregate placement statistics and student profiles (if you are a registered student of that institution).</li>
                <li><strong>Employers (for job applications):</strong> Only the information you explicitly submit in an application.</li>
                <li><strong>Service providers:</strong> Supabase (database &amp; auth), Cloudinary (media storage), email service providers — bound by data processing agreements.</li>
                <li><strong>Legal authorities:</strong> When required by law or valid legal process.</li>
              </ul>
            </>
          ))}

          {section("4. Data Retention", (
            <ul style={{ paddingLeft: 20 }}>
              <li>Active account data is retained for the duration of your account.</li>
              <li>After account deletion, personal data is purged within 30 days, except where required by law.</li>
              <li>Anonymized placement statistics may be retained indefinitely.</li>
              <li>Uploaded documents are deleted from storage within 30 days of account deletion.</li>
            </ul>
          ))}

          {section("5. Cookies", (
            <>
              <p>We use the following types of cookies:</p>
              <ul style={{ paddingLeft: 20, marginTop: 8 }}>
                <li><strong>Necessary cookies:</strong> Authentication session tokens (required for login to work).</li>
                <li><strong>Preference cookies:</strong> Theme (light/dark mode) stored in localStorage.</li>
                <li><strong>Analytics cookies:</strong> Anonymous usage statistics (only if you consent).</li>
              </ul>
              <p style={{ marginTop: 8 }}>You can manage cookie preferences via the banner shown on your first visit. Revoking consent will disable non-essential cookies on your next page load.</p>
            </>
          ))}

          {section("6. Your Rights", (
            <ul style={{ paddingLeft: 20 }}>
              <li><strong>Access:</strong> Request a copy of the personal data we hold about you.</li>
              <li><strong>Correction:</strong> Update inaccurate data via your profile settings.</li>
              <li><strong>Deletion:</strong> Request account and data deletion by emailing <a href="mailto:privacy@placementhub.in" style={{ color: "var(--accent-text)" }}>privacy@placementhub.in</a>.</li>
              <li><strong>Portability:</strong> Request your data in machine-readable format via the "My Data Export" feature (coming soon).</li>
              <li><strong>Objection:</strong> Object to processing of your data for analytics or marketing.</li>
            </ul>
          ))}

          {section("7. Security", (
            <p>We implement industry-standard security measures including encrypted database storage (Supabase with row-level security), HTTPS-only access, bcrypt password hashing via Supabase Auth, and regular security reviews. No system is 100% secure — please use a strong password and report any suspected breach to <a href="mailto:security@placementhub.in" style={{ color: "var(--accent-text)" }}>security@placementhub.in</a>.</p>
          ))}

          {section("8. Third-Party Services", (
            <p>PlacementHub uses Supabase (database, auth, storage), Cloudinary (media), and Google Fonts (typography). Each service has its own privacy policy. We recommend reviewing them.</p>
          ))}

          {section("9. Changes to This Policy", (
            <p>We may update this Privacy Policy. Significant changes will be notified via email or in-app banner. Continued use of the Platform after changes constitutes acceptance.</p>
          ))}

          {section("10. Contact", (
            <p>For privacy-related inquiries, contact our Data Protection Officer at <a href="mailto:privacy@placementhub.in" style={{ color: "var(--accent-text)" }}>privacy@placementhub.in</a> or write to: PlacementHub, Bangalore, Karnataka, India.</p>
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: 24, fontSize: 13, color: "var(--text-muted)" }}>
          <Link href="/legal/terms" style={{ color: "var(--accent-text)", textDecoration: "none", marginRight: 20 }}>Terms &amp; Conditions</Link>
          <Link href="/auth/signup" style={{ color: "var(--accent-text)", textDecoration: "none" }}>Create Account</Link>
        </div>
      </div>
    </div>
  );
}
