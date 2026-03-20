'use client';

import Link from 'next/link';

const tableRows = [
  { label: 'Storage', free: '5GB', premium: '500GB' },
  { label: 'Timelines', free: '1', premium: 'Unlimited' },
  { label: 'Albums', free: '1', premium: 'Unlimited' },
  { label: 'Capsules', free: '1', premium: 'Unlimited' },
  { label: 'Max file size', free: '20MB', premium: '10GB' },
  { label: 'Video length', free: '1 min', premium: '30 min' },
  { label: 'Priority support', free: '—', premium: 'Included' },
  { label: 'Early access', free: '—', premium: 'Included' },
];

export default function PricingPage() {

  const price = '£9.99';
  const billingNote = 'Upgrade when you are ready to preserve more of your family library.';

  return (
    <div className="bg-[#FFFDF6] text-[#0F2040]">
      {/* HERO — KEEP EXACTLY THE SAME */}
      <section className="border-b border-[#E8D9A8] bg-[#F6F1E4]">
        <div className="px-6 pb-20 pt-20 sm:pb-24 sm:pt-24">
          <div className="mx-auto max-w-6xl">
            <div className="max-w-[42rem]">
              <p className="text-lg uppercase tracking-[0.25em] text-[#B89B3C]">
                Pricing
              </p>

              <h1 className="mt-5 font-serif text-[2.6rem] leading-[1.05] sm:text-[3.4rem] md:text-[4.1rem]">
                A private place for your family’s stories.
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-relaxed text-[#0F2040]/70 sm:text-lg">
                Start building without a card. Keep it private.
                Upgrade when you are ready to preserve more of your family library.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FREE — KEEP EXACTLY THE SAME */}
      <section className="-mt-10 px-6 sm:-mt-14">
        <div className="mx-auto max-w-6xl">
          <div className="overflow-hidden rounded-[2rem] border border-[#EEDFAE] bg-white shadow-[0_18px_50px_-38px_rgba(15,32,64,0.18)]">
            <div className="grid md:grid-cols-[1.06fr_0.94fr]">
              <div className="p-10 sm:p-12">
                <div className="inline-flex items-center gap-2 rounded-full bg-[#FFF3D6] px-4 py-1.5 text-xs font-semibold text-[#8F7A2A]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#D4AF37]" />
                  Free forever
                </div>

                <h2 className="mt-6 font-serif text-[2.15rem] leading-[1.05] sm:text-[3rem]">
                  Begin with the essentials.
                </h2>

                <p className="mt-5 max-w-xl text-base leading-relaxed text-[#0F2040] sm:text-lg">
                  Create your first timeline, add an album, and save a capsule with the story behind it.
                  If your family grows into it, expand later.
                </p>

                <div className="mt-8 h-px w-full bg-gradient-to-r from-transparent via-[#E7D8A9] to-transparent" />

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="/signup"
                    className="inline-flex items-center justify-center rounded-full bg-[#E6C26E] px-7 py-4 font-semibold text-[#0F2040] transition hover:bg-[#F3D99B]"
                  >
                    Create your free library
                  </Link>
                </div>
              </div>

              <div className="border-t border-[#EEDFAE] bg-[linear-gradient(180deg,#FFF9EE_0%,#FFFDF8_100%)] p-10 md:border-l md:border-t-0 sm:p-12">
                <div className="text-[3.3rem] font-extrabold leading-none tracking-tight text-[#0F2040] sm:text-[4.5rem]">
                  FREE
                </div>

                <ul className="mt-8 space-y-4 text-sm text-[#0F2040]/80 sm:text-base">
                  <li className="flex gap-3">
                    <span className="text-[#D4AF37]">●</span>
                    <span>5GB of secure storage</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-[#D4AF37]">●</span>
                    <span>Create unlimited family members</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-[#D4AF37]">●</span>
                    <span>1 timeline, 1 album and 1 capsule</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-[#D4AF37]">●</span>
                    <span>Private by default</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-[#D4AF37]">●</span>
                    <span>Add stories, voices and context</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-[#D4AF37]">●</span>
                    <span>Upgrade whenever you choose</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PREMIUM */}
      <section
        id="premium"
        className="relative mt-16 overflow-hidden border-t border-[#EEDFAE] bg-[linear-gradient(180deg,#FFF9EE_0%,#F6EDD6_38%,#FDFBF5_72%,#FFF8EC_100%)] sm:mt-20"
      >
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-[-8rem] h-[24rem] w-[44rem] -translate-x-1/2 rounded-full bg-[#F2D47E]/20 blur-[110px]" />
          <div className="absolute left-[-5rem] top-20 h-56 w-56 rounded-full bg-[#EBCF72]/18 blur-3xl" />
          <div className="absolute right-[-5rem] bottom-10 h-72 w-72 rounded-full bg-[#D4AF37]/10 blur-3xl" />
          <div className="absolute inset-0 opacity-[0.035] [background-image:url('data:image/svg+xml,%3Csvg_viewBox%3D%270_0_200_200%27_xmlns%3D%27http%3A//www.w3.org/2000/svg%27%3E%3Cfilter_id%3D%27noiseFilter%27%3E%3CfeTurbulence_type%3D%27fractalNoise%27_baseFrequency%3D%270.75%27_numOctaves%3D%273%27_stitchTiles%3D%27stitch%27/%3E%3C/filter%3E%3Crect_width%3D%27100%25%27_height%3D%27100%25%27_filter%3D%27url(%23noiseFilter)%27/%3E%3C/svg%3E')] bg-[length:180px_180px]" />
        </div>

        <div className="relative px-6 py-20 sm:py-24 lg:py-28">
          <div className="mx-auto max-w-6xl xl:max-w-[1360px] 2xl:max-w-[1480px]">
            <div className="text-center">
              <div className="inline-flex items-center gap-4 sm:gap-5">
                <span className="h-px w-14 bg-gradient-to-r from-transparent to-[#B88918] sm:w-20" />
                <span className="text-[13px] font-semibold uppercase tracking-[0.38em] text-[#8E6600] sm:text-[14px]">
                  Premium Plan
                </span>
                <span className="h-px w-14 bg-gradient-to-l from-transparent to-[#B88918] sm:w-20" />
              </div>
            </div>

            <div className="mt-8 overflow-hidden rounded-[2.3rem] border border-[#E7D9AF] bg-[linear-gradient(160deg,rgba(255,253,247,0.97)_0%,rgba(250,244,229,0.98)_100%)] shadow-[0_32px_96px_-40px_rgba(15,32,64,0.2)]">
              <div className="h-[2px] bg-[linear-gradient(90deg,transparent,#C9A84C_20%,#F0DC9A_50%,#C9A84C_80%,transparent)]" />

              <div className="relative grid lg:grid-cols-[1.12fr_0.88fr]">
                <div className="pointer-events-none absolute inset-0">
                  <div className="absolute left-[-4rem] top-10 h-44 w-44 rounded-full bg-[#F3DE9B]/20 blur-3xl" />
                  <div className="absolute right-[-5rem] top-[-2rem] h-52 w-52 rounded-full bg-[#E7DDF8]/60 blur-3xl" />
                  <div className="absolute bottom-[-5rem] left-1/3 h-44 w-44 rounded-full bg-[#EFD587]/16 blur-3xl" />
                  <div className="absolute top-0 h-[300px] w-full bg-[radial-gradient(ellipse_at_50%_-10%,rgba(212,175,55,0.07)_0%,transparent_65%)]" />
                </div>

                {/* LEFT */}
                <div className="relative p-8 sm:p-10 lg:p-14">
                  <h2 className="max-w-[34rem] font-serif text-[2.25rem] leading-[1.08] tracking-[-0.01em] text-[#0F2040] sm:text-[3rem] lg:text-[3.8rem]">
                    Room to keep more of your family’s life
                  </h2>

                  <p className="mt-5 max-w-[31rem] text-base leading-relaxed text-[#0F2040]/62 sm:text-lg">
                    Premium is for families who want to preserve more properly, with room for more memories,
                    longer moments and no limit on the timelines, albums and capsules you create.
                  </p>

                  <div className="mt-9 h-px w-full max-w-2xl bg-gradient-to-r from-[#D4AF37]/50 via-[#D4AF37]/20 to-transparent" />

                  <div className="mt-9 grid gap-y-8 sm:grid-cols-2 sm:gap-x-12">
                    {[
                      {
                        label: 'Storage',
                        value: '500GB',
                        sub: 'Photos, videos and voice notes',
                      },
                      {
                        label: 'Creations',
                        value: 'Unlimited',
                        sub: 'Timelines, albums and capsules',
                      },
                      {
                        label: 'Max file size',
                        value: '10GB',
                        sub: 'Higher quality, larger memories',
                      },
                      {
                        label: 'Video length',
                        value: '30 min',
                        sub: 'Keep more of the moment',
                      },
                    ].map((item) => (
                      <div key={item.label}>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#A8841E]">
                          {item.label}
                        </p>
                        <p className="mt-2 font-serif text-[2.3rem] leading-none tracking-[-0.02em] text-[#0F2040] sm:text-[3rem]">
                          {item.value}
                        </p>
                        <p className="mt-2 text-sm leading-relaxed text-[#0F2040]/56 sm:text-[15px]">
                          {item.sub}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-10 h-px w-full max-w-2xl bg-gradient-to-r from-[#D4AF37]/35 via-[#D4AF37]/15 to-transparent" />

                  <div className="mt-8 grid gap-y-5 sm:grid-cols-2 sm:gap-x-10">
                    {[
                      {
                        title: 'Priority phone support',
                        sub: 'Faster help when something matters.',
                      },
                      {
                        title: 'Early access to new features',
                        sub: 'Try new parts of Ancestorii first.',
                      },
                    ].map((item) => (
                      <div key={item.title} className="flex items-start gap-3">
                        <span className="mt-[0.1rem] text-[1rem] font-bold leading-none text-[#C9A84C]">✓</span>
                        <div>
                          <p className="text-sm font-semibold text-[#0F2040] sm:text-base">
                            {item.title}
                          </p>
                          <p className="mt-1 text-sm leading-relaxed text-[#0F2040]/52">
                            {item.sub}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* RIGHT */}
                <div className="relative border-t border-[#E9DDAF] bg-[linear-gradient(180deg,rgba(255,255,255,0.45)_0%,rgba(255,249,232,0.92)_100%)] p-8 sm:p-10 lg:border-l lg:border-t-0 lg:p-12">
                  <div className="flex h-full flex-col justify-between">
                    <div>
                      <p className="mt-10 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#A8841E]">
                        Premium pricing
                      </p>

                      <div className="mt-4 flex items-end gap-3">
                        <span className="font-serif text-[4rem] leading-none tracking-[-0.04em] text-[#0F2040] sm:text-[5.2rem]">
                          {price}
                        </span>
                        <span className="pb-3 text-sm text-[#0F2040]/45 sm:text-base">
                          / month
                        </span>
                      </div>

                     <p className="mt-3 text-sm leading-relaxed text-[#0F2040]/56">
                     {billingNote}
                    </p>

                      <div className="mt-6 flex flex-wrap gap-2.5">
                        <span className="rounded-full border border-[#D9C27B]/40 bg-white/70 px-4 py-1.5 text-xs font-semibold text-[#8B6914]">
                          €11.99 EUR
                        </span>
                        <span className="rounded-full border border-[#D9C27B]/40 bg-white/70 px-4 py-1.5 text-xs font-semibold text-[#8B6914]">
                          $12.99 USD
                        </span>
                      </div>

                      <div className="mt-8 h-px w-full bg-gradient-to-r from-[#D4AF37]/35 via-[#D4AF37]/15 to-transparent" />

                      <div className="mt-8">
                        <p className="text-sm leading-relaxed text-[#0F2040]/68">
                          You still begin on Free. Premium is there when you are ready to build a lasting family library.
                        </p>
                      </div>

                      <div className="mt-8 rounded-[1.35rem] border border-[#D8C9F2]/60 bg-[linear-gradient(180deg,#EEE7FB_0%,#E7DDF8_100%)] px-5 py-5">
  <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[#7D5AA8]">
    Included with your first upgrade
  </p>
  <p className="mt-3 text-sm leading-relaxed text-[#0F2040]/75 sm:text-[15px]">
    Your first physical memory book will be free — so your family’s memories can
    live on a real shelf too.
  </p>
</div>
                    </div>

                    <div className="mt-10">
                      <Link
                        href="/signup"
                        className="inline-flex w-full items-center justify-center rounded-full bg-[#1A234D] px-7 py-4 text-base font-semibold text-white transition hover:bg-[#243063]"
                      >
                        Start for free
                      </Link>

                      <p className="mt-4 text-center text-xs leading-relaxed text-[#0F2040]/40">
                        No card required · Upgrade when you are ready to preserve more.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* COMPARISON */}
            <div className="mx-auto mt-14 max-w-5xl lg:mt-28">
              <div className="flex items-center justify-center gap-4 sm:gap-6">
  <span className="h-px w-16 bg-gradient-to-r from-transparent to-[#D4AF37]/70 sm:w-28" />
  <span className="text-[13px] font-semibold uppercase tracking-[0.38em] text-[#8E6600] sm:text-[14px]">
    Compare Plans
  </span>
  <span className="h-px w-16 bg-gradient-to-l from-transparent to-[#D4AF37]/70 sm:w-28" />
</div>

              <div className="mt-8 overflow-hidden rounded-[1.8rem] border border-[#E7D9AF] bg-white shadow-[0_18px_50px_-36px_rgba(15,32,64,0.14)]">
                <div className="grid grid-cols-[1.4fr_0.8fr_0.8fr] border-b border-[#EFE3BE] bg-[#FDFBF5] px-5 py-4 sm:px-8">
                  <div />
                  <div className="text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0F2040]/45">
                    Free
                  </div>
                  <div className="text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-[#B38918]">
                    Premium
                  </div>
                </div>

                {tableRows.map((row, index) => (
                  <div
                    key={row.label}
                    className={`grid grid-cols-[1.4fr_0.8fr_0.8fr] px-5 py-4 sm:px-8 ${
                      index !== tableRows.length - 1 ? 'border-b border-[#F2E7C3]' : ''
                    } ${index % 2 === 0 ? 'bg-white' : 'bg-[#FFFCF4]'}`}
                  >
                    <span className="text-sm text-[#0F2040]">{row.label}</span>
                    <span className="text-center text-sm text-[#0F2040]/42">{row.free}</span>
                    <span className="text-center text-sm font-medium text-[#0F2040]">{row.premium}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* FINAL CTA */}
            <div className="mx-auto mt-14 max-w-5xl">
              <div className="overflow-hidden rounded-[2rem] border border-[#E7D9AF] bg-[linear-gradient(180deg,rgba(255,255,255,0.76)_0%,rgba(255,249,236,0.94)_100%)] shadow-[0_22px_60px_-36px_rgba(15,32,64,0.18)]">
                <div className="flex flex-col items-center justify-between gap-8 px-8 py-10 sm:px-12 lg:flex-row">
                  <div className="text-center lg:text-left">
                    <h3 className="font-serif text-[2rem] leading-tight text-[#0F2040] sm:text-[2.4rem]">
                      Start free today.
                    </h3>
                    <p className="mt-3 max-w-xs text-base leading-relaxed text-[#0F2040]/68 sm:max-w-none">
                       Build your library now, then move to Premium when you are ready to preserve more of your family story.
                    </p>
                  </div>

                  <div className="flex flex-col gap-4 sm:flex-row">
                    <Link
                      href="/signup"
                      className="inline-flex items-center justify-center rounded-full bg-[#E6C26E] px-8 py-3.5 text-sm font-semibold text-[#0F2040] transition hover:bg-[#F3D99B]"
                    >
                      Create your library
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <p className="mt-8 text-center text-xs leading-relaxed text-[#0F2040]/38">
              All plans include encryption at rest and in transit.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}