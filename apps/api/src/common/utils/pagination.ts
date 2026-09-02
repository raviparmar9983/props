export function normalizePagination(page?: number, limit?: number, maxLimit = 50) {
  const safePage = Number.isFinite(page) && (page as number) >= 1 ? Math.floor(page as number) : 1;
  const safeLimit =
    Number.isFinite(limit) && (limit as number) >= 1
      ? Math.min(Math.floor(limit as number), maxLimit)
      : 20;
  return { page: safePage, limit: safeLimit };
}
