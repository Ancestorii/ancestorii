'use client';

import { inter } from '@/lib/fonts';
import { getBrowserClient } from '@/lib/supabase/browser';
import type { Asset } from '@/types/memory-book';

export default function DedicationBackCover({
  assets,
  onUpdateAsset,
  isExport = false, // ✅ ADDED
}: {
  assets: Asset[];
  onUpdateAsset: (asset: Asset) => void;
  isExport?: boolean; // ✅ ADDED
}) {
  const sorted = [...assets].sort((a, b) => a.slot_index - b.slot_index);
  

  const titleAsset =
    sorted.find((a) => a.slot_index === 99) || { slot_index: 99 };

  return (
    <div
  style={{
    width: '100%',
    height: '100%',
    background: '#FDFAF5',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '10% 15%',
    fontFamily: inter.style.fontFamily,
    textAlign: 'center',
    gap: 12,
    position: 'relative',
  }}
>
      <div
        style={{
          width: 30,
          height: 3,
          background: '#d4af37',
          borderRadius: 2,
          marginBottom: 4,
        }}
      />

      {/* 🔥 TITLE */}
      {isExport ? (
        <div
          style={{
            width: '100%',
            fontFamily: inter.style.fontFamily,
            fontSize: 22,
            fontWeight: 800,
            color: '#0F1A2E',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            textAlign: 'center',
            lineHeight: 1.3,
          }}
        >
          {titleAsset.subheading || ' '}
        </div>
      ) : (
        <input
          value={titleAsset.subheading || ''}
          placeholder="For Mum"
          maxLength={30}
          onChange={(e) => {
            if (e.target.value.length > 30) return;
            onUpdateAsset({
              ...titleAsset,
              slot_index: 99,
              subheading: e.target.value,
            });
          }}
          style={{
            width: '100%',
            fontFamily: inter.style.fontFamily,
            fontSize: 22,
            fontWeight: 800,
            color: '#0F1A2E',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            textAlign: 'center',
            lineHeight: 1.3,
            border: 'none',
            outline: 'none',
            background: 'transparent',
          }}
        />
      )}

      {/* 🔥 MESSAGE */}
      {isExport ? (
        <div
          style={{
            width: '100%',
            fontFamily: inter.style.fontFamily,
            fontSize: 12,
            fontWeight: 400,
            color: '#1A1714',
            lineHeight: 1.6,
            textAlign: 'center',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {titleAsset.comment || ' '}
        </div>
      ) : (
        <textarea
          value={titleAsset.comment || ''}
          placeholder={"A personal message or dedication"}
          maxLength={200}
          onChange={(e) => {
            if (e.target.value.length > 200) return;
            onUpdateAsset({
              ...titleAsset,
              slot_index: 99,
              comment: e.target.value,
            });
          }}
          rows={4}
          style={{
            width: '100%',
            fontFamily: inter.style.fontFamily,
            fontSize: 12,
            fontWeight: 400,
            color: '#1A1714',
            lineHeight: 1.6,
            textAlign: 'center',
            border: 'none',
            outline: 'none',
            background: 'transparent',
            resize: 'none',
            overflow: 'hidden',
          }}
        />
      )}

      <div
        style={{
          width: 30,
          height: 3,
          background: '#d4af37',
          borderRadius: 2,
          marginTop: 4,
        }}
      />

      <span
        style={{
          fontSize: 7,
          fontWeight: 600,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          color: '#d4af37',
          opacity: 0.5,
          position: 'absolute',
          bottom: '8%',
        }}
      >
        Made with Ancestorii
      </span>
    </div>
  );
}