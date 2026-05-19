import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Join a Family Library on Ancestorii',
  description: "You've been invited to join a family library on Ancestorii — a private place to preserve your family's stories, photos, and memories together.",
  openGraph: {
    title: "You've been invited to join a Family Library",
    description: "Come add your photos and stories — a private space for your family's memories.",
    images: [{ url: '/og-image.jpg', width: 1200, height: 630 }],
  },
  robots: { index: false, follow: false },
};

export default function JoinLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}