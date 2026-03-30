'use client';

import ComingSoon from "@/components/ComingSoon";

const BOOKS_ENABLED = false;

export default function BooksPage() {
  if (!BOOKS_ENABLED) {
    return <ComingSoon title="Memory Books" />;
  }

  return (
    <div>
      {/* 🔥 Your REAL Memory Books UI goes here */}
    </div>
  );
}