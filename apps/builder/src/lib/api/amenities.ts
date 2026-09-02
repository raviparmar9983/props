import apiClient from "./client";
import type { Amenity } from "./schemas";

export const amenitiesApi = {
  list: () => apiClient.get<Amenity[]>("/amenities").then((r) => r.data),
};
