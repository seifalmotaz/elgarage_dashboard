"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import type {
  AvailabilityRule,
  AvailabilityRuleType,
  CreateAvailabilityRulePayload,
} from "@/lib/api/availability";

export const WEEKDAYS = [
  { value: 0, label: "الأحد" },
  { value: 1, label: "الاثنين" },
  { value: 2, label: "الثلاثاء" },
  { value: 3, label: "الأربعاء" },
  { value: 4, label: "الخميس" },
  { value: 5, label: "الجمعة" },
  { value: 6, label: "السبت" },
];

export const SLOT_OPTIONS = [
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
  "21:00",
];

const DEFAULT_OPEN_DAYS = [0, 1, 2, 3, 4, 6];
const DEFAULT_TIMES = [
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "20:00",
  "21:00",
];

type FormState = {
  type: AvailabilityRuleType;
  startDate: string;
  endDate: string;
  weekdays: number[];
  times: string[];
  label: string;
};

function fromRule(rule?: AvailabilityRule, type?: AvailabilityRuleType): FormState {
  if (rule) {
    return {
      type: rule.type,
      startDate: rule.startDate,
      endDate: rule.endDate,
      weekdays: rule.weekdays.length ? rule.weekdays : [0, 1, 2, 3, 4, 5, 6],
      times: rule.times,
      label: rule.label ?? "",
    };
  }
  const today = new Date().toISOString().slice(0, 10);
  return {
    type: type ?? "OPEN",
    startDate: today,
    endDate: today,
    weekdays: DEFAULT_OPEN_DAYS,
    times: DEFAULT_TIMES,
    label: "",
  };
}

export function AvailabilityRuleModal({
  open,
  type,
  rule,
  saving,
  onClose,
  onSubmit,
}: {
  open: boolean;
  type: AvailabilityRuleType;
  rule: AvailabilityRule | null;
  saving: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateAvailabilityRulePayload) => void;
}) {
  const [form, setForm] = useState<FormState>(() => fromRule(rule ?? undefined, type));

  useEffect(() => {
    if (open) setForm(fromRule(rule ?? undefined, type));
  }, [open, rule, type]);

  const isOpen = form.type === "OPEN";

  const toggleWeekday = (day: number) => {
    setForm((prev) => ({
      ...prev,
      weekdays: prev.weekdays.includes(day)
        ? prev.weekdays.filter((item) => item !== day)
        : [...prev.weekdays, day].sort((a, b) => a - b),
    }));
  };

  const toggleTime = (slot: string) => {
    setForm((prev) => ({
      ...prev,
      times: prev.times.includes(slot)
        ? prev.times.filter((item) => item !== slot)
        : [...prev.times, slot].sort(),
    }));
  };

  const handleSave = () => {
    onSubmit({
      type: form.type,
      startDate: form.startDate,
      endDate: form.endDate,
      weekdays: form.weekdays,
      times: isOpen ? form.times : [],
      label: form.label.trim() || undefined,
    });
  };

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title={
        rule
          ? "تعديل الفترة"
          : isOpen
            ? "إضافة أوقات متاحة"
            : "إضافة إجازة أو إغلاق"
      }
      maxWidth="640px"
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button variant="outline" onClick={onClose} type="button">
            إلغاء
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            loading={saving}
            type="button"
            disabled={!form.startDate || !form.endDate || (isOpen && form.times.length === 0)}
          >
            حفظ
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="من يوم">
            <input
              type="date"
              value={form.startDate}
              onChange={(e) => setForm((prev) => ({ ...prev, startDate: e.target.value }))}
              className="bg-white border border-[#f2f2f2] h-[50px] rounded-[16px] px-4 text-[13px] outline-none focus:border-[#002ec1] w-full"
            />
          </Field>
          <Field label="إلى يوم">
            <input
              type="date"
              value={form.endDate}
              onChange={(e) => setForm((prev) => ({ ...prev, endDate: e.target.value }))}
              className="bg-white border border-[#f2f2f2] h-[50px] rounded-[16px] px-4 text-[13px] outline-none focus:border-[#002ec1] w-full"
            />
          </Field>
        </div>

        <Field label="اسم اختياري">
          <input
            type="text"
            value={form.label}
            onChange={(e) => setForm((prev) => ({ ...prev, label: e.target.value }))}
            placeholder={isOpen ? "مثال: جدول الصيف" : "مثال: عيد الفطر"}
            className="bg-white border border-[#f2f2f2] h-[50px] rounded-[16px] px-4 text-[13px] outline-none focus:border-[#002ec1] w-full"
          />
        </Field>

        <div className="flex flex-col gap-2">
          <p className="text-[14px] font-medium text-[#1a1a1a]">أيام الأسبوع</p>
          <div className="flex flex-wrap gap-2">
            {WEEKDAYS.map((day) => {
              const active = form.weekdays.includes(day.value);
              return (
                <button
                  key={day.value}
                  type="button"
                  onClick={() => toggleWeekday(day.value)}
                  className={`h-10 px-3 rounded-full text-[13px] border ${
                    active
                      ? "bg-[#e9f0fc] border-[#002ec1] text-[#002ec1]"
                      : "bg-white border-[#f2f2f2] text-[#6b7280]"
                  }`}
                >
                  {day.label}
                </button>
              );
            })}
          </div>
        </div>

        {isOpen ? (
          <div className="flex flex-col gap-2">
            <p className="text-[14px] font-medium text-[#1a1a1a]">الأوقات المتاحة</p>
            <div className="flex flex-wrap gap-2" dir="ltr">
              {SLOT_OPTIONS.map((slot) => {
                const active = form.times.includes(slot);
                return (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => toggleTime(slot)}
                    className={`h-10 w-[88px] rounded-[12px] text-[13px] border ${
                      active
                        ? "bg-[#e9f0fc] border-[#002ec1] text-[#002ec1]"
                        : "bg-white border-[#f2f2f2] text-[#6b7280]"
                    }`}
                  >
                    {slot}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>
    </Modal>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-2 w-full">
      <span className="text-[14px] text-[#1a1a1a] font-medium">{label}</span>
      {children}
    </label>
  );
}
