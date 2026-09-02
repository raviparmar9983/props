import apiClient from "./client";
import type { PaginatedResponse, Notification } from "../../types/public";

export interface ListNotificationsParams {
  isRead?: boolean;
  page?: number;
  limit?: number;
}

export const notificationsApi = {
  list: (params?: ListNotificationsParams) =>
    apiClient
      .get<PaginatedResponse<Notification>>("/notifications", { params })
      .then((r) => r.data),

  markAsRead: (id: string) =>
    apiClient.patch(`/notifications/${id}/read`).then((r) => r.data),

  markAllAsRead: () =>
    apiClient.patch("/notifications/read-all").then((r) => r.data),
};
