import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  serverExternalPackages: ['@sparticuz/chromium'],
  webpack: (config: any, { isServer }: { isServer: boolean }) => {
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push('@sparticuz/chromium');
    }
    return config;
  },
  images: {
    qualities: [70, 75, 90],
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'i.pravatar.cc' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: 'cdn.pixabay.com' },
      { protocol: 'https', hostname: 'wekebqaooixjngznycnm.supabase.co' },
    ],
  },
};

export default nextConfig;