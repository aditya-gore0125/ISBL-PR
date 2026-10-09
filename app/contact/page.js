'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function ContactPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'Bridal Consultation',
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
        throw new Error(data?.message || 'Failed to submit inquiry. Please try again.');
      }

      setSubmitted(true);
      setForm({
        name: '',
        email: '',
        phone: '',
        subject: 'Bridal Consultation',
        message: '',
      });
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar categories={[]} />

      <main className="min-h-screen bg-ivory">
        {/* Header Banner */}
        <section className="border-b border-gold/15 bg-gradient-to-br from-ivory via-white to-blush/30 py-12 sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-gold">
              Get In Touch
            </p>
            <h1 className="mt-3 font-fraunces text-4xl text-charcoal sm:text-5xl">
              We’d Love to Hear From You
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-charcoal/75">
              Have questions regarding custom bridal jewelry, sizing, or an existing order?
              Our jewelry concierge team is at your service.
            </p>
          </div>
        </section>

        {/* Content Section */}
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
            {/* Contact Form Card */}
            <div className="rounded-[1.75rem] border border-gold/20 bg-white p-6 shadow-soft sm:p-10">
              <h2 className="font-fraunces text-2xl text-charcoal sm:text-3xl">Send Us a Message</h2>
              <p className="mt-2 text-sm text-charcoal/70">
                Fill in the details below and we will respond within 24 hours.
              </p>

              {submitted ? (
                <div className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-8 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="mt-4 font-fraunces text-2xl text-emerald-900">Message Received!</h3>
                  <p className="mt-2 text-sm leading-6 text-emerald-800">
                    Thank you for reaching out to Nandini Jewellers. Our concierge has received your request and will contact you promptly.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSubmitted(false)}
                    className="mt-6 rounded-full bg-emerald-700 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                  {error && (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                      {error}
                    </div>
                  )}

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-charcoal">Full Name *</label>
                      <input
                        type="text"
                        name="name"
                        required
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Priya Sharma"
                        className="mt-2 w-full rounded-xl border border-gold/20 bg-ivory/50 px-4 py-3 text-sm text-charcoal outline-none transition focus:border-gold focus:bg-white"
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
                        className="mt-2 w-full rounded-xl border border-gold/20 bg-ivory/50 px-4 py-3 text-sm text-charcoal outline-none transition focus:border-gold focus:bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-charcoal">Phone Number</label>
                      <input
                        type="tel"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="+91 98765 43210"
                        className="mt-2 w-full rounded-xl border border-gold/20 bg-ivory/50 px-4 py-3 text-sm text-charcoal outline-none transition focus:border-gold focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-charcoal">Inquiry Subject</label>
                      <select
                        name="subject"
                        value={form.subject}
                        onChange={handleChange}
                        className="mt-2 w-full rounded-xl border border-gold/20 bg-ivory/50 px-4 py-3 text-sm text-charcoal outline-none transition focus:border-gold focus:bg-white"
                      >
                        <option value="Bridal Consultation">Bridal Consultation</option>
                        <option value="Order & Delivery Status">Order & Delivery Status</option>
                        <option value="Custom Sizing & Design">Custom Sizing & Design</option>
                        <option value="General Inquiries">General Inquiries</option>
                        <option value="Bulk / Gifting Orders">Bulk / Gifting Orders</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-charcoal">Message *</label>
                    <textarea
                      name="message"
                      rows={5}
                      required
                      value={form.message}
                      onChange={handleChange}
                      placeholder="Please let us know how we can assist you..."
                      className="mt-2 w-full rounded-xl border border-gold/20 bg-ivory/50 px-4 py-3 text-sm text-charcoal outline-none transition focus:border-gold focus:bg-white"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-xl bg-gold py-3.5 text-sm font-semibold uppercase tracking-[0.2em] text-white shadow-soft transition hover:bg-gold-dark disabled:opacity-60"
                  >
                    {loading ? 'Sending Message...' : 'Send Message'}
                  </button>
                </form>
              )}
            </div>

            {/* Direct Contact & Store Info */}
            <div className="flex flex-col gap-6">
              {/* Flagship Store Details */}
              <div className="rounded-[1.75rem] border border-gold/20 bg-white p-6 shadow-soft sm:p-8">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gold/15 text-gold-dark font-fraunces text-lg">
                    🏛
                  </span>
                  <div>
                    <h3 className="font-fraunces text-xl text-charcoal">Flagship Showroom</h3>
                    <p className="text-xs uppercase tracking-[0.25em] text-gold">Nashik, Maharashtra</p>
                  </div>
                </div>

                <div className="mt-6 space-y-4 text-sm text-charcoal/80">
                  <div className="flex items-start gap-3">
                    <span className="text-gold font-bold">📍</span>
                    <p className="leading-relaxed">
                      Shop 14-16, Manohar Sankul, Kanade Maruti Ln , Dahipul, Gulal Wadi, Naikwadi Pura, Panchavati, Nashik, Maharashtra 422003
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-gold font-bold">📞</span>
                    <p>+91 93220 06509</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-gold font-bold">✉️</span>
                    <p>concierge@nandinijewellers.com</p>
                  </div>
                </div>

                <div className="mt-6 rounded-xl border border-gold/15 bg-ivory p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">Showroom Timings</p>
                  <p className="mt-1 text-sm text-charcoal">Monday – Saturday: 10:30 AM – 8:30 PM</p>
                  <p className="text-sm text-charcoal">Sunday: 11:00 AM – 7:30 PM</p>
                </div>
              </div>

              {/* Instant WhatsApp Support */}
              <div className="rounded-[1.75rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-ivory p-6 shadow-soft sm:p-8">
                <h3 className="font-fraunces text-xl text-emerald-950">Direct WhatsApp Assistance</h3>
                <p className="mt-2 text-sm text-charcoal/75 leading-relaxed">
                  Need an instant video call preview of a necklace or real-time photos of a ring? Message our master stylist directly on WhatsApp.
                </p>
                <a
                  href="https://wa.me/919322006509?text=Hello%20Nandini%20Jewellers,%20I%20would%20like%20to%20inquire%20about%20your%20collection."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 shadow-sm"
                >
                  <span>Chat on WhatsApp</span>
                  <span>→</span>
                </a>
              </div>

              {/* Help & Links */}
              <div className="rounded-[1.75rem] border border-gold/15 bg-white p-6 shadow-soft text-sm text-charcoal/80">
                <p className="font-fraunces text-lg text-charcoal">Looking for Order Information?</p>
                <p className="mt-2 leading-relaxed text-charcoal/70">
                  Track your shipped parcels or view order invoices directly inside your account.
                </p>
                <div className="mt-4 flex gap-4">
                  <Link href="/account" className="font-semibold text-gold-dark hover:underline">
                    My Account →
                  </Link>
                  <Link href="/faq" className="font-semibold text-gold-dark hover:underline">
                    Read FAQs →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

