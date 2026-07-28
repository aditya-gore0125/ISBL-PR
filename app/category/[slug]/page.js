import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import connectToDatabase from '@/lib/mongodb';
import Category from '@/models/Category';
import Product from '@/models/Product';

const PAGE_SIZE = 24;

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function normalizeSearchParams(searchParams = {}) {
  const sort = typeof searchParams.sort === 'string' ? searchParams.sort : 'featured';
  const minPrice = Number(searchParams.minPrice || 0);
  const maxPrice = Number(searchParams.maxPrice || 0);
  const materials = Array.isArray(searchParams.material)
    ? searchParams.material
    : typeof searchParams.material === 'string'
      ? [searchParams.material]
      : [];
  const inStockOnly = searchParams.inStockOnly === '1' || searchParams.inStockOnly === 'true';
  const page = Number(searchParams.page || 1);

  return {
    sort,
    minPrice: Number.isFinite(minPrice) ? minPrice : 0,
    maxPrice: Number.isFinite(maxPrice) ? maxPrice : 0,
    materials: materials.filter(Boolean),
    inStockOnly,
    page: Number.isFinite(page) && page > 0 ? page : 1,
  };
}

function getCategoryAliases(slug, categoryDoc) {
  const aliases = [];
  if (categoryDoc?.name) aliases.push(categoryDoc.name);
  if (slug) aliases.push(slug.replace(/-/g, ' '));

  const slugMap = {
    necklaces: ['Necklaces'],
    earrings: ['Earrings'],
    rings: ['Rings'],
    bangles: ['Bangles & Bracelets'],
    bracelets: ['Bangles & Bracelets'],
    'bangles-bracelets': ['Bangles & Bracelets'],
    mangalsutra: ['Mangalsutra'],
    'mangalsutra-pendant': ['Mangalsutra'],
    'mangalsutra-chain': ['Mangalsutra'],
    'mangalsutra-set': ['Mangalsutra'],
    anklets: ['Anklets'],
    'nose-pins': ['Nose Pins'],
    'combos-sets': ['Combos & Sets'],
    'combos-and-sets': ['Combos & Sets'],
  };

  const mapped = slugMap[String(slug || '').toLowerCase()];
  if (mapped) aliases.push(...mapped);

  return [...new Set(aliases.filter(Boolean))];
}

function buildCategoryQuery(slug, categoryDoc) {
  const aliases = getCategoryAliases(slug, categoryDoc);
  if (!aliases.length) {
    return { category: { $regex: new RegExp(escapeRegExp(String(slug || '').replace(/-/g, ' ')), 'i') } };
  }
  const pattern = aliases.map((alias) => escapeRegExp(alias)).join('|');
  return { category: { $regex: new RegExp(pattern, 'i') } };
}

function buildQuery(slug, categoryDoc, filters) {
  const query = buildCategoryQuery(slug, categoryDoc);

  if (filters.minPrice > 0 || filters.maxPrice > 0) {
    query.price = {};
    if (filters.minPrice > 0) {
      query.price.$gte = filters.minPrice;
    }
    if (filters.maxPrice > 0) {
      query.price.$lte = filters.maxPrice;
    }
  }

  if (filters.materials.length) {
    query.material = { $in: filters.materials };
  }

  if (filters.inStockOnly) {
    query.stock = { $gt: 0 };
  }

  return query;
}

function buildSort(sort) {
  switch (sort) {
    case 'price-asc':
      return { price: 1, createdAt: -1 };
    case 'price-desc':
      return { price: -1, createdAt: -1 };
    case 'newest':
      return { createdAt: -1, price: 1 };
    case 'popular':
      return { rating: -1, numReviews: -1, createdAt: -1 };
    default:
      return { createdAt: -1, price: 1 };
  }
}

function buildFiltersUrl(slug, filters, page = 1) {
  const params = new URLSearchParams();
  if (filters.sort && filters.sort !== 'featured') params.set('sort', filters.sort);
  if (filters.minPrice > 0) params.set('minPrice', String(filters.minPrice));
  if (filters.maxPrice > 0) params.set('maxPrice', String(filters.maxPrice));
  filters.materials.forEach((material) => params.append('material', material));
  if (filters.inStockOnly) params.set('inStockOnly', '1');
  if (page > 1) params.set('page', String(page));
  const queryString = params.toString();
  return queryString ? `/category/${slug}?${queryString}` : `/category/${slug}`;
}

function getCategoryDisplayName(slug, category) {
  if (category?.name) return category.name;
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function FilterPanel({ categorySlug, normalizedFilters, allMaterials, highestPrice, clearFiltersHref }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-fraunces text-2xl text-charcoal">Filter</h2>
        <Link href={clearFiltersHref} className="text-sm font-semibold text-gold-dark hover:text-gold">Clear</Link>
      </div>

      <form className="space-y-6" action={`/category/${categorySlug}`} method="get">
        <div>
          <label htmlFor="minPrice" className="mb-2 block text-sm font-semibold text-charcoal">Min price</label>
          <input id="minPrice" name="minPrice" type="number" min="0" defaultValue={normalizedFilters.minPrice || ''} className="w-full rounded-[0.8rem] border border-gold/20 bg-ivory px-3 py-2 text-sm text-charcoal" />
        </div>
        <div>
          <label htmlFor="maxPrice" className="mb-2 block text-sm font-semibold text-charcoal">Max price</label>
          <input id="maxPrice" name="maxPrice" type="number" min="0" max={highestPrice || undefined} defaultValue={normalizedFilters.maxPrice || ''} className="w-full rounded-[0.8rem] border border-gold/20 bg-ivory px-3 py-2 text-sm text-charcoal" />
        </div>

        <div>
          <p className="mb-3 text-sm font-semibold text-charcoal">Material</p>
          <div className="space-y-2">
            {allMaterials.map((material) => {
              const checked = normalizedFilters.materials.includes(material);
              return (
                <label key={material} className="flex items-center gap-2 text-sm text-charcoal/80">
                  <input type="checkbox" name="material" value={material} defaultChecked={checked} className="h-4 w-4 rounded border-gold/20 text-gold focus:ring-gold" />
                  <span>{material}</span>
                </label>
              );
            })}
          </div>
        </div>

        <label className="flex items-center justify-between rounded-[0.9rem] border border-gold/15 bg-ivory/60 px-3 py-3 text-sm font-medium text-charcoal">
          <span>In stock only</span>
          <input type="checkbox" name="inStockOnly" value="1" defaultChecked={normalizedFilters.inStockOnly} className="h-4 w-4 rounded border-gold/20 text-gold focus:ring-gold" />
        </label>

        <div>
          <label htmlFor="sort" className="mb-2 block text-sm font-semibold text-charcoal">Sort</label>
          <select id="sort" name="sort" defaultValue={normalizedFilters.sort} className="w-full rounded-[0.8rem] border border-gold/20 bg-ivory px-3 py-2 text-sm text-charcoal">
            <option value="featured">Featured</option>
            <option value="price-asc">Price low-high</option>
            <option value="price-desc">Price high-low</option>
            <option value="newest">Newest</option>
            <option value="popular">Popularity</option>
          </select>
        </div>

        <button type="submit" className="w-full rounded-[0.95rem] bg-gold px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-gold-dark">
          Apply filters
        </button>
      </form>
    </div>
  );
}

export async function generateMetadata({ params }) {
  const categorySlug = params?.slug;
  const category = await Category.findOne({ slug: categorySlug }).lean();
  const name = getCategoryDisplayName(categorySlug, category);
  return {
    title: `${name} | Nandini Jewellers`,
    description: `Browse ${name.toLowerCase()} at Nandini Jewellers with elegant designs, filters, and shareable search links.`,
  };
}

export default async function CategoryPage({ params, searchParams }) {
  const categorySlug = params?.slug;
  const normalizedFilters = normalizeSearchParams(searchParams);

  await connectToDatabase();

  const categoryDoc = await Category.findOne({ slug: categorySlug }).lean();
  const categoryName = getCategoryDisplayName(categorySlug, categoryDoc);
  const categoryBaseQuery = buildCategoryQuery(categorySlug, categoryDoc);

  const [allProductsForCategory, currentPageProducts] = await Promise.all([
    Product.find(categoryBaseQuery).lean(),
    Product.find(buildQuery(categorySlug, categoryDoc, normalizedFilters))
      .sort(buildSort(normalizedFilters.sort))
      .skip((normalizedFilters.page - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE)
      .lean(),
  ]);

  const allMaterials = [...new Set(allProductsForCategory.map((product) => product.material).filter(Boolean))].sort();
  const highestPrice = allProductsForCategory.reduce((max, product) => Math.max(max, Number(product.price || 0)), 0);
  const filteredProductsCount = allProductsForCategory.filter((product) => {
    const passesMin = normalizedFilters.minPrice > 0 ? Number(product.price || 0) >= normalizedFilters.minPrice : true;
    const passesMax = normalizedFilters.maxPrice > 0 ? Number(product.price || 0) <= normalizedFilters.maxPrice : true;
    const passesMaterials = normalizedFilters.materials.length
      ? normalizedFilters.materials.some((material) => material === product.material)
      : true;
    const passesStock = normalizedFilters.inStockOnly ? Number(product.stock || 0) > 0 : true;
    return passesMin && passesMax && passesMaterials && passesStock;
  }).length;
  const totalPages = Math.max(1, Math.ceil(filteredProductsCount / PAGE_SIZE));
  const hasMore = normalizedFilters.page < totalPages;
  const clearFiltersHref = `/category/${categorySlug}`;

  return (
    <>
      <Navbar categories={[]} />
      <main className="min-h-screen bg-ivory">
        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
          <div className="mb-8 flex flex-col gap-4 rounded-[1.5rem] border border-gold/15 bg-gradient-to-br from-white via-ivory to-blush/30 p-8 shadow-soft md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-gold">Curated collection</p>
              <h1 className="mt-3 font-fraunces text-3xl text-charcoal sm:text-4xl">{categoryName}</h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-charcoal/70">
                Discover elegant {categoryName.toLowerCase()} pieces with premium finishes, shareable filter combinations, and effortless browsing.
              </p>
            </div>
            <div className="rounded-[1rem] border border-gold/15 bg-white/70 px-4 py-3 text-sm text-charcoal/70">
              {filteredProductsCount} pieces available
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
            <div className="space-y-4 lg:space-y-0">
              <aside className="hidden rounded-[1.25rem] border border-gold/15 bg-white/80 p-5 shadow-soft lg:block">
                <FilterPanel categorySlug={categorySlug} normalizedFilters={normalizedFilters} allMaterials={allMaterials} highestPrice={highestPrice} clearFiltersHref={clearFiltersHref} />
              </aside>

              <details className="group rounded-[1.25rem] border border-gold/15 bg-white/80 p-5 shadow-soft lg:hidden">
                <summary className="flex cursor-pointer list-none items-center justify-between">
                  <span className="font-fraunces text-xl text-charcoal">Filters</span>
                  <span className="text-sm font-semibold text-gold-dark">Open</span>
                </summary>
                <div className="mt-4">
                  <FilterPanel categorySlug={categorySlug} normalizedFilters={normalizedFilters} allMaterials={allMaterials} highestPrice={highestPrice} clearFiltersHref={clearFiltersHref} />
                </div>
              </details>
            </div>

            <section>
              <div className="mb-5 flex flex-col gap-3 rounded-[1rem] border border-gold/15 bg-white/70 p-4 shadow-soft sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold">Showing {currentPageProducts.length} of {filteredProductsCount}</p>
                  <p className="mt-1 text-sm text-charcoal/70">Sorted by {normalizedFilters.sort === 'featured' ? 'featured picks' : normalizedFilters.sort === 'price-asc' ? 'price low-to-high' : normalizedFilters.sort === 'price-desc' ? 'price high-to-low' : normalizedFilters.sort === 'newest' ? 'newest arrivals' : 'popularity'}</p>
                </div>
                <div className="rounded-full border border-gold/15 bg-ivory/70 px-3 py-2 text-sm text-charcoal/70">
                  {normalizedFilters.page} / {totalPages}
                </div>
              </div>

              {currentPageProducts.length === 0 ? (
                <div className="rounded-[1.4rem] border border-dashed border-gold/25 bg-white/75 p-10 text-center shadow-soft">
                  <h3 className="font-fraunces text-2xl text-charcoal">No pieces match these filters yet</h3>
                  <p className="mt-3 text-base leading-7 text-charcoal/70">Try widening your price range or clearing the active filters to explore more options.</p>
                  <Link href={clearFiltersHref} className="mt-6 inline-flex rounded-[0.95rem] bg-gold px-5 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-gold-dark">
                    Clear filters
                  </Link>
                </div>
              ) : (
                <>
                  <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {currentPageProducts.map((product) => (
                      <ProductCard key={product._id} product={{ ...product, category: product.category || categoryName }} />
                    ))}
                  </div>

                  {hasMore && (
                    <div className="mt-8 flex justify-center">
                      <Link href={buildFiltersUrl(categorySlug, normalizedFilters, normalizedFilters.page + 1)} className="rounded-[0.95rem] border border-gold/20 bg-white px-5 py-3 text-sm font-semibold text-charcoal transition hover:border-gold hover:text-gold-dark">
                        Load more
                      </Link>
                    </div>
                  )}
                </>
              )}
            </section>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
