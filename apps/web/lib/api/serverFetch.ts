export class NotFoundError extends Error {
  constructor(message = "Not found") {
    super(message);
    this.name = "NotFoundError";
  }
}

function resolveBaseUrl(): string {
  const raw = (process.env.API_INTERNAL_BASE_URL ?? "http://localhost:4000").replace(/\/+$/, "");
  if (raw.endsWith("/v1")) return raw;
  return `${raw}/v1`;
}

export async function serverFetch<T>(
  path: string,
  opts?: RequestInit & { revalidate?: number },
): Promise<T> {
  const { revalidate = 300, ...fetchOpts } = opts ?? {};
  const baseUrl = resolveBaseUrl();

  try {
    const res = await fetch(`${baseUrl}${path}`, {
      ...fetchOpts,
      next: { revalidate },
    });

    if (!res.ok) {
      if (res.status === 404) throw new NotFoundError();
      throw new Error(`API error ${res.status} on ${path}`);
    }

    return res.json() as Promise<T>;
  } catch (error) {
    if (typeof window !== "undefined") {
      const { toast } = await import("../toast");
      toast.error(
        error instanceof Error ? error.message : "API request failed",
        "API error",
      );
    }
    throw error;
  }
}
