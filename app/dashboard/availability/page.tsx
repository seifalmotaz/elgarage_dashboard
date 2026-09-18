"use client";

import { useMemo, useState } from "react";
import Button from "@/components/ui/Button";
import { PageContainer } from "@/components/dashboard/layout/PageContainer";
import { PageHeader } from "@/components/dashboard/layout/PageHeader";
import { ContentCard } from "@/components/dashboard/layout/ContentCard";
import { LoadingState } from "@/components/dashboard/states/LoadingState";
import { ErrorState } from "@/components/dashboard/states/ErrorState";
import { EmptyState } from "@/components/dashboard/states/EmptyState";
import {
  AvailabilityRuleModal,
  WEEKDAYS,
} from "@/components/dashboard/availability/availability-form";
import {
  useAvailabilityCalendar,
  useAvailabilityRules,
} from "@/hooks/queries/useAvailability";
import {
  useCreateAvailabilityRule,
  useDeleteAvailabilityRule,
  useUpdateAvailabilityRule,
} from "@/hooks/mutations/useAvailability";
import type {
  AvailabilityRule,
  AvailabilityRuleType,
  CreateAvailabilityRulePayload,
} from "@/lib/api/availability";

function rangeFromToday(days: number) {
  const start = new Date();
  const end = new Date();
  end.setDate(start.getDate() + days);
  return {
    from: start.toISOString().slice(0, 10),
    to: end.toISOString().slice(0, 10),
  };
}

function weekdayLabel(days: number[]) {
  if (days.length === 0 || days.length === 7) return "كل الأيام";
  return days
    .map((day) => WEEKDAYS.find((item) => item.value === day)?.label ?? day)
    .join("، ");
}

export default function AvailabilityPage() {
  const { from, to } = useMemo(() => rangeFromToday(20), []);
  const rulesQuery = useAvailabilityRules();
  const calendarQuery = useAvailabilityCalendar(from, to);
  const createRule = useCreateAvailabilityRule();
  const updateRule = useUpdateAvailabilityRule();
  const deleteRule = useDeleteAvailabilityRule();

  const [modalType, setModalType] = useState<AvailabilityRuleType | null>(null);
  const [editing, setEditing] = useState<AvailabilityRule | null>(null);

  const saving = createRule.isPending || updateRule.isPending;

  const handleSubmit = (payload: CreateAvailabilityRulePayload) => {
    if (editing) {
      updateRule.mutate(
        { id: editing.id, data: payload },
        {
          onSuccess: () => {
            setEditing(null);
            setModalType(null);
          },
        },
      );
      return;
    }
    createRule.mutate(payload, {
      onSuccess: () => setModalType(null),
    });
  };

  if (rulesQuery.isLoading) {
    return (
      <PageContainer>
        <PageHeader title="مواعيد الفحص" />
        <LoadingState />
      </PageContainer>
    );
  }

  if (rulesQuery.error) {
    return (
      <PageContainer>
        <PageHeader title="مواعيد الفحص" />
        <ErrorState onRetry={() => rulesQuery.refetch()} />
      </PageContainer>
    );
  }

  const rules = rulesQuery.data ?? [];

  return (
    <PageContainer>
      <PageHeader
        title="مواعيد الفحص"
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="md"
              className="rounded-full px-5 h-[44px]"
              onClick={() => {
                setEditing(null);
                setModalType("CLOSED");
              }}
            >
              إضافة إجازة
            </Button>
            <Button
              variant="primary"
              size="md"
              className="rounded-full px-5 h-[44px]"
              onClick={() => {
                setEditing(null);
                setModalType("OPEN");
              }}
            >
              إضافة أوقات متاحة
            </Button>
          </div>
        }
      />

      <ContentCard>
        <h2 className="text-[16px] font-semibold text-[#1a1a1a] mb-4">
          الأيام القادمة
        </h2>
        <div className="flex flex-wrap gap-2">
          {(calendarQuery.data?.days ?? []).map((day) => (
            <div
              key={day.date}
              className={`w-[72px] rounded-[12px] border px-2 py-2 text-center ${
                day.closed
                  ? "bg-[#f8f8f8] border-[#f2f2f2] text-[#9ca3af]"
                  : "bg-white border-[#e9f0fc] text-[#1a1a1a]"
              }`}
            >
              <p className="text-[11px]">
                {WEEKDAYS.find((item) => item.value === day.weekday)?.label}
              </p>
              <p className="text-[16px] font-semibold">{day.date.slice(8)}</p>
              <p className="text-[10px]">
                {day.closed ? day.label || "مغلق" : `${day.times.length} موعد`}
              </p>
            </div>
          ))}
        </div>
      </ContentCard>

      <ContentCard>
        <h2 className="text-[16px] font-semibold text-[#1a1a1a] mb-4">
          القواعد
        </h2>
        {rules.length === 0 ? (
          <EmptyState title="لا توجد قواعد بعد" description="أضف فترة متاحة أو إجازة ليظهر التقويم في بيع السيارة." />
        ) : (
          <div className="flex flex-col gap-3">
            {rules.map((rule) => (
              <div
                key={rule.id}
                className="flex flex-col md:flex-row md:items-center justify-between gap-3 border border-[#f2f2f2] rounded-[16px] p-4"
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[12px] px-2 py-0.5 rounded-full ${
                        rule.type === "OPEN"
                          ? "bg-[#f0fdf4] text-[#16a34a]"
                          : "bg-[#fff1f2] text-[#e11d48]"
                      }`}
                    >
                      {rule.type === "OPEN" ? "متاح" : "مغلق"}
                    </span>
                    <span className="text-[14px] font-medium text-[#1a1a1a]">
                      {rule.label || (rule.type === "OPEN" ? "فترة متاحة" : "إجازة")}
                    </span>
                  </div>
                  <p className="text-[13px] text-[#6b7280]">
                    {rule.startDate} → {rule.endDate} · {weekdayLabel(rule.weekdays)}
                  </p>
                  {rule.type === "OPEN" ? (
                    <p className="text-[12px] text-[#8286ab]" dir="ltr">
                      {rule.times.join("  ")}
                    </p>
                  ) : null}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditing(rule);
                      setModalType(rule.type);
                    }}
                  >
                    تعديل
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (confirm("حذف هذه القاعدة؟")) deleteRule.mutate(rule.id);
                    }}
                  >
                    حذف
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </ContentCard>

      <AvailabilityRuleModal
        open={modalType !== null}
        type={editing?.type ?? modalType ?? "OPEN"}
        rule={editing}
        saving={saving}
        onClose={() => {
          setModalType(null);
          setEditing(null);
        }}
        onSubmit={handleSubmit}
      />
    </PageContainer>
  );
}
