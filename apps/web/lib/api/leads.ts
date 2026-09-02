import apiClient from "./client";

export interface SubmitLeadPayload {
  projectId: string;
  unitTypeId?: string | undefined;
  message?: string | undefined;
}

export const leadsApi = {
  submit: (payload: SubmitLeadPayload) =>
    apiClient
      .post<{ id: string; status: string; createdAt: string; duplicate?: boolean }>(
        "/public/leads",
        payload,
      )
      .then((r) => r.data),
};
