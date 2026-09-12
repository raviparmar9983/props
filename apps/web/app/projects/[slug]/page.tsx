import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProjectBySlug, searchProjects } from "../../../lib/api";
import { ProjectMedia } from "../../../components/project-media";
import { ProjectCard } from "../../../components/project-card";
import { UnitTypeCards } from "../../../components/unit-type-cards";
import { ExpressInterest } from "../../../features/leads/express-interest";
import { ReadMore } from "../../../components/read-more";
import { PriceAndEmi } from "../../../components/price-and-emi";
import { CompareToggle } from "../../../components/compare-toggle";
import { SaveToggle } from "../../../components/save-toggle";
import { ShareButton } from "../../../components/share-button";
import { AmenityIcon } from "../../../components/amenity-icon";
import {
  ArrowRight,
  ChevronRight,
  Download,
  FileText,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import type { PublicProjectSummary } from "../../../types/public";
import { formatPrice, formatPossessionDate, formatStatusLabel } from "../../../lib/format";

export const revalidate = 300;

interface PageProps {
  params: Promise<{ slug: string }>;
}

function getPropertyTypeLabel(unitTypes: { propertyType: string }[]): string {
  const type = unitTypes[0]?.propertyType;
  if (!type) return "Property";
  const labels: Record<string, string> = {
    FLAT: "Flats",
    HOUSE: "Houses",
    PLOT: "Plots",
    SHOP: "Shops",
    CORPORATE: "Commercial",
  };
  return labels[type] ?? type.charAt(0) + type.slice(1).toLowerCase();
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const project = await getProjectBySlug(slug);
    return {
      title: `${project.title} in ${project.locality.name}, ${project.city.name} | PropertiesWale`,
      description: project.description ?? `Buy ${project.title} in ${project.locality.name}, ${project.city.name}. Verified builder project with zero brokerage.`,
    };
  } catch {
    return { title: "Project Not Found — PropertiesWale" };
  }
}

export default async function ProjectPage({ params }: PageProps) {
  const { slug } = await params;

  let project;
  try {
    project = await getProjectBySlug(slug);
  } catch {
    notFound();
  }

  const unitTypes = project.unitTypes;
  const startingPrice = unitTypes.length
    ? Math.min(...unitTypes.map((u) => u.price))
    : null;
  const availableCount = unitTypes.reduce(
    (sum, u) => sum + (u.availableCount > 0 ? u.availableCount : 0),
    0,
  );

  const propertyTypeLabel = getPropertyTypeLabel(unitTypes);
  const statusLabel = formatStatusLabel(project.status);
  const possessionLabel = project.possessionDate
    ? formatPossessionDate(project.possessionDate)
    : statusLabel === "Move-in Ready"
      ? "Ready to Move"
      : "On request";

  const isReraVerified = Boolean(project.reraProjectNumber);
  const isNewLaunch = project.status === "UPCOMING" || project.status === "UNDER_CONSTRUCTION";

  const brochureDocs = project.media.filter(
    (m) => m.type === "BROCHURE" || m.type === "FLOOR_PLAN" || m.type === "MASTER_PLAN",
  );

  const mapUrl =
    project.latitude && project.longitude
      ? `https://www.google.com/maps?q=${project.latitude},${project.longitude}`
      : project.address
        ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(project.address)}`
        : null;

  let similar: PublicProjectSummary[] = [];
  try {
    const res = await searchProjects({ city: project.city.slug, limit: 5 });
    similar = res.data.filter((p) => p.slug !== slug).slice(0, 4);
  } catch {
    similar = [];
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      <div className="mx-auto max-w-7xl px-6 pt-6">
        {/* Breadcrumbs */}
        <nav className="flex flex-wrap items-center gap-1.5 text-xs font-medium text-slate-400">
          <Link href="/" className="hover:text-accent">Home</Link>
          <ChevronRight size={12} />
          <Link href="/search" className="hover:text-accent">Properties</Link>
          <ChevronRight size={12} />
          <Link href={`/search?city=${project.city.slug}`} className="hover:text-accent">{project.city.name}</Link>
          <ChevronRight size={12} />
          <span className="text-slate-500">{project.locality.name}</span>
          <ChevronRight size={12} />
          <span className="font-semibold text-slate-800">{project.title}</span>
        </nav>

        {/* Header Title Section */}
        <div className="mt-4 flex flex-col justify-between gap-4 md:flex-row md:items-start">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-display text-3xl font-extrabold text-slate-900 md:text-4xl">
                {project.title}
              </h1>
              {isReraVerified && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                  <ShieldCheck size={13} /> RERA Verified
                </span>
              )}
              {isNewLaunch && (
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
                  New Launch
                </span>
              )}
            </div>

            <p className="mt-2 flex items-center gap-1 text-sm text-slate-600">
              <MapPin size={15} className="text-slate-400" />
              {project.locality.name}, {project.city.name}
            </p>
            {project.description && (
              <p className="mt-1 max-w-xl text-xs text-slate-500 line-clamp-2">
                {project.description.slice(0, 120)}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <SaveToggle projectId={project.id} />
            <CompareToggle slug={project.slug} />
            <ShareButton title={project.title} url={`/projects/${project.slug}`} />
          </div>
        </div>

        {/* Main 2-Column Grid */}
        <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:items-start">
          {/* Left Column */}
          <div className="min-w-0 flex-1">
            <ProjectMedia
              media={project.media}
              alt={project.title}
              projectId={project.id}
              shareTitle={project.title}
              shareUrl={`/projects/${project.slug}`}
            />

            {/* Key Info Metric Tiles */}
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                { value: propertyTypeLabel, label: "Property Type" },
                { value: statusLabel, label: "Status" },
                { value: possessionLabel, label: "Possession" },
                { value: startingPrice ? formatPrice(startingPrice) : "On request", label: "Starting Price" },
              ].map((tile) => (
                <div key={tile.label} className="rounded-xl border border-slate-100 bg-white p-4 text-center shadow-sm">
                  <span className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-accent-soft text-accent">
                    ✓
                  </span>
                  <p className="text-xs font-bold text-slate-900">{tile.value}</p>
                  <p className="mt-0.5 text-[10px] text-slate-400">{tile.label}</p>
                </div>
              ))}
            </div>

            {/* About Project Section */}
            <section className="mt-10 border-t border-slate-200 pt-8">
              <h2 className="font-display text-xl font-bold text-slate-900">
                About this project
              </h2>
              <ReadMore
                text={
                  project.description ??
                  `${project.title} is a premium development located in ${project.locality.name}, ${project.city.name}. Designed for modern living, it offers excellent connectivity, high-quality infrastructure and a vibrant community environment.`
                }
                className="mt-3 text-xs leading-relaxed text-slate-600"
              />
            </section>

            {/* Unit types & pricing */}
            {unitTypes.length > 0 && (
              <section className="mt-10 border-t border-slate-200 pt-8">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-xl font-bold text-slate-900">
                    Unit types &amp; pricing
                  </h2>
                  {availableCount > 0 && (
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-600">
                      {availableCount} units available
                    </span>
                  )}
                </div>
                <div className="mt-4">
                  <UnitTypeCards
                    projectId={project.id}
                    builderName={project.builder.companyName}
                    unitTypes={unitTypes}
                  />
                </div>
              </section>
            )}

            {/* Price & EMI Calculator */}
            {startingPrice !== null && (
              <section className="mt-10 border-t border-slate-200 pt-8">
                <PriceAndEmi
                  priceComponents={project.priceComponents ?? []}
                  startingPrice={startingPrice}
                />
              </section>
            )}

            {/* Amenities Grid */}
            {project.amenities.length > 0 && (
              <section className="mt-10 border-t border-slate-200 pt-8">
                <h2 className="font-display text-xl font-bold text-slate-900">Amenities</h2>
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {project.amenities.map(({ amenity }) => (
                    <div
                      key={amenity.id}
                      className="flex items-center gap-2.5 rounded-xl border border-slate-100 bg-white p-3.5 text-xs font-semibold text-slate-700 shadow-sm"
                    >
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent-soft text-accent">
                        <AmenityIcon icon={amenity.icon} size={14} />
                      </span>
                      {amenity.name}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* You May Also Like */}
            {similar.length > 0 && (
              <section className="mt-12 border-t border-slate-200 pt-8">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-xl font-bold text-slate-900">
                    You may also like
                  </h2>
                  <Link href={`/search?city=${project.city.slug}`} className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:underline">
                    View all <ArrowRight size={13} />
                  </Link>
                </div>
                <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {similar.map((p, i) => (
                    <ProjectCard key={p.slug} project={p} index={i} />
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Right Column Sidebar */}
          <aside className="w-full shrink-0 space-y-6 lg:w-80">
              <ExpressInterest
                projectId={project.id}
                builderName={project.builder.companyName}
                startingPriceLabel={startingPrice ? formatPrice(startingPrice) : "On request"}
                availableCount={availableCount}
                propertyTypeLabel={propertyTypeLabel}
                possessionLabel={possessionLabel}
                unitTypes={unitTypes.map((unit) => ({ id: unit.id, label: unit.label, price: unit.price }))}
              />

              {/* Brochure & Floor Plans */}
              {(brochureDocs.length > 0 || project.media.length > 0) && (
                <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-900">Brochure &amp; Floor Plans</h3>
                  <div className="mt-4 space-y-3 text-xs">
                    {(brochureDocs.length > 0
                      ? brochureDocs
                      : project.media.slice(0, 3)
                    ).map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 p-3">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 items-center justify-center rounded bg-red-100 text-red-600">
                            <FileText size={16} />
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 capitalize">
                              {doc.type.replace(/_/g, " ").toLowerCase()}
                            </p>
                            <p className="text-[10px] text-slate-400">PDF</p>
                          </div>
                        </div>
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-100"
                        >
                          <Download size={12} />
                          Download
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Location Map Box */}
              <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900">Location</h3>
                {project.address && (
                  <p className="mt-2 text-xs text-slate-600">
                    📍 {project.address}
                  </p>
                )}
                {mapUrl && (
                  <a
                    href={mapUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-block text-xs font-semibold text-accent hover:underline"
                  >
                    Open in Google Maps →
                  </a>
                )}
                <div className="mt-3 overflow-hidden rounded-lg border border-slate-200">
                  {project.latitude && project.longitude ? (
                    <iframe
                      title="Property location map"
                      src={`https://maps.google.com/maps?q=${project.latitude},${project.longitude}&z=14&output=embed`}
                      className="h-36 w-full border-0"
                      loading="lazy"
                    />
                  ) : (
                    <img
                      src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=600&q=80"
                      alt="Location preview"
                      className="h-36 w-full object-cover"
                    />
                  )}
                  <div className="bg-white p-2.5 text-[11px]">
                    <p className="font-bold text-slate-800">{project.locality.name}</p>
                    <p className="text-slate-400">{project.city.name}</p>
                  </div>
                </div>
              </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
