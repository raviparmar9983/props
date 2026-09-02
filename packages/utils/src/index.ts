export function slugify(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export function assertNever(value: never): never { throw new Error(`Unexpected value: ${String(value)}`); }
