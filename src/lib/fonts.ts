import localFont from 'next/font/local';

export const inter = localFont({
  src: [
    {
      path: '../fonts/Inter-Regular.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../fonts/Inter-Medium.ttf',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../fonts/Inter-SemiBold.ttf',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../fonts/Inter-Bold.ttf',
      weight: '700',
      style: 'normal',
    },
  ],
  display: 'swap',
});