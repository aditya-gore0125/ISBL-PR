import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getCategories } from '@/lib/data';

export default async function ShopLayout({ children }) {
  const categories = await getCategories();

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar categories={categories} />
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  );
}