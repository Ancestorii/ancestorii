'use client';

import { Toaster } from 'react-hot-toast';
import { useEffect, useState } from 'react';

export default function ClientToaster() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => setIsClient(true), []);

  if (!isClient) return null;

  return (
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: '#1F2837',    // navy tone
          color: '#F3D99B',         // gold accent
          borderRadius: '10px',
          border: '1px solid #D4AF37',
          fontWeight: 500,
          fontSize: '14px',
          padding: '12px 16px',
          fontFamily: 'Inter, sans-serif',
        },
        success: {
          iconTheme: {
            primary: '#D4AF37',
            secondary: '#1F2837',
          },
        },
      }}
    />
  );
}
