'use client';

import { useEffect } from 'react';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error('[ErrorBoundary]', error);
  }, [error]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-md rounded-xl border border-red-200 bg-red-50 p-8 text-center dark:border-red-800 dark:bg-red-950/30">
        <p className="text-4xl" aria-hidden="true">⚠️</p>
        <h2 className="mt-4 text-lg font-semibold text-red-800 dark:text-red-300">
          Something went wrong
        </h2>
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">
          {error.message || 'Failed to load rankings. Please try again.'}
        </p>
        <button
          onClick={reset}
          className="mt-6 rounded-lg bg-red-600 px-5 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
