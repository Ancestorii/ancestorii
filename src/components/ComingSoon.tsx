'use client';

export default function ComingSoon({
  title,
  description = "We're putting the finishing touches on this. Something worth keeping is worth doing properly.",
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="min-h-screen flex items-start justify-center bg-gradient-to-b from-white via-[#fefaf3] to-[#faf7ed] px-6 pt-24">
      <div className="text-center max-w-lg">

        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="h-[1px] w-10 bg-[#D4AF37]/40" />
          <p className="text-[11px] font-semibold tracking-[0.2em] text-[#D4AF37] uppercase">
            Coming Soon
          </p>
          <div className="h-[1px] w-10 bg-[#D4AF37]/40" />
        </div>

        <h1 className="text-3xl md:text-4xl font-semibold text-[#0F2040] mb-5 leading-snug">
          {title}
        </h1>

        <p className="text-[#5B6473] italic text-[15px] leading-relaxed mb-10">
          {description}
        </p>

        <div className="w-12 h-[2px] bg-[#D4AF37]/50 mx-auto" />

      </div>
    </div>
  );
}