import Link from "next/link";

export const metadata = {
  title: "Terms & Conditions — PlacementHub",
  description: "Read PlacementHub's Terms and Conditions of use.",
};

export default function TermsPage() {
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
        {/* Header */}
        <div style={{ marginBottom: 36 }}>
          <Link href="/" style={{ fontSize: 13, color: "var(--accent-text)", textDecoration: "none", fontWeight: 600 }}>← Back to PlacementHub</Link>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--text-primary)", margin: "16px 0 6px" }}>Terms &amp; Conditions</h1>
          <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Last updated: {updated}</p>
        </div>

        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)", borderRadius: "var(--radius-xl)", padding: "36px 40px" }}>
          <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.8, marginBottom: 32 }}>
            Welcome to <strong>PlacementHub</strong>. By registering for or using our platform, you agree to be bound by these Terms &amp; Conditions. Please read them carefully.
          </p>

          {section("1. Acceptance of Terms", (
            <p>By creating an account, accessing, or using PlacementHub ("Platform"), you agree to these Terms. If you do not agree, you may not use the Platform. These Terms apply to all users including students, alumni, employers, college administrators, and placement committee members.</p>
          ))}

          {section("2. Eligibility", (
            <ul style={{ paddingLeft: 20 }}>
              <li>You must be at least 18 years old to register.</li>
              <li>Students must register using a valid enrollment key provided by their institution.</li>
              <li>Employers must provide accurate company and HR contact information.</li>
              <li>All information provided during registration must be truthful and current.</li>
            </ul>
          ))}

          {section("3. User Accounts", (
            <>
              <p>You are responsible for maintaining the confidentiality of your login credentials. You agree to notify us immediately of any unauthorized access to your account.</p>
              <p style={{ marginTop: 8 }}>Each user may hold only one account per role. Sharing or transferring accounts is prohibited.</p>
            </>
          ))}

          {section("4. Platform Use", (
            <ul style={{ paddingLeft: 20 }}>
              <li>You may not post false, misleading, or fraudulent job listings or placement drives.</li>
              <li>Students may not misrepresent their academic credentials or placement status.</li>
              <li>Employers may not contact students outside of the Platform for unsolicited commercial purposes.</li>
              <li>Scraping, automated access, or reverse-engineering the Platform is strictly prohibited.</li>
            </ul>
          ))}

          {section("5. Data Privacy", (
            <p>Your use of the Platform is also governed by our <Link href="/legal/privacy" style={{ color: "var(--accent-text)", textDecoration: "none", fontWeight: 600 }}>Privacy Policy</Link>, which describes how we collect, store, and use your personal data in compliance with applicable laws.</p>
          ))}

          {section("6. Intellectual Property", (
            <p>All content, trademarks, and software on the Platform are owned by or licensed to PlacementHub. You may not copy, reproduce, or redistribute any part of the Platform without express written permission.</p>
          ))}

          {section("7. Placement Offer Integrity", (
            <ul style={{ paddingLeft: 20 }}>
              <li>Offers extended through the Platform must reflect genuine employment intent.</li>
              <li>Rescinding offers without documented cause may result in employer account suspension.</li>
              <li>Students who accept and renege on offers may face sanctions from their institution.</li>
            </ul>
          ))}

          {section("8. Termination", (
            <p>We reserve the right to suspend or terminate accounts that violate these Terms, engage in fraudulent activity, or harm the integrity of the placement process. College administrators may independently deactivate student accounts.</p>
          ))}

          {section("9. Limitation of Liability", (
            <p>PlacementHub is a facilitating platform and is not responsible for the outcome of employment relationships formed through it. We do not guarantee job offers, placement rates, or hiring timelines.</p>
          ))}

          {section("10. Changes to Terms", (
            <p>We may update these Terms periodically. Continued use of the Platform after changes constitutes acceptance of the revised Terms. Material changes will be communicated via email or in-app notification.</p>
          ))}

          {section("11. Governing Law", (
            <p>These Terms are governed by the laws of India. Disputes shall be resolved through binding arbitration in Bangalore, Karnataka, unless otherwise required by applicable law.</p>
          ))}

          {section("12. Contact", (
            <p>For questions about these Terms, contact us at <a href="mailto:legal@placementhub.in" style={{ color: "var(--accent-text)" }}>legal@placementhub.in</a>.</p>
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: 24, fontSize: 13, color: "var(--text-muted)" }}>
          <Link href="/legal/privacy" style={{ color: "var(--accent-text)", textDecoration: "none", marginRight: 20 }}>Privacy Policy</Link>
          <Link href="/auth/signup" style={{ color: "var(--accent-text)", textDecoration: "none" }}>Create Account</Link>
        </div>
      </div>
    </div>
  );
}
