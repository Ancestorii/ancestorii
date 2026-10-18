"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getBrowserClient } from "@/lib/supabase/browser";
import { useQuill } from "react-quilljs";
import Image from "next/image";
import { ensureDisplayableImage } from '@/lib/convertImage';
import { sanitizeRichTextClient } from '@/lib/richText/client';
import { safeToast as toast } from '@/lib/safeToast';
import {
  Plus,
  ImagePlus,
  Sparkles,
  Feather,
  X,
  Check,
} from "lucide-react";
import "quill/dist/quill.snow.css";
import {
  ui,
  Accent,
  Btn,
  IconBtn,
  IconTile,
  SectionHead,
  Spinner,
  Tag,
  btnClass,
  toneByKey,
  type ToneKey,
} from "@/components/dashboard/ui/AppBits";
import s from "./lovedOne.module.css";

const cx = (...parts: (string | false | null | undefined)[]) =>
  parts.filter(Boolean).join(" ");

type StoryKey =
  | "early_years"
  | "important_moments"
  | "special_memories"
  | "who_they_are";

type FamilyMember = {
  id: string;
  full_name?: string | null;
  birth_date?: string | null;
  death_date?: string | null;
  relationship_to_user?: string | null;
  early_years?: string | null;
  important_moments?: string | null;
  special_memories?: string | null;
  who_they_are?: string | null;
  early_years_image?: string | null;
  important_moments_image?: string | null;
  special_memories_image?: string | null;
  who_they_are_image?: string | null;
};

type Props = {
  member: FamilyMember;
  firstName: string;
  setMember: any;
};

type StoryContent = {
  early_years: string;
  important_moments: string;
  special_memories: string;
  who_they_are: string;
};

type StoryImages = {
  early_years: string | null;
  important_moments: string | null;
  special_memories: string | null;
  who_they_are: string | null;
};

type StoryPaths = {
  early_years: string | null;
  important_moments: string | null;
  special_memories: string | null;
  who_they_are: string | null;
};

type SectionConfig = {
  key: StoryKey;
  title: string;
  eyebrow: string;
  hint: string;
  shortPrompt: string;
  prompts: string[];
  // The chapter's colour (its dot, prompts and photo frame), as on the landing's chapters.
  accent: ToneKey;
  imageFirstOnDesktop: boolean;
};

const SECTION_CONFIG: SectionConfig[] = [
  {
    key: "early_years",
    title: "Early years",
    eyebrow: "Chapter 1",
    hint: "Where did it all begin?",
    shortPrompt: "Childhood, home, family, little details.",
    prompts: [
      "Where were they born?",
      "What was home like?",
      "What do you remember about their childhood?",
      "Were there family traditions, routines, or favourite places?",
    ],
    accent: "pink",
    imageFirstOnDesktop: true,
  },
  {
    key: "important_moments",
    title: "Important moments",
    eyebrow: "Chapter 2",
    hint: "Milestones that mattered",
    shortPrompt: "Turning points, achievements, defining moments.",
    prompts: [
      "What moments changed the direction of their life?",
      "What made them proud?",
      "Which milestones should never be forgotten?",
      "What seasons of life shaped them most?",
    ],
    accent: "orange",
    imageFirstOnDesktop: false,
  },
  {
    key: "special_memories",
    title: "Special memories",
    eyebrow: "Chapter 3",
    hint: "Moments you never forget",
    shortPrompt: "Holidays, laughter, traditions, ordinary magic.",
    prompts: [
      "Which memory still makes you smile?",
      "What family tradition always stands out?",
      "Was there a holiday, gathering, or moment that felt unforgettable?",
      "What simple memory meant more than it seemed at the time?",
    ],
    accent: "aqua",
    imageFirstOnDesktop: true,
  },
  {
    key: "who_they_are",
    title: "Who they are",
    eyebrow: "Chapter 4",
    hint: "What made them who they are",
    shortPrompt: "Personality, habits, energy, presence.",
    prompts: [
      "How would you describe their energy?",
      "What little habits or phrases made them feel like them?",
      "How do people remember them?",
      "What made them different from everyone else?",
    ],
    accent: "blue",
    imageFirstOnDesktop: false,
  },
];

const INITIAL_CONTENT: StoryContent = {
  early_years: "",
  important_moments: "",
  special_memories: "",
  who_they_are: "",
};

const INITIAL_IMAGES: StoryImages = {
  early_years: null,
  important_moments: null,
  special_memories: null,
  who_they_are: null,
};

const INITIAL_PATHS: StoryPaths = {
  early_years: null,
  important_moments: null,
  special_memories: null,
  who_they_are: null,
};

export default function StorySection({
  member,
  firstName,
  setMember,
}: Props) {
  const supabase = getBrowserClient();

  const [content, setContent] = useState<StoryContent>(INITIAL_CONTENT);
  const [imageUrls, setImageUrls] = useState<StoryImages>(INITIAL_IMAGES);
  const [imagePaths, setImagePaths] = useState<StoryPaths>(INITIAL_PATHS);

  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState(false);

  const [uploadingKey, setUploadingKey] = useState<StoryKey | null>(null);

  useEffect(() => {
    setContent({
      early_years: member.early_years || "",
      important_moments: member.important_moments || "",
      special_memories: member.special_memories || "",
      who_they_are: member.who_they_are || "",
    });

    setImagePaths({
      early_years: member.early_years_image || null,
      important_moments: member.important_moments_image || null,
      special_memories: member.special_memories_image || null,
      who_they_are: member.who_they_are_image || null,
    });
    // Only when a different loved one arrives: the parent's setMember (the About box, a chapter
    // save) re-ran this, wiping unsaved chapter text and re-signing every photo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [member.id]);

  // Signed URLs by storage path, kept for the page's life: each path is signed once (all of
  // them in one request), so adding or removing one photo leaves the others' URLs, and their
  // cached images, alone.
  const signedByPath = useRef<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;

    const loadSignedImages = async () => {
      const keys = Object.keys(imagePaths) as StoryKey[];
      const unsigned = keys
        .map((key) => imagePaths[key])
        .filter((path): path is string => !!path && !signedByPath.current[path]);

      if (unsigned.length > 0) {
        const { data } = await supabase.storage
          .from("user-media")
          .createSignedUrls(unsigned, 60 * 60 * 24);
        for (const row of data || []) {
          if (row.path && row.signedUrl) signedByPath.current[row.path] = row.signedUrl;
        }
      }
      if (cancelled) return;

      const nextUrls = { ...INITIAL_IMAGES };
      for (const key of keys) {
        const path = imagePaths[key];
        nextUrls[key] = path ? signedByPath.current[path] || null : null;
      }
      setImageUrls(nextUrls);
    };

    loadSignedImages();
    return () => {
      cancelled = true;
    };
  }, [imagePaths, supabase]);

  const filledSections = useMemo(() => {
    return (Object.values(content) as string[]).filter((value) => {
      const stripped = stripHtml(value);
      return stripped.trim().length > 0;
    }).length;
  }, [content]);

  const saveAll = async () => {
    setSaving(true);

    const payload = {
      early_years: content.early_years || null,
      important_moments: content.important_moments || null,
      special_memories: content.special_memories || null,
      who_they_are: content.who_they_are || null,
      early_years_image: imagePaths.early_years || null,
      important_moments_image: imagePaths.important_moments || null,
      special_memories_image: imagePaths.special_memories || null,
      who_they_are_image: imagePaths.who_they_are || null,
    };

    // select('id') so an update blocked by row security (no error, no row) counts as failed:
    // the chapter used to show "Saved" either way.
    const { data: updated, error } = await supabase
      .from("family_members")
      .update(payload)
      .eq("id", member.id)
      .select("id");

    const ok = !error && !!updated && updated.length > 0;
    if (ok) {
      setMember((prev: any) => (prev ? { ...prev, ...payload } : prev));
      setSavedMessage(true);
      window.setTimeout(() => setSavedMessage(false), 2200);
    } else {
      toast.error("Couldn't save this chapter. Please try again.");
    }

    setSaving(false);
    return ok;
  };

  const uploadStoryImage = async (rawFile: File, key: StoryKey) => {
    setUploadingKey(key);
    // try/finally: a photo that can't be converted (an odd HEIC) used to leave
    // "Uploading photo..." on screen for good.
    try {
      const file = await ensureDisplayableImage(rawFile);

      const { data: sess } = await supabase.auth.getSession();
      const uid = sess?.session?.user?.id;

      if (!uid) {
        setUploadingKey(null);
        return;
      }

      const ext = file.name.split(".").pop() || "jpg";
      const cleanKey = key.replace(/_/g, "-");
      const path = `${uid}/story-${cleanKey}-${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("user-media")
        .upload(path, file, { upsert: true });

      if (uploadError) {
        setUploadingKey(null);
        toast.error("Couldn't upload that photo. Please try another.");
        return;
      }

      const { data: signed } = await supabase.storage
        .from("user-media")
        .createSignedUrl(path, 60 * 60 * 24);
      if (signed?.signedUrl) signedByPath.current[path] = signed.signedUrl;

      setImagePaths((prev) => ({
        ...prev,
        [key]: path,
      }));

      setImageUrls((prev) => ({
        ...prev,
        [key]: signed?.signedUrl || null,
      }));

      setMember((prev: any) =>
        prev
          ? {
              ...prev,
              [`${key}_image`]: path,
            }
          : prev
      );
    } catch {
      toast.error("Couldn't use that photo. Please try another.");
    } finally {
      setUploadingKey(null);
    }
  };

  const removeStoryImage = async (key: StoryKey) => {
    setImagePaths((prev) => ({
      ...prev,
      [key]: null,
    }));

    setImageUrls((prev) => ({
      ...prev,
      [key]: null,
    }));

    setMember((prev: any) =>
      prev
        ? {
            ...prev,
            [`${key}_image`]: null,
          }
        : prev
    );
  };

  return (
    <section className={ui.section} aria-labelledby="story-title">
      <SectionHead
        id="story-title"
        tag="Story scrapbook"
        tagDot="var(--c0)"
        title={
          <span className="[overflow-wrap:anywhere]">
            The story of <Accent>{firstName}</Accent>
          </span>
        }
        lead="Build their story in meaningful chapters. Add words, small details, milestones, and a photograph beside each section so it starts to feel like a real keepsake instead of just a blank form."
      />

        <div className={s.chapters}>
          {SECTION_CONFIG.map((section, index) => {
            return (
              <StoryEditorCard
  key={section.key}
  memberId={member.id}
  memberName={member.full_name || firstName}
  memberBorn={member.birth_date || undefined}
  memberDied={member.death_date || undefined}
  memberRelationship={member.relationship_to_user || undefined}
  section={section}
  onSave={() => saveAll()}
  htmlValue={content[section.key]}
  imageUrl={imageUrls[section.key]}
  isUploading={uploadingKey === section.key}
  onHtmlChange={(nextHtml) => {
    setContent((prev) => ({
      ...prev,
      [section.key]: nextHtml,
    }));
  }}
  onUploadImage={(file) => uploadStoryImage(file, section.key)}
  onRemoveImage={() => removeStoryImage(section.key)}
  index={index}
/>
            );
          })}
        </div>
    </section>
  );
}

function StoryEditorCard({
  section,
  htmlValue,
  imageUrl,
  isUploading,
  onHtmlChange,
  onUploadImage,
  onRemoveImage,
  index,
  onSave,
  memberName,
  memberBorn,
  memberDied,
  memberRelationship,
}: {
  memberId: string;
  memberName: string;
  memberBorn?: string;
  memberDied?: string;
  memberRelationship?: string;
  section: SectionConfig;
  htmlValue: string;
  imageUrl: string | null;
  isUploading: boolean;
  onHtmlChange: (nextHtml: string) => void;
  onUploadImage: (file: File) => void;
  onRemoveImage: () => void;
  index: number;
  onSave: () => Promise<boolean>;
}) {
  const { quill, quillRef } = useQuill({
    theme: "snow",
    modules: {
      toolbar: [
        ["bold", "italic", "underline"],
        [{ list: "bullet" }],
      ],
    },
  });

  const tone = toneByKey(section.accent);
  const titleId = `chapter-${section.key}-title`;

  const lastAppliedValueRef = useRef<string>("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!quill) return;

    const handleTextChange = () => {
      const nextHtml = quill.root.innerHTML;
      onHtmlChange(nextHtml);
      lastAppliedValueRef.current = nextHtml;
    };

    quill.on("text-change", handleTextChange);

    return () => {
      quill.off("text-change", handleTextChange);
    };
  }, [quill, onHtmlChange]);

  useEffect(() => {
    if (!quill) return;

    const current = quill.root.innerHTML;
    const next = htmlValue || "";

    if (current !== next && lastAppliedValueRef.current !== next) {
      // Cleaned first: innerHTML runs inline handlers (an onerror in a stored chapter would run
      // for every family member who opens this page).
      quill.root.innerHTML = sanitizeRichTextClient(next);
      lastAppliedValueRef.current = next;
    }
  }, [quill, htmlValue]);

  return (
    <motion.article
      initial={{ opacity: 0, y: 26 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.06 }}
      className={cx(ui.card, s.chapter)}
      aria-labelledby={titleId}
    >
      {/* ── The chapter's name ── */}
      <div className={s.chapterHead}>
        <Tag dot={tone.bg}>{section.eyebrow}</Tag>

        <h3 id={titleId} className={s.chapterTitle}>
          {section.title}
        </h3>

        <p className={s.chapterHint}>{section.hint}</p>
      </div>

      {/* ── Its photo ── */}
      <div className={s.chapterPhoto}>
        <ScrapbookImageCard
          title={section.title}
          accent={section.accent}
          imageUrl={imageUrl}
          isUploading={isUploading}
          onUploadImage={onUploadImage}
          onRemoveImage={onRemoveImage}
        />
      </div>

      {/* ── Prompts, the editor and Save ── */}
      <div className={s.chapterWrite}>
        <div>
          <p className={s.promptsLabel}>
            <Sparkles size={15} strokeWidth={2.4} aria-hidden="true" />
            Writing prompts
          </p>

          <ul className={s.promptList}>
            {section.prompts.map((prompt, idx) => (
              <li key={`${section.key}-${idx}`} className="min-w-0">
                <PromptChip text={prompt} accent={section.accent} />
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className={s.writeHead}>
            <span className={s.writeIcon} aria-hidden="true">
              <Feather size={18} strokeWidth={2.2} />
            </span>

            <div className="min-w-0">
              <p className={s.writeLabel}>Start writing</p>
              <p className={s.writeHint}>{section.shortPrompt}</p>
            </div>
          </div>

          {/* Quill puts its toolbar before the editor, inside this box. */}
          <div className={s.quill} role="group" aria-labelledby={titleId}>
            <div ref={quillRef} />
          </div>
        </div>

        <div className={s.saveRow}>
          <Btn
            size="sm"
            icon={
              saved ? (
                <Check size={16} strokeWidth={2.6} aria-hidden="true" />
              ) : undefined
            }
            onClick={async () => {
              const ok = await onSave();
              if (!ok) return;
              setSaved(true);
              setTimeout(() => setSaved(false), 2000);
            }}
          >
            {saved ? "Saved" : "Save"}
          </Btn>
        </div>
      </div>
    </motion.article>
  );
}

function ScrapbookImageCard({
  title,
  accent,
  imageUrl,
  isUploading,
  onUploadImage,
  onRemoveImage,
}: {
  title: string;
  accent: ToneKey;
  imageUrl: string | null;
  isUploading: boolean;
  onUploadImage: (file: File) => void;
  onRemoveImage: () => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const tone = toneByKey(accent);

  return (
    <div className={s.photoBox}>
      {/* The whole box opens the file picker; its input is hidden from view, not from Tab. */}
      <label className={s.photoPick}>
        {imageUrl ? (
          <span
            className={s.photoFrame}
            style={{ "--frame": tone.bg } as CSSProperties}
          >
            <span className={s.photoInner}>
              <Image
                src={imageUrl}
                alt=""
                fill
                sizes="(max-width: 767px) 100vw, 380px"
                className="object-cover"
              />
            </span>
          </span>
        ) : (
          <span className={s.dropZone}>
            <IconTile Icon={ImagePlus} tone={tone} size="lg" />

            <span className={s.dropTitle}>Add a meaningful photo</span>

            <span
              className={cx(btnClass({ variant: "soft", size: "sm" }), s.dropBtn)}
            >
              <Plus size={16} strokeWidth={2.6} aria-hidden="true" />
              Upload image
            </span>
          </span>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className={ui.srOnly}
          aria-label={imageUrl ? `Change photo: ${title}` : undefined}
          onChange={(e) => {
            const file = e.target.files?.[0];
            // Cleared, so picking the same photo again still fires a change.
            e.target.value = '';
            if (file) onUploadImage(file);
          }}
        />
      </label>

      {imageUrl && (
        <IconBtn
          label="Remove photo"
          onPhoto
          size="sm"
          className={s.photoRemove}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onRemoveImage();
          }}
        >
          <X size={18} strokeWidth={2.4} aria-hidden="true" />
        </IconBtn>
      )}

      {isUploading && (
        <div className={s.uploading} role="status">
          <Spinner size={28} />
          <span>Uploading photo...</span>
        </div>
      )}
    </div>
  );
}

function PromptChip({
  text,
  accent,
}: {
  text: string;
  accent: ToneKey;
}) {
  return (
    <span
      className={cx(ui.chip, ui.chipDot, s.prompt)}
      style={{ "--dot": toneByKey(accent).bg } as CSSProperties}
    >
      {text}
    </span>
  );
}

function stripHtml(html: string) {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ");
}

function countWords(html: string) {
  const stripped = stripHtml(html).trim();
  if (!stripped) return 0;
  return stripped.split(/\s+/).filter(Boolean).length;
}
