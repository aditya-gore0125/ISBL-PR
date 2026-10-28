import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getCategories } from '@/lib/data';
import { getSiteSettings } from '@/lib/siteSettings';

export default async function ShopLayout({ children }) {
  const [categories, settings] = await Promise.all([
    getCategories(),
    getSiteSettings(),
  ]);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar categories={categories} logoUrl={settings?.logoUrl || '/logo.svg'} />
      <div className="flex-1">{children}</div>
      <Footer logoUrl={settings?.logoUrl || '/logo.svg'} />
    </div>
  );
}
