import apiClient from "./client";
import type {
  UnitType,
  PropertyType,
  AreaUnit,
  PriceUnit,
  Facing,
} from "./schemas";

export interface CreateUnitTypePayload {
  propertyType: PropertyType;
  label: string;
  towerId?: string;
  carpetArea?: number;
  builtUpArea?: number;
  areaUnit?: AreaUnit;
  price: number;
  priceUnit?: PriceUnit;
  totalCount: number;
  availableCount: number;
  floorNumber?: number;
  facing?: Facing;
  viewType?: string;
  bookingAmount?: number;
  attributes?: Record<string, unknown>;
}

export type UpdateUnitTypePayload = {
  propertyType?: PropertyType;
  label?: string;
  towerId?: string | null;
  carpetArea?: number;
  builtUpArea?: number;
  areaUnit?: AreaUnit;
  price?: number;
  priceUnit?: PriceUnit;
  totalCount?: number;
  availableCount?: number;
  floorNumber?: number;
  facing?: Facing | null;
  viewType?: string;
  bookingAmount?: number;
  attributes?: Record<string, unknown>;
};

export const unitTypesApi = {
  listByProject: (projectId: string) =>
    apiClient
      .get<UnitType[]>(`/projects/${projectId}/unit-types`)
      .then((r) => r.data),

  create: (projectId: string, data: CreateUnitTypePayload) =>
    apiClient
      .post<UnitType>(`/projects/${projectId}/unit-types`, data)
      .then((r) => r.data),

  update: (id: string, data: UpdateUnitTypePayload) =>
    apiClient.patch<UnitType>(`/unit-types/${id}`, data).then((r) => r.data),

  delete: (id: string) =>
    apiClient.delete(`/unit-types/${id}`).then((r) => r.data),
};
