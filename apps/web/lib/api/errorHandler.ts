export interface ApiError {
  statusCode: number;
  code: string;
  message: string;
  errors?: Record<string, string[]>;
}

export function parseApiError(error: unknown): ApiError {
  if (error && typeof error === "object" && "statusCode" in error) {
    return error as ApiError;
  }

  if (error && typeof error === "object" && "isAxiosError" in error) {
    const axiosError = error as {
      response?: { data?: ApiError; status?: number };
      message?: string;
    };
    if (axiosError.response?.data) {
      return axiosError.response.data as ApiError;
    }
    return {
      statusCode: axiosError.response?.status ?? 500,
      code: "NETWORK_ERROR",
      message: axiosError.message ?? "Network request failed",
    };
  }

  return {
    statusCode: 500,
    code: "UNKNOWN_ERROR",
    message:
      error instanceof Error ? error.message : "An unknown error occurred",
  };
}
