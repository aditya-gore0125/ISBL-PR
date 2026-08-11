'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';

const initialForm = {
  name: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
};

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/account';
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const nextErrors = {};
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (form.name.trim().length < 2) {
      nextErrors.name = 'Please enter your full name.';
    }

    if (!emailPattern.test(form.email.trim())) {
      nextErrors.email = 'Enter a valid email address.';
    }

    if (form.phone && !/^[6-9]\d{9}$/.test(form.phone.trim())) {
      nextErrors.phone = 'Enter a valid 10-digit mobile number.';
    }

    if (form.password.length < 6) {
      nextErrors.password = 'Password must be at least 6 characters long.';
    }

    if (form.confirmPassword !== form.password) {
      nextErrors.confirmPassword = 'Passwords do not match.';
    }

    return nextErrors;
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
    setSubmitError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          password: form.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const message = data?.message || 'Unable to create account.';
        if (message.toLowerCase().includes('email')) {
          setSubmitError('This email is already registered. Please sign in instead.');
        } else {
          setSubmitError(message);
        }
        return;
      }

      router.push(`/login?redirect=${encodeURIComponent(redirectTo)}`);
    } catch (error) {
      console.error('Signup error', error);
      setSubmitError('Unable to create account right now. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="rounded-[1.5rem] border border-gold/15 bg-white/90 p-8 shadow-soft sm:p-10">
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold">Create account</p>
          <h1 className="mt-3 font-fraunces text-4xl text-charcoal">Sign up</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <label className="block">
            <span className="text-sm font-medium text-charcoal/80">Full name</span>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="mt-2 h-12 w-full rounded-[1rem] border border-gold/20 bg-ivory px-4 text-sm text-charcoal outline-none transition focus:border-gold"
              placeholder="Your name"
            />
            {errors.name ? <p className="mt-1 text-xs text-maroon">{errors.name}</p> : null}
          </label>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-charcoal/80">Email</span>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="mt-2 h-12 w-full rounded-[1rem] border border-gold/20 bg-ivory px-4 text-sm text-charcoal outline-none transition focus:border-gold"
                placeholder="name@example.com"
              />
              {errors.email ? <p className="mt-1 text-xs text-maroon">{errors.email}</p> : null}
            </label>

            <label className="block">
              <span className="text-sm font-medium text-charcoal/80">Phone</span>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="mt-2 h-12 w-full rounded-[1rem] border border-gold/20 bg-ivory px-4 text-sm text-charcoal outline-none transition focus:border-gold"
                placeholder="9876543210"
              />
              {errors.phone ? <p className="mt-1 text-xs text-maroon">{errors.phone}</p> : null}
            </label>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-charcoal/80">Password</span>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                className="mt-2 h-12 w-full rounded-[1rem] border border-gold/20 bg-ivory px-4 text-sm text-charcoal outline-none transition focus:border-gold"
                placeholder="Create a password"
              />
              {errors.password ? <p className="mt-1 text-xs text-maroon">{errors.password}</p> : null}
            </label>

            <label className="block">
              <span className="text-sm font-medium text-charcoal/80">Confirm password</span>
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                className="mt-2 h-12 w-full rounded-[1rem] border border-gold/20 bg-ivory px-4 text-sm text-charcoal outline-none transition focus:border-gold"
                placeholder="Re-enter password"
              />
              {errors.confirmPassword ? <p className="mt-1 text-xs text-maroon">{errors.confirmPassword}</p> : null}
            </label>
          </div>

          {submitError ? (
            <div className="rounded-[1rem] border border-maroon/25 bg-maroon/5 px-4 py-3 text-sm text-maroon">
              {submitError}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-full bg-gold px-5 py-3 text-sm font-semibold text-white transition hover:bg-gold-dark disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-charcoal/75">
          <p>
            Already have an account?{' '}
            <Link href={`/login${redirectTo !== '/account' ? `?redirect=${encodeURIComponent(redirectTo)}` : ''}`} className="font-semibold text-gold-dark">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<main className="mx-auto max-w-3xl px-4 py-16 text-center text-sm text-charcoal/70">Loading...</main>}>
      <SignupForm />
    </Suspense>
  );
}
