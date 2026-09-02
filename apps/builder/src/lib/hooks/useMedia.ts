import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { mediaApi } from "../api";
import type { ReorderItem } from "../api/media";
import type { MediaType } from "../api/schemas";

export function useProjectMedia(projectId: string) {
  return useQuery({
    queryKey: ["projects", projectId, "media"],
    queryFn: () => mediaApi.listByProject(projectId),
    enabled: !!projectId,
    staleTime: 30_000,
  });
}

export function useUploadMedia() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      projectId,
      file,
      type,
      unitTypeId,
      onUploadProgress,
    }: {
      projectId: string;
      file: File;
      type: MediaType;
      unitTypeId?: string;
      onUploadProgress?: (pct: number) => void;
    }) => mediaApi.upload(projectId, file, type, unitTypeId, onUploadProgress),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({
        queryKey: ["projects", projectId, "media"],
      });
    },
  });
}

export function useDeleteMedia() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => mediaApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

export function useReorderMedia() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      projectId,
      order,
    }: {
      projectId: string;
      order: ReorderItem[];
    }) => mediaApi.reorder(projectId, order),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({
        queryKey: ["projects", projectId, "media"],
      });
    },
  });
}

export function useSetPrimaryMedia() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      projectId,
      mediaId,
    }: {
      projectId: string;
      mediaId: string;
    }) => mediaApi.setPrimary(projectId, mediaId),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({
        queryKey: ["projects", projectId, "media"],
      });
    },
  });
}
