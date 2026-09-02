export interface ApiResponse<T> {
  success: true;
  data: T;
  meta?: { total: number; page: number; limit: number };
}

export function success<T>(data: T, meta?: { total: number; page: number; limit: number }): ApiResponse<T> {
  const response: ApiResponse<T> = { success: true, data };
  if (meta) response.meta = meta;
  return response;
}
