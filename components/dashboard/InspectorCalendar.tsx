"use client";

import React, { useState, useEffect, useMemo } from "react";
import { DayPicker } from "react-day-picker";
import { format, isSameDay, parseISO } from "date-fns";
import { ar } from "date-fns/locale";
import { useInspectorAppointments } from "@/hooks/queries/useInspectors";
import { Appointment } from "@/lib/api/inspectors";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import "react-day-picker/style.css";

interface InspectorCalendarProps {
  inspectorId: string;
  onCreateAppointment?: () => void;
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  ASSIGNED: "bg-orange-100 text-orange-700",
  IN_INSPECTION: "bg-blue-100 text-blue-700",
  INSPECTED: "bg-purple-100 text-purple-700",
  APPROVED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
  CANCELLED: "bg-gray-100 text-gray-500",
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: "قيد الانتظار",
  ASSIGNED: "مخصص",
  IN_INSPECTION: "جارٍ الفحص",
  INSPECTED: "تم الفحص",
  APPROVED: "موافق عليه",
  REJECTED: "مرفوض",
  CANCELLED: "ملغى",
};

const WEEKDAYS_AR = ["أحد", "إثنين", "ثلا", "أرب", "خمي", "جمع", "سبت"];

function getStatusPriority(status: string): number {
  const priorities: Record<string, number> = {
    IN_INSPECTION: 1,
    PENDING: 2,
    ASSIGNED: 3,
    INSPECTED: 4,
    APPROVED: 5,
    REJECTED: 6,
    CANCELLED: 7,
  };
  return priorities[status] ?? 99;
}

function getDominantStatus(appointments: Appointment[]): string {
  if (appointments.length === 0) return "PENDING";

  const statusCounts = appointments.reduce(
    (acc, apt) => {
      acc[apt.status] = (acc[apt.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return Object.entries(statusCounts).sort((a, b) => {
    const priorityDiff = getStatusPriority(a[0]) - getStatusPriority(b[0]);
    if (priorityDiff !== 0) return priorityDiff;
    return b[1] - a[1];
  })[0][0];
}

function getBadgeColorClass(_status: string): string {
  return "bg-gray-400";
}

export default function InspectorCalendar({
  inspectorId,
  onCreateAppointment,
}: InspectorCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  const { data: appointmentsData, isLoading: loading } = useInspectorAppointments(inspectorId);

  const appointments = appointmentsData?.appointments || [];

  const appointmentsByDate = useMemo(() => {
    const map: Record<string, Appointment[]> = {};
    appointments.forEach((apt) => {
      const dateKey = format(parseISO(apt.scheduledDate), "yyyy-MM-dd");
      if (!map[dateKey]) map[dateKey] = [];
      map[dateKey].push(apt);
    });
    return map;
  }, [appointments]);

  const selectedDateAppointments = useMemo(() => {
    if (!selectedDate) return [];
    const dateKey = format(selectedDate, "yyyy-MM-dd");
    return appointmentsByDate[dateKey] || [];
  }, [selectedDate, appointmentsByDate]);

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    const dateKey = format(date, "yyyy-MM-dd");
    if (appointmentsByDate[dateKey]?.length > 0) {
      setDetailsModalOpen(true);
    }
  };

  const handleMonthChange = (month: Date) => {
    setCurrentMonth(month);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col items-center justify-center h-[400px] gap-4">
          <div className="w-10 h-10 border-4 border-[#002ec1] border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500">جارٍ تحميل المواعيد...</p>
        </div>
      </div>
    );
  }

  const detailsFooter = (
    <div className="flex items-center justify-end gap-[12px]">
      <Button variant="outline" onClick={() => setDetailsModalOpen(false)}>
        إغلاق
      </Button>
    </div>
  );

  return (
    <div
      className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-6"
      dir="rtl"
    >
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-[18px] font-semibold text-[#111]">تقويم المواعيد</h3>
        {onCreateAppointment && (
          <button
            onClick={onCreateAppointment}
            className="bg-[#002ec1] hover:bg-[#0025a1] text-white h-[40px] px-[16px] rounded-[12px] flex items-center gap-[8px] transition-all duration-300"
          >
            <img
              src="/assets/dashboard/cars/plus.svg"
              alt="Add"
              width={16}
              height={16}
              className="brightness-0 invert"
            />
            <span className="text-[14px] font-medium">إضافة موعد</span>
          </button>
        )}
      </div>

      {/* Calendar */}
      <div className="flex justify-center [&_.rdp]:rtl-direction">
        <DayPicker
          mode="single"
          selected={selectedDate}
          onSelect={(date) => date && handleDayClick(date)}
          month={currentMonth}
          onMonthChange={handleMonthChange}
          locale={ar}
          dir="rtl"
          weekStartsOn={0}
          modifiers={{
            hasAppointments: (date) => {
              const dateKey = format(date, "yyyy-MM-dd");
              return (appointmentsByDate[dateKey]?.length ?? 0) > 0;
            },
            today: (date) => isSameDay(date, new Date()),
          }}
          modifiersClassNames={{
            hasAppointments: "has-appointments",
            today: "rdp-day_today",
          }}
        />
      </div>

      {/* Custom styles for appointment badges */}
      <style jsx>{`
        :global(.rdp-day_today .rdp-button__content) {
          background-color: #002ec1 !important;
          color: white !important;
          border-radius: 9999px;
        }
        :global(.has-appointments .rdp-button__content) {
          position: relative;
        }
        :global(.has-appointments .rdp-button__content::after) {
          content: "";
          position: absolute;
          bottom: 2px;
          right: 50%;
          transform: translateX(50%);
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background-color: #f59e0b;
        }
      `}</style>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 mt-6 pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-yellow-400" />
          <span className="text-[12px] text-gray-600">انتظار</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-400" />
          <span className="text-[12px] text-gray-600">قيد الفحص</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-purple-400" />
          <span className="text-[12px] text-gray-600">تم الفحص</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-400" />
          <span className="text-[12px] text-gray-600">موافق</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <span className="text-[12px] text-gray-600">مرفوض</span>
        </div>
      </div>

      {/* Day Details Modal */}
      {selectedDate && (
        <Modal
          isOpen={detailsModalOpen}
          onClose={() => setDetailsModalOpen(false)}
          title={`مواعيد يوم ${format(selectedDate, "dd/MM/yyyy", { locale: ar })}`}
          footer={detailsFooter}
          maxWidth="600px"
        >
          {selectedDateAppointments.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              لا توجد مواعيد لهذا اليوم
            </p>
          ) : (
            <div className="flex flex-col gap-4">
              {selectedDateAppointments.map((apt) => (
                <div
                  key={apt.id}
                  className="bg-[#fafafa] rounded-[16px] p-4 border border-gray-100"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex flex-col gap-1">
                      <h4 className="text-[16px] font-semibold text-[#111]">
                        {apt.user.firstName} {apt.user.lastName}
                      </h4>
                      <p className="text-[14px] text-gray-600">{apt.user.phone}</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-[12px] font-medium ${
                        STATUS_COLORS[apt.status] || "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {STATUS_LABELS[apt.status] || apt.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <span className="text-[12px] text-gray-500">السيارة</span>
                      <span className="text-[14px] text-[#111] font-medium">
                        {apt.brand} {apt.model} ({apt.year})
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[12px] text-gray-500">الوقت</span>
                      <span className="text-[14px] text-[#111] font-medium">
                        {apt.scheduledTime}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1 col-span-2">
                      <span className="text-[12px] text-gray-500">العنوان</span>
                      <span className="text-[14px] text-[#111] font-medium">
                        {apt.address}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}