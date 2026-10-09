import connectToDatabase from '@/lib/mongodb';
import ContactInquiry from '@/models/ContactInquiry';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Customer Inquiries | Admin' };

export default async function AdminInquiriesPage() {
  await connectToDatabase();

  const inquiries = await ContactInquiry.find({})
    .sort({ createdAt: -1 })
    .lean();

  const unread = inquiries.filter((i) => !i.read).length;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-fraunces text-3xl text-charcoal">Customer Inquiries</h1>
          <p className="mt-1 text-sm text-charcoal/60">
            Messages received via the Contact Us form
          </p>
        </div>
        {unread > 0 && (
          <span className="rounded-full bg-gold/20 px-4 py-1.5 text-sm font-semibold text-gold-dark">
            {unread} Unread
          </span>
        )}
      </div>

      {inquiries.length === 0 ? (
        <div className="rounded-2xl border border-gold/15 bg-white p-12 text-center text-charcoal/50">
          No customer messages yet.
        </div>
      ) : (
        <div className="space-y-4">
          {inquiries.map((inq) => {
            const id = inq._id.toString();
            const date = new Date(inq.createdAt).toLocaleString('en-IN', {
              day: '2-digit', month: 'short', year: 'numeric',
              hour: '2-digit', minute: '2-digit',
            });

            return (
              <div
                key={id}
                className={`rounded-2xl border bg-white p-6 shadow-sm ${
                  inq.read ? 'border-gold/10' : 'border-gold/40 ring-1 ring-gold/20'
                }`}
              >
                {/* Top row */}
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-charcoal">{inq.name}</p>
                    <a
                      href={`mailto:${inq.email}`}
                      className="text-sm text-gold-dark underline underline-offset-2 hover:text-gold"
                    >
                      {inq.email}
                    </a>
                    {inq.phone && (
                      <p className="mt-0.5 text-xs text-charcoal/60">📞 {inq.phone}</p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="rounded-full bg-ivory px-3 py-0.5 text-xs font-medium text-charcoal/70 border border-gold/15">
                      {inq.subject}
                    </span>
                    <span className="text-xs text-charcoal/40">{date}</span>
                    {!inq.read && (
                      <span className="rounded-full bg-gold text-white text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider">
                        New
                      </span>
                    )}
                  </div>
                </div>

                {/* Message body */}
                <p className="mt-4 whitespace-pre-wrap rounded-xl bg-ivory/60 p-4 text-sm leading-relaxed text-charcoal/80">
                  {inq.message}
                </p>

                {/* Action buttons */}
                <div className="mt-4 flex flex-wrap gap-3">
                  <a
                    href={`mailto:${inq.email}?subject=Re: ${encodeURIComponent(inq.subject)}`}
                    className="rounded-full bg-gold px-4 py-1.5 text-xs font-semibold text-white hover:bg-gold-dark"
                  >
                    ✉️ Reply via Email
                  </a>
                  {inq.phone && (
                    <a
                      href={`https://wa.me/${inq.phone.replace(/\D/g, '')}?text=Hello%20${encodeURIComponent(inq.name)},%20thank%20you%20for%20contacting%20Nandini%20Jewellers!`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                    >
                      💬 WhatsApp
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
