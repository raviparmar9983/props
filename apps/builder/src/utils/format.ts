export function formatPrice(price: number, unit?: string): string {
  if (unit === "LAKH") {
    return `₹${price}L`;
  }
  if (unit === "CRORE") {
    return `₹${price}Cr`;
  }
  if (price >= 10000000) {
    return `₹${(price / 10000000).toFixed(1).replace(/\.0$/, "")}Cr`;
  }
  if (price >= 100000) {
    return `₹${(price / 100000).toFixed(1).replace(/\.0$/, "")}L`;
  }
  return `₹${price.toLocaleString("en-IN")}`;
}

export function formatPriceFull(price: number): string {
  return `₹${price.toLocaleString("en-IN")}`;
}

export function formatArea(area: number, unit?: string): string {
  if (unit === "SQM") {
    return `${area} sq.m`;
  }
  return `${area.toLocaleString("en-IN")} sq.ft`;
}

export function relativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;

  if (diffMs < 0) return "just now";

  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);

  if (seconds < 60) return "just now";
  if (minutes === 1) return "1m ago";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours === 1) return "1h ago";
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return "yesterday";
  if (days < 7) return `${days}d ago`;
  if (weeks === 1) return "1w ago";
  if (weeks < 5) return `${weeks}w ago`;
  if (months === 1) return "1mo ago";
  return `${months}mo ago`;
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
