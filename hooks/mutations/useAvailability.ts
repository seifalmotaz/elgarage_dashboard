import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import {
  availabilityApi,
  type CreateAvailabilityRulePayload,
} from "@/lib/api/availability";
import { queryKeys } from "@/lib/query-keys";

export function useCreateAvailabilityRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAvailabilityRulePayload) =>
      availabilityApi.createRule(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.availability.all() });
      toast.success("تم حفظ الموعد");
    },
    onError: () => toast.error("تعذر حفظ الموعد"),
  });
}

export function useUpdateAvailabilityRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CreateAvailabilityRulePayload>;
    }) => availabilityApi.updateRule(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.availability.all() });
      toast.success("تم تحديث الموعد");
    },
    onError: () => toast.error("تعذر تحديث الموعد"),
  });
}

export function useDeleteAvailabilityRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => availabilityApi.deleteRule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.availability.all() });
      toast.success("تم الحذف");
    },
    onError: () => toast.error("تعذر الحذف"),
  });
}
