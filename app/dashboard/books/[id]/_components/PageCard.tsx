'use client';

export default function PageCard({
  pageNumber,
  children,
}: {
  pageNumber: number;
  children: React.ReactNode;
}) {
  return (
    <div className="w-full max-w-[900px] mx-auto">
      <div className="text-xs text-[#7A8596] mb-3 text-center">
        Page {pageNumber}
      </div>

      <div className="bg-white rounded-3xl shadow-md border border-[#E6E8EC] p-6 sm:p-8">
        {children}
      </div>
    </div>
  );
}