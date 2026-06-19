
export default function StepIndicator() {
  return (
    <div className="w-full max-w-screen-xl mx-auto mb-10 px-[clamp(1.5rem,5vw,5rem)]">
      {/* Headline */}
      <div className="text-center mb-4">
        <h2 className="text-[clamp(2.25rem,6vw,3.75rem)] font-extrabold tracking-tight leading-[1.1] text-[#0F2040]">
        Your story,
        <br className="sm:hidden" />{' '}
        <span className="text-[#D4AF37]">
        still being written
  </span>
</h2>
      </div>

      {/* Sub-heading (intimate) */}
      <p className="text-center text-sm sm:text-base text-[#0F2040]/80 mb-3">
        A private place for the moments you don’t want to lose.
      </p>

      {/* Free reassurance */}
      <p className="text-center text-sm md:text-base font-semibold text-[#0F2040]">
        Start for free. <span className="text-[#D4AF37]">No payment details required.</span>
      </p>
    </div>
  );
}
