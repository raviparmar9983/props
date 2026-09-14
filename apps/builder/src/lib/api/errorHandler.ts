export interface ApiError {
  statusCode: number;
  code: string;
  message: string;
  errors?: Record<string, string[]>;
}

export function parseApiError(error: unknown): ApiError {
  return withReadableMessage(extractApiError(error));
}

function extractApiError(error: unknown): ApiError {
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
    message: error instanceof Error ? error.message : "An unknown error occurred",
  };
}

// The backend collapses class-validator field errors into a generic
// `message: "Validation failed"` with the real per-field text under
// `errors.body` (see AllExceptionsFilter) — it's a flat list, not keyed by
// field name, so `getFieldErrors` below can't map it to individual inputs.
// Every caller that just shows `err.message` (toasts, inline form errors)
// was displaying the useless generic string instead; surfacing the real
// messages here fixes it everywhere at once instead of per-form.
function withReadableMessage(apiError: ApiError): ApiError {
  if (apiError.errors?.body?.length) {
    return { ...apiError, message: apiError.errors.body.join(" ") };
  }
  return apiError;
}

export function getFieldErrors(error: ApiError, field: string): string[] {
  return error.errors?.[field] ?? [];
}
