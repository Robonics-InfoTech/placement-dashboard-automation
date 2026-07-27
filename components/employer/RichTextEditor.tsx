"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import { useEffect } from "react";

interface Props {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  maxWords?: number;
  minHeight?: string;
}

function countWords(html: string): number {
  const text = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  return text.length === 0 ? 0 : text.split(" ").length;
}

const ToolbarBtn = ({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
}) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    style={{
      padding: "5px 8px",
      borderRadius: "6px",
      border: "none",
      cursor: "pointer",
      fontSize: "13px",
      fontWeight: 600,
      background: active ? "rgba(14,165,233,.2)" : "transparent",
      color: active ? "#38BDF8" : "#94A3B8",
      transition: "all .15s",
    }}
  >
    {children}
  </button>
);

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Start typing…",
  maxWords,
  minHeight = "180px",
}: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false }),
    ],
    content: value,
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        style: `min-height:${minHeight}; outline:none; padding:14px; font-size:14px; line-height:1.6; color:#E2E8F0;`,
        "data-placeholder": placeholder,
      },
    },
  });

  // Sync external value changes (e.g. form reset)
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [value, editor]);

  const wordCount = countWords(value);
  const overLimit = maxWords !== undefined && wordCount > maxWords;

  if (!editor) return null;

  return (
    <>
      <style>{`
        .rte-wrap .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #475569;
          pointer-events: none;
          height: 0;
        }
        .rte-wrap .ProseMirror ul { padding-left: 20px; list-style: disc; }
        .rte-wrap .ProseMirror ol { padding-left: 20px; list-style: decimal; }
        .rte-wrap .ProseMirror a  { color: #38BDF8; text-decoration: underline; }
        .rte-wrap .ProseMirror strong { font-weight: 700; }
        .rte-wrap .ProseMirror em { font-style: italic; }
        .rte-wrap .ProseMirror p { margin: 0 0 6px; }
      `}</style>

      <div
        className="rte-wrap"
        style={{
          border: `1px solid ${overLimit ? "rgba(239,68,68,.5)" : "rgba(255,255,255,.1)"}`,
          borderRadius: "12px",
          background: "rgba(255,255,255,.04)",
          overflow: "hidden",
        }}
      >
        {/* Toolbar */}
        <div
          style={{
            display: "flex",
            gap: "2px",
            padding: "8px 10px",
            borderBottom: "1px solid rgba(255,255,255,.07)",
            flexWrap: "wrap",
          }}
        >
          <ToolbarBtn
            title="Bold"
            active={editor.isActive("bold")}
            onClick={() => editor.chain().focus().toggleBold().run()}
          >B</ToolbarBtn>

          <ToolbarBtn
            title="Italic"
            active={editor.isActive("italic")}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          ><em>I</em></ToolbarBtn>

          <ToolbarBtn
            title="Underline"
            active={editor.isActive("underline")}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
          ><span style={{ textDecoration: "underline" }}>U</span></ToolbarBtn>

          <div style={{ width: "1px", background: "rgba(255,255,255,.1)", margin: "0 4px" }} />

          <ToolbarBtn
            title="Bullet list"
            active={editor.isActive("bulletList")}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          >• List</ToolbarBtn>

          <ToolbarBtn
            title="Numbered list"
            active={editor.isActive("orderedList")}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          >1. List</ToolbarBtn>

          <div style={{ flex: 1 }} />

          {maxWords && (
            <span
              style={{
                fontSize: "11px",
                fontWeight: 600,
                color: overLimit ? "#EF4444" : "#64748B",
                alignSelf: "center",
              }}
            >
              {wordCount}/{maxWords} words
            </span>
          )}
        </div>

        {/* Editor area */}
        <EditorContent editor={editor} />
      </div>

      {overLimit && (
        <p style={{ fontSize: "12px", color: "#EF4444", marginTop: "6px" }}>
          Word limit exceeded. Please reduce to {maxWords} words.
        </p>
      )}
    </>
  );
}
