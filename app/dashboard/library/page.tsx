'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { getBrowserClient } from '@/lib/supabase/browser';
import UploadLibraryDrawer from './_components/UploadLibraryDrawer';
import { motion } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import DeleteLibraryMediaModal from './_components/DeleteLibraryMediaModal';

const Particles = dynamic(() => import('@/components/ParticlesPlatform'), {
  ssr: false,
});

type LibraryMedia = {
  id: string;
  user_id: string;
  file_path: string;
  file_type: string;
  created_at: string;
};

export default function LibraryPage() {
  const supabase = getBrowserClient();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [media, setMedia] = useState<LibraryMedia[]>([]);
  const [signedMap, setSignedMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    filePath: string;
  } | null>(null);

  const line1 = '“Everything you upload lives here first.”';
  const line2 =
    'From here, you can use your media inside albums, timelines and capsules.';

  const [typed1, setTyped1] = useState('');
  const [typed2, setTyped2] = useState('');
  const [isTyping1Done, setIsTyping1Done] = useState(false);

  const TYPING_KEY = 'library_typing_last_run';
  const TYPING_RESET_MS = 24 * 60 * 60 * 1000;

  useEffect(() => {
    fetchLibrary();
  }, []);

  async function fetchLibrary() {
    setLoading(true);

    const { data, error } = await supabase
      .from('library_media')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      setLoading(false);
      return;
    }

    if (!data || data.length === 0) {
      setMedia([]);
      setSignedMap({});
      setLoading(false);
      return;
    }

    const signedResults = await Promise.all(
      data.map(async (item) => {
        const { data: urlData } = await supabase.storage
          .from('library-media')
          .createSignedUrl(item.file_path, 60 * 60 * 24 * 7);

        return {
          id: item.id,
          url: urlData?.signedUrl || null,
        };
      })
    );

    const signed: Record<string, string> = {};
    signedResults.forEach((r) => {
      if (r.url) signed[r.id] = r.url;
    });

    setMedia(data);
    setSignedMap(signed);

    requestAnimationFrame(() => {
      setLoading(false);
    });
  }

  useEffect(() => {
    const lastRun = localStorage.getItem(TYPING_KEY);
    const now = Date.now();

    if (lastRun && now - Number(lastRun) < TYPING_RESET_MS) {
      setTyped1(line1);
      setTyped2(line2);
      setIsTyping1Done(true);
      return;
    }

    localStorage.setItem(TYPING_KEY, String(now));

    let i1 = 0;
    let i2 = 0;
    let t1: any;
    let t2: any;

    const speed = 45;

    t1 = setInterval(() => {
      i1++;
      setTyped1(line1.slice(0, i1));
      if (i1 >= line1.length) {
        clearInterval(t1);
        setIsTyping1Done(true);

        setTimeout(() => {
          t2 = setInterval(() => {
            i2++;
            setTyped2(line2.slice(0, i2));
            if (i2 >= line2.length) clearInterval(t2);
          }, speed);
        }, 600);
      }
    }, speed);

    return () => {
      clearInterval(t1);
      clearInterval(t2);
    };
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden font-[Inter] bg-gradient-to-b from-white via-[#fefaf3] to-[#faf7ed]">
      <Particles />

      <div className="relative z-10 px-6 sm:px-8 pt-16 pb-24 max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-10 mb-12">
          <div className="text-center md:text-left flex-1">
            <h1 className="text-4xl md:text-5xl font-bold text-[#222B3A] mb-4 relative inline-block">
              <span className="relative">
                My
                <motion.span
                  className="absolute left-0 -bottom-2 h-[3px] bg-[#C8A557] rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: 70 }}
                  transition={{ delay: 0.2, duration: 0.8 }}
                />
              </span>{' '}
              <span className="text-[#C8A557]">Library</span>
            </h1>

            <p className="text-[#5B6473] mt-3 text-lg italic min-h-[30px]">
              {typed1}
            </p>

            <p
              className={`text-[#7A8596] text-sm mt-2 transition-opacity duration-500 ${
                isTyping1Done ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {typed2}
            </p>
          </div>

          <div className="flex justify-center md:justify-end flex-1">
            <button
              onClick={() => setDrawerOpen(true)}
              className="px-8 py-4 rounded-full bg-gradient-to-r from-[#E6C26E] to-[#F3D99B] text-[#1F2837] font-semibold text-lg shadow-md hover:shadow-lg transition-transform hover:scale-[1.03] relative overflow-hidden"
            >
              <span className="relative z-10">+ Upload Media</span>
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[shine_3s_linear_infinite]" />
            </button>
          </div>
        </div>

        {/* CONTENT */}
        {loading ? (
          <p className="text-[#778199] italic text-center">
            Loading your library...
          </p>
        ) : media.length === 0 ? (
          <div className="text-center text-[#0f2040] italic mt-12">
            Your library is empty. Upload your first memory ✨
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8">
            {media.map((item) => {
              const url = signedMap[item.id];
              if (!url) return null;

              return (
                <div
                  key={item.id}
                  className="rounded-3xl border border-[#B7932F]/60 shadow-md hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-300 overflow-hidden bg-white/95"
                >
                  {/* MEDIA CONTAINER */}
                  <div className="aspect-[16/9] relative bg-gradient-to-b from-[#F3F4F6] to-[#EAECEF] overflow-hidden">

                    {/* 🔥 Trash Icon INSIDE media */}
                    <button
                      onClick={() =>
                        setDeleteTarget({
                          id: item.id,
                          filePath: item.file_path,
                        })
                      }
                      className="absolute top-3 right-3 z-50 w-6 h-6 md:w-7 md:h-7 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg hover:bg-red-700 transition"
                    >
                      <Trash2 className="w-3 h-3 md:w-3.5 md:h-3.5" />
                    </button>

                    {item.file_type === 'video' ? (
                      <video
                        preload="metadata"
                        src={url}
                        className="w-full h-full object-cover"
                        controls
                      />
                    ) : (
                      <img
                        src={url}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                        alt=""
                      />
                    )}
                  </div>

                  <div className="p-4">
                    <p className="text-xs text-[#7A8596]">
                      Added {new Date(item.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <UploadLibraryDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onUploaded={() => fetchLibrary()}
      />

      <DeleteLibraryMediaModal
        open={!!deleteTarget}
        mediaId={deleteTarget?.id || ''}
        filePath={deleteTarget?.filePath || ''}
        onClose={() => setDeleteTarget(null)}
        onDeleted={() => {
          setMedia((prev) =>
            prev.filter((m) => m.id !== deleteTarget?.id)
          );
        }}
      />

      <style jsx global>{`
        @keyframes shine {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
}