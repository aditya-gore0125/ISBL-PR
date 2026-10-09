import ContactForm from '@/components/ContactForm';

export function generateMetadata() {
  return {
    title: 'Contact Us | Customer Care & Showroom Concierge',
    description: 'Get in touch with Nandini Jewellers for customer support, showroom visits, and custom jewelry inquiries.',
  };
}

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-ivory">
      {/* Header Banner */}
      <section className="border-b border-gold/15 bg-gradient-to-br from-white via-ivory to-blush/25 py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-gold">
            Customer Care & Concierge
          </p>
          <h1 className="mt-3 font-fraunces text-4xl text-charcoal sm:text-5xl lg:text-6xl">
            We’re Here to Assist You
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-charcoal/75 sm:text-lg">
            Have questions about a bespoke bridal piece, ring sizing, or order delivery?
            Connect with our team directly or send us a message below.
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16 space-y-16">
        {/* Tier 1: 3 Spacious Customer Care Cards */}
        <section>
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">Direct Channels</p>
            <h2 className="mt-1 font-fraunces text-2xl text-charcoal sm:text-3xl">Ways to Reach Us</h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Card 1: Phone & WhatsApp */}
            <div className="flex flex-col justify-between rounded-[1.75rem] border border-gold/15 bg-white p-7 shadow-soft transition hover:-translate-y-1 hover:shadow-md">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold/10 text-gold-dark text-xl font-bold">
                  📞
                </div>
                <h3 className="mt-5 font-fraunces text-xl text-charcoal">Phone & WhatsApp</h3>
                <p className="mt-2 text-sm text-charcoal/70 leading-relaxed">
                  Call our concierge desk directly or request live photos of products via WhatsApp.
                </p>
                <div className="mt-4">
                  <a
                    href="tel:+919322006509"
                    className="font-fraunces text-xl font-semibold text-charcoal hover:text-gold-dark"
                  >
                    +91 93220 06509
                  </a>
                  <p className="mt-1 text-xs text-charcoal/50">Mon – Sat: 10:30 AM – 8:30 PM</p>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-gold/10">
                <a
                  href="https://wa.me/919322006509?text=Hello%20Nandini%20Jewellers,%20I%20would%20like%20to%20inquire%20about%20your%20collection."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                >
                  <span>Chat on WhatsApp</span>
                  <span>→</span>
                </a>
              </div>
            </div>

            {/* Card 2: Email Concierge */}
            <div className="flex flex-col justify-between rounded-[1.75rem] border border-gold/15 bg-white p-7 shadow-soft transition hover:-translate-y-1 hover:shadow-md">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold/10 text-gold-dark text-xl font-bold">
                  ✉️
                </div>
                <h3 className="mt-5 font-fraunces text-xl text-charcoal">Email Support</h3>
                <p className="mt-2 text-sm text-charcoal/70 leading-relaxed">
                  For order inquiries, bulk corporate gifting, or media, write to our concierge team.
                </p>
                <div className="mt-4">
                  <a
                    href="mailto:concierge@nandinijewellers.com"
                    className="text-base font-semibold text-charcoal underline decoration-gold/50 underline-offset-4 hover:text-gold-dark"
                  >
                    concierge@nandinijewellers.com
                  </a>
                  <p className="mt-1 text-xs text-charcoal/50">Response within 24 business hours</p>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-gold/10">
                <a
                  href="mailto:concierge@nandinijewellers.com"
                  className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gold-dark hover:text-gold"
                >
                  <span>Compose Email</span>
                  <span>→</span>
                </a>
              </div>
            </div>

            {/* Card 3: Showroom & Hours */}
            <div className="flex flex-col justify-between rounded-[1.75rem] border border-gold/15 bg-white p-7 shadow-soft transition hover:-translate-y-1 hover:shadow-md sm:col-span-2 lg:col-span-1">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold/10 text-gold-dark text-xl font-bold">
                  🏛
                </div>
                <h3 className="mt-5 font-fraunces text-xl text-charcoal">Flagship Showroom</h3>
                <p className="mt-2 text-sm text-charcoal/70 leading-relaxed">
                  Heritage Royale Arcade, Near MG Road, Camp, Pune, Maharashtra 411001
                </p>
                <div className="mt-4 space-y-1 text-xs text-charcoal/80">
                  <p><span className="font-semibold text-charcoal">Mon – Sat:</span> 10:30 AM – 8:30 PM</p>
                  <p><span className="font-semibold text-charcoal">Sunday:</span> 11:00 AM – 7:30 PM</p>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-gold/10">
                <span className="inline-flex rounded-full bg-gold/10 px-3 py-1 text-xs font-semibold text-gold-dark">
                  Walk-ins Welcome
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Tier 2: Dedicated "Send Us a Message" + Experience Highlights */}
        <section>
          <div className="grid gap-12 lg:grid-cols-[1.3fr_0.9fr] lg:items-start">
            {/* Left: Spacious Message Form */}
            <div>
              <div className="mb-6">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">Inquiry Form</p>
                <h2 className="mt-1 font-fraunces text-3xl text-charcoal">Send Us a Message</h2>
                <p className="mt-2 text-sm text-charcoal/70">
                  Please share your requirements below. One of our jewelry consultants will review and respond promptly.
                </p>
              </div>

              <ContactForm />
            </div>

            {/* Right: Showroom Experience & Concierge Guarantees */}
            <div className="space-y-6 lg:pt-8">
              <div className="rounded-[1.75rem] border border-gold/20 bg-gradient-to-br from-ivory via-white to-blush/20 p-8 shadow-soft">
                <h3 className="font-fraunces text-2xl text-charcoal">The Nandini Experience</h3>
                <p className="mt-3 text-sm leading-relaxed text-charcoal/75">
                  Every interaction is guided by our dedication to genuine hospitality, honest advice, and exceptional artistry.
                </p>

                <div className="mt-6 space-y-5">
                  <div className="flex gap-4">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold/15 text-gold-dark font-bold text-sm">
                      ✓
                    </span>
                    <div>
                      <h4 className="text-sm font-semibold text-charcoal">Private Bridal Appointments</h4>
                      <p className="mt-1 text-xs leading-relaxed text-charcoal/70">
                        Reserve a dedicated bridal suite session to explore sets tailored to your wedding wardrobe.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold/15 text-gold-dark font-bold text-sm">
                      ✓
                    </span>
                    <div>
                      <h4 className="text-sm font-semibold text-charcoal">Custom Sizing & Remodeling</h4>
                      <p className="mt-1 text-xs leading-relaxed text-charcoal/70">
                        Our master artisans provide resizing for rings, custom necklace lengths, and bangle fittings.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold/15 text-gold-dark font-bold text-sm">
                      ✓
                    </span>
                    <div>
                      <h4 className="text-sm font-semibold text-charcoal">Insured Doorstep Delivery</h4>
                      <p className="mt-1 text-xs leading-relaxed text-charcoal/70">
                        Every online order ships securely in tamper-evident packaging with real-time tracking.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Call Box */}
              <div className="rounded-[1.5rem] border border-gold/15 bg-white p-6 shadow-soft">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-charcoal/60">Need Urgent Assistance?</p>
                    <p className="mt-1 font-fraunces text-lg text-charcoal">Speak with a specialist right away</p>
                  </div>
                  <a
                    href="tel:+919322006509"
                    className="rounded-full bg-gold px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white transition hover:bg-gold-dark"
                  >
                    Call Now
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}