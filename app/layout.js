import './globals.css';
import { Fraunces, Manrope } from 'next/font/google';

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
  title: 'Nandini Jewellers | Fashion Jewelry Boutique',
  description: 'Elegant fashion jewelry store with warm, premium design and seamless shopping experience.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${manrope.variable}`}>
      <body className="min-h-screen bg-ivory text-charcoal antialiased">
        {children}
      </body>
    </html>
  );
}
