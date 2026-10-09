import StoreInfoPage from '@/components/StoreInfoPage';

const questions = [
  {
    question: 'How much does shipping cost?',
    answer: 'Shipping is free for orders above ₹999. Orders below ₹999 have a flat ₹99 shipping charge.',
  },
  {
    question: 'Can I return an order?',
    answer: 'Contact customer care within 7 days of delivery to request a return. The team will confirm the next steps.',
  },
  {
    question: 'Where can I find my tracking details?',
    answer: 'After dispatch, sign in and open your order history to see available tracking information.',
  },
  {
    question: 'How do I contact customer care?',
    answer: 'Use the email address or phone number on our Contact page. Those details are placeholders and need to be replaced before launch.',
  },
];

export function generateMetadata() {
  return {
    title: 'Frequently Asked Questions',
    description: 'Answers to common questions about shipping, returns, and orders.',
  };
}

export default function FAQPage() {
  return (
    <StoreInfoPage
      eyebrow="Help center"
      title="Frequently asked questions."
      intro="Quick answers about placing and receiving an order."
    >
      <div className="divide-y divide-gold/20 border-y border-gold/20">
        {questions.map(({ question, answer }) => (
          <details key={question} className="group py-5">
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 font-semibold text-charcoal marker:hidden">
              {question}
              <span aria-hidden="true" className="text-lg text-gold transition group-open:rotate-45">+</span>
            </summary>
            <p className="max-w-3xl pb-2 pr-8 text-charcoal/75">{answer}</p>
          </details>
        ))}
      </div>
      <p className="text-sm text-charcoal/60">FAQ copy is placeholder content; confirm all policies and support information before launch.</p>
    </StoreInfoPage>
  );
}