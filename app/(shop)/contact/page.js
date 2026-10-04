import StoreInfoPage from '@/components/StoreInfoPage';

export function generateMetadata() {
  return {
    title: 'Contact Us',
    description: 'Get in touch with the Nandini Jewellers team.',
  };
}

export default function ContactPage() {
  return (
    <StoreInfoPage
      eyebrow="We're here to help"
      title="Let’s talk jewelry."
      intro="Questions about an order, a product, or finding the right gift? Reach our team using the contact details below."
    >
      <section>
        <h2 className="font-fraunces text-2xl text-charcoal">Customer care</h2>
        <dl className="mt-4 grid gap-5 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-semibold text-charcoal">Email</dt>
            <dd className="mt-1"><a className="inline-flex min-h-11 items-center underline decoration-gold/50 underline-offset-4" href="mailto:hello@example.com">hello@example.com</a></dd>
          </div>
          <div>
            <dt className="text-sm font-semibold text-charcoal">Phone</dt>
            <dd className="mt-1"><a className="inline-flex min-h-11 items-center underline decoration-gold/50 underline-offset-4" href="tel:+910000000000">+91 00000 00000</a></dd>
          </div>
        </dl>
        <p className="mt-5 text-sm text-charcoal/60">Contact details and support hours are placeholders; replace them with your customer-care information.</p>
      </section>
    </StoreInfoPage>
  );
}