"use client";

import PageHeader from "@/components/ui/PageHeader";
import ResumeUploader from "@/components/student/ResumeUploader";
import MarksheetUploader from "@/components/student/MarksheetUploader";
import CertificateUploader from "@/components/student/CertificateUploader";

export default function StudentDocumentsPage() {
  return (
    <div style={{ padding: "0 0 32px" }}>
      <PageHeader
        title="Documents"
        description="Upload and manage your placement documents — resume, marksheets and certificates."
      />
      <div style={{ padding: "20px 28px 0", display: "flex", flexDirection: "column", gap: 20 }}>
        <ResumeUploader />
        <MarksheetUploader />
        <CertificateUploader />
      </div>
    </div>
  );
}