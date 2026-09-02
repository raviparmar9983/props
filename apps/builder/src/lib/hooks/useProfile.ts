import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { builderProfileApi } from "../api";
import type { UpdateBuilderPayload, PortfolioPayload } from "../api/builderProfile";

export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: builderProfileApi.getProfile,
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateBuilderPayload) =>
      builderProfileApi.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}

export function usePortfolio() {
  return useQuery({
    queryKey: ["profile", "portfolio"],
    queryFn: builderProfileApi.listPortfolio,
    staleTime: 30_000,
  });
}

export function useCreatePortfolio() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: PortfolioPayload) => builderProfileApi.createPortfolio(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", "portfolio"] });
    },
  });
}

export function useUpdatePortfolio() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<PortfolioPayload> }) =>
      builderProfileApi.updatePortfolio(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", "portfolio"] });
    },
  });
}

export function useDeletePortfolio() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => builderProfileApi.deletePortfolio(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", "portfolio"] });
    },
  });
}

export function useReviews() {
  return useQuery({
    queryKey: ["profile", "reviews"],
    queryFn: builderProfileApi.listReviews,
    staleTime: 30_000,
  });
}

export function useUploadDocument() {
  return useMutation({
    mutationFn: ({
      file,
      onUploadProgress,
    }: {
      file: File;
      onUploadProgress?: (pct: number) => void;
    }) => builderProfileApi.uploadDocument(file, onUploadProgress),
  });
}

export function useUploadLogo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      file,
      onUploadProgress,
    }: {
      file: File;
      onUploadProgress?: (pct: number) => void;
    }) => builderProfileApi.uploadLogo(file, onUploadProgress),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}
