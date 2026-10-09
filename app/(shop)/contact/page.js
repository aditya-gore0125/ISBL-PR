import StoreInfoPage from '@/components/StoreInfoPage';
import ContactForm from '@/components/ContactForm';

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
      intro="Questions about an order, custom bridal designs, or finding the right gift? Reach our team using the contact details or form below."
    >
      <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr]">
        <div className="space-y-6">
          <section>
            <h2 className="font-fraunces text-2xl text-charcoal">Customer Care</h2>
            <dl className="mt-4 grid gap-5 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-semibold text-charcoal">Phone & WhatsApp</dt>
                <dd className="mt-1">
                  <a className="inline-flex min-h-11 items-center underline decoration-gold/50 underline-offset-4 hover:text-gold-dark" href="tel:+919322006509">
                    +91 93220 06509
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-semibold text-charcoal">Email</dt>
                <dd className="mt-1">
                  <a className="inline-flex min-h-11 items-center underline decoration-gold/50 underline-offset-4 hover:text-gold-dark" href="mailto:concierge@nandinijewellers.com">
                    concierge@nandinijewellers.com
                  </a>
                </dd>
              </div>
            </dl>
          </section>

          <section className="rounded-[1.25rem] border border-emerald-200 bg-emerald-50/70 p-5">
            <h3 className="font-fraunces text-lg text-emerald-950">Direct WhatsApp Assistance</h3>
            <p className="mt-1.5 text-xs leading-relaxed text-charcoal/75">
              Need instant photos or real-time assistance with your jewelry selection?
            </p>
            <a
              href="https://wa.me/919322006509?text=Hello%20Nandini%20Jewellers,%20I%20would%20like%20to%20inquire%20about%20your%20collection."
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700"
            >
              <span>Chat on WhatsApp</span>
              <span>→</span>
            </a>
          </section>

          <section className="rounded-[1.25rem] border border-gold/15 bg-white p-5 shadow-soft">
            <h3 className="font-fraunces text-lg text-charcoal">Showroom Hours</h3>
            <div className="mt-3 space-y-2 text-xs text-charcoal/80">
              <div className="flex justify-between border-b border-gold/10 pb-2">
                <span>Monday – Saturday</span>
                <span className="font-semibold text-charcoal">10:30 AM – 8:30 PM</span>
              </div>
              <div className="flex justify-between pt-1">
                <span>Sunday</span>
                <span className="font-semibold text-charcoal">11:00 AM – 7:30 PM</span>
              </div>
            </div>
          </section>
        </div>

        <div>
          <h2 className="mb-4 font-fraunces text-2xl text-charcoal">Send Us a Message</h2>
          <ContactForm />
        </div>
      </div>
    </StoreInfoPage>
  );
}