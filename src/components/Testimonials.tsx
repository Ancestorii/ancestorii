'use client';

const testimonials = [
  {
    name: 'Nicole',
    location: 'Nampa, United States',
    quote: 'In my case, I have external hard drives full of photos I never get to see, but Ancestorii finally gave those memories a place where they can be easily enjoyed and shared.',
    image: '/testimonial1.png',
  },
  {
    name: 'Andrea',
    location: 'Dudley, United Kingdom',
    quote: 'I recently lost my dad, so this book became incredibly special. It captured the essence of him and the life he lived. Our family will treasure it for years to come.',
    image: '/testimonial4.png',
  },
];

const Star = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="#FFB800" stroke="none">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

export default function Testimonials() {
  return (
    <section className="relative w-full overflow-hidden bg-white py-14 md:py-20 lg:py-28">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 60% 10%, rgba(212,175,55,0.06), transparent 50%)',
        }}
      />

      <div className="relative mx-auto max-w-[1400px] px-6 md:px-10 lg:px-16">

        {/* ── HEADER ── */}
        <div className="text-center mb-8 md:mb-12">
          <p
            className="font-sans uppercase text-[#B8932A] mb-3"
            style={{ fontSize: 'clamp(0.82rem, 0.8vw, 0.72rem)', letterSpacing: '0.28em', fontWeight: 700 }}
          >
            From Our Families
          </p>
          <h2
            className="font-serif text-[#000] font-bold"
            style={{
              fontSize: 'clamp(2.2rem, 4.5vw, 3.8rem)',
              lineHeight: 1.05,
              letterSpacing: '-0.03em',
            }}
          >
            Memories{' '}
            <em className="font-normal italic" style={{ color: '#B8932A' }}>finally</em>
            {' '}given a home.
          </h2>

          <div className="flex items-center justify-center gap-4 mt-5">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => <Star key={i} />)}
            </div>
            <div className="h-[1px] w-8" style={{ background: 'rgba(184,147,42,0.3)' }} />
            <p
              className="font-sans uppercase text-[#B8932A]"
              style={{ fontSize: '0.58rem', letterSpacing: '0.2em', fontWeight: 700 }}
            >
              Real Stories
            </p>
          </div>
        </div>

        {/* ── MOBILE / TABLET: horizontal scroll ── */}
        <div className="block lg:hidden">
          <div
            className="flex gap-4 overflow-x-auto pb-2 px-[8vw] snap-x snap-mandatory"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="flex-shrink-0 w-[78vw] max-w-[380px] snap-center"
              >
                <MobileCard testimonial={t} />
              </div>
            ))}
          </div>

          {/* Swipe indicator — prominent */}
          <p
            className="text-center font-sans text-[#B8932A] mt-5"
            style={{ fontSize: '0.82rem', letterSpacing: '0.08em', fontWeight: 700 }}
          >
            Swipe for more →
          </p>
        </div>

        {/* ── DESKTOP: grid ── */}
        <div
          className="hidden lg:grid gap-8 xl:gap-10"
          style={{
            gridTemplateColumns: `repeat(${testimonials.length}, minmax(0, 1fr))`,
          }}
        >
          {testimonials.map((t) => (
            <DesktopCard key={t.name} testimonial={t} />
          ))}
        </div>
      </div>

      <div
        className="absolute bottom-0 left-0 w-full h-[3px]"
        style={{
          background: 'linear-gradient(to right, rgba(184,147,42,0.4), rgba(184,147,42,0.1))',
        }}
      />

      <style>{`
        .snap-x { scroll-snap-type: x mandatory; }
        .snap-center { scroll-snap-align: center; }
        .flex.overflow-x-auto::-webkit-scrollbar,
        .flex.snap-x::-webkit-scrollbar { display: none; }
      `}</style>
    </section>
  );
}

/* ─── MOBILE CARD — fixed height so all cards match ─── */
function MobileCard({
  testimonial,
}: {
  testimonial: (typeof testimonials)[number];
}) {
  return (
    <div
      className="overflow-hidden flex flex-col"
      style={{
        border: '1px solid rgba(184,147,42,0.15)',
        height: '460px',
      }}
    >
      {/* Photo — fixed height */}
      <div className="relative w-full h-[220px] flex-shrink-0">
        <img
          src={testimonial.image}
          alt={`${testimonial.name} with their Ancestorii Memory Book`}
          className="absolute inset-0 w-full h-full object-cover brightness-[0.92] contrast-[1.05]"
          style={{ objectPosition: '50% 15%' }}
        />
      </div>

      {/* Golden quote card — fills remaining space */}
      <div
        className="flex flex-col justify-between flex-1 p-5"
        style={{ background: 'linear-gradient(160deg, #F5EDDA 0%, #EDE3CB 100%)' }}
      >
        <div>
          <svg
            width="22"
            height="16"
            viewBox="0 0 32 24"
            fill="#B8932A"
            className="mb-3 opacity-40"
          >
            <path d="M0 24V14.4C0 6.08 4.48 1.12 13.44 0l1.28 3.2C9.28 4.48 7.04 8 6.72 12H12v12H0zm18.56 0V14.4C18.56 6.08 23.04 1.12 32 0l1.28 3.2c-5.44 1.28-7.68 4.8-8 8.8h5.28v12H18.56z" />
          </svg>
          <blockquote
            className="font-serif text-[#000] italic"
            style={{ fontSize: '0.95rem', lineHeight: 1.5 }}
          >
            {testimonial.quote}
          </blockquote>
        </div>

        <div className="pt-3 mt-3" style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
          <p
            className="font-sans text-[#000] uppercase"
            style={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.14em' }}
          >
            {testimonial.name}
          </p>
          <p
            className="font-sans text-[#B8932A] mt-0.5 uppercase"
            style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em' }}
          >
            {testimonial.location}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─── DESKTOP CARD ─── */
function DesktopCard({
  testimonial,
}: {
  testimonial: (typeof testimonials)[number];
}) {
  return (
    <div
      className="overflow-hidden"
      style={{
        border: '1px solid rgba(184,147,42,0.12)',
        boxShadow: '0 20px 60px rgba(42,31,17,0.06)',
        height: '480px',
      }}
    >
      <div className="grid grid-cols-2 h-full">
        {/* Photo */}
        <div className="relative overflow-hidden h-full">
          <img
            src={testimonial.image}
            alt={`${testimonial.name} with their Ancestorii Memory Book`}
            className="absolute inset-0 w-full h-full object-cover brightness-[0.92] contrast-[1.05]"
            style={{ objectPosition: '50% 15%' }}
          />
        </div>

        {/* Golden quote card */}
        <div
          className="relative flex flex-col justify-between h-full ts-quote-pad"
          style={{ background: 'linear-gradient(160deg, #F5EDDA 0%, #EDE3CB 100%)' }}
        >
          <div
            className="absolute -left-3 -top-6 font-serif text-[#B8932A] opacity-10 select-none pointer-events-none"
            style={{ fontSize: '8rem', lineHeight: 0.7 }}
          >
            &ldquo;
          </div>

          <div className="relative z-10">
            <svg
              width="28"
              height="20"
              viewBox="0 0 32 24"
              fill="#B8932A"
              className="mb-4 opacity-35"
            >
              <path d="M0 24V14.4C0 6.08 4.48 1.12 13.44 0l1.28 3.2C9.28 4.48 7.04 8 6.72 12H12v12H0zm18.56 0V14.4C18.56 6.08 23.04 1.12 32 0l1.28 3.2c-5.44 1.28-7.68 4.8-8 8.8h5.28v12H18.56z" />
            </svg>
            <blockquote
              className="ts-quote-text font-serif text-[#000] italic"
              style={{ letterSpacing: '-0.01em' }}
            >
              {testimonial.quote}
            </blockquote>
          </div>

          <div className="mt-6 pt-5" style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
            <p
              className="font-sans text-[#000] uppercase"
              style={{ fontSize: '0.78rem', fontWeight: 800, letterSpacing: '0.16em' }}
            >
              {testimonial.name}
            </p>
            <p
              className="font-sans text-[#B8932A] mt-1 uppercase"
              style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.14em' }}
            >
              {testimonial.location}
            </p>
          </div>
        </div>
      </div>

      <style>{`
        .ts-quote-pad    { padding: 32px 28px; }
        .ts-quote-text   { font-size: 1.15rem; line-height: 1.5; }

        @media (min-width: 1280px) {
          .ts-quote-pad    { padding: 40px 36px; }
          .ts-quote-text   { font-size: 1.25rem; line-height: 1.45; }
        }

        @media (min-width: 1536px) {
          .ts-quote-pad    { padding: 48px 42px; }
          .ts-quote-text   { font-size: 1.35rem; line-height: 1.45; }
        }
      `}</style>
    </div>
  );
}