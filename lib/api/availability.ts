import { AuthMiddleware } from "./generated/auth-middleware";

export type AvailabilityRuleType = "OPEN" | "CLOSED";

export type AvailabilityRule = {
  id: string;
  type: AvailabilityRuleType;
  startDate: string;
  endDate: string;
  weekdays: number[];
  times: string[];
  label: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AvailabilityTime = { value: string; label: string };

export type AvailabilityDay = {
  date: string;
  weekday: number;
  closed: boolean;
  label?: string | null;
  times: AvailabilityTime[];
};

export type CreateAvailabilityRulePayload = {
  type: AvailabilityRuleType;
  startDate: string;
  endDate: string;
  weekdays?: number[];
  times?: string[];
  label?: string;
};

export const availabilityApi = {
  listRules: () => AuthMiddleware.get<AvailabilityRule[]>("/admin/availability"),

  createRule: (data: CreateAvailabilityRulePayload) =>
    AuthMiddleware.post<AvailabilityRule>("/admin/availability", data),

  updateRule: (id: string, data: Partial<CreateAvailabilityRulePayload>) =>
    AuthMiddleware.patch<AvailabilityRule>(`/admin/availability/${id}`, data),

  deleteRule: (id: string) =>
    AuthMiddleware.delete<void>(`/admin/availability/${id}`),

  calendar: (from: string, to: string) =>
    AuthMiddleware.get<{ days: AvailabilityDay[] }>(
      `/availability?from=${from}&to=${to}`,
    ),
};
