"use client";

// Medium-style formatting board for the job Description field: paragraph,
// H1/H2, bold, italic, bullet/numbered lists, quote. Built on Tiptap v3
// (@tiptap/react + @tiptap/pm + @tiptap/starter-kit — see the install
// command in the PR/chat notes; this repo's tooling can't run npm install
// remotely, so those three packages need one manual install before this
// component will resolve).
//
// Content is stored/read as an HTML string (editor.getHTML()), which is
// exactly what src/app/api/admin/jobs/route.ts forwards as Description and
// what CareersPageClient renders back with dangerouslySetInnerHTML (see the
// .job-description wrapper styles there) — trusted content since only a
// logged-in admin can write it.

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  FaBold,
  FaItalic,
  FaListUl,
  FaListOl,
  FaQuoteRight,
  FaParagraph,
} from "react-icons/fa";
import { cn } from "@/utils/cn";

type RichTextEditorProps = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
};

function ToolbarButton({
  onClick,
  active,
  label,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()} // keep focus/selection in the editor
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      title={label}
      className={cn(
        "flex items-center justify-center w-8 h-8 rounded-[4px] text-sm cursor-pointer transition-colors duration-150",
        active ? "bg-[#1e3143] text-white" : "text-[#1e3143] hover:bg-[#f0f3f5]"
      )}
    >
      {children}
    </button>
  );
}

const EDITOR_CONTENT_CLASS =
  "min-h-[140px] max-h-[320px] overflow-y-auto px-3 py-2 focus:outline-none text-sm text-[#131720] " +
  "[&_h1]:text-xl [&_h1]:font-bold [&_h1]:text-[#1e3143] [&_h1]:mt-2 [&_h1]:mb-1 " +
  "[&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-[#1e3143] [&_h2]:mt-2 [&_h2]:mb-1 " +
  "[&_p]:my-1 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-1 " +
  "[&_blockquote]:border-l-2 [&_blockquote]:border-[#aec2cc] [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:text-[#64748B] " +
  "[&_strong]:font-bold [&_em]:italic";

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value || "",
    immediatelyRender: false, // avoid Next.js SSR/CSR hydration mismatch (Tiptap v3)
    shouldRerenderOnTransaction: true, // keep toolbar active-state (bold/H1/etc) live as you type
    editorProps: {
      attributes: { class: EDITOR_CONTENT_CLASS },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html === "<p></p>" ? "" : html);
    },
  });

  if (!editor) return null;

  return (
    <div className="border border-[#aec2cc] rounded-[4px] overflow-hidden bg-white">
      <div className="flex flex-wrap items-center gap-1 px-2 py-1.5 border-b border-[#f0f3f5] bg-[#fafbf9]">
        <ToolbarButton
          label="Paragraph"
          active={editor.isActive("paragraph") && !editor.isActive("heading")}
          onClick={() => editor.chain().focus().setParagraph().run()}
        >
          <FaParagraph />
        </ToolbarButton>
        <ToolbarButton
          label="Heading 1"
          active={editor.isActive("heading", { level: 1 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        >
          <span className="font-bold text-xs">H1</span>
        </ToolbarButton>
        <ToolbarButton
          label="Heading 2"
          active={editor.isActive("heading", { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <span className="font-bold text-xs">H2</span>
        </ToolbarButton>
        <div className="w-px h-5 bg-[#f0f3f5] mx-1" />
        <ToolbarButton
          label="Bold"
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <FaBold />
        </ToolbarButton>
        <ToolbarButton
          label="Italic"
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <FaItalic />
        </ToolbarButton>
        <div className="w-px h-5 bg-[#f0f3f5] mx-1" />
        <ToolbarButton
          label="Bullet list"
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <FaListUl />
        </ToolbarButton>
        <ToolbarButton
          label="Numbered list"
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <FaListOl />
        </ToolbarButton>
        <ToolbarButton
          label="Quote"
          active={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <FaQuoteRight />
        </ToolbarButton>
      </div>
      <div className="relative">
        <EditorContent editor={editor} />
        {editor.isEmpty && placeholder && (
          <p className="absolute top-2 left-3 text-sm text-[#94A3B8] pointer-events-none select-none">
            {placeholder}
          </p>
        )}
      </div>
    </div>
  );
}
