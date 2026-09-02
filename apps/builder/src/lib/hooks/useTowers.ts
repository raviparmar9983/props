import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { towersApi } from "../api";
import type { CreateTowerPayload } from "../api/towers";

export function useTowers(projectId: string) {
  return useQuery({
    queryKey: ["projects", projectId, "towers"],
    queryFn: () => towersApi.listByProject(projectId),
    enabled: !!projectId,
    staleTime: 30_000,
  });
}

export function useCreateTower() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      projectId,
      data,
    }: {
      projectId: string;
      data: CreateTowerPayload;
    }) => towersApi.create(projectId, data),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({
        queryKey: ["projects", projectId, "towers"],
      });
    },
  });
}

export function useUpdateTower() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateTowerPayload }) =>
      towersApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

export function useDeleteTower() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => towersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}
