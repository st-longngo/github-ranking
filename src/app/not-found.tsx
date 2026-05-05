import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-20 text-center sm:px-6">
      <h2 className="text-xl font-semibold">Page not found</h2>
      <p className="mt-2 text-sm text-muted">
        The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <Link
        href="/"
        className="mt-6 inline-block rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:opacity-90"
      >
        Back to Explore
      </Link>
    </div>
  );
}
