'use client';

import Image from 'next/image';

export default function FeaturedBy() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-5xl px-6 py-10 sm:py-14 text-center space-y-8 sm:space-y-10">

        {/* Title */}
        <h2 className="font-serif text-[1.3rem] sm:text-[1.6rem] text-[#0F2040] whitespace-nowrap">
          Proud to be{' '}
          <span className="italic text-[#E5C45C]">featured</span> by
        </h2>

        {/* Logos */}
        <div className="flex items-center justify-center gap-12 sm:gap-16">
          <div className="flex h-24 w-24 sm:h-36 sm:w-36 items-center justify-center transition">
            <Image
              src="/familytree.jpg"
              alt="Family Tree Magazine"
              width={144}
              height={144}
              className="object-contain"
            />
          </div>

          <div className="flex h-24 w-24 sm:h-36 sm:w-36 items-center justify-center transition">
            <Image
              src="/podcast.jpg"
              alt="The Family Histories Podcast"
              width={144}
              height={144}
              className="object-contain"
            />
          </div>
        </div>

        {/* Sentence */}
        <p className="mx-auto max-w-xl text-[0.95rem] sm:text-lg leading-relaxed text-[#0F2040]">
          Ancestorii is being shared by people who care deeply about family history
          and what lives on.
        </p>

      </div>
    </section>
  );
}
