"use client";

import { useState, useMemo } from "react";

export interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  render: (row: T) => React.ReactNode;
  width?: string;
}

interface Props<T> {
  columns: Column<T>[];
  data: T[];
  rowKey: (row: T) => string;
  selectable?: boolean;
  onSelectionChange?: (selectedIds: string[]) => void;
  emptyMessage?: string;
  loading?: boolean;
}

export default function DataTable<T>({
  columns,
  data,
  rowKey,
  selectable = false,
  onSelectionChange,
  emptyMessage = "No records found.",
  loading = false,
}: Props<T>) {
  const [sortKey, setSortKey]     = useState<string | null>(null);
  const [sortDir, setSortDir]     = useState<"asc" | "desc">("asc");
  const [selected, setSelected]   = useState<Set<string>>(new Set());

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const toggleRow = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
    onSelectionChange?.(Array.from(next));
  };

  const toggleAll = () => {
    if (selected.size === data.length) {
      setSelected(new Set());
      onSelectionChange?.([]);
    } else {
      const all = new Set(data.map(rowKey));
      setSelected(all);
      onSelectionChange?.(Array.from(all));
    }
  };

  const allChecked = data.length > 0 && selected.size === data.length;
  const someChecked = selected.size > 0 && !allChecked;

  return (
    <>
      <style>{`
        .dt-wrap { overflow-x: auto; border-radius: 12px; border: 1px solid rgba(255,255,255,.07); }
        .dt-table { width: 100%; border-collapse: collapse; }
        .dt-th {
          padding: 12px 14px; text-align: left; font-size: 11px; font-weight: 600;
          color: #64748B; text-transform: uppercase; letter-spacing: .05em;
          border-bottom: 1px solid rgba(255,255,255,.07);
          background: rgba(255,255,255,.02);
          white-space: nowrap; user-select: none;
        }
        .dt-th.sortable { cursor: pointer; }
        .dt-th.sortable:hover { color: #94A3B8; }
        .dt-td {
          padding: 13px 14px; font-size: 13px; color: #CBD5E1;
          border-bottom: 1px solid rgba(255,255,255,.04);
          vertical-align: middle;
        }
        .dt-tr:last-child .dt-td { border-bottom: none; }
        .dt-tr:hover .dt-td { background: rgba(255,255,255,.02); }
        .dt-tr.selected .dt-td { background: rgba(14,165,233,.05); }
        .dt-checkbox { accent-color: #0EA5E9; width: 15px; height: 15px; cursor: pointer; }
        .dt-empty { padding: 40px; text-align: center; color: #475569; font-size: 14px; }
        .dt-skeleton { height: 16px; background: rgba(255,255,255,.06); border-radius: 6px; animation: pulse 1.4s ease-in-out infinite; }
        @keyframes pulse { 0%,100%{opacity:.6} 50%{opacity:1} }
      `}</style>

      <div className="dt-wrap">
        <table className="dt-table">
          <thead>
            <tr>
              {selectable && (
                <th className="dt-th" style={{ width: "40px" }}>
                  <input
                    type="checkbox"
                    className="dt-checkbox"
                    checked={allChecked}
                    ref={(el) => { if (el) el.indeterminate = someChecked; }}
                    onChange={toggleAll}
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`dt-th${col.sortable ? " sortable" : ""}`}
                  style={{ width: col.width }}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  {col.label}
                  {col.sortable && sortKey === col.key && (
                    <span style={{ marginLeft: "4px" }}>
                      {sortDir === "asc" ? " ↑" : " ↓"}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="dt-tr">
                  {selectable && <td className="dt-td"><div className="dt-skeleton" style={{ width: "15px" }} /></td>}
                  {columns.map((col) => (
                    <td key={col.key} className="dt-td">
                      <div className="dt-skeleton" style={{ width: "80%" }} />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={selectable ? columns.length + 1 : columns.length}
                  className="dt-empty"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row) => {
                const id = rowKey(row);
                const isSelected = selected.has(id);
                return (
                  <tr key={id} className={`dt-tr${isSelected ? " selected" : ""}`}>
                    {selectable && (
                      <td className="dt-td">
                        <input
                          type="checkbox"
                          className="dt-checkbox"
                          checked={isSelected}
                          onChange={() => toggleRow(id)}
                        />
                      </td>
                    )}
                    {columns.map((col) => (
                      <td key={col.key} className="dt-td">
                        {col.render(row)}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
