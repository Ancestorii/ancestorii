'use client';

type Step = 'signup' | 'plan' | 'pay';

type StepIndicatorProps = {
  step: Step;
};

const steps: {
  key: Step;
  label: string;
  sub: string;
}[] = [
  {
    key: 'signup',
    label: 'Create your legacy',
    sub: 'Begin preserving what matters most',
  },
  {
    key: 'plan',
    label: 'Choose your vault',
    sub: 'Select how your memories are protected',
  },
  {
    key: 'pay',
    label: 'Seal & protect',
    sub: 'Secure your legacy for generations',
  },
];

export default function StepIndicator({ step }: StepIndicatorProps) {
  const currentIndex = steps.findIndex((s) => s.key === step);

  return (
    <div className="w-full max-w-screen-xl mx-auto mb-6 px-6 lg:px-20">
      {/* Headline */}
      <div className="text-center mb-6">
  <h2 className="text-2xl md:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-[#0F2040]">
    Your{' '}
    <span className="bg-gradient-to-r from-[#D4AF37] via-[#F3D99B] to-[#D4AF37] bg-clip-text text-transparent animate-shimmer">
      Legacy Journey
    </span>
  </h2>

  <p className="mt-2 text-sm md:text-base font-medium text-[#0F2040]">
    What you preserve here is built to outlive you
  </p>
</div>

      {/* Progress */}
      <div className="relative flex justify-between">
        {/* Base line */}
        <div className="absolute left-0 right-0 top-4 h-[2px] bg-[#D4AF37]/20" />

        {/* Active line */}
        <div
          className="absolute left-0 top-4 h-[2px] bg-[#D4AF37] transition-all duration-700 ease-out"
          style={{
            width:
              currentIndex === 0
                ? '0%'
                : currentIndex === 1
                ? '50%'
                : '100%',
          }}
        />

        {steps.map((s, index) => {
          const isActive = index <= currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <div
              key={s.key}
              className="relative z-10 flex flex-col items-center text-center w-1/3 px-3 lg:px-6"
            >
              {/* Circle */}
              <div
                className={`flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 text-sm font-semibold transition-all duration-300 ${
                  isActive
                    ? 'bg-[#D4AF37] border-[#D4AF37] text-[#0F2040] shadow-[0_0_12px_rgba(212,175,55,0.45)]'
                    : 'bg-[#fffdf7] border-[#D4AF37]/40 text-gray-400'
                }`}
              >
                {index + 1}
              </div>

              {/* Label */}
              <span
              className={`mt-4 md:mt-5 font-semibold leading-tight whitespace-nowrap transition-colors ${
              isActive ? 'text-[#0F2040]' : 'text-gray-400'
              }`}
             >
             {/* Mobile */}
              <span className="block sm:hidden text-[13px]">
                  {s.key === 'signup' && 'Create'}
                  {s.key === 'plan' && 'Choose'}
                  {s.key === 'pay' && 'Seal'}
                  </span>

           {/* Desktop */}
            <span className="hidden sm:block text-base md:text-lg">
            {s.label}
  </span>
</span>


              {/* Subtext */}
              <span
             className={`mt-1 hidden sm:block text-xs md:text-sm leading-tight transition-colors ${
             isCurrent
             ? 'text-[#0F2040]/70'
             : 'text-gray-400/70'
             }`}
             >

                {s.sub}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
