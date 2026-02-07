
import Link from "next/link";
import Image from "next/image";

export default function WhyThisExists() {
  return (
    <section className="relative isolate bg-[#fffdf6] text-[#1f2937]">

{/* Parchment texture background */}
<Image
  src="/parchment.png"
  alt=""
  fill
  sizes="100vw"
  loading="lazy"
  className="object-cover opacity-[0.25] -z-10 pointer-events-none"
/>

{/* Soft paper light */}
<div
  className="
    absolute inset-0
    bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.65),transparent_10%)]
  "
/>
      <div className="relative">

        <section className="mx-auto max-w-[680px] px-5 pt-20 pb-24">

          {/* HEADER */}
          <header className="pt-8 md:pt-12 mb-16 text-center">
            <h1 className="font-serif text-4xl md:text-5xl leading-tight mb-4 text-[#0F2040]">
              <span className="block">This was</span>
              <span className="italic text-[#0F2040]">always personal.</span>
            </h1>

            <p className="text-sm tracking-wide text-[#475569]">
              A note from the founder
            </p>
          </header>

          {/* SECTION 1 */}
          <div className="space-y-5 text-lg leading-relaxed">
            <p>
              <strong className="text-[#0F2040]">
                Ancestorii did not begin as a company.
              </strong>
              <br />
              It did not begin as a feature list or a business plan.
            </p>

            <p>
              It began with a quiet fear.
              <br />
              <em>
                That one day the stories, voices, and moments that shape a family
                could disappear without anyone noticing.
              </em>
            </p>
          </div>

          {/* PHOTO 1 */}
          <div className="my-16 text-center">
            <div className="relative mx-auto w-[360px] md:w-[420px] rotate-[-1deg]">
              <div className="absolute inset-0 translate-x-[6px] translate-y-[6px] bg-[#e9dcc4]" />
              <div className="relative bg-white p-3 shadow-sm">
                <Image
                  src="/outdoor.jpg"
                  alt="Me posing outdoors"
                  width={900}
                  height={600}
                  loading="lazy"
                  className="rounded-sm"
                />
              </div>
            </div>
            <p className="mt-3 text-sm italic text-[#475569]">
              Me posing outdoors · July 2010
            </p>
          </div>

          <div className="space-y-5 text-lg leading-relaxed">
            <div className="text-center">
              <p className="font-serif text-2xl italic text-[#0F2040]">
                Photos survive.
                <br />
                Everything around them usually fades.
              </p>
            </div>

            <p>
              I realised how much context is lost when all that remains is an image.
            </p>

            <p className="pl-4 border-l-2 border-[#e3b341] text-[#0F2040]">
              <em>
                Why that photo mattered.
                <br />
                What was happening that day.
                <br />
                What that person sounded like when they laughed.
              </em>
            </p>
          </div>

          {/* PHOTO 2 */}
          <div className="my-16 text-center">
            <div className="relative mx-auto w-[360px] md:w-[420px] rotate-[1deg]">
              <div className="absolute inset-0 translate-x-[6px] translate-y-[6px] bg-[#e9dcc4]" />
              <div className="relative bg-white p-3 shadow-sm">
                <Image
                  src="/snow.jpg"
                  alt="Me and my sister in the snow"
                  width={900}
                  height={600}
                  loading="lazy"
                  className="rounded-sm"
                />
              </div>
            </div>
            <p className="mt-3 text-sm italic text-[#475569]">
              Me and my sister in the snow · March 2010
            </p>
          </div>

          <div className="space-y-5 text-lg leading-relaxed">
            <p>
              <strong className="text-[#0F2040]">
                I wanted a place where memories could live naturally.
              </strong>
              <br />
              Not buried in folders.
              <br />
              Not lost on old phones.
            </p>

            <p>
              But kept together as something you could return to years from now
              and still <em>feel close to</em>.
            </p>

            <p className="font-serif text-xl italic text-[#0F2040]">
              This was never about storing files.
              <br />
              It was about preserving presence.
            </p>
          </div>

          {/* PHOTO 3 */}
          <div className="my-16 text-center">
            <div className="relative mx-auto w-[360px] md:w-[420px] rotate-[-1deg]">
              <div className="absolute inset-0 translate-x-[6px] translate-y-[6px] bg-[#e9dcc4]" />
              <div className="relative bg-white p-3 shadow-sm">
                <Image
                  src="/garden.jpg"
                  alt="Me and my sister in the garden"
                  width={900}
                  height={600}
                  loading="lazy"
                  className="rounded-sm"
                />
              </div>
            </div>
            <p className="mt-3 text-sm italic text-[#475569]">
              Me and my sister in the garden · May 2013
            </p>
          </div>

          {/* PHOTO 4 */}
          <div className="my-16 text-center">
            <div className="relative mx-auto w-[360px] md:w-[420px] rotate-[1deg]">
              <div className="absolute inset-0 translate-x-[6px] translate-y-[6px] bg-[#e9dcc4]" />
              <div className="relative bg-white p-3 shadow-sm">
                <Image
                  src="/family.jpg"
                  alt="Me and my mum sitting on the floor"
                  width={900}
                  height={600}
                  loading="lazy"
                  className="rounded-sm"
                />
              </div>
            </div>
            <p className="mt-3 text-sm italic text-[#475569]">
              Me and my mum sitting on the floor · May 2011
            </p>
          </div>

          {/* FINAL */}
          <div className="mt-20 space-y-6 text-lg leading-relaxed text-center">
            <p className="font-serif text-2xl italic text-[#0F2040]">
              One day someone will want to know more.
            </p>

            <p>
              Not just who you were.
              <br />
              But <strong className="text-[#0F2040]">how you lived</strong>.
            </p>

            <p className="font-serif text-xl italic text-[#0F2040]">
              That is why this exists.
              <br />
              And that is why it was always personal.
            </p>
          </div>

          {/* CTA */}
          <div className="mt-16 text-center">
            <Link
              href="/signup" prefetch
              className="
                inline-block rounded-full
                bg-[#e3b341]
                px-10 py-4
                text-lg font-semibold
                text-[#0F2040]
                transition hover:bg-[#d6a834]
              "
            >
              Start with one memory
            </Link>

            <p className="mt-3 text-sm text-[#475569]">
              Private. Free to begin. Nothing is shared publicly.
            </p>
          </div>

        </section>
      </div>
    </section>
  );
}
