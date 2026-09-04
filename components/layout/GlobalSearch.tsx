"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, X, ArrowRight } from "lucide-react";
import type { SearchResult } from "@/types/platform";
import { useRouter } from "next/navigation";

interface Props {
  placeholder?: string;
}

export default function GlobalSearch({ placeholder = 'Search screens (e.g. drives, S-11)...' }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Ctrl+K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === "Escape") {
        setOpen(false);
        setQuery("");
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.results ?? []);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = useCallback(
    (result: SearchResult) => {
      router.push(result.href);
      setOpen(false);
      setQuery("");
    },
    [router]
  );

  // Keyboard nav
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && results[selectedIndex]) {
      handleSelect(results[selectedIndex]);
    }
  };

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="focus-ring"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "7px 14px",
          borderRadius: "var(--radius-md)",
          border: "1px solid var(--border-primary)",
          background: "var(--bg-secondary)",
          color: "var(--text-muted)",
          cursor: "pointer",
          fontSize: 13,
          minWidth: 240,
          transition: "all var(--transition-normal)",
        }}
      >
        <Search size={14} />
        <span style={{ flex: 1, textAlign: "left" }}>{placeholder}</span>
        <kbd
          style={{
            fontSize: 11,
            padding: "2px 6px",
            borderRadius: 4,
            border: "1px solid var(--border-primary)",
            background: "var(--bg-primary)",
            color: "var(--text-muted)",
            fontFamily: "var(--font-mono)",
          }}
        >
          ⌘K
        </kbd>
      </button>

      {/* Modal overlay */}
      {open && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            paddingTop: 120,
            background: "var(--bg-overlay)",
          }}
          onClick={() => {
            setOpen(false);
            setQuery("");
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 560,
              background: "var(--bg-card)",
              border: "1px solid var(--border-primary)",
              borderRadius: "var(--radius-lg)",
              boxShadow: "var(--shadow-lg)",
              overflow: "hidden",
            }}
          >
            {/* Search input */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "14px 16px",
                borderBottom: "1px solid var(--border-primary)",
              }}
            >
              <Search size={18} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                style={{
                  flex: 1,
                  border: "none",
                  outline: "none",
                  background: "transparent",
                  fontSize: 15,
                  color: "var(--text-primary)",
                  fontFamily: "var(--font-sans)",
                }}
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--text-muted)",
                    display: "flex",
                    padding: 4,
                  }}
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Results */}
            <div style={{ maxHeight: 320, overflowY: "auto", padding: "8px 0" }} className="custom-scrollbar">
              {loading && (
                <div style={{ padding: "20px 16px", textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
                  Searching...
                </div>
              )}

              {!loading && query && results.length === 0 && (
                <div style={{ padding: "20px 16px", textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
                  No results found for &quot;{query}&quot;
                </div>
              )}

              {!loading &&
                results.map((result, i) => (
                  <button
                    key={`${result.type}-${result.href}`}
                    onClick={() => handleSelect(result)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      width: "100%",
                      padding: "10px 16px",
                      border: "none",
                      cursor: "pointer",
                      textAlign: "left",
                      fontSize: 14,
                      background: i === selectedIndex ? "var(--bg-hover)" : "transparent",
                      color: "var(--text-primary)",
                      fontFamily: "var(--font-sans)",
                      transition: "background var(--transition-fast)",
                    }}
                    onMouseEnter={() => setSelectedIndex(i)}
                  >
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        textTransform: "uppercase",
                        color: "var(--accent-text)",
                        background: "var(--accent-light)",
                        padding: "2px 6px",
                        borderRadius: 4,
                        flexShrink: 0,
                      }}
                    >
                      {result.type}
                    </span>
                    <span style={{ flex: 1 }}>{result.title}</span>
                    <ArrowRight size={14} style={{ color: "var(--text-muted)" }} />
                  </button>
                ))}

              {!query && (
                <div style={{ padding: "16px", color: "var(--text-muted)", fontSize: 13, textAlign: "center" }}>
                  Type to search pages, drives, students...
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
