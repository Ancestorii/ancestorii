'use client';

import { useRouter } from 'next/navigation';
import { HandHeart, Clock, Image as ImageIcon, Sparkles, ArrowRight, BookOpen, Frame, Diamond, Package, Calendar, Gem, Book } from 'lucide-react';

export default function LibrarySection({
  metrics,
}: {
  metrics: {
    lovedOnes: number;
    timelines: number;
    albums: number;
    capsules: number;
  };
}) {
  const router = useRouter();

  return (
    <section className="w-full bg-white px-4 sm:px-6 py-10">
      <div className="mx-auto max-w-[1200px]">

        {/* YOUR STORIES */}
        <div className="mb-10">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-[#B8924A]">Your Stories</p>
              <h3 className="mt-2 font-serif text-[28px] leading-[1.1] tracking-[-0.03em] text-[#17120E]">
                The memories you&apos;re preserving
              </h3>
            </div>
            <p className="hidden sm:block text-[14px] text-[#7D6F5F] text-right">
              Because some things deserve to last.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <MetricCard
              value={metrics.lovedOnes}
              label="Loved Ones"
              icon={<HandHeart size={18} strokeWidth={1.6} />}
              accent="#C8A557"
              action={metrics.lovedOnes === 0 ? 'Add your first' : 'View all'}
              onAction={() => router.push('/dashboard/family')}
            />
            <MetricCard
              value={metrics.timelines}
              label="Timelines"
              icon={<Calendar size={18} strokeWidth={1.6} />}
              accent="#7C8B6A"
              action={metrics.timelines === 0 ? 'Create one' : 'View all'}
              onAction={() => router.push('/dashboard/timeline')}
            />
            <MetricCard
              value={metrics.albums}
              label="Albums"
              icon={<ImageIcon size={18} strokeWidth={1.6} />}
              accent="#8B7355"
              action={metrics.albums === 0 ? 'Create one' : 'View all'}
              onAction={() => router.push('/dashboard/albums')}
            />
            <MetricCard
              value={metrics.capsules}
              label="Capsules"
              icon={<Package size={18} strokeWidth={1.6} />}
              accent="#A9782F"
              action={metrics.capsules === 0 ? 'Create one' : 'View all'}
              onAction={() => router.push('/dashboard/capsules')}
            />
          </div>
        </div>

        {/* YOUR HEIRLOOMS */}
        <div>
          <div className="mb-6">
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-[#6F6255]">Your Heirlooms</p>
            <h3 className="mt-2 font-serif text-[28px] leading-[1.1] tracking-[-0.03em] text-[#17120E]">
              Made to hold, made to <em className="italic text-[#A9782F]">last</em>
            </h3>
          </div>

          {/* Memory Books — hero card */}
          <div
            className="rounded-[20px] px-5 py-6 sm:px-8 sm:py-8 mb-4"
            style={{
              background: 'linear-gradient(135deg, #1A1612 0%, #2C241B 100%)',
              boxShadow: '0 18px 40px rgba(26,22,18,0.2)',
            }}
          >
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="max-w-[480px]">
                <div className="flex items-center gap-2.5 mb-3">
                  <Book className="h-4 w-4 text-[#C8A557]" strokeWidth={1.7} />
                  <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-[#C8A557]">Memory Books</p>
                </div>
                <h3 className="font-serif text-[24px] leading-[1.15] text-[#FAF5EB]">
                  Your stories, <em className="italic text-[#D4AF37]">printed and bound.</em>
                </h3>
                <p className="mt-3 text-[14px] leading-[1.7] text-[#FFFFFF]">
                  Turn your memories into a hardcover book delivered to your door.
                </p>
              </div>

              <button
                onClick={() => router.push('/dashboard/books')}
                className="inline-flex items-center justify-center gap-2 self-start rounded-[12px] bg-[#C8A557] px-6 py-3 text-[14px] font-semibold text-white shadow-[0_8px_20px_rgba(184,146,74,0.25)] transition hover:bg-[#B8924A] sm:self-center"
              >
                Create your book <ArrowRight size={14} />
              </button>
            </div>
          </div>

          {/* Canvas + Acrylic */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <HeirloomCard
              icon={<Frame size={20} strokeWidth={1.5} />}
              title="Canvas Prints"
              description="Gallery-quality prints on stretched canvas."
              onAction={() => router.push('/dashboard/canvas')}
            />
            <HeirloomCard
              icon={<Gem size={20} strokeWidth={1.5} />}
              title="Acrylic Prints"
              description="Vivid colours behind crystal-clear acrylic."
              onAction={() => router.push('/dashboard/acrylic')}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function MetricCard({
  value, label, icon, accent, action, onAction,
}: {
  value: number;
  label: string;
  icon: React.ReactNode;
  accent: string;
  action: string;
  onAction: () => void;
}) {
  return (
    <div
      onClick={onAction}
      className="group cursor-pointer rounded-[16px] bg-[#FFFDF9] p-5 transition hover:shadow-[0_12px_28px_rgba(44,36,27,0.08)]"
      style={{ border: '1px solid #EAD8B8' }}
    >
      <div className="flex items-center gap-2 mb-4" style={{ color: accent }}>
        {icon}
        <span className="text-[11px] font-bold uppercase tracking-[0.14em]">{label}</span>
      </div>
      <div className="text-[40px] font-bold leading-none tracking-[-0.04em] text-[#17120E]">
        {value}
      </div>
      <div className="mt-4 flex items-center gap-1.5 text-[13px] font-semibold transition" style={{ color: accent }}>
        <span className="group-hover:underline">{action}</span>
        <ArrowRight size={13} className="transition group-hover:translate-x-0.5" />
      </div>
    </div>
  );
}

function HeirloomCard({
  icon, title, description, onAction,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  onAction: () => void;
}) {
  return (
    <div
      onClick={onAction}
      className="group cursor-pointer rounded-[16px] bg-[#FFFDF9] px-6 py-5 transition hover:shadow-[0_12px_28px_rgba(44,36,27,0.08)]"
      style={{ border: '1px solid #EAD8B8' }}
    >
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[10px] bg-[#F5EDD8] text-[#A9782F]">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[16px] font-semibold text-[#17120E]">{title}</p>
          <p className="mt-1 text-[13px] leading-[1.6] text-[#6F6255]">{description}</p>
          <p className="mt-3 flex items-center gap-1.5 text-[13px] font-semibold text-[#A9782F] transition group-hover:underline">
            Create <ArrowRight size={13} className="transition group-hover:translate-x-0.5" />
          </p>
        </div>
      </div>
    </div>
  );
}