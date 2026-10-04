import Link from 'next/link';
import SafeImage from '@/components/SafeImage';
import StoreInfoPage from '@/components/StoreInfoPage';
import { getCategories } from '@/lib/data';

export function generateMetadata() {
  return {
    title: 'Collections',
    description: 'Browse all Ladies and Gents jewelry collections from Nandini Jewellers.',
  };
}

export default async function CollectionsPage() {
  const categories = await getCategories();
  const groupedCategories = {
    Ladies: categories.filter((category) => category.type !== 'Gents'),
    Gents: categories.filter((category) => category.type === 'Gents'),
  };

  return (
    <StoreInfoPage
      eyebrow="Find your style"
      title="Collections for every kind of occasion."
      intro="Explore the full Nandini Jewellers collection, grouped by who it is made for."
    >
      {Object.entries(groupedCategories).map(([group, groupCategories]) => (
        <section key={group}>
          <h2 className="font-fraunces text-2xl text-charcoal">{group}</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {groupCategories.map((category) => (
              <Link key={category.slug} href={`/category/${category.slug}`} className="group overflow-hidden rounded-xl border border-gold/15 bg-white transition hover:border-gold/40">
                <div className="aspect-[4/3] overflow-hidden bg-blush/20">
                  <SafeImage src={category.image || '/hero-placeholder.svg'} alt={category.name} width={600} height={450} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                </div>
                <span className="flex min-h-12 items-center justify-between px-4 font-semibold text-charcoal">
                  {category.name}<span aria-hidden="true" className="text-gold">→</span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </StoreInfoPage>
  );
}