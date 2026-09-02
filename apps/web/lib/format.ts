export const FILE_BASE =
  process.env.NEXT_PUBLIC_FILE_BASE_URL ?? "";

// The API serves uploads as origin-relative paths (/uploads/...). The web app
// must build the full URL from its own API origin so it works from any device
// (localhost in stored URLs would be unreachable for customers/mobile users).
const FILE_ORIGIN = FILE_BASE.replace(/\/uploads\/?$/i, "").replace(/\/+$/, "");

export function fileUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) {
    try {
      const parsed = new URL(path);
      if (parsed.pathname.startsWith("/uploads/")) {
        return FILE_ORIGIN ? `${FILE_ORIGIN}${parsed.pathname}` : parsed.pathname;
      }
    } catch {
      return path;
    }
    return path;
  }
  const cleaned = path.startsWith("/") ? path : `/${path}`;
  const fullPath = cleaned.startsWith("/uploads/") ? cleaned : `/uploads${cleaned}`;
  return FILE_ORIGIN ? `${FILE_ORIGIN}${fullPath}` : fullPath;
}

export function formatPrice(price: number | null): string {
  if (price === null) return "Price on request";
  if (price >= 10000000) {
    const cr = price / 10000000;
    return `₹${cr % 1 === 0 ? cr.toFixed(0) : cr.toFixed(2)}Cr`;
  }
  if (price >= 100000) {
    const l = price / 100000;
    return `₹${l % 1 === 0 ? l.toFixed(0) : l.toFixed(1)}L`;
  }
  return `₹${price.toLocaleString("en-IN")}`;
}

export function formatStatusLabel(status?: string): string {
  switch (status) {
    case "UPCOMING":
      return "Upcoming";
    case "UNDER_CONSTRUCTION":
      return "New Launch";
    case "READY":
    case "READY_TO_MOVE":
      return "Move-in Ready";
    default:
      return status ?? "";
  }
}

export function formatPossessionDate(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-IN", {
    month: "short",
    year: "numeric",
  });
}
