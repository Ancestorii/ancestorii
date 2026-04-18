'use client';

import { inter } from '@/lib/fonts';

export default function BlankBackCover({
  isExport = false, // ✅ ADDED (for consistency)
}: {
  isExport?: boolean;
}) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: '#FDFAF5',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        padding: '0 0 8%',
        fontFamily: inter.style.fontFamily,
      }}
    >
      <span
        style={{
          fontSize: 7,
          fontWeight: 600,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          color: '#d4af37',
          opacity: 0.5,
        }}
      >
        Made with Ancestorii
      </span>
    </div>
  );
}