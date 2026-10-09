import AdminProductForm from '@/components/AdminProductForm';

export default async function EditProductPage({ params }) {
  const resolvedParams = await Promise.resolve(params);
  return <AdminProductForm productId={resolvedParams?.id} />;
}
