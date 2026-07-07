"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase/client";

/* ─── Types ──────────────────────────────────────────────────────────────── */
type DocType = "resume" | "marksheet" | "certification";
type Document = {
  id: string;
  document_name: string;
  document_type: DocType;
  file_path: string;
  file_size: number | null;
  mime_type: string | null;
  created_at: string;
  is_primary?: boolean;
};

/* ─── Icons ──────────────────────────────────────────────────────────────── */
const IconUpload = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
  </svg>
);
const IconFile = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
  </svg>
);
const IconTrash = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
  </svg>
);
const IconExternalLink = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
  </svg>
);
const IconStar = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);
const IconStarOutline = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);

/* ─── Limits ──────────────────────────────────────────────────────────────── */
const LIMITS: Record<DocType, number> = { resume: 5, marksheet: 3, certification: 5 };
const ACCEPTS: Record<DocType, string> = {
  resume: "application/pdf",
  marksheet: "application/pdf,image/*",
  certification: "application/pdf,image/*",
};
const SECTION_META: Record<DocType, { title: string; icon: string; desc: string; maxFiles: number; badge: string }> = {
  resume: { title: "Resume", icon: "📄", desc: "PDF only · max 5 MB · up to 5 files · mark one as Primary", maxFiles: 1, badge: "PDF only" },
  marksheet: { title: "Academic Marksheets", icon: "🎓", desc: "PDF or image · max 5 MB each · up to 3 files", maxFiles: 3, badge: "PDF / Image" },
  certification: { title: "Certifications", icon: "🏆", desc: "PDF or image · max 5 MB each · up to 5 files", maxFiles: 5, badge: "PDF / Image" },
};

function formatSize(bytes: number | null) {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function timeAgo(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

/* ─── Delete confirm modal ─────────────────────────────────────────────── */
function DeleteModal({ doc, onConfirm, onCancel }: { doc: Document; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.65)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}>
      <div style={{ background: "#0E1629", border: "1px solid rgba(239,68,68,.25)", borderRadius: 16, padding: 28, width: 380, maxWidth: "90vw" }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: "white", marginBottom: 8 }}>Delete Document?</div>
        <div style={{ fontSize: 13, color: "#94A3B8", marginBottom: 20, lineHeight: 1.5 }}>
          <strong style={{ color: "#E2E8F0" }}>{doc.document_name}</strong> will be permanently removed from cloud storage and cannot be recovered.
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onCancel} style={{ flex: 1, padding: "9px 0", borderRadius: 9, border: "1px solid rgba(255,255,255,.1)", background: "transparent", color: "#94A3B8", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
            Cancel
          </button>
          <button onClick={onConfirm} style={{ flex: 1, padding: "9px 0", borderRadius: 9, border: "none", background: "#DC2626", color: "white", cursor: "pointer", fontSize: 13, fontWeight: 700 }}>
            Delete Permanently
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Document card ──────────────────────────────────────────────────────── */
function DocCard({
  doc, docType, onDelete, onSetPrimary, primaryId,
}: {
  doc: Document; docType: DocType; onDelete: (d: Document) => void; onSetPrimary?: (id: string) => void; primaryId?: string;
}) {
  const isPrimary = primaryId === doc.id;
  return (
    <div className="doc-card">
      <div className="doc-icon" style={{ color: docType === "resume" ? "#6366F1" : docType === "marksheet" ? "#10B981" : "#F59E0B" }}>
        <IconFile />
      </div>
      <div className="doc-info">
        <div className="doc-name">{doc.document_name}</div>
        <div className="doc-meta">
          <span>{formatSize(doc.file_size)}</span>
          <span>·</span>
          <span>Uploaded {timeAgo(doc.created_at)}</span>
          {doc.mime_type && <><span>·</span><span>{doc.mime_type.split("/")[1]?.toUpperCase()}</span></>}
        </div>
      </div>
      <div className="doc-actions">
        {docType === "resume" && onSetPrimary && (
          <button
            className={`doc-primary-btn${isPrimary ? " active" : ""}`}
            onClick={() => onSetPrimary(doc.id)}
            title={isPrimary ? "Primary resume" : "Set as primary"}
          >
            {isPrimary ? <IconStar /> : <IconStarOutline />}
            {isPrimary ? "Primary" : "Set Primary"}
          </button>
        )}
        <a href={doc.file_path} target="_blank" rel="noopener noreferrer" className="doc-action-btn preview" title="Preview">
          <IconExternalLink /> Preview
        </a>
        <button className="doc-action-btn delete" onClick={() => onDelete(doc)} title="Delete">
          <IconTrash />
        </button>
      </div>
    </div>
  );
}

/* ─── Upload zone ────────────────────────────────────────────────────────── */
function UploadZone({ docType, onUpload, count, maxFiles, uploading }: {
  docType: DocType; onUpload: (file: File) => void; count: number; maxFiles: number; uploading: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  const full = count >= maxFiles;

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDrag(false);
    if (!full && e.dataTransfer.files[0]) onUpload(e.dataTransfer.files[0]);
  };

  return (
    <div
      className={`upload-zone${drag ? " drag" : ""}${full ? " disabled" : ""}`}
      onDragOver={(e) => { e.preventDefault(); if (!full) setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={handleDrop}
      onClick={() => !full && inputRef.current?.click()}
    >
      {uploading ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", border: "3px solid rgba(99,102,241,.2)", borderTopColor: "#6366F1", animation: "spin 0.8s linear infinite" }} />
          <span style={{ fontSize: 13, color: "#94A3B8" }}>Uploading…</span>
        </div>
      ) : full ? (
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>✅</div>
          <div style={{ fontSize: 13, color: "#64748B" }}>Maximum files reached ({maxFiles})</div>
        </div>
      ) : (
        <div style={{ textAlign: "center" }}>
          <div style={{ marginBottom: 10, opacity: .5 }}><IconUpload /></div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#94A3B8" }}>
            Drop file here or <span style={{ color: "#818CF8", textDecoration: "underline" }}>click to browse</span>
          </div>
          <div style={{ fontSize: 11, color: "#475569", marginTop: 5 }}>
            {SECTION_META[docType].badge} · Max 5 MB
          </div>
        </div>
      )}
      <input
        ref={inputRef} type="file" accept={ACCEPTS[docType]} style={{ display: "none" }}
        onChange={(e) => { if (e.target.files?.[0]) onUpload(e.target.files[0]); }}
      />
    </div>
  );
}

/* ─── Main component ─────────────────────────────────────────────────────── */
export default function DocumentsPage() {
  const [docs, setDocs] = useState<Record<DocType, Document[]>>({ resume: [], marksheet: [], certification: [] });
  const [primaryId, setPrimaryId] = useState<string | null>(null);
  const [uploading, setUploading] = useState<Record<DocType, boolean>>({ resume: false, marksheet: false, certification: false });
  const [deleteTarget, setDeleteTarget] = useState<Document | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" } | null>(null);

  const showToast = (msg: string, type: "ok" | "err" = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  /* ── Fetch documents ── */
  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("documents")
        .select("id, document_name, document_type, file_path, file_size, mime_type, created_at")
        .eq("user_id", user.id)
        .in("document_type", ["resume", "marksheet", "certification"])
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

      if (data) {
        const grouped: Record<DocType, Document[]> = { resume: [], marksheet: [], certification: [] };
        data.forEach((d) => {
          if (grouped[d.document_type as DocType]) grouped[d.document_type as DocType].push(d as Document);
        });
        setDocs(grouped);
      }

      // Get primary resume from student_profiles
      const { data: sp } = await supabase
        .from("student_profiles")
        .select("resume_url")
        .eq("user_id", user.id)
        .single();

      if (sp?.resume_url) {
        // find the doc whose file_path matches
        const match = (data ?? []).find((d) => d.file_path === sp.resume_url);
        if (match) setPrimaryId(match.id);
      }

      setLoading(false);
    };
    load();
  }, []);

  /* ── Upload ── */
  const handleUpload = async (file: File, docType: DocType) => {
    const maxMB = 5;
    if (file.size > maxMB * 1024 * 1024) { showToast(`File too large. Max ${maxMB} MB allowed.`, "err"); return; }
    if (docType === "resume" && file.type !== "application/pdf") { showToast("Resume must be a PDF file.", "err"); return; }

    setUploading((u) => ({ ...u, [docType]: true }));
    const fd = new FormData();
    fd.append("file", file);
    fd.append("doc_type", docType);

    try {
      const res = await fetch("/api/student/documents", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Upload failed");
      setDocs((d) => ({ ...d, [docType]: [json.doc, ...d[docType]] }));
      showToast("Document uploaded successfully!");
    } catch (e) {
      showToast((e as Error).message, "err");
    }
    setUploading((u) => ({ ...u, [docType]: false }));
  };

  /* ── Delete ── */
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/student/documents?id=${deleteTarget.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      const docType = deleteTarget.document_type;
      setDocs((d) => ({ ...d, [docType]: d[docType].filter((x) => x.id !== deleteTarget.id) }));
      if (primaryId === deleteTarget.id) setPrimaryId(null);
      showToast("Document deleted.");
    } catch {
      showToast("Failed to delete document.", "err");
    }
    setDeleting(false);
    setDeleteTarget(null);
  };

  /* ── Set primary ── */
  const handleSetPrimary = async (docId: string) => {
    const doc = docs.resume.find((d) => d.id === docId);
    if (!doc) return;
    setPrimaryId(docId);
    await fetch("/api/student/documents", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ doc_id: docId, file_path: doc.file_path }),
    });
    showToast("Primary resume updated.");
  };

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
        <div style={{ width: 40, height: 40, borderRadius: "50%", border: "3px solid rgba(99,102,241,.2)", borderTopColor: "#6366F1", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .docs-wrap { padding: 28px 32px; max-width: 900px; margin: 0 auto; }
        .docs-section { margin-bottom: 28px; }
        .docs-section-header {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 14px;
        }
        .docs-section-title {
          display: flex; align-items: center; gap: 10px;
          font-size: 15px; font-weight: 700; color: white;
        }
        .docs-section-badge {
          font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 20px;
          background: rgba(99,102,241,.12); color: #818CF8; border: 1px solid rgba(99,102,241,.2);
        }
        .docs-count { font-size: 12px; color: #64748B; }

        /* ── Upload zone ── */
        .upload-zone {
          border: 2px dashed rgba(99,102,241,.3); border-radius: 14px;
          padding: 28px; cursor: pointer; transition: all .18s;
          display: flex; align-items: center; justify-content: center;
          min-height: 100px; margin-bottom: 14px;
          color: #94A3B8;
        }
        .upload-zone:hover:not(.disabled) { border-color: rgba(99,102,241,.55); background: rgba(99,102,241,.04); }
        .upload-zone.drag { border-color: #6366F1; background: rgba(99,102,241,.08); }
        .upload-zone.disabled { cursor: not-allowed; opacity: .6; border-color: rgba(255,255,255,.1); }

        /* ── Doc card ── */
        .doc-card {
          display: flex; align-items: center; gap: 14px;
          padding: 14px 16px; border-radius: 12px; margin-bottom: 10px;
          background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.07);
          transition: border-color .18s;
        }
        .doc-card:hover { border-color: rgba(255,255,255,.12); }
        .doc-icon { opacity: .8; flex-shrink: 0; }
        .doc-info { flex: 1; min-width: 0; }
        .doc-name { font-size: 13.5px; font-weight: 600; color: #E2E8F0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .doc-meta { font-size: 11px; color: #64748B; margin-top: 3px; display: flex; gap: 6px; flex-wrap: wrap; }
        .doc-actions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; flex-wrap: wrap; }

        .doc-action-btn {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 5px 11px; border-radius: 8px; font-size: 12px; font-weight: 600;
          cursor: pointer; border: none; text-decoration: none; transition: all .18s;
        }
        .doc-action-btn.preview { background: rgba(99,102,241,.1); color: #818CF8; border: 1px solid rgba(99,102,241,.18); }
        .doc-action-btn.preview:hover { background: rgba(99,102,241,.18); }
        .doc-action-btn.delete { background: rgba(239,68,68,.08); color: #F87171; border: 1px solid rgba(239,68,68,.15); }
        .doc-action-btn.delete:hover { background: rgba(239,68,68,.15); }

        .doc-primary-btn {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 5px 11px; border-radius: 8px; font-size: 12px; font-weight: 600;
          cursor: pointer; border: 1px solid rgba(245,158,11,.2); transition: all .18s;
          background: rgba(245,158,11,.08); color: #94A3B8;
        }
        .doc-primary-btn.active { background: rgba(245,158,11,.15); color: #FCD34D; border-color: rgba(245,158,11,.3); }
        .doc-primary-btn:hover:not(.active) { color: #FCD34D; }

        /* ── Desc bar ── */
        .docs-desc {
          font-size: 12px; color: #475569; margin-bottom: 12px;
          padding: 8px 12px; border-radius: 8px; background: rgba(255,255,255,.03);
          border: 1px solid rgba(255,255,255,.05);
        }

        /* ── Toast ── */
        .docs-toast {
          position: fixed; bottom: 28px; right: 28px;
          padding: 12px 20px; border-radius: 12px; font-size: 13px; font-weight: 600;
          z-index: 300; animation: toast-in .25s ease;
          box-shadow: 0 8px 32px rgba(0,0,0,.4);
        }
        .docs-toast.ok  { background: rgba(16,185,129,.15); border: 1px solid rgba(16,185,129,.25); color: #34D399; }
        .docs-toast.err { background: rgba(239,68,68,.12);  border: 1px solid rgba(239,68,68,.25);  color: #F87171; }
        @keyframes toast-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

        @media (max-width: 640px) { .docs-wrap { padding: 16px; } .doc-card { flex-wrap: wrap; } }
      `}</style>

      <div className="docs-wrap">
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "white" }}>My Documents</h1>
          <p style={{ fontSize: 13, color: "#64748B", marginTop: 4 }}>Upload and manage your resume, marksheets and certifications.</p>
        </div>

        {(["resume", "marksheet", "certification"] as DocType[]).map((type) => {
          const meta = SECTION_META[type];
          const list = docs[type];
          return (
            <div className="docs-section" key={type}>
              <div className="docs-section-header">
                <div className="docs-section-title">
                  <span style={{ fontSize: 20 }}>{meta.icon}</span>
                  {meta.title}
                  <span className="docs-section-badge">{meta.badge}</span>
                </div>
                <span className="docs-count">{list.length}/{meta.maxFiles} files</span>
              </div>
              <div className="docs-desc">{meta.desc}</div>

              <UploadZone
                docType={type}
                onUpload={(file) => handleUpload(file, type)}
                count={list.length}
                maxFiles={meta.maxFiles}
                uploading={uploading[type]}
              />

              {list.length === 0 ? (
                <div style={{ textAlign: "center", padding: "16px 0", color: "#475569", fontSize: 13 }}>
                  No {meta.title.toLowerCase()} uploaded yet
                </div>
              ) : (
                list.map((doc) => (
                  <DocCard
                    key={doc.id}
                    doc={doc}
                    docType={type}
                    onDelete={setDeleteTarget}
                    onSetPrimary={type === "resume" ? handleSetPrimary : undefined}
                    primaryId={primaryId ?? undefined}
                  />
                ))
              )}

              {type !== "certification" && (
                <div style={{ height: 1, background: "rgba(255,255,255,.06)", margin: "8px 0 0" }} />
              )}
            </div>
          );
        })}

        {/* Primary resume notice */}
        {docs.resume.length > 0 && !primaryId && (
          <div style={{ padding: "12px 16px", borderRadius: 10, background: "rgba(245,158,11,.08)", border: "1px solid rgba(245,158,11,.2)", fontSize: 13, color: "#FCD34D", marginTop: 8 }}>
            ⚠️ No primary resume set. Set one so it can be auto-submitted with job applications.
          </div>
        )}
      </div>

      {deleteTarget && (
        <DeleteModal
          doc={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {toast && (
        <div className={`docs-toast ${toast.type}`}>{toast.msg}</div>
      )}
    </>
  );
}
