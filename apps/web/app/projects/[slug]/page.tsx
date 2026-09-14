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
import { StatusBadge, BoolIcon } from "../../../components/status-badge";
import {
  ArrowRight,
  ChevronRight,
  Download,
  FileText,
  MapPin,
  ShieldCheck,
  HardHat,
  Lock,
  Landmark as BankIcon,
  Wallet,
  ListChecks,
  HelpCircle,
  Sparkles,
  Award,
  type LucideIcon,
} from "lucide-react";
import type { PublicProjectSummary } from "../../../types/public";
import { formatPrice, formatPossessionDate, formatStatusLabel, fileUrl } from "../../../lib/format";

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

function DetailSection({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-10 border-t border-slate-200 pt-8">
      <h2 className="flex items-center gap-2 font-display text-xl font-bold text-slate-900">
        <Icon size={19} className="text-accent" aria-hidden />
        {title}
      </h2>
      <div className="mt-4 overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
        {children}
      </div>
    </section>
  );
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-4 py-3 last:border-b-0 sm:px-5">
      <span className="text-xs font-medium text-slate-500">{label}</span>
      <span className="text-right text-sm font-semibold text-slate-800">{value}</span>
    </div>
  );
}

function formatFullDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const project = await getProjectBySlug(slug);
    const title = `${project.title} in ${project.locality.name}, ${project.city.name} | PropertiesWale`;
    const description =
      project.description ??
      `Buy ${project.title} in ${project.locality.name}, ${project.city.name}. Verified builder project with zero brokerage.`;
    const ogImage = fileUrl(project.ogImageUrl);
    return {
      title,
      description,
      openGraph: ogImage ? { title, description, images: [{ url: ogImage }] } : { title, description },
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

  const hasConstructionDetails = Boolean(
    project.structureType || project.powerBackupCapacity || project.waterSource || project.liftCount,
  );
  const hasSocietyDetails = Boolean(
    project.openSpacePercent != null ||
      project.greenAreaPercent != null ||
      project.securityGuardCount != null ||
      project.petPolicy,
  );

  const specsByCategory = project.specifications.reduce<Record<string, typeof project.specifications>>(
    (acc, spec) => {
      (acc[spec.category] ??= []).push(spec);
      return acc;
    },
    {},
  );

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

            {/* Legal & Compliance — always shown: RERA/occupancy/commencement/
                litigation status are non-nullable on every project. */}
            <DetailSection title="Legal & Compliance" icon={ShieldCheck}>
              <DetailRow label="RERA status" value={<StatusBadge value={project.reraStatus} />} />
              {project.reraProjectNumber && (
                <DetailRow label="RERA registration no." value={project.reraProjectNumber} />
              )}
              {project.reraPortalUrl && (
                <DetailRow
                  label="RERA portal"
                  value={
                    <a
                      href={project.reraPortalUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-accent hover:underline"
                    >
                      View listing →
                    </a>
                  }
                />
              )}
              <DetailRow label="Occupancy certificate" value={<StatusBadge value={project.occupancyCertStatus} />} />
              <DetailRow label="Commencement certificate" value={<StatusBadge value={project.commencementCertStatus} />} />
              <DetailRow label="Land title" value={<StatusBadge value={project.landTitleType} />} />
              <DetailRow label="Litigation status" value={<StatusBadge value={project.litigationStatus} />} />
            </DetailSection>

            {/* Construction Quality */}
            {hasConstructionDetails && (
              <DetailSection title="Construction Quality" icon={HardHat}>
                {project.structureType && (
                  <DetailRow label="Structure type" value={project.structureType} />
                )}
                {project.powerBackupCapacity && (
                  <DetailRow label="Power backup" value={project.powerBackupCapacity} />
                )}
                {project.waterSource && <DetailRow label="Water source" value={project.waterSource} />}
                {project.liftCount != null && (
                  <DetailRow
                    label="Lifts"
                    value={`${project.liftCount}${project.liftBrand ? ` (${project.liftBrand})` : ""}`}
                  />
                )}
                <DetailRow
                  label="Fire safety compliant"
                  value={<BoolIcon value={project.fireSafetyCompliant} />}
                />
              </DetailSection>
            )}

            {/* Society & Security */}
            <DetailSection title="Society & Security" icon={Lock}>
              {project.openSpacePercent != null && (
                <DetailRow label="Open space" value={`${project.openSpacePercent}%`} />
              )}
              {project.greenAreaPercent != null && (
                <DetailRow label="Green area" value={`${project.greenAreaPercent}%`} />
              )}
              <DetailRow label="CCTV surveillance" value={<BoolIcon value={project.hasCctv} />} />
              <DetailRow label="Gated entry" value={<BoolIcon value={project.hasGatedEntry} />} />
              {project.securityGuardCount != null && (
                <DetailRow label="Security guards" value={String(project.securityGuardCount)} />
              )}
              {project.petPolicy && <DetailRow label="Pet policy" value={project.petPolicy} />}
            </DetailSection>

            {/* Nearby Landmarks */}
            {project.landmarks.length > 0 && (
              <section className="mt-10 border-t border-slate-200 pt-8">
                <h2 className="flex items-center gap-2 font-display text-xl font-bold text-slate-900">
                  <MapPin size={19} className="text-accent" aria-hidden />
                  Nearby Landmarks
                </h2>
                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {project.landmarks.map((lm) => (
                    <div
                      key={lm.id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-white p-3.5 shadow-sm"
                    >
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-accent">
                          {lm.category.replace(/_/g, " ")}
                        </p>
                        <p className="truncate text-sm font-semibold text-slate-800">{lm.name}</p>
                      </div>
                      <p className="shrink-0 text-right text-xs text-slate-500">
                        {lm.distanceKm} km
                        {lm.travelTimeMinutes ? <> · {lm.travelTimeMinutes} min</> : null}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Payment Plans */}
            {project.paymentPlans.length > 0 && (
              <section className="mt-10 border-t border-slate-200 pt-8">
                <h2 className="flex items-center gap-2 font-display text-xl font-bold text-slate-900">
                  <Wallet size={19} className="text-accent" aria-hidden />
                  Payment Plans
                </h2>
                <div className="mt-4 space-y-4">
                  {project.paymentPlans.map((plan) => (
                    <div key={plan.id} className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-bold text-slate-900">{plan.name}</p>
                        <StatusBadge value={plan.type} />
                      </div>
                      <p className="mt-1 text-xs text-slate-500">
                        Booking amount: <span className="font-semibold text-slate-700">{formatPrice(plan.bookingAmount)}</span>
                      </p>
                      {plan.milestones.length > 0 && (
                        <div className="mt-3 space-y-1.5">
                          {plan.milestones.map((m, i) => (
                            <div key={i} className="flex items-center justify-between text-xs">
                              <span className="text-slate-600">{m.stage}</span>
                              <span className="font-semibold text-slate-800">{m.percent}%</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Bank Partners */}
            {project.bankPartners.length > 0 && (
              <section className="mt-10 border-t border-slate-200 pt-8">
                <h2 className="flex items-center gap-2 font-display text-xl font-bold text-slate-900">
                  <BankIcon size={19} className="text-accent" aria-hidden />
                  Bank Partners
                </h2>
                <div className="mt-4 flex flex-wrap gap-3">
                  {project.bankPartners.map((bank) => (
                    <div
                      key={bank.id}
                      className="flex items-center gap-2.5 rounded-xl border border-slate-100 bg-white px-4 py-3 shadow-sm"
                    >
                      {bank.logoUrl && (
                        <img
                          src={fileUrl(bank.logoUrl) ?? bank.logoUrl}
                          alt={bank.bankName}
                          className="h-6 w-auto object-contain"
                        />
                      )}
                      <span className="text-xs font-semibold text-slate-700">{bank.bankName}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Construction Updates */}
            {project.constructionUpdates.length > 0 && (
              <section className="mt-10 border-t border-slate-200 pt-8">
                <h2 className="flex items-center gap-2 font-display text-xl font-bold text-slate-900">
                  <HardHat size={19} className="text-accent" aria-hidden />
                  Construction Updates
                </h2>
                <div className="mt-4 space-y-4">
                  {project.constructionUpdates.map((update) => (
                    <div key={update.id} className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-bold text-slate-900">{update.title}</p>
                        <span className="text-[11px] font-medium text-slate-400">
                          {formatFullDate(update.updateDate)}
                        </span>
                      </div>
                      {update.progressPercent != null && (
                        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-accent"
                            style={{ width: `${Math.min(100, Math.max(0, update.progressPercent))}%` }}
                          />
                        </div>
                      )}
                      {update.description && (
                        <p className="mt-2 text-xs leading-relaxed text-slate-600">{update.description}</p>
                      )}
                      {update.photoUrl && (
                        <img
                          src={fileUrl(update.photoUrl) ?? update.photoUrl}
                          alt={update.title}
                          className="mt-3 h-40 w-full rounded-lg object-cover"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Specifications */}
            {project.specifications.length > 0 && (
              <section className="mt-10 border-t border-slate-200 pt-8">
                <h2 className="flex items-center gap-2 font-display text-xl font-bold text-slate-900">
                  <ListChecks size={19} className="text-accent" aria-hidden />
                  Specifications
                </h2>
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {Object.entries(specsByCategory).map(([category, specs]) => (
                    <div key={category} className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
                      <p className="border-b border-slate-100 bg-slate-50 px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        {category.replace(/_/g, " ")}
                      </p>
                      {specs.map((spec) => (
                        <DetailRow key={spec.id} label={spec.label} value={spec.value} />
                      ))}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Project Highlights */}
            {project.highlights.length > 0 && (
              <section className="mt-10 border-t border-slate-200 pt-8">
                <h2 className="flex items-center gap-2 font-display text-xl font-bold text-slate-900">
                  <Sparkles size={19} className="text-accent" aria-hidden />
                  Highlights
                </h2>
                <ul className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {project.highlights.map((h) => (
                    <li
                      key={h.id}
                      className="flex items-start gap-2 rounded-xl border border-slate-100 bg-white p-3.5 text-sm text-slate-700 shadow-sm"
                    >
                      <Sparkles size={14} className="mt-0.5 shrink-0 text-accent" aria-hidden />
                      {h.text}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* FAQs */}
            {project.faqs.length > 0 && (
              <section className="mt-10 border-t border-slate-200 pt-8">
                <h2 className="flex items-center gap-2 font-display text-xl font-bold text-slate-900">
                  <HelpCircle size={19} className="text-accent" aria-hidden />
                  Frequently Asked Questions
                </h2>
                <div className="mt-4 space-y-2">
                  {project.faqs.map((faq) => (
                    <details
                      key={faq.id}
                      className="group rounded-xl border border-slate-100 bg-white p-4 shadow-sm open:shadow-card-hover"
                    >
                      <summary className="cursor-pointer list-none text-sm font-semibold text-slate-900 marker:content-none">
                        {faq.question}
                      </summary>
                      <p className="mt-2 text-xs leading-relaxed text-slate-600">{faq.answer}</p>
                    </details>
                  ))}
                </div>
              </section>
            )}

            {/* Brochure & Floor Plans — moved out of the sidebar for the same
                reason as Location and Developer info below: anything living
                next to ExpressInterest's sticky/fixed price card could end
                up visually stuck underneath it while scrolling. */}
            {(brochureDocs.length > 0 || project.media.length > 0) && (
              <section className="mt-10 border-t border-slate-200 pt-8">
                <h2 className="flex items-center gap-2 font-display text-xl font-bold text-slate-900">
                  <FileText size={19} className="text-accent" aria-hidden />
                  Brochure &amp; Floor Plans
                </h2>
                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {(brochureDocs.length > 0 ? brochureDocs : project.media.slice(0, 3)).map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-white p-4 shadow-sm"
                    >
                      <div className="flex min-w-0 items-center gap-2.5">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600">
                          <FileText size={16} />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-slate-800 capitalize">
                            {doc.type.replace(/_/g, " ").toLowerCase()}
                          </p>
                          <p className="text-[10px] text-slate-400">PDF</p>
                        </div>
                      </div>
                      <a
                        href={fileUrl(doc.url) ?? doc.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-100"
                      >
                        <Download size={12} />
                        Download
                      </a>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Location */}
            <section className="mt-10 border-t border-slate-200 pt-8">
              <h2 className="flex items-center gap-2 font-display text-xl font-bold text-slate-900">
                <MapPin size={19} className="text-accent" aria-hidden />
                Location
              </h2>
              <div className="mt-4 overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm sm:flex sm:items-stretch">
                <div className="p-5 sm:w-72 sm:shrink-0 sm:p-6">
                  <p className="font-bold text-slate-800">{project.locality.name}</p>
                  <p className="text-sm text-slate-400">{project.city.name}</p>
                  {project.address && (
                    <p className="mt-3 text-xs leading-relaxed text-slate-600">📍 {project.address}</p>
                  )}
                  {mapUrl && (
                    <a
                      href={mapUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-block text-xs font-semibold text-accent hover:underline"
                    >
                      Open in Google Maps →
                    </a>
                  )}
                </div>
                <div className="sm:flex-1">
                  {project.latitude && project.longitude ? (
                    <iframe
                      title="Property location map"
                      src={`https://maps.google.com/maps?q=${project.latitude},${project.longitude}&z=14&output=embed`}
                      className="h-56 w-full border-0 sm:h-full sm:min-h-[14rem]"
                      loading="lazy"
                    />
                  ) : (
                    <img
                      src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=900&q=80"
                      alt="Location preview"
                      className="h-56 w-full object-cover sm:h-full"
                    />
                  )}
                </div>
              </div>
            </section>

            {/* Developer & Builder Information — placed after every other detail
                section (not in the sticky sidebar) so it can't end up
                visually stuck under the price/contact card while scrolling,
                which is what happened when it lived in the aside next to
                ExpressInterest's sticky/fixed positioning. */}
            <section className="mt-10 border-t border-slate-200 pt-8">
              <h2 className="flex items-center gap-2 font-display text-xl font-bold text-slate-900">
                <Award size={19} className="text-accent" aria-hidden />
                Developer &amp; Builder Information
              </h2>
              <div className="mt-4 rounded-xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {project.builder.logo ? (
                      <img
                        src={fileUrl(project.builder.logo) ?? project.builder.logo}
                        alt={project.builder.companyName}
                        className="h-12 w-12 shrink-0 rounded-lg object-contain"
                      />
                    ) : (
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-base font-bold text-accent-dark">
                        {project.builder.companyName.charAt(0)}
                      </span>
                    )}
                    <div className="min-w-0">
                      <Link
                        href={`/builders/${project.builder.slug}`}
                        className="block text-base font-bold text-slate-900 hover:text-accent-dark"
                      >
                        {project.builder.companyName}
                      </Link>
                      {project.builder.verificationStatus === "VERIFIED" && (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-success">
                          <ShieldCheck size={12} /> Verified builder
                        </span>
                      )}
                    </div>
                  </div>
                  <Link
                    href={`/builders/${project.builder.slug}`}
                    className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-accent hover:underline"
                  >
                    View builder profile <ArrowRight size={13} />
                  </Link>
                </div>

                {(project.builder.yearsInBusiness != null ||
                  project.builder.totalProjectsCompleted != null ||
                  project.builder.onTimeDeliveryRate != null ||
                  (project.builder.reviewsSummary.count > 0 && project.builder.reviewsSummary.averageRating != null)) && (
                  <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-slate-100 pt-5 text-center sm:grid-cols-4">
                    {project.builder.yearsInBusiness != null && (
                      <div>
                        <dt className="font-display text-lg font-bold text-slate-900">{project.builder.yearsInBusiness}</dt>
                        <dd className="mt-0.5 text-[11px] text-slate-400">Years active</dd>
                      </div>
                    )}
                    {project.builder.totalProjectsCompleted != null && (
                      <div>
                        <dt className="font-display text-lg font-bold text-slate-900">{project.builder.totalProjectsCompleted}</dt>
                        <dd className="mt-0.5 text-[11px] text-slate-400">Projects delivered</dd>
                      </div>
                    )}
                    {project.builder.onTimeDeliveryRate != null && (
                      <div>
                        <dt className="font-display text-lg font-bold text-slate-900">{project.builder.onTimeDeliveryRate}%</dt>
                        <dd className="mt-0.5 text-[11px] text-slate-400">On-time delivery</dd>
                      </div>
                    )}
                    {project.builder.reviewsSummary.count > 0 && project.builder.reviewsSummary.averageRating != null && (
                      <div>
                        <dt className="font-display text-lg font-bold text-slate-900">
                          {project.builder.reviewsSummary.averageRating.toFixed(1)}★
                        </dt>
                        <dd className="mt-0.5 text-[11px] text-slate-400">
                          {project.builder.reviewsSummary.count} review{project.builder.reviewsSummary.count !== 1 ? "s" : ""}
                        </dd>
                      </div>
                    )}
                  </dl>
                )}

                {project.builder.reraNumber && (
                  <p className="mt-4 border-t border-slate-100 pt-4 text-xs text-slate-400">
                    Builder RERA No. <span className="font-medium text-slate-600">{project.builder.reraNumber}</span>
                  </p>
                )}
              </div>
            </section>

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
          </aside>
        </div>
      </div>
    </div>
  );
}
