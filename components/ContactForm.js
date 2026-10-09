'use client';

import { useState } from 'react';

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || 'Failed to submit inquiry.');
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
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="rounded-[1.25rem] border border-emerald-200 bg-emerald-50/80 p-6 text-center">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="mt-3 font-fraunces text-xl text-emerald-900">Message Received!</h3>
        <p className="mt-2 text-sm leading-relaxed text-emerald-800">
          Thank you for reaching out. Our jewelry concierge will get back to you within 24 hours.
        </p>
        <button
          type="button"
          onClick={() => setSubmitted(false)}
          className="mt-4 rounded-full bg-emerald-700 px-5 py-2 text-xs font-semibold text-white transition hover:bg-emerald-800"
        >
          Send Another Message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-[1.25rem] border border-gold/15 bg-white p-6 shadow-soft">
      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-semibold text-charcoal">Your Name *</label>
          <input
            type="text"
            name="name"
            required
            value={form.name}
            onChange={handleChange}
            placeholder="Full Name"
            className="mt-1.5 w-full rounded-lg border border-gold/20 bg-ivory/50 px-3.5 py-2 text-sm text-charcoal outline-none focus:border-gold focus:bg-white"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-charcoal">Email Address *</label>
          <input
            type="email"
            name="email"
            required
            value={form.email}
            onChange={handleChange}
            placeholder="name@example.com"
            className="mt-1.5 w-full rounded-lg border border-gold/20 bg-ivory/50 px-3.5 py-2 text-sm text-charcoal outline-none focus:border-gold focus:bg-white"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-semibold text-charcoal">Phone Number</label>
          <input
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="+91 98765 43210"
            className="mt-1.5 w-full rounded-lg border border-gold/20 bg-ivory/50 px-3.5 py-2 text-sm text-charcoal outline-none focus:border-gold focus:bg-white"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-charcoal">Inquiry Type</label>
          <select
            name="subject"
            value={form.subject}
            onChange={handleChange}
            className="mt-1.5 w-full rounded-lg border border-gold/20 bg-ivory/50 px-3.5 py-2 text-sm text-charcoal outline-none focus:border-gold focus:bg-white"
          >
            <option value="General Inquiry">General Inquiry</option>
            <option value="Bridal Consultation">Bridal Consultation</option>
            <option value="Order & Delivery Status">Order & Delivery Status</option>
            <option value="Custom Sizing & Design">Custom Sizing & Design</option>
            <option value="Bulk & Gifting">Bulk & Gifting</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-charcoal">Message *</label>
        <textarea
          name="message"
          rows={4}
          required
          value={form.message}
          onChange={handleChange}
          placeholder="How can we assist you today?"
          className="mt-1.5 w-full rounded-lg border border-gold/20 bg-ivory/50 px-3.5 py-2 text-sm text-charcoal outline-none focus:border-gold focus:bg-white"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-gold py-2.5 text-xs font-semibold uppercase tracking-wider text-white shadow-soft transition hover:bg-gold-dark disabled:opacity-50"
      >
        {loading ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  );
}

