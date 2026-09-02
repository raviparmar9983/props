import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  landmarksApi,
  priceComponentsApi,
  paymentPlansApi,
  bankPartnersApi,
  constructionUpdatesApi,
  specificationsApi,
  faqsApi,
  siteVisitsApi,
} from "../api/projectDetails";
import type {
  LandmarkPayload,
  PriceComponentPayload,
  PaymentPlanPayload,
  BankPartnerPayload,
  ConstructionUpdatePayload,
  SpecificationPayload,
  FaqPayload,
  UpdateLandmarkPayload,
  UpdatePriceComponentPayload,
  UpdatePaymentPlanPayload,
  UpdateBankPartnerPayload,
  UpdateConstructionUpdatePayload,
  UpdateSpecificationPayload,
  UpdateFaqPayload,
  SiteVisitQuery,
} from "../api/projectDetails";
import type { SiteVisitStatus } from "../api/schemas";

const key = (projectId: string, resource: string) => [
  "projects",
  projectId,
  resource,
];

function useResource<T, Create, Update, UpdateType>(
  resource: string,
  list: (projectId: string) => Promise<T[]>,
  create: (projectId: string, data: Create) => Promise<T>,
  update: (id: string, data: Update) => Promise<T>,
  remove: (id: string) => Promise<unknown>,
) {
  const keyFor = (projectId: string) => key(projectId, resource);

  const useList = (projectId: string) =>
    useQuery({
      queryKey: keyFor(projectId),
      queryFn: () => list(projectId),
      enabled: !!projectId,
      staleTime: 30_000,
    });

  const useCreate = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: ({ projectId, data }: { projectId: string; data: Create }) =>
        create(projectId, data),
      onSuccess: (_, { projectId }) =>
        queryClient.invalidateQueries({ queryKey: keyFor(projectId) }),
    });
  };

  const useUpdate = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: ({ id, data }: { id: string; data: Update }) =>
        update(id, data),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ["projects"] }),
    });
  };

  const useDelete = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (id: string) => remove(id),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ["projects"] }),
    });
  };

  return { useList, useCreate, useUpdate, useDelete };
}

const landmarks = useResource(
  "landmarks",
  landmarksApi.list,
  landmarksApi.create,
  landmarksApi.update,
  landmarksApi.remove,
);
export const useLandmarks = landmarks.useList;
export const useCreateLandmark = landmarks.useCreate;
export const useUpdateLandmark = landmarks.useUpdate;
export const useDeleteLandmark = landmarks.useDelete;

const priceComponents = useResource(
  "priceComponents",
  priceComponentsApi.list,
  priceComponentsApi.create,
  priceComponentsApi.update,
  priceComponentsApi.remove,
);
export const usePriceComponents = priceComponents.useList;
export const useCreatePriceComponent = priceComponents.useCreate;
export const useUpdatePriceComponent = priceComponents.useUpdate;
export const useDeletePriceComponent = priceComponents.useDelete;

const paymentPlans = useResource(
  "paymentPlans",
  paymentPlansApi.list,
  paymentPlansApi.create,
  paymentPlansApi.update,
  paymentPlansApi.remove,
);
export const usePaymentPlans = paymentPlans.useList;
export const useCreatePaymentPlan = paymentPlans.useCreate;
export const useUpdatePaymentPlan = paymentPlans.useUpdate;
export const useDeletePaymentPlan = paymentPlans.useDelete;

const bankPartners = useResource(
  "bankPartners",
  bankPartnersApi.list,
  bankPartnersApi.create,
  bankPartnersApi.update,
  bankPartnersApi.remove,
);
export const useBankPartners = bankPartners.useList;
export const useCreateBankPartner = bankPartners.useCreate;
export const useUpdateBankPartner = bankPartners.useUpdate;
export const useDeleteBankPartner = bankPartners.useDelete;

const specifications = useResource(
  "specifications",
  specificationsApi.list,
  specificationsApi.create,
  specificationsApi.update,
  specificationsApi.remove,
);
export const useSpecifications = specifications.useList;
export const useCreateSpecification = specifications.useCreate;
export const useUpdateSpecification = specifications.useUpdate;
export const useDeleteSpecification = specifications.useDelete;

const faqs = useResource(
  "faqs",
  faqsApi.list,
  faqsApi.create,
  faqsApi.update,
  faqsApi.remove,
);
export const useFaqs = faqs.useList;
export const useCreateFaq = faqs.useCreate;
export const useUpdateFaq = faqs.useUpdate;
export const useDeleteFaq = faqs.useDelete;

export function useConstructionUpdates(projectId: string) {
  return useQuery({
    queryKey: key(projectId, "constructionUpdates"),
    queryFn: () => constructionUpdatesApi.list(projectId),
    enabled: !!projectId,
    staleTime: 30_000,
  });
}

export function useCreateConstructionUpdate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      projectId,
      data,
      file,
    }: {
      projectId: string;
      data: ConstructionUpdatePayload;
      file?: File;
    }) => constructionUpdatesApi.create(projectId, data, file),
    onSuccess: (_, { projectId }) =>
      queryClient.invalidateQueries({
        queryKey: key(projectId, "constructionUpdates"),
      }),
  });
}

export function useUpdateConstructionUpdate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
      file,
    }: {
      id: string;
      data: UpdateConstructionUpdatePayload;
      file?: File;
    }) => constructionUpdatesApi.update(id, data, file),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["projects"] }),
  });
}

export function useDeleteConstructionUpdate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => constructionUpdatesApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["projects"] }),
  });
}

export function useSiteVisits(params?: SiteVisitQuery) {
  return useQuery({
    queryKey: ["siteVisits", params],
    queryFn: () => siteVisitsApi.list(params),
    staleTime: 30_000,
  });
}

export function useUpdateSiteVisitStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: SiteVisitStatus }) =>
      siteVisitsApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["siteVisits"] });
    },
  });
}

export type {
  LandmarkPayload,
  PriceComponentPayload,
  PaymentPlanPayload,
  BankPartnerPayload,
  ConstructionUpdatePayload,
  SpecificationPayload,
  FaqPayload,
  UpdateLandmarkPayload,
  UpdatePriceComponentPayload,
  UpdatePaymentPlanPayload,
  UpdateBankPartnerPayload,
  UpdateConstructionUpdatePayload,
  UpdateSpecificationPayload,
  UpdateFaqPayload,
  SiteVisitQuery,
};
