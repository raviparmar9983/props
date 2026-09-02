import { useInfiniteQuery } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";

interface UsePaginatedQueryOptions<T> {
  queryKey: string[];
  queryFn: (page: number, limit: number) => Promise<{
    data: T[];
    meta: { total: number; page: number; limit: number };
  }>;
  limit?: number;
  enabled?: boolean;
}

export function usePaginatedQuery<T>({
  queryKey,
  queryFn,
  limit = 20,
  enabled = true,
}: UsePaginatedQueryOptions<T>) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam }) => queryFn(pageParam as number, limit),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, total } = lastPage.meta;
      return page * limit < total ? page + 1 : undefined;
    },
    enabled,
  });

  const items = useMemo(
    () => data?.pages.flatMap((p) => p.data) ?? [],
    [data],
  );

  const total = data?.pages[0]?.meta.total ?? 0;

  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  return {
    items,
    total,
    isLoading,
    isError,
    error,
    hasNextPage: hasNextPage ?? false,
    isFetchingNextPage,
    loadMore,
  };
}
