"use client";

import { useState, useRef, useCallback, DragEvent, ChangeEvent } from "react";
import type { CldFolder } from "@/lib/cloudinary";

interface ImageUploadProps {
  /** Cloudinary folder to upload into */
  folder: CldFolder;
  /** Called when upload completes successfully with the secure URL */
  onUpload: (url: string) => void;
  /** Shown as the label above the drop zone */
  label?: string;
  /** Shown inside the drop zone when empty */
  placeholder?: string;
  /** Max file size in bytes (default 5 MB) */
  maxBytes?: number;
  /** Optional initial image URL to preview */
  initialUrl?: string;
}

type UploadState = "idle" | "dragging" | "uploading" | "done" | "error";

export default function ImageUpload({
  folder,
  onUpload,
  label = "Profile Photo",
  placeholder = "Click or drag a photo here",
  maxBytes = 5 * 1024 * 1024, // 5 MB
  initialUrl,
}: ImageUploadProps) {
  const [state, setState] = useState<UploadState>("idle");
  const [preview, setPreview] = useState<string | null>(initialUrl ?? null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setState("idle");
    setError(null);
    setProgress(0);
  };

  const upload = useCallback(
    async (file: File) => {
      // Basic validation
      if (!file.type.startsWith("image/")) {
        setError("Please upload an image file (JPG, PNG, WEBP).");
        return;
      }
      if (file.size > maxBytes) {
        setError(`File too large — max ${Math.round(maxBytes / 1024 / 1024)} MB.`);
        return;
      }

      setError(null);
      setState("uploading");
      setProgress(10);

      // Show local preview immediately
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(file);

      try {
        // 1. Get a server-signed upload signature
        const signRes = await fetch("/api/upload/sign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ folder }),
        });
        if (!signRes.ok) throw new Error("Failed to get upload signature.");
        const { signature, timestamp, api_key, cloud_name } = await signRes.json();

        setProgress(30);

        // 2. Upload directly to Cloudinary using the signature
        const formData = new FormData();
        formData.append("file", file);
        formData.append("api_key", api_key);
        formData.append("signature", signature);
        formData.append("timestamp", String(timestamp));
        formData.append("folder", folder);

        const uploadRes = await fetch(
          `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`,
          { method: "POST", body: formData }
        );

        setProgress(90);

        if (!uploadRes.ok) {
          const err = await uploadRes.json().catch(() => ({}));
          throw new Error(err?.error?.message ?? "Cloudinary upload failed.");
        }

        const data = await uploadRes.json();
        setProgress(100);
        setState("done");
        onUpload(data.secure_url);
      } catch (err) {
        console.error("[ImageUpload]", err);
        setState("error");
        setError(err instanceof Error ? err.message : "Upload failed. Try again.");
        setPreview(null);
      }
    },
    [folder, maxBytes, onUpload]
  );

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    upload(file);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setState("idle");
    handleFile(e.dataTransfer.files[0]);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setState("dragging");
  };

  const handleDragLeave = () => {
    if (state === "dragging") setState("idle");
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    handleFile(e.target.files?.[0]);
    // Reset input so same file can be re-selected
    if (inputRef.current) inputRef.current.value = "";
  };

  const isDragging = state === "dragging";
  const isUploading = state === "uploading";
  const isDone = state === "done";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {label && (
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: "#94A3B8",
            textTransform: "uppercase",
            letterSpacing: "0.6px",
          }}
        >
          {label}{" "}
          <span style={{ color: "#374151", fontWeight: 400, textTransform: "none" }}>
            (optional)
          </span>
        </span>
      )}

      {/* Drop zone */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => !isUploading && inputRef.current?.click()}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          height: 110,
          borderRadius: 12,
          border: `1.5px dashed ${
            isDragging
              ? "#6366F1"
              : isDone
              ? "#22C55E"
              : error
              ? "#EF4444"
              : "rgba(99,102,241,0.3)"
          }`,
          background: isDragging
            ? "rgba(99,102,241,0.08)"
            : preview
            ? "transparent"
            : "rgba(255,255,255,0.03)",
          cursor: isUploading ? "default" : "pointer",
          overflow: "hidden",
          transition: "border-color 0.2s, background 0.2s",
        }}
      >
        {/* Preview image */}
        {preview && !isUploading && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt="Preview"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: isDone ? 1 : 0.5,
            }}
          />
        )}

        {/* Overlay content */}
        <div
          style={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 6,
            pointerEvents: "none",
          }}
        >
          {isUploading ? (
            <>
              <div
                style={{
                  width: 28,
                  height: 28,
                  border: "2.5px solid rgba(99,102,241,0.2)",
                  borderTopColor: "#6366F1",
                  borderRadius: "50%",
                  animation: "spin 0.7s linear infinite",
                }}
              />
              <span style={{ fontSize: 12, color: "#6366F1" }}>
                Uploading… {progress}%
              </span>
            </>
          ) : isDone ? (
            <>
              <span style={{ fontSize: 22 }}>✅</span>
              <span
                style={{
                  fontSize: 11,
                  color: "#22C55E",
                  background: "rgba(0,0,0,0.6)",
                  padding: "2px 8px",
                  borderRadius: 4,
                }}
              >
                Uploaded — click to change
              </span>
            </>
          ) : (
            <>
              <span style={{ fontSize: 24, opacity: preview ? 0 : 1 }}>📷</span>
              {!preview && (
                <span style={{ fontSize: 12, color: "#4B5563", textAlign: "center", padding: "0 8px" }}>
                  {placeholder}
                </span>
              )}
            </>
          )}
        </div>
      </div>

      {/* Progress bar */}
      {isUploading && (
        <div
          style={{
            height: 3,
            borderRadius: 2,
            background: "rgba(99,102,241,0.15)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${progress}%`,
              background: "linear-gradient(90deg, #6366F1, #8B5CF6)",
              transition: "width 0.3s ease",
            }}
          />
        </div>
      )}

      {/* Error message */}
      {error && (
        <span style={{ fontSize: 11, color: "#F87171" }}>
          ⚠️ {error}{" "}
          <button
            type="button"
            onClick={reset}
            style={{
              background: "none",
              border: "none",
              color: "#6366F1",
              cursor: "pointer",
              fontSize: 11,
              padding: 0,
            }}
          >
            Try again
          </button>
        </span>
      )}

      <span style={{ fontSize: 11, color: "#374151" }}>
        JPG, PNG or WEBP · max {Math.round(maxBytes / 1024 / 1024)} MB
      </span>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        style={{ display: "none" }}
        onChange={handleChange}
        aria-label={label}
      />
    </div>
  );
}
