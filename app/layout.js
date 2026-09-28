import './globals.css';
import { Fraunces, Manrope } from 'next/font/google';
import Providers from '@/components/Providers';

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

export const metadata = {
  title: {
    default: 'Nandini Jewellers | Modern Jewelry for Every Celebration',
    template: '%s | Nandini Jewellers',
  },
  description: 'Elegant fashion jewelry store with warm, premium design and seamless shopping experience.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${manrope.variable}`}>
      <body className="min-h-screen bg-ivory text-charcoal antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
