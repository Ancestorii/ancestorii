'use client';

export default function StepIndicator() {
  return (
    <div className="w-full max-w-screen-xl mx-auto mb-10 px-6 lg:px-20">
      {/* Headline */}
      <div className="text-center mb-6">
        <h2 className="text-2xl md:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-[#0F2040]">
          Your{' '}
          <span className="bg-gradient-to-r from-[#D4AF37] via-[#F3D99B] to-[#D4AF37] bg-clip-text text-transparent animate-shimmer">
            Legacy
          </span>
        </h2>

        <p className="mt-3 text-sm md:text-base font-medium text-[#0F2040]/80 max-w-xl mx-auto">
          A private space to preserve the moments, voices, and stories that matter
          most to you.
        </p>
      </div>

      {/* Trust / Protection Strip (single row on all sizes) */}
      <div className="flex flex-row items-center justify-center gap-3 md:gap-6 mb-6 text-center whitespace-nowrap">
        <div className="flex items-center gap-1.5 text-xs md:text-sm text-[#0F2040]/80">
          <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
          Private by default
        </div>

        <div className="flex items-center gap-1.5 text-xs md:text-sm text-[#0F2040]/80">
          <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
          Not shared
        </div>

        <div className="flex items-center gap-1.5 text-xs md:text-sm text-[#0F2040]/80">
          <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
          Personal & protected
        </div>
      </div>

      {/* Gentle reassurance */}
      <p className="text-center text-xs md:text-sm text-[#0F2040]/60 max-w-lg mx-auto">
        It starts with one memory. You can add more whenever you’re ready.
      </p>
    </div>
  );
}
