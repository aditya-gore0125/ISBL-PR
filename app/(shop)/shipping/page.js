import StoreInfoPage from '@/components/StoreInfoPage';

export function generateMetadata() {
  return {
    title: 'Shipping Policy',
    description: 'Shipping charges and delivery information for Nandini Jewellers orders.',
  };
}

export default function ShippingPage() {
  return (
    <StoreInfoPage
      eyebrow="Shipping"
      title="A little sparkle, delivered."
      intro="Shipping is free on orders above ₹999. Orders below ₹999 have a flat shipping charge of ₹99."
    >
      <section>
        <h2 className="font-fraunces text-2xl text-charcoal">Shipping charges</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="border-l-2 border-gold pl-4">
            <p className="font-semibold text-charcoal">Order below ₹999</p>
            <p className="mt-1">Flat shipping charge: ₹99</p>
          </div>
          <div className="border-l-2 border-emerald-600 pl-4">
            <p className="font-semibold text-charcoal">Order of ₹999 or more</p>
            <p className="mt-1">Free shipping</p>
          </div>
        </div>
      </section>
      <section>
        <h2 className="font-fraunces text-2xl text-charcoal">Delivery updates</h2>
        <p className="mt-3">Once an order ships, tracking details will appear in your account order history. Delivery timelines vary by destination.</p>
      </section>
    </StoreInfoPage>
  );
}