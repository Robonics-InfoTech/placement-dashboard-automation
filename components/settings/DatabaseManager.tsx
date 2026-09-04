"use client";

import { useState } from "react";
import { localDb } from "@/lib/db/localDb";
import { Download, Upload, Database, Loader2, Check, AlertTriangle } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import "dexie-export-import";

export default function DatabaseManager() {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      setMessage(null);
      
      const blob = await localDb.export();
      
      // Create a download link for the blob
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `placementhub-offline-db-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setMessage({ type: "success", text: "Database exported successfully!" });
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Failed to export database." });
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsImporting(true);
      setMessage(null);
      
      await localDb.import(file, {
        clearTablesBeforeImport: false, // Merge with existing data
        overwriteValues: true,
      });
      
      setMessage({ type: "success", text: "Data imported successfully!" });
      
      // Clear file input
      e.target.value = '';
      
      // Force page reload to reflect new data
      setTimeout(() => {
        window.location.reload();
      }, 1500);
      
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Failed to import database file." });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Card>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <div style={{ padding: 10, background: "var(--accent-light)", borderRadius: "var(--radius-md)", color: "var(--accent-text)" }}>
          <Database size={20} />
        </div>
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>Local Database Management</h3>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "4px 0 0" }}>
            Export your offline data to share it across devices or import a backup.
          </p>
        </div>
      </div>

      {message && (
        <div style={{
          padding: "10px 14px",
          borderRadius: "var(--radius-md)",
          background: message.type === "success" ? "var(--success-light)" : "var(--error-light)",
          color: message.type === "success" ? "var(--success-text)" : "var(--error-text)",
          fontSize: 13,
          fontWeight: 500,
          marginBottom: 16,
          display: "flex",
          alignItems: "center",
          gap: 8
        }}>
          {message.type === "success" ? <Check size={16} /> : <AlertTriangle size={16} />}
          {message.text}
        </div>
      )}

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <Button onClick={handleExport} disabled={isExporting || isImporting} style={{ gap: 8 }}>
          {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
          Export Backup
        </Button>
        
        <div style={{ position: "relative" }}>
          <input
            type="file"
            accept=".json"
            onChange={handleImport}
            disabled={isExporting || isImporting}
            style={{
              position: "absolute",
              inset: 0,
              opacity: 0,
              cursor: "pointer",
              width: "100%"
            }}
          />
          <Button variant="outline" disabled={isExporting || isImporting} style={{ gap: 8, pointerEvents: "none" }}>
            {isImporting ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
            Import Data
          </Button>
        </div>
      </div>
      
      <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 16, lineHeight: 1.5 }}>
        <strong>Note:</strong> Importing data will merge it with your current local database. If a record already exists, it will be overwritten by the imported version. This is useful for transferring your offline progress between devices.
      </p>
    </Card>
  );
}
