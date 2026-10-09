import './globals.css';
import '@fontsource-variable/fraunces';
import '@fontsource-variable/manrope';
import Providers from '@/components/Providers';

export const metadata = {
  title: {
    default: 'Nandini Jewellers | Modern Jewelry for Every Celebration',
    template: '%s | Nandini Jewellers',
  },
  description: 'Elegant fashion jewelry store with warm, premium design and seamless shopping experience.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: 'Nandini Jewellers',
    title: 'Nandini Jewellers | Modern Jewelry for Every Celebration',
    description: 'Elegant fashion jewelry for everyday style and special celebrations.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nandini Jewellers | Modern Jewelry for Every Celebration',
    description: 'Elegant fashion jewelry for everyday style and special celebrations.',
  },
};

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Nandini Jewellers',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
};

export default function RootLayout({ children }) {
  const organizationJson = JSON.stringify(organizationJsonLd).replace(/</g, '\\u003c');

  return (
    <html lang="en">
      <body className="min-h-screen bg-ivory text-charcoal antialiased">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: organizationJson }} />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
