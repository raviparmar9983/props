import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { savedPropertiesApi } from "../api";
import { useAuth } from "./useAuth";

export function useSavedProperties() {
  const { isAuthenticated, user } = useAuth();
  const isCustomer = user?.role === "CUSTOMER";
  return useQuery({
    queryKey: ["savedProperties"],
    queryFn: savedPropertiesApi.listMine,
    enabled: isAuthenticated && isCustomer,
    staleTime: 30_000,
    retry: false,
  });
}

export function useIsSaved(projectId: string) {
  const { data } = useSavedProperties();
  return data?.data.some((sp) => sp.projectId === projectId) ?? false;
}

export function useSaveProperty() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (projectId: string) => savedPropertiesApi.save(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["savedProperties"] });
    },
  });
}

export function useUnsaveProperty() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (projectId: string) => savedPropertiesApi.unsave(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["savedProperties"] });
    },
  });
}
