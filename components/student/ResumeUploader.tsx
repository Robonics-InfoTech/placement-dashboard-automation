"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import {
  getDocuments,
  uploadDocument,
  deleteDocument,
  setPrimaryResume,
} from "@/lib/student/documents";
import {
  uploadFile,
  getFileUrl,
  deleteFile,
} from "@/lib/storage/upload";

type Document = {
  id: string;
  user_id: string;
  document_name: string;
  document_type: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  is_primary: boolean;
};

export default function ResumeUploader() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadDocuments();
  }, []);

  async function loadDocuments() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const docs = await getDocuments(user.id);

    setDocuments(
      docs.filter((doc: any) => doc.document_type === "resume")
    );
  }

  async function handleUpload(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];

    if (!file) return;

    if (file.type !== "application/pdf") {
      alert("Only PDF files are allowed.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Maximum file size is 5MB.");
      return;
    }

    try {
      setUploading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const path = `${user.id}/${Date.now()}-${file.name}`;

      await uploadFile("resumes", path, file);

      await uploadDocument({
        user_id: user.id,
        document_name: file.name,
        document_type: "resume",
        file_path: path,
        file_size: file.size,
        mime_type: file.type,
      });

      await loadDocuments();
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(doc: Document) {
    await deleteFile("resumes", doc.file_path);
    await deleteDocument(doc.id);

    loadDocuments();
  }

  async function handlePrimary(doc: Document) {
    await setPrimaryResume(doc.user_id, doc.id);

    loadDocuments();
  }

  async function handlePreview(path: string) {
    const url = await getFileUrl("resumes", path);

    window.open(url, "_blank");
  }

  return (
    <div className="rounded-2xl border border-slate-700/50 bg-slate-900/70 p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white">
            Resume
          </h2>

          <p className="mt-2 text-slate-400">
            Upload your latest resume (PDF only, max 5MB).
          </p>
        </div>

        <label className="cursor-pointer rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 px-5 py-3 font-medium text-white">
          {uploading ? "Uploading..." : "Upload Resume"}

          <input
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={handleUpload}
          />
        </label>
      </div>

      <div className="space-y-4">
        {documents.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-700 p-8 text-center text-slate-500">
            No resume uploaded yet.
          </div>
        )}

        {documents.map((doc) => (
          <div
            key={doc.id}
            className="flex items-center justify-between rounded-xl border border-slate-700 bg-slate-800/60 p-5"
          >
            <div>
              <h3 className="font-semibold text-white">
                {doc.document_name}
              </h3>

              <p className="mt-1 text-sm text-slate-400">
                {(doc.file_size / 1024).toFixed(1)} KB
              </p>

              {doc.is_primary && (
                <span className="mt-2 inline-block rounded-full bg-green-600/20 px-3 py-1 text-xs text-green-400">
                  Primary Resume
                </span>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => handlePreview(doc.file_path)}
                className="rounded-lg bg-slate-700 px-4 py-2"
              >
                Preview
              </button>

              {!doc.is_primary && (
                <button
                  onClick={() => handlePrimary(doc)}
                  className="rounded-lg bg-indigo-600 px-4 py-2"
                >
                  Set Primary
                </button>
              )}

              <button
                onClick={() => handleDelete(doc)}
                className="rounded-lg bg-red-600 px-4 py-2"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}