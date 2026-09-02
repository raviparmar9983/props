import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { unitTypesApi } from "../api";
import type {
  CreateUnitTypePayload,
  UpdateUnitTypePayload,
} from "../api/unitTypes";

export function useUnitTypes(projectId: string) {
  return useQuery({
    queryKey: ["projects", projectId, "unitTypes"],
    queryFn: () => unitTypesApi.listByProject(projectId),
    enabled: !!projectId,
    staleTime: 30_000,
  });
}

export function useCreateUnitType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      projectId,
      data,
    }: {
      projectId: string;
      data: CreateUnitTypePayload;
    }) => unitTypesApi.create(projectId, data),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({
        queryKey: ["projects", projectId, "unitTypes"],
      });
    },
  });
}

export function useUpdateUnitType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateUnitTypePayload;
    }) => unitTypesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

export function useDeleteUnitType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => unitTypesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}
