import { useQuery } from "@tanstack/react-query";
import { amenitiesApi } from "../api";

export function useAmenities() {
  return useQuery({
    queryKey: ["amenities"],
    queryFn: amenitiesApi.list,
    staleTime: Infinity,
  });
}
