"use client";

export function FooterNewsletter() {
  return (
    <form
      onSubmit={(e) => e.preventDefault()}
      className="mt-3 flex flex-col gap-2"
    >
      <input
        type="email"
        placeholder="Enter your email"
        className="w-full rounded border border-slate-200 px-3 py-2 text-xs outline-none focus:border-accent"
      />
      <button
        type="submit"
        className="w-full rounded bg-accent py-2 text-xs font-semibold text-white transition-colors hover:bg-accent-dark"
      >
        Subscribe
      </button>
    </form>
  );
}
