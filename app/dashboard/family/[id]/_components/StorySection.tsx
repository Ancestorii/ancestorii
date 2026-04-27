"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getBrowserClient } from "@/lib/supabase/browser";
import { useQuill } from "react-quilljs";
import Image from "next/image";
import { ensureDisplayableImage } from '@/lib/convertImage';
import {
  Plus,
  ImagePlus,
  Sparkles,
  BookOpenText,
  Feather,
  X,
  Heart,
} from "lucide-react";
import "quill/dist/quill.snow.css";

type StoryKey =
  | "early_years"
  | "important_moments"
  | "special_memories"
  | "who_they_are";

type FamilyMember = {
  id: string;
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
  accent: "gold" | "violet" | "mint" | "rose";
  tilt: string;
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
    accent: "gold",
    tilt: "rotate-[-2deg]",
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
    accent: "violet",
    tilt: "rotate-[1.5deg]",
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
    accent: "mint",
    tilt: "rotate-[-1.5deg]",
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
    accent: "rose",
    tilt: "rotate-[1deg]",
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
  }, [member]);

  useEffect(() => {
    const loadSignedImages = async () => {
      const nextUrls: StoryImages = {
        early_years: null,
        important_moments: null,
        special_memories: null,
        who_they_are: null,
      };

      for (const key of Object.keys(imagePaths) as StoryKey[]) {
        const path = imagePaths[key];
        if (!path) continue;

        const { data } = await supabase.storage
          .from("user-media")
          .createSignedUrl(path, 60 * 60 * 24);

        nextUrls[key] = data?.signedUrl || null;
      }

      setImageUrls(nextUrls);
    };

    loadSignedImages();
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

    const { error } = await supabase
      .from("family_members")
      .update(payload)
      .eq("id", member.id);

    if (!error) {
      setMember((prev: any) => (prev ? { ...prev, ...payload } : prev));
      setSavedMessage(true);
      window.setTimeout(() => setSavedMessage(false), 2200);
    }

    setSaving(false);
  };

  const uploadStoryImage = async (rawFile: File, key: StoryKey) => {
    setUploadingKey(key);
    const file = await ensureDisplayableImage(rawFile);

    const { data: auth } = await supabase.auth.getUser();
    const uid = auth?.user?.id;

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
      return;
    }

    const { data: signed } = await supabase.storage
      .from("user-media")
      .createSignedUrl(path, 60 * 60 * 24);

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

    setUploadingKey(null);
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
    <section className="relative mt-16">
      <div className="pointer-events-none absolute inset-x-0 top-8 h-[1px] bg-gradient-to-r from-transparent via-[#d4af37]/25 to-transparent" />
      <div className="pointer-events-none absolute left-[-120px] top-24 h-[260px] w-[260px] rounded-full bg-[#d4af37]/8 blur-3xl" />
      <div className="pointer-events-none absolute right-[-80px] top-40 h-[240px] w-[240px] rounded-full bg-[#8d77ff]/8 blur-3xl" />

      <div className="relative mx-auto max-w-[1380px] px-2 sm:px-4 lg:px-6">
        <div className="relative overflow-hidden rounded-[34px] border border-[#eadfbf] bg-[linear-gradient(180deg,rgba(255,255,255,0.84),rgba(250,245,235,0.96))] shadow-[0_28px_90px_rgba(16,35,71,0.08)]">
          <div className="absolute inset-x-0 top-0 h-[4px] bg-gradient-to-r from-[#d4af37] via-[#f0ddb0] to-[#8d77ff]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(212,175,55,0.10),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(141,119,255,0.08),transparent_30%)]" />

          <div className="relative px-5 py-7 sm:px-8 sm:py-9 lg:px-12 lg:py-12 xl:px-14">
            <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#ead99b] bg-[#fff8df] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#9e7820] shadow-sm">
                  <BookOpenText className="h-4 w-4" />
                  Story scrapbook
                </div>

                <h2 className="text-[2rem] font-semibold leading-[1.02] tracking-[-0.05em] text-[#18202d] sm:text-[2.4rem] lg:text-[3rem]">
                  The story of {firstName}
                </h2>

                <p className="mt-4 max-w-3xl text-[15px] leading-8 text-[#596377] sm:text-[16px]">
                  Build their story in meaningful chapters. Add words, small
                  details, milestones, and a photograph beside each section so
                  it starts to feel like a real keepsake instead of just a blank
                  form.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 space-y-14 lg:space-y-20 pb-20 sm:pb-24 lg:pb-28">
          {SECTION_CONFIG.map((section, index) => {
            return (
              <StoryEditorCard
                key={section.key}
                memberId={member.id}
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
}: {
  memberId: string;
  section: SectionConfig;
  htmlValue: string;
  imageUrl: string | null;
  isUploading: boolean;
  onHtmlChange: (nextHtml: string) => void;
  onUploadImage: (file: File) => void;
  onRemoveImage: () => void;
  index: number;
  onSave: () => void;
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

  const accentStyles = {
  gold: {
    border: "border-[#e8dcc0]",
    bg: "bg-[linear-gradient(180deg,#ffffff_0%,#fdf9f0_100%)]",
    topBar: "from-[#d4af37] via-[#f0ddb0] to-transparent",
    glow: "bg-[#d4af37]/6",
    promptBg: "bg-[linear-gradient(180deg,#fffdfa_0%,#fff8ee_100%)]",
    bullet: "bg-[#d4af37]",
  },
  violet: {
    border: "border-[#dcd6ff]",
    bg: "bg-[linear-gradient(180deg,#ffffff_0%,#f5f3ff_100%)]",
    topBar: "from-[#8d77ff] via-[#c4b8ff] to-transparent",
    glow: "bg-[#8d77ff]/6",
    promptBg: "bg-[linear-gradient(180deg,#faf9ff_0%,#f1edff_100%)]",
    bullet: "bg-[#8d77ff]",
  },
  mint: {
    border: "border-[#cdeee6]",
    bg: "bg-[linear-gradient(180deg,#ffffff_0%,#f2fffb_100%)]",
    topBar: "from-[#32d5b2] via-[#9df0db] to-transparent",
    glow: "bg-[#32d5b2]/6",
    promptBg: "bg-[linear-gradient(180deg,#f8fffd_0%,#ecfffb_100%)]",
    bullet: "bg-[#32d5b2]",
  },
  rose: {
    border: "border-[#f3d8de]",
    bg: "bg-[linear-gradient(180deg,#ffffff_0%,#fff6f8_100%)]",
    topBar: "from-[#e9a2b0] via-[#f7c8d2] to-transparent",
    glow: "bg-[#e9a2b0]/6",
    promptBg: "bg-[linear-gradient(180deg,#fffafa_0%,#fff1f4_100%)]",
    bullet: "bg-[#e9a2b0]",
  },
};

const styles = accentStyles[section.accent];

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
      quill.root.innerHTML = next;
      lastAppliedValueRef.current = next;
    }
  }, [quill, htmlValue]);

  const imageSideClass = "lg:order-1";
  const textSideClass = "lg:order-2";

  return (
    <motion.div
      initial={{ opacity: 0, y: 26 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.06 }}
      className="relative"
    >
      <div className="pointer-events-none absolute left-8 top-4 hidden h-[1px] w-24 bg-gradient-to-r from-[#d4af37]/40 to-transparent lg:block" />
      <div className="grid gap-6 lg:grid-cols-[minmax(330px,420px)_1fr] lg:gap-10 xl:grid-cols-[minmax(360px,450px)_1fr]">
        <div className={`${imageSideClass}`}>
          <ScrapbookImageCard
            title={section.title}
            eyebrow={section.eyebrow}
            accent={section.accent}
            tilt={section.tilt}
            imageUrl={imageUrl}
            isUploading={isUploading}
            onUploadImage={onUploadImage}
            onRemoveImage={onRemoveImage}
          />
        </div>

        <div className={`${textSideClass}`}>
          <div className={`relative overflow-hidden rounded-[30px] border ${styles.border} ${styles.bg} shadow-[0_20px_50px_rgba(16,35,71,0.07)]`}>
            <div className={`absolute inset-x-0 top-0 h-[4px] bg-gradient-to-r ${styles.topBar}`} />
            <div className="absolute right-[-60px] top-[-10px] h-[180px] w-[180px] rounded-full ${styles.glow} blur-3xl" />

            <div className="relative px-5 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
              <div className="flex flex-col gap-5">
                <div className="border-b border-[#efe5d1] pb-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="max-w-2xl">
                      <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#efe4c5] bg-[#fffaf0] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#b8921e]">
                        <Heart className="h-3.5 w-3.5" />
                        {section.eyebrow}
                      </div>

                      <h3 className="text-[1.55rem] font-semibold tracking-[-0.03em] text-[#162132] sm:text-[1.8rem]">
                        {section.title}
                      </h3>

                      <p className="mt-2 text-[15px] leading-7 text-[#5d6779]">
                        {section.hint}
                      </p>
                    </div>
                    <div />
                  </div>
                </div>

                <div className={`rounded-[24px] border border-[#efe5d1] ${styles.promptBg} p-4 sm:p-5`}>
                  <div className="mb-4 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-[#b8921e]" />
                    <p className="text-[12px] font-semibold uppercase tracking-[0.24em] text-[#b8921e]">
                      Writing prompts
                    </p>
                  </div>

                  <div className="space-y-2">
  {section.prompts.map((prompt, idx) => (
    <div
      key={`${section.key}-${idx}`}
      className="flex gap-3 text-[14px] leading-7 text-[#5f697c]"
    >
      <span className={`mt-[10px] h-[6px] w-[6px] rounded-full ${styles.bullet} shrink-0`} />
      <p className="flex-1">{prompt}</p>
    </div>
  ))}
</div>
                </div>

                <div className="border border-[#e6dcc8] bg-white shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
                  <div className="border-b border-[#efe5d1] px-4 py-4 sm:px-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#ead99b] bg-[#fff8df] text-[#a57d22]">
                        <Feather className="h-5 w-5" />
                      </div>

                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#a57d22]">
                          Start writing
                        </p>
                        <p className="mt-1 text-[14px] leading-6 text-[#60697c]">
                          {section.shortPrompt}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="px-0 py-0">
                    <div
                      ref={quillRef}
                      className="story-quill-editor min-h-[240px] bg-transparent sm:min-h-[280px]"
                    />
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
  <button
  onClick={async () => {
    await onSave();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }}
  className={`inline-flex items-center gap-2 rounded-full border px-5 py-2 text-xs font-semibold shadow-[0_8px_18px_rgba(0,0,0,0.08)] transition hover:-translate-y-[1px]
${
  section.accent === "gold"
    ? "border-[#ead99b] bg-[#fff8df] text-[#a57d22]"
    : section.accent === "violet"
    ? "border-[#d9d3ff] bg-[#f4f1ff] text-[#7058ee]"
    : section.accent === "mint"
    ? "border-[#c8f2e7] bg-[#ecfffb] text-[#157c66]"
    : "border-[#f3d8de] bg-[#fff4f6] text-[#b86478]"
}`}
>
  {saved ? "Saved ✓" : "Save"}
</button>
</div>
              </div>
            </div>
          </div>

          <style jsx global>{`
            .story-quill-editor .ql-toolbar.ql-snow {
              border: 0;
              border-bottom: 1px solid #efe5d1;
              background: linear-gradient(180deg, #fffdfa 0%, #fcf5e9 100%);
              padding: 14px 16px;
            }

            .story-quill-editor .ql-container.ql-snow {
              border: 0;
              font-family: Inter, sans-serif;
            }

            .story-quill-editor .ql-editor {
              min-height: 180px;
              padding: 20px 18px 22px 18px;
              font-size: 16px;
              line-height: 1.95;
              color: #1f2735;
            }

            .story-quill-editor .ql-editor p {
              margin-bottom: 0.7rem;
            }

            .story-quill-editor .ql-editor ul {
              padding-left: 1.15rem;
            }

            .story-quill-editor .ql-editor.ql-blank::before {
              left: 18px;
              right: 18px;
              font-style: normal;
              color: #9aa3b2;
            }

            .story-quill-editor .ql-snow .ql-stroke {
              stroke: #6b7280;
            }

            .story-quill-editor .ql-snow .ql-fill {
              fill: #6b7280;
            }

            .story-quill-editor .ql-snow .ql-picker {
              color: #6b7280;
            }

            .story-quill-editor .ql-toolbar button:hover .ql-stroke,
            .story-quill-editor .ql-toolbar button.ql-active .ql-stroke {
              stroke: #b8921e;
            }

            .story-quill-editor .ql-toolbar button:hover .ql-fill,
            .story-quill-editor .ql-toolbar button.ql-active .ql-fill {
              fill: #b8921e;
            }
          `}</style>
        </div>
      </div>
    </motion.div>
  );
}

function ScrapbookImageCard({
  title,
  eyebrow,
  accent,
  tilt,
  imageUrl,
  isUploading,
  onUploadImage,
  onRemoveImage,
}: {
  title: string;
  eyebrow: string;
  accent: "gold" | "violet" | "mint" | "rose";
  tilt: string;
  imageUrl: string | null;
  isUploading: boolean;
  onUploadImage: (file: File) => void;
  onRemoveImage: () => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const accentStyles = {
  gold: {
    tape: "bg-[#f6df9d]",
    pin: "bg-[#d4af37]",
    paper: "bg-[linear-gradient(180deg,rgba(255,252,242,0.98),rgba(249,240,220,0.96))]",
    icon: "border-[#ead99b] bg-[#fff8df] text-[#a57d22]",
    button: "border-[#ead99b] bg-[#fff8df] text-[#a57d22]",
    glow: "rgba(212,175,55,0.08)",
  },
  violet: {
    tape: "bg-[#d7d0ff]",
    pin: "bg-[#8d77ff]",
    paper: "bg-[linear-gradient(180deg,rgba(251,249,255,0.98),rgba(239,233,255,0.96))]",
    icon: "border-[#d9d3ff] bg-[#f4f1ff] text-[#7058ee]",
    button: "border-[#d9d3ff] bg-[#f4f1ff] text-[#7058ee]",
    glow: "rgba(141,119,255,0.08)",
  },
  mint: {
    tape: "bg-[#c9f4ea]",
    pin: "bg-[#32d5b2]",
    paper: "bg-[linear-gradient(180deg,rgba(249,255,253,0.98),rgba(235,255,250,0.96))]",
    icon: "border-[#c8f2e7] bg-[#ecfffb] text-[#157c66]",
    button: "border-[#c8f2e7] bg-[#ecfffb] text-[#157c66]",
    glow: "rgba(50,213,178,0.08)",
  },
  rose: {
    tape: "bg-[#f7d8de]",
    pin: "bg-[#e9a2b0]",
    paper: "bg-[linear-gradient(180deg,rgba(255,250,251,0.98),rgba(255,240,244,0.96))]",
    icon: "border-[#f3d8de] bg-[#fff4f6] text-[#b86478]",
    button: "border-[#f3d8de] bg-[#fff4f6] text-[#b86478]",
    glow: "rgba(233,162,176,0.08)",
  },
};

  const styles = accentStyles[accent];

  return (
    <div className="relative px-2 pt-5 sm:px-4">
      <div
        className={`relative mx-auto max-w-[460px] rounded-[28px] border border-[#e8dcc0] ${styles.paper} p-5 shadow-[0_28px_60px_rgba(16,35,71,0.12)] ${tilt}`}
      >
        <div className="pointer-events-none absolute -top-3 left-8 h-7 w-24 rotate-[-6deg] rounded-sm opacity-90 shadow-sm ${styles.tape}" />
        <div
          className={`pointer-events-none absolute -top-3 left-8 h-7 w-24 rotate-[-6deg] rounded-sm opacity-90 shadow-sm ${styles.tape}`}
        />
        <div
          className={`pointer-events-none absolute -top-3 right-8 h-7 w-24 rotate-[8deg] rounded-sm opacity-90 shadow-sm ${styles.tape}`}
        />

        <div
          className={`pointer-events-none absolute left-1/2 top-3 h-3.5 w-3.5 -translate-x-1/2 rounded-full shadow-[0_4px_10px_rgba(0,0,0,0.15)] ${styles.pin}`}
        />

        <div className="relative">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[#8a94a6]">
                {eyebrow}
              </p>
            </div>
          </div>

          <label className="block cursor-pointer">
            <div className="relative overflow-hidden rounded-[22px] border border-white/70 bg-white/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]">
              <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/80 to-transparent" />

              {imageUrl ? (
                <div className="relative h-[280px] w-full sm:h-[320px]">
                  <Image
                    src={imageUrl}
                    alt=""
                    fill
                    sizes="(max-width: 1024px) 100vw, 420px"
                    className="object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/30 via-black/8 to-transparent" />

                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onRemoveImage();
                    }}
                    className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-white/75 bg-white/85 text-[#1f2735] shadow-sm transition hover:bg-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="relative flex h-[280px] flex-col items-center justify-center px-8 text-center sm:h-[320px]">
                  <div
  className="absolute inset-0"
  style={{
    background: `radial-gradient(circle_at_top, ${styles.glow}, transparent 45%)`,
  }}
/>
                  <div className={`relative flex h-16 w-16 items-center justify-center rounded-full border ${styles.icon} shadow-[0_10px_24px_rgba(0,0,0,0.08)]`}>
                    <ImagePlus className="h-7 w-7" />
                  </div>

                  <p className="relative mt-5 text-[18px] font-semibold text-[#18202d]">
                    Add a meaningful photo
                  </p>

                  <div className={`relative mt-5 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold ${styles.button}`}>
                    <Plus className="h-4 w-4" />
                    Upload image
                  </div>
                </div>
              )}

              {isUploading && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/70 backdrop-blur-sm">
                  <div className="flex flex-col items-center gap-4">
                    <div className="h-14 w-14 animate-spin rounded-full border-[3px] border-[#d4af37]/25 border-t-[#d4af37]" />
                    <p className="text-sm font-semibold text-[#6b7280]">
                      Uploading photo...
                    </p>
                  </div>
                </div>
              )}
            </div>

            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onUploadImage(file);
              }}
            />
          </label>
        </div>
      </div>
    </div>
  );
}

function PromptChip({
  text,
  accent,
}: {
  text: string;
  accent: "gold" | "violet" | "mint" | "rose";
}) {
  const accentMap = {
    gold: "border-[#ead99b] bg-[#fff9e8] text-[#7a6323]",
    violet: "border-[#d9d3ff] bg-[#f7f5ff] text-[#6451c9]",
    mint: "border-[#c8f2e7] bg-[#f2fffb] text-[#0f7a65]",
    rose: "border-[#f3d8de] bg-[#fff6f8] text-[#b86478]",
  };

  return (
    <div
      className={`rounded-[18px] border px-4 py-3 text-[13px] leading-6 shadow-sm ${accentMap[accent]}`}
    >
      {text}
    </div>
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