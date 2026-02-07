
import Image from 'next/image';
import Link from 'next/link';


export default function Founder() {
  return (
    <section className="w-full py-16 px-6 relative overflow-hidden">

      {/* Parchment texture background */}
      <Image
  src="/parchment.png"
  alt=""
  fill
  sizes="100vw"
  loading="lazy"
  className="object-cover -z-10 pointer-events-none"
/>


      {/* Soft light wash */}
      <div className="absolute inset-0 bg-[#FFFDF6]/65" />

      {/* Gentle paper lighting */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.35),transparent_55%)] opacity-60" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(0,0,0,0.08),transparent_60%)]" />

      <div className="relative mx-auto max-w-3xl text-center">

        {/* Headline */}
        <h2 className="text-2xl md:text-3xl font-serif text-[#2f3e34] mb-10">
          “This was always personal.”
        </h2>

        {/* Photo */}
        <div className="relative mx-auto w-[90%] md:w-[520px] lg:w-[640px] mb-6 rotate-[-1.5deg]">
          <div className="absolute inset-0 translate-x-[6px] translate-y-[6px] bg-[#e3dccb] shadow-sm" />
          <div className="relative bg-[#faf7f0] p-3 shadow-sm">
            <Image
              src="/outdoor.jpg"
              alt="Me posing outdoors"
              width={900}
              height={600}
              loading="lazy"
              className="rounded-sm"
            />
            <div className="pointer-events-none absolute inset-3 rounded-sm
              bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0)_45%,rgba(0,0,0,0.28)_100%)]
              mix-blend-multiply"
            />
            <div className="pointer-events-none absolute inset-3 rounded-sm
              bg-[#3b2f1a] opacity-[0.08] mix-blend-soft-light"
            />
          </div>
        </div>

        {/* Caption */}
        <p className="text-sm text-[#6b6b6b] mb-6 italic">
          Me posing outdoors · July 2010
        </p>

        {/* Founder text */}
       <p className="text-left text-[#1f1f1f] text-[15px] md:text-[17px] lg:text-[18px] leading-relaxed font-serif">
          “Ancestorii did not begin as a company. It began with a quiet fear that one day the stories, voices, and moments that shape a family could disappear without anyone noticing. I wanted a place where memories could live naturally, not buried in folders or lost on old phones, but kept together as something you could return to years from now and still feel close to. This is personal, and that is why it exists.”
          <span className="block mt-4 text-[#2f3e34]">
            David Leon, Founder
          </span>
        </p>

       {/* TRUST CTA BLOCK */}
<Link
  href="/why-this-exists" prefetch
  className="
    group relative block mx-auto mt-10 md:mt-20 max-w-xl
    rounded-2xl bg-[#2f3e34]
    px-6 py-6 md:px-7 md:py-7
    shadow-xl
    transition hover:-translate-y-[2px] hover:shadow-2xl
    border-l-4 border-[#f0c75e]
    overflow-hidden
  "
>
  {/* Subtle parchment glow */}
  <div
    className="
      pointer-events-none absolute inset-0
      bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.14),transparent_55%)]
    "
  />

  {/* Top highlight */}
  <div className="absolute top-0 left-0 h-[1px] w-full bg-[#f5e8c8]/40" />

  <p className="mb-2 text-[11px] uppercase tracking-widest text-[#f5e8c8]">
    A personal note
  </p>

  <h3 className="
    font-serif text-2xl md:text-3xl
    leading-tight text-[#ffffff]
    mb-4
  ">
    Before you trust us with your family’s memories,
    <span className="block italic text-[#fff4d6]">
      this is why Ancestorii exists.
    </span>
  </h3>

  <p className="
    text-[15px] md:text-[16px]
    leading-relaxed text-[#f1ede2]
    max-w-[90%]
    mb-5
  ">
    This was not built for attention or scale.
    It was built to protect voices, stories, and moments
    that cannot be replaced.
  </p>

  <div className="flex items-center font-semibold text-[#f0c75e]">
    <span className="mr-2">
      Read the full story
    </span>
    <span className="text-xl transition-transform group-hover:translate-x-1">
      →
    </span>
  </div>
</Link>
        </div>
    </section>
  );
}
