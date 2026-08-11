import AdminProductForm from '@/components/AdminProductForm';

export default function EditProductPage({ params }) {
  return <AdminProductForm productId={params.id} />;
}
