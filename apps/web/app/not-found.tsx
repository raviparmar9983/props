import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-4 text-center">
      <p className="text-6xl font-bold text-accent">404</p>
      <h1 className="mt-4 font-display text-2xl font-bold text-slate-900 md:text-3xl">
        Page not found
      </h1>
      <p className="mt-3 max-w-sm text-slate-500">
        The page you are looking for does not exist or has been moved.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/"
          className="rounded-pill bg-accent px-6 py-3 text-sm font-semibold text-white shadow-accent-button transition-colors hover:bg-accent-dark"
        >
          Go to homepage
        </Link>
        <Link
          href="/search"
          className="rounded-pill border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
        >
          Search properties
        </Link>
      </div>
    </div>
  );
}

export const metadata = {
  title: "Page Not Found — VerifiedProps",
  description: "The page you are looking for could not be found. Browse verified properties on VerifiedProps.",
  robots: {
    index: false,
    follow: true,
  },
};
