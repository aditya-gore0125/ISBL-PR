import StoreInfoPage from '@/components/StoreInfoPage';

export function generateMetadata() {
  return {
    title: 'Returns',
    description: 'Read the Nandini Jewellers 7-day return information.',
  };
}

export default function ReturnsPage() {
  return (
    <StoreInfoPage
      eyebrow="Returns"
      title="A 7-day return window."
      intro="Contact customer care within 7 days of delivery to request a return. Include your order number and the item you would like help with."
    >
      <section>
        <h2 className="font-fraunces text-2xl text-charcoal">How to start a return</h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5">
          <li>Contact customer care within 7 days of delivery.</li>
          <li>Share your order number and a brief description of the item.</li>
          <li>Wait for the team to confirm the next steps before sending an item back.</li>
        </ol>
      </section>
      <p className="text-sm text-charcoal/60">Eligibility conditions, return shipping costs, and refund timelines are placeholders and must be confirmed before launch.</p>
    </StoreInfoPage>
  );
}