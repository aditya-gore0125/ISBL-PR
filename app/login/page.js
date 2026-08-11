'use client';

import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';

const initialForm = {
  email: '',
  password: '',
};

function LoginForm() {
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

    if (!emailPattern.test(form.email.trim())) {
      nextErrors.email = 'Enter a valid email address.';
    }

    if (!form.password) {
      nextErrors.password = 'Password is required.';
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
      const result = await signIn('credentials', {
        email: form.email.trim(),
        password: form.password,
        redirect: false,
        callbackUrl: redirectTo,
      });

      if (result?.error) {
        setSubmitError('Invalid email or password. Please try again.');
        return;
      }

      router.push(result?.url || redirectTo);
    } catch (error) {
      console.error('Login error', error);
      setSubmitError('Unable to sign in right now. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="rounded-[1.5rem] border border-gold/15 bg-white/90 p-8 shadow-soft sm:p-10">
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold">Welcome back</p>
          <h1 className="mt-3 font-fraunces text-4xl text-charcoal">Sign in</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
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
            <span className="text-sm font-medium text-charcoal/80">Password</span>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="mt-2 h-12 w-full rounded-[1rem] border border-gold/20 bg-ivory px-4 text-sm text-charcoal outline-none transition focus:border-gold"
              placeholder="••••••••"
            />
            {errors.password ? <p className="mt-1 text-xs text-maroon">{errors.password}</p> : null}
          </label>

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
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-charcoal/75">
          <p>
            New here?{' '}
            <Link href={`/signup${redirectTo !== '/account' ? `?redirect=${encodeURIComponent(redirectTo)}` : ''}`} className="font-semibold text-gold-dark">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<main className="mx-auto max-w-3xl px-4 py-16 text-center text-sm text-charcoal/70">Loading...</main>}>
      <LoginForm />
    </Suspense>
  );
}
