import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import ImageExtension from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import Dropcursor from "@tiptap/extension-dropcursor";
import Gapcursor from "@tiptap/extension-gapcursor";
import CharacterCount from "@tiptap/extension-character-count";
import Highlight from "@tiptap/extension-highlight";
import Underline from "@tiptap/extension-underline";
import DOMPurify from "isomorphic-dompurify";
import { marked } from "marked";
import {
  IconAlignCenter,
  IconAlignLeft,
  IconAlignRight,
  IconBold,
  IconCode,
  IconCircleNumber1,
  IconCircleNumber2,
  IconCircleNumber3,
  IconHighlight,
  IconItalic,
  IconLink,
  IconList,
  IconListNumbers,
  IconPhotoPlus,
  IconQuote,
  IconStrikethrough,
  IconUnderline,
  IconArrowBackUp,
  IconArrowForwardUp,
  IconWorldUpload,
  IconClearFormatting,
} from "@tabler/icons-react";

const TOOLBAR_BUTTON_BASE =
  "inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/10 bg-black text-sm font-medium text-gray-200 transition hover:border-white/40 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white";

const ALIGNMENT_CLASSES = {
  left: "float-left mr-6 mb-4 max-w-[45%]",
  right: "float-right ml-6 mb-4 max-w-[45%]",
  center: "mx-auto mb-6 block",
};

function ToolbarButton({ icon, isActive, disabled, onClick, title }) {
  return (
    <button
      type="button"
      className={`${TOOLBAR_BUTTON_BASE} ${isActive ? "border-white/40 bg-white/20" : ""} ${disabled ? "cursor-not-allowed opacity-50" : ""}`.trim()}
      onClick={onClick}
      title={title}
      disabled={disabled}
    >
      {icon}
    </button>
  );
}

function getInitialHtml(content = "") {
  if (!content) return "";
  const trimmed = content.trim();
  if (trimmed.startsWith("<")) {
    return trimmed;
  }
  return marked.parse(trimmed);
}

export default function PostEditor({ mode = "create", initialData = {}, onSubmit, onDelete }) {
  const router = useRouter();
  const fileInputRef = useRef(null);

  const [meta, setMeta] = useState({
    title: initialData.title ?? "",
    excerpt: initialData.excerpt ?? "",
    authorName: initialData.authorName ?? "",
    featuredImage: initialData.featuredImage ?? "",
    published: initialData.published ?? true,
  });
  const [html, setHtml] = useState(() => getInitialHtml(initialData.content));
  const [wordCount, setWordCount] = useState(0);
  const [readTime, setReadTime] = useState("-");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: { keepMarks: true },
        orderedList: { keepMarks: true },
      }),
      Underline,
      Highlight,
      Dropcursor,
      Gapcursor,
      Placeholder.configure({
        placeholder: "Start typing…",
      }),
      CharacterCount.configure({ limit: 20000 }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Link.configure({
        autolink: true,
        openOnClick: false,
        HTMLAttributes: {
          class: "text-emerald-300 underline hover:text-emerald-200",
        },
      }),
      ImageExtension.configure({
        allowBase64: true,
        HTMLAttributes: {
          class: ALIGNMENT_CLASSES.center,
        },
      }),
    ],
    content: html,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "prose prose-invert prose-lg max-w-none min-h-[420px] focus:outline-none [&_.float-left]:mr-6 [&_.float-right]:ml-6 [&_img]:rounded-xl",
      },
      handleDrop(view, event) {
        const files = event?.dataTransfer?.files;
        if (files && files.length > 0) {
          event.preventDefault();
          handleFilesUpload(files);
          return true;
        }
        return false;
      },
      handlePaste(view, event) {
        const items = event.clipboardData?.items;
        if (!items) return false;
        const files = [];
        for (let i = 0; i < items.length; i += 1) {
          const item = items[i];
          if (item.type?.startsWith("image")) {
            const file = item.getAsFile();
            if (file) files.push(file);
          }
        }
          const resolvedInitial = initialData ?? {};
          const {
            title: initialTitle = "",
            excerpt: initialExcerpt = "",
            authorName: initialAuthorName = "",
            featuredImage: initialFeaturedImage = "",
            published: initialPublished = true,
            content: initialContent = "",
          } = resolvedInitial;

          const initialHtml = useMemo(() => getInitialHtml(initialContent), [initialContent]);

          const [meta, setMeta] = useState({
            title: initialTitle,
            excerpt: initialExcerpt,
            authorName: initialAuthorName,
            featuredImage: initialFeaturedImage,
            published: initialPublished,
          });
          const [html, setHtml] = useState(initialHtml);
          event.preventDefault();
          handleFilesUpload(files);
          return true;
        }
        return false;
      },
    },
    onUpdate({ editor: currentEditor }) {
      const raw = currentEditor.getHTML();
      const sanitized = DOMPurify.sanitize(raw, {
        ADD_ATTR: ["style", "class", "data-align"],
        ADD_TAGS: ["figure", "figcaption"],
      });
      setHtml(sanitized);
      const words = currentEditor.storage.characterCount.words();
      setWordCount(words);
      const minutes = words === 0 ? 0 : Math.max(1, Math.round(words / 200));
      setReadTime(minutes ? `${minutes} min read` : "-");
    },
  });

  const handleFilesUpload = useCallback(
    (fileList) => {
      if (!editor) return;
      const files = Array.from(fileList);
      files.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const src = event.target?.result;
          if (!src) return;
          editor.chain().focus().setImage({ src, alt: file.name, class: ALIGNMENT_CLASSES.center }).run();
        };
        reader.readAsDataURL(file);
      });
    },
            content: initialHtml,
            immediatelyRender: false,
  );

  useEffect(() => {
    setMeta({
      title: initialData.title ?? "",
      excerpt: initialData.excerpt ?? "",
      authorName: initialData.authorName ?? "",
      featuredImage: initialData.featuredImage ?? "",
      published: initialData.published ?? true,
    });
    const initialHtml = getInitialHtml(initialData.content);
    setHtml(initialHtml);
    if (editor) {
      editor.commands.setContent(initialHtml || "", false);
      const words = editor.storage.characterCount.words();
      setWordCount(words);
      const minutes = words === 0 ? 0 : Math.max(1, Math.round(words / 200));
      setReadTime(minutes ? `${minutes} min read` : "-");
    }
  }, [initialData, editor]);

  const updateMeta = (field, value) => {
    setMeta((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!editor) return;
    setSaving(true);
    setError("");

    try {
      const sanitized = DOMPurify.sanitize(editor.getHTML(), {
        ADD_ATTR: ["style", "class", "data-align"],
        ADD_TAGS: ["figure", "figcaption"],
      });
      await onSubmit({
        ...meta,
        content: sanitized,
      });
    } catch (submitError) {
      console.error(submitError);
      setError(submitError?.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    const confirmed = window.confirm("Delete this post? This action cannot be undone.");
    if (!confirmed) return;
    setDeleting(true);
    setError("");
    try {
      await onDelete();
    } catch (deleteError) {
      console.error(deleteError);
      setError(deleteError?.message || "Failed to delete post");
    } finally {
      setDeleting(false);
    }
  };

          useEffect(() => {
            const nextMeta = {
              title: initialTitle,
              excerpt: initialExcerpt,
              authorName: initialAuthorName,
              featuredImage: initialFeaturedImage,
              published: initialPublished,
            };

            setMeta(nextMeta);

            const nextHtml = getInitialHtml(initialContent);
            setHtml(nextHtml);

            if (!editor) return;

            editor.commands.setContent(nextHtml || "", false);
            const words = editor.storage.characterCount.words();
            setWordCount(words);
            const minutes = words === 0 ? 0 : Math.max(1, Math.round(words / 200));
            setReadTime(minutes ? `${minutes} min read` : "-");
          }, [editor, initialTitle, initialExcerpt, initialAuthorName, initialFeaturedImage, initialPublished, initialContent]);
      const currentClass = attrs?.class || "";
      if (currentClass.includes("float-left")) return "left";
      if (currentClass.includes("float-right")) return "right";
      return "center";
    }
    if (editor.isActive({ textAlign: "center" })) return "center";
    if (editor.isActive({ textAlign: "right" })) return "right";
    return "left";
  })();

  const insertLink = () => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("Enter URL", previousUrl || "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const removeLink = () => {
    if (!editor) return;
    editor.chain().focus().extendMarkRange("link").unsetLink().run();
  };

  const openImagePicker = () => {
    if (!fileInputRef.current) return;
    fileInputRef.current.click();
  };

  const handleManualImageUpload = (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    handleFilesUpload(files);
    event.target.value = "";
  };

  const previewHtml = useMemo(() => {
    if (!html) {
      return '<p class="text-sm text-gray-500">Start writing to see a preview.</p>';
    }
    return html;
  }, [html]);

  return (
    <div className="space-y-10">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-gray-500">{mode === "edit" ? "Edit post" : "New post"}</p>
          <h1 className="text-3xl font-semibold">{meta.title || "Untitled"}</h1>
        </div>
        <button
          type="button"
          onClick={() => router.push("/admin")}
          className="inline-flex items-center justify-center rounded-lg border border-white/10 px-4 py-2 text-sm font-semibold text-gray-300 transition hover:border-white/40 hover:text-white"
        >
          Back to dashboard
        </button>
      </header>

      <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="space-y-8">
          <section className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Title</label>
              <input
                value={meta.title}
                onChange={(event) => updateMeta("title", event.target.value)}
                required
                className="w-full rounded-lg border border-white/10 bg-black px-3 py-2 text-white focus:border-white/40 focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Excerpt</label>
              <textarea
                value={meta.excerpt}
                onChange={(event) => updateMeta("excerpt", event.target.value)}
                rows={3}
                className="w-full rounded-lg border border-white/10 bg-black px-3 py-2 text-white focus:border-white/40 focus:outline-none"
              />
              <p className="text-xs text-gray-500">Used for previews, meta descriptions, and social sharing.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Author</label>
                <input
                  value={meta.authorName}
                  onChange={(event) => updateMeta("authorName", event.target.value)}
                  placeholder="Your name"
                  className="w-full rounded-lg border border-white/10 bg-black px-3 py-2 text-white focus:border-white/40 focus:outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Featured image URL</label>
                <input
                  value={meta.featuredImage}
                  onChange={(event) => updateMeta("featuredImage", event.target.value)}
                  placeholder="https://…"
                  className="w-full rounded-lg border border-white/10 bg-black px-3 py-2 text-white focus:border-white/40 focus:outline-none"
                />
                <p className="text-xs text-gray-500">Host hero images externally (Cloudinary, Supabase Storage, etc.) and paste the URL.</p>
              </div>
            </div>

            <label className="flex items-center gap-3 text-sm text-gray-300">
              <input
                type="checkbox"
                checked={meta.published}
                onChange={(event) => updateMeta("published", event.target.checked)}
                className="h-4 w-4 rounded border-white/20 bg-black"
              />
              Published
            </label>
          </section>

          <section className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-400">Compose</h2>
                <p className="text-xs text-gray-500">Drag & drop images, paste screenshots, or use the toolbar for formatting.</p>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-400">
                <span>{wordCount} words</span>
                <span>·</span>
                <span>{readTime}</span>
              </div>
            </div>

            <div className="sticky top-24 z-10 flex flex-wrap gap-2 rounded-xl border border-white/10 bg-black/80 p-3 backdrop-blur">
              <ToolbarButton
                icon={<IconBold size={16} />}
                title="Bold"
                isActive={editor?.isActive("bold")}
                disabled={!editor}
                onClick={() => editor?.chain().focus().toggleBold().run()}
              />
              <ToolbarButton
                icon={<IconItalic size={16} />}
                title="Italic"
                isActive={editor?.isActive("italic")}
                disabled={!editor}
                onClick={() => editor?.chain().focus().toggleItalic().run()}
              />
              <ToolbarButton
                icon={<IconUnderline size={16} />}
                title="Underline"
                isActive={editor?.isActive("underline")}
                disabled={!editor}
                onClick={() => editor?.chain().focus().toggleUnderline().run()}
              />
              <ToolbarButton
                icon={<IconStrikethrough size={16} />}
                title="Strikethrough"
                isActive={editor?.isActive("strike")}
                disabled={!editor}
                onClick={() => editor?.chain().focus().toggleStrike().run()}
              />
              <ToolbarButton
                icon={<IconHighlight size={16} />}
                title="Highlight"
                isActive={editor?.isActive("highlight")}
                disabled={!editor}
                onClick={() => editor?.chain().focus().toggleHighlight().run()}
              />
              <div className="mx-1 h-6 w-px bg-white/10" />
              <ToolbarButton
                icon={<IconCircleNumber1 size={16} />}
                title="Heading 1"
                isActive={editor?.isActive("heading", { level: 1 })}
                disabled={!editor}
                onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
              />
              <ToolbarButton
                icon={<IconCircleNumber2 size={16} />}
                title="Heading 2"
                isActive={editor?.isActive("heading", { level: 2 })}
                disabled={!editor}
                onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
              />
              <ToolbarButton
                icon={<IconCircleNumber3 size={16} />}
                title="Heading 3"
                isActive={editor?.isActive("heading", { level: 3 })}
                disabled={!editor}
                onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
              />
              <div className="mx-1 h-6 w-px bg-white/10" />
              <ToolbarButton
                icon={<IconList size={16} />}
                title="Bullet list"
                isActive={editor?.isActive("bulletList")}
                disabled={!editor}
                onClick={() => editor?.chain().focus().toggleBulletList().run()}
              />
              <ToolbarButton
                icon={<IconListNumbers size={16} />}
                title="Numbered list"
                isActive={editor?.isActive("orderedList")}
                disabled={!editor}
                onClick={() => editor?.chain().focus().toggleOrderedList().run()}
              />
              <ToolbarButton
                icon={<IconQuote size={16} />}
                title="Quote"
                isActive={editor?.isActive("blockquote")}
                disabled={!editor}
                onClick={() => editor?.chain().focus().toggleBlockquote().run()}
              />
              <ToolbarButton
                icon={<IconCode size={16} />}
                title="Code block"
                isActive={editor?.isActive("codeBlock")}
                disabled={!editor}
                onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
              />
              <div className="mx-1 h-6 w-px bg-white/10" />
              <ToolbarButton
                icon={<IconAlignLeft size={16} />}
                title="Align left"
                isActive={currentAlignment === "left"}
                disabled={!editor}
                onClick={() => applyAlignment("left")}
              />
              <ToolbarButton
                icon={<IconAlignCenter size={16} />}
                title="Align center"
                isActive={currentAlignment === "center"}
                disabled={!editor}
                onClick={() => applyAlignment("center")}
              />
              <ToolbarButton
                icon={<IconAlignRight size={16} />}
                title="Align right"
                isActive={currentAlignment === "right"}
                disabled={!editor}
                onClick={() => applyAlignment("right")}
              />
              <div className="mx-1 h-6 w-px bg-white/10" />
              <ToolbarButton
                icon={<IconLink size={16} />}
                title="Insert link"
                isActive={editor?.isActive("link")}
                disabled={!editor}
                onClick={insertLink}
              />
              <ToolbarButton
                icon={<IconClearFormatting size={16} />}
                title="Remove link"
                disabled={!editor}
                onClick={removeLink}
              />
              <ToolbarButton
                icon={<IconPhotoPlus size={16} />}
                title="Upload image"
                disabled={!editor}
                onClick={openImagePicker}
              />
              <ToolbarButton
                icon={<IconWorldUpload size={16} />}
                title="Embed remote image"
                disabled={!editor}
                onClick={() => {
                  const url = window.prompt("Image URL", "https://");
                  if (!url) return;
                  editor?.chain().focus().setImage({ src: url, class: ALIGNMENT_CLASSES.center }).run();
                }}
              />
              <div className="mx-1 h-6 w-px bg-white/10" />
              <ToolbarButton
                icon={<IconArrowBackUp size={16} />}
                title="Undo"
                disabled={!editor}
                onClick={() => editor?.chain().focus().undo().run()}
              />
              <ToolbarButton
                icon={<IconArrowForwardUp size={16} />}
                title="Redo"
                disabled={!editor}
                onClick={() => editor?.chain().focus().redo().run()}
              />
            </div>

            <div className="overflow-hidden rounded-xl border border-white/20 bg-black/40">
              <EditorContent editor={editor} className="relative" />
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleManualImageUpload}
            />
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="mb-6 space-y-2">
              <h2 className="text-lg font-semibold text-white">Preview</h2>
              <p className="text-xs text-gray-500">Rendered exactly as readers will see it.</p>
            </div>
            <article
              className="prose prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
          </section>
        </div>

        <aside className="space-y-6">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-400">Meta</h2>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400">Author name</label>
              <input
                type="text"
                value={meta.authorName}
                onChange={(event) => updateMeta("authorName", event.target.value)}
                placeholder="Published under"
                className="w-full rounded-lg border border-white/10 bg-black px-3 py-2 text-sm text-white focus:border-white/40 focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400">Featured image URL</label>
              <input
                type="url"
                value={meta.featuredImage}
                onChange={(event) => updateMeta("featuredImage", event.target.value)}
                placeholder="https://"
                className="w-full rounded-lg border border-white/10 bg-black px-3 py-2 text-sm text-white focus:border-white/40 focus:outline-none"
              />
              {meta.featuredImage ? (
                <div className="overflow-hidden rounded-xl border border-white/10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={meta.featuredImage}
                    alt="Featured preview"
                    className="h-40 w-full object-cover"
                  />
                </div>
              ) : null}
            </div>

            <label className="flex items-center justify-between rounded-lg border border-white/10 bg-black px-3 py-2 text-sm text-gray-200">
              <span>Publish post</span>
              <input
                type="checkbox"
                checked={meta.published}
                onChange={(event) => updateMeta("published", event.target.checked)}
                className="h-4 w-4"
              />
            </label>
          </div>

          <div className="flex flex-col gap-3">
            <button
              type="submit"
              disabled={saving}
              className={`w-full rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black transition ${saving ? "cursor-not-allowed opacity-70" : ""}`}
            >
              {saving ? "Saving…" : mode === "edit" ? "Update post" : "Publish post"}
            </button>
            {onDelete ? (
              <button
                type="button"
                disabled={deleting}
                onClick={handleDelete}
                className={`w-full rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-200 transition hover:bg-red-500/20 ${deleting ? "cursor-not-allowed opacity-70" : ""}`}
              >
                {deleting ? "Deleting…" : "Delete post"}
              </button>
            ) : null}
            {error ? (
              <p className="text-sm text-red-400">{error}</p>
            ) : null}
          </div>
        </aside>
      </form>
    </div>
  );
}
