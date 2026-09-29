'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ReviewForm({ slug }) {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    const trimmedComment = comment.trim();
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      setError('Choose a rating from 1 to 5 stars.');
      return;
    }
    if (trimmedComment.length < 5 || trimmedComment.length > 1000) {
      setError('Your review must be between 5 and 1000 characters.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`/api/products/${encodeURIComponent(slug)}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, comment: trimmedComment }),
      });
      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'Unable to submit your review.');
        return;
      }

      setComment('');
      setSuccess('Your review has been saved.');
      router.refresh();
    } catch {
      setError('Unable to submit your review. Check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <fieldset>
        <legend className="mb-2 text-sm font-semibold text-charcoal">Your rating</legend>
        <div className="flex items-center gap-1" role="radiogroup" aria-label="Product rating">
          {[1, 2, 3, 4, 5].map((value) => (
            <label key={value} className="cursor-pointer rounded focus-within:outline-none focus-within:ring-2 focus-within:ring-gold">
              <input
                className="peer sr-only"
                type="radio"
                name={`rating-${slug}`}
                value={value}
                checked={rating === value}
                onChange={() => setRating(value)}
                aria-label={`${value} out of 5 stars`}
              />
              <span className={`block px-1 text-2xl ${rating >= value ? 'text-gold' : 'text-gold/35'} peer-focus-visible:rounded peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-gold`} aria-hidden="true">★</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor="review-comment" className="mb-2 block text-sm font-semibold text-charcoal">Your review</label>
        <textarea
          id="review-comment"
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          maxLength={1000}
          rows={4}
          className="w-full rounded-[0.9rem] border border-gold/20 bg-white px-4 py-3 text-sm text-charcoal outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"
          aria-describedby="review-count"
        />
        <p id="review-count" className="mt-1 text-right text-xs text-charcoal/60">{comment.trim().length}/1000</p>
      </div>

      {error ? <p className="text-sm font-medium text-maroon" role="alert">{error}</p> : null}
      {success ? <p className="text-sm font-medium text-emerald-700" role="status">{success}</p> : null}

      <button
        type="submit"
        disabled={submitting}
        className="rounded-[0.95rem] bg-gold px-5 py-3 text-sm font-semibold uppercase text-white transition hover:bg-gold-dark disabled:cursor-wait disabled:opacity-60"
      >
        {submitting ? 'Submitting...' : 'Submit review'}
      </button>
    </form>
  );
}