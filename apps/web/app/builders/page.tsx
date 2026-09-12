import type { Metadata } from "next";
import { BuildersDirectory } from "../../components/builders-directory";
import { getBuilders } from "../../lib/api";

export const metadata: Metadata = {
  title: "Verified Builders | PropertiesWale",
  description: "Explore verified real-estate builders and their published projects on PropertiesWale.",
};

export const revalidate = 300;

export default async function BuildersPage() {
  let builders: Awaited<ReturnType<typeof getBuilders>> = [];

  try {
    builders = await getBuilders();
  } catch {
    builders = [];
  }

  return (
    <main className="min-h-screen bg-paper pb-24 md:pb-16">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-12 md:py-16">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent">PropertiesWale partners</p>
          <h1 className="mt-3 font-display text-4xl font-bold text-ink-blue md:text-5xl">Meet verified builders</h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600 md:text-base">
            Browse developer profiles, published projects and only the information supplied by each builder.
          </p>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-6 py-10 md:py-14">
        <p className="mb-5 text-sm font-semibold text-slate-600">{builders.length} published {builders.length === 1 ? "builder" : "builders"}</p>
        <BuildersDirectory builders={builders} />
      </section>
    </main>
  );
}
