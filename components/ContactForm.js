'use client';

import { useRef, useState } from 'react';

export default function ContactForm() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'General Inquiry',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const submittingRef = useRef(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submittingRef.current) return;
    submittingRef.current = true;
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      let data;
      try {
        data = await response.json();
      } catch {
        throw new Error('Unable to submit inquiry. Please try again.');
      }
      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Too many inquiries have been sent from your connection. Please wait a little while and try again.');
        }
        throw new Error(data?.message || 'Failed to submit inquiry.');
      }
      if (data?.success !== true) {
        throw new Error('Unable to submit inquiry. Please try again.');
      }

      setSubmitted(true);
      setForm({
        name: '',
        email: '',
        phone: '',
        subject: 'General Inquiry',
        message: '',
      });
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      submittingRef.current = false;
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50/90 p-8 text-center sm:p-12">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-sm">
          <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="mt-4 font-fraunces text-2xl text-emerald-950 sm:text-3xl">Message Received</h3>
        <p className="mx-auto mt-3 max-w-md text-base leading-relaxed text-emerald-800">
          Thank you for reaching out. Our jewelry concierge has received your request and will contact you within 24 hours.
        </p>
        <button
          type="button"
          onClick={() => setSubmitted(false)}
          className="mt-6 rounded-full bg-emerald-700 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800"
        >
          Send Another Message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-[1.75rem] border border-gold/15 bg-white p-6 shadow-soft sm:p-10">
      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-charcoal">Your Full Name *</label>
          <input
            type="text"
            name="name"
            required
            value={form.name}
            onChange={handleChange}
            placeholder="e.g. Priya Sharma"
            className="mt-2 w-full rounded-xl border border-gold/20 bg-ivory/40 px-4 py-3 text-sm text-charcoal outline-none transition focus:border-gold focus:bg-white focus:ring-1 focus:ring-gold"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-charcoal">Email Address *</label>
          <input
            type="email"
            name="email"
            required
            value={form.email}
            onChange={handleChange}
            placeholder="priya@example.com"
            className="mt-2 w-full rounded-xl border border-gold/20 bg-ivory/40 px-4 py-3 text-sm text-charcoal outline-none transition focus:border-gold focus:bg-white focus:ring-1 focus:ring-gold"
          />
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-charcoal">Phone / WhatsApp Number</label>
          <input
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="+91 93220 06509"
            className="mt-2 w-full rounded-xl border border-gold/20 bg-ivory/40 px-4 py-3 text-sm text-charcoal outline-none transition focus:border-gold focus:bg-white focus:ring-1 focus:ring-gold"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-charcoal">Topic of Inquiry</label>
          <select
            name="subject"
            value={form.subject}
            onChange={handleChange}
            className="mt-2 w-full rounded-xl border border-gold/20 bg-ivory/40 px-4 py-3 text-sm text-charcoal outline-none transition focus:border-gold focus:bg-white focus:ring-1 focus:ring-gold"
          >
            <option value="General Inquiry">General Inquiry</option>
            <option value="Bridal Consultation">Bridal Consultation</option>
            <option value="Order & Delivery Status">Order & Delivery Status</option>
            <option value="Custom Sizing & Design">Custom Sizing & Design</option>
            <option value="Bulk & Festive Gifting">Bulk & Festive Gifting</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-charcoal">Your Message *</label>
        <textarea
          name="message"
          rows={5}
          required
          value={form.message}
          onChange={handleChange}
          placeholder="Please tell us about your requirements, specific jewelry pieces, or questions..."
          className="mt-2 w-full rounded-xl border border-gold/20 bg-ivory/40 px-4 py-3 text-sm text-charcoal outline-none transition focus:border-gold focus:bg-white focus:ring-1 focus:ring-gold"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-gold py-3.5 text-sm font-semibold uppercase tracking-[0.2em] text-white shadow-soft transition hover:bg-gold-dark disabled:opacity-50"
      >
        {loading ? 'Sending Message...' : 'Send Message'}
      </button>
    </form>
  );
}
