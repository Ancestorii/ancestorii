import Link from 'next/link';

export default function PodcastPreview() {
  return (
    <section className="relative bg-[#FFFDF6] text-[#0F2040] overflow-hidden">
      {/* soft archival glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(212,175,55,0.12),transparent_55%)]" />

      <div className="relative max-w-screen-md mx-auto px-6 pt-16 pb-20 sm:pt-24 sm:pb-28 space-y-10 sm:space-y-14">
        {/* INTRO */}
        <div className="text-center space-y-4 sm:space-y-6">
          <p className="text-xs tracking-[0.3em] text-[#C9AE4A] uppercase">
            Moments Worth Keeping
          </p>

          <h2 className="text-[2.2rem] sm:text-[3.2rem] font-semibold leading-tight text-[#0F2040]">
            A quiet place
            <br />
            <span className="italic text-[#E5C45C]">
              to slow things down
            </span>
          </h2>

          <p className="text-base sm:text-lg leading-relaxed text-[#1F2A44] max-w-xl mx-auto">
            A few calm minutes to think about memories, photos,
            and the parts of life that usually fade over time.
          </p>
        </div>

        {/* SPOTIFY EMBED */}
        <div className="relative max-w-[520px] mx-auto">
          <div className="rounded-xl overflow-hidden border border-[#E5C45C]/45 shadow-md bg-white">
            <iframe
              src="https://open.spotify.com/embed/show/0fR2O7fyOBB98yGlRpRsiJ"
              width="100%"
              height="232"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
            />
          </div>
        </div>

        {/* Full list link */}
        <div className="text-center">
          <Link
            href="/moments-worth-keeping"
            className="
              inline-flex items-center gap-2
              text-[15px]
              font-medium
              text-[#0F2040]
              transition
              hover:text-[#C9AE4A]
              group
            "
          >
            View all episodes
            <span className="
              text-[#C9AE4A]
              text-lg
              transition-transform
              group-hover:translate-x-1
            ">
              →
            </span>
          </Link>
        </div>

        {/* OUTRO */}
        <div className="text-center max-w-md mx-auto">
          <p className="font-serif text-base sm:text-lg italic text-[#0F2040]">
  A podcast by Ancestorii, for the moments you don’t want to lose.
</p>
        </div>
      </div>
    </section>
  );
}
