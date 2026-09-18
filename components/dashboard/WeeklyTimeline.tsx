"use client";

import React, { useState, useMemo } from "react";
import {
  format,
  startOfWeek,
  endOfWeek,
  addWeeks,
  subWeeks,
  subDays,
  addDays,
  isToday,
} from "date-fns";
import { ar } from "date-fns/locale";
import { useWeeklyAppointments, useInspectorAppointments } from "@/hooks/queries/useInspectors";
import { WeeklyAppointmentItem } from "@/lib/api/inspectors";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";

interface WeeklyTimelineProps {
  inspectorId?: string;
  inspectorName?: string;
}

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  PENDING: { bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-200" },
  ASSIGNED: { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200" },
  IN_INSPECTION: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  INSPECTED: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
  APPROVED: { bg: "bg-green-50", text: "text-green-700", border: "border-green-200" },
  REJECTED: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
  CANCELLED: { bg: "bg-gray-50", text: "text-gray-500", border: "border-gray-200" },
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: "انتظار",
  ASSIGNED: "مخصص",
  IN_INSPECTION: "جارٍ الفحص",
  INSPECTED: "تم الفحص",
  APPROVED: "موافق عليه",
  REJECTED: "مرفوض",
  CANCELLED: "ملغى",
};

const WEEKDAYS_AR = ["أحد", "إثنين", "ثلا", "أرب", "خمي", "جمع", "سبت"];
const HOURS = Array.from({ length: 13 }, (_, i) => i + 8); // 08:00 to 20:00

const parseHour = (timeStr: string) => {
  if (!timeStr) return -1;
  const match = timeStr.match(/^(\d{2}):\d{2}\s+(AM|PM)$/i);
  if (!match) return parseInt(timeStr.substring(0, 2), 10) || -1;
  let h = parseInt(match[1], 10);
  const isPM = match[2].toUpperCase() === 'PM';
  if (isPM && h < 12) h += 12;
  if (!isPM && h === 12) h = 0;
  return h;
};

interface AppointmentCardProps {
  appointment: WeeklyAppointmentItem;
  displayName: string; // Either inspector name or client name
  showClientName?: boolean; // When true, shows client name below
  onClick: () => void;
}

function AppointmentCard({ appointment, displayName, showClientName = true, onClick }: AppointmentCardProps) {
  const colors = STATUS_COLORS[appointment.status] || STATUS_COLORS.PENDING;

  return (
    <button
      onClick={onClick}
      className={`w-full text-right p-2 rounded-lg border ${colors.bg} ${colors.border} hover:shadow-md transition-all cursor-pointer text-[12px]`}
    >
      <div className="font-medium text-[#111] truncate">
        {displayName}
      </div>
      {showClientName && appointment.user && (
        <div className="text-gray-600 truncate">
          {appointment.user.firstName} {appointment.user.lastName}
        </div>
      )}
      <div className={`mt-1 px-2 py-0.5 rounded-full text-[10px] font-medium inline-block ${colors.text}`}>
        {STATUS_LABELS[appointment.status] || appointment.status}
      </div>
    </button>
  );
}

interface DayColumnProps {
  date: Date;
  appointments: WeeklyAppointmentItem[];
  inspectorName?: string; // When viewing a specific inspector's calendar
  onAppointmentClick: (appointment: WeeklyAppointmentItem) => void;
}

function DayColumn({ date, appointments, inspectorName, onAppointmentClick }: DayColumnProps) {
  const dateKey = format(date, "yyyy-MM-dd");
  const dayAppointments = appointments.filter(
    (apt) => apt.scheduledDate && apt.scheduledDate.startsWith(dateKey)
  );
  const isTodayDate = isToday(date);

  return (
    <div className="flex-1 min-w-0 border-l border-gray-200">
      {/* Day Header */}
      <div
        className={`text-center py-3 border-b border-gray-200 ${
          isTodayDate ? "bg-[#002ec1] text-white" : "bg-gray-50 text-gray-700"
        }`}
      >
        <div className="text-[14px] font-semibold">
          {WEEKDAYS_AR[date.getDay()]}
        </div>
        <div className={`text-[12px] ${isTodayDate ? "text-white/80" : "text-gray-500"}`}>
          {format(date, "dd/MM")}
        </div>
      </div>

      {/* Time Slots */}
      <div className="flex flex-col">
        {HOURS.map((hour) => {
          const hourStr = hour.toString().padStart(2, "0") + ":00";
          const hourAppointments = dayAppointments.filter(
            (apt) => parseHour(apt.scheduledTime) === hour
          );

          return (
            <div
              key={hour}
              className="min-h-[80px] p-1 border-b border-gray-100 relative"
            >
              <div className="absolute top-1 right-1 text-[10px] text-gray-400">
                {hourStr}
              </div>
              <div className="flex flex-col gap-1 pt-5">
                {hourAppointments.map((apt) => (
                  <AppointmentCard
                    key={apt.id}
                    appointment={apt}
                    displayName={
                      // If we're viewing a specific inspector's calendar, show client name
                      // If we're viewing all inspectors, show inspector name
                      inspectorName
                        ? `${apt.user?.firstName || ""} ${apt.user?.lastName || ""}`.trim() || "عميل"
                        : apt.assignedInspector
                          ? `${apt.assignedInspector.firstName || ""} ${apt.assignedInspector.lastName || ""}`.trim() || "غير محدد"
                          : "غير محدد"
                    }
                    showClientName={!inspectorName}
                    onClick={() => onAppointmentClick(apt)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function WeeklyTimeline({ inspectorId, inspectorName }: WeeklyTimelineProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedAppointment, setSelectedAppointment] = useState<WeeklyAppointmentItem | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });

  // Add 2 days buffer on each side to handle timezone issues
  const fetchStart = subDays(weekStart, 2);
  const fetchEnd = addDays(weekEnd, 2);

  // Fetch all appointments (for admin view) or single inspector's appointments
  const allAppointmentsData = useWeeklyAppointments(fetchStart, fetchEnd);

  const inspectorAppointmentsData = useInspectorAppointments(inspectorId || '');

  // Use the appropriate appointments based on mode
  const appointments = inspectorId
    ? inspectorAppointmentsData.data?.appointments || []
    : allAppointmentsData.data?.items || [];
  const loading = inspectorId
    ? inspectorAppointmentsData.isLoading
    : allAppointmentsData.isLoading;

  // Filter appointments by date range for inspector view
  const filteredAppointments = useMemo(() => {
    if (!inspectorId) return appointments;
    
    const startDateStr = format(weekStart, 'yyyy-MM-dd');
    const endDateStr = format(weekEnd, 'yyyy-MM-dd');
    
    return appointments.filter((apt) => {
      const aptDate = apt.scheduledDate ? apt.scheduledDate.substring(0, 10) : "";
      return aptDate >= startDateStr && aptDate <= endDateStr;
    });
  }, [inspectorId, appointments, weekStart, weekEnd]);

  const handlePreviousWeek = () => {
    setCurrentDate((prev) => subWeeks(prev, 1));
  };

  const handleNextWeek = () => {
    setCurrentDate((prev) => addWeeks(prev, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleAppointmentClick = (appointment: WeeklyAppointmentItem) => {
    setSelectedAppointment(appointment);
    setDetailsModalOpen(true);
  };

  const weekDays = useMemo(() => {
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + i);
      days.push(day);
    }
    return days;
  }, [weekStart]);

  const detailsFooter = (
    <div className="flex items-center justify-end gap-[12px]">
      <Button variant="outline" onClick={() => setDetailsModalOpen(false)}>
        إغلاق
      </Button>
    </div>
  );

  if (loading && filteredAppointments.length === 0) {
    return (
      <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col items-center justify-center h-[400px] gap-4">
          <div className="w-10 h-10 border-4 border-[#002ec1] border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500">جارٍ تحميل المواعيد...</p>
        </div>
      </div>
    );
  }

  const timelineTitle = inspectorId && inspectorName 
    ? `تقويم مواعيد ${inspectorName}` 
    : "تقويم المواعيد الأسبوعي";

  return (
    <div
      className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-6"
      dir="rtl"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-[18px] font-semibold text-[#111]">{timelineTitle}</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={handleToday}
            className="h-[36px] px-4 rounded-[8px] text-[14px] font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all"
          >
            اليوم
          </button>
          <button
            onClick={handlePreviousWeek}
            className="w-[36px] h-[36px] rounded-[8px] border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all flex items-center justify-center"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
          <span className="text-[14px] font-medium text-gray-700 min-w-[180px] text-center">
            {format(weekStart, "dd/MM/yyyy")} - {format(weekEnd, "dd/MM/yyyy")}
          </span>
          <button
            onClick={handleNextWeek}
            className="w-[36px] h-[36px] rounded-[8px] border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all flex items-center justify-center"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg text-[14px] text-blue-600">
         جارٍ تحديث المواعيد...
        </div>
      )}

      {/* Timeline Grid */}
      <div className="flex border-t border-gray-200 overflow-x-auto">
        {weekDays.map((day) => (
          <DayColumn
            key={day.toISOString()}
            date={day}
            appointments={filteredAppointments}
            inspectorName={inspectorId ? inspectorName : undefined}
            onAppointmentClick={handleAppointmentClick}
          />
        ))}
      </div>

      {/* Empty State */}
      {!loading && filteredAppointments.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-gray-400 text-lg">لا توجد مواعيد هذا الأسبوع</p>
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 mt-6 pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-yellow-400" />
          <span className="text-[12px] text-gray-600">انتظار</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-orange-400" />
          <span className="text-[12px] text-gray-600">مخصص</span>
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

      {/* Appointment Details Modal */}
      <Modal
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        title="تفاصيل الموعد"
        footer={detailsFooter}
        maxWidth="500px"
      >
        {selectedAppointment && (
          <div className="flex flex-col gap-4">
            <div className="bg-[#fafafa] rounded-[16px] p-4 border border-gray-100">
              <div className="flex items-start justify-between mb-3">
                <div className="flex flex-col gap-1">
                  <h4 className="text-[16px] font-semibold text-[#111]">
                    {selectedAppointment.user?.firstName} {selectedAppointment.user?.lastName}
                  </h4>
                  <p className="text-[14px] text-gray-600">{selectedAppointment.user?.phone}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-[12px] font-medium ${
                    STATUS_COLORS[selectedAppointment.status]?.bg || "bg-gray-100"
                  } ${STATUS_COLORS[selectedAppointment.status]?.text || "text-gray-600"}`}
                >
                  {STATUS_LABELS[selectedAppointment.status] || selectedAppointment.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <span className="text-[12px] text-gray-500">المفتش</span>
                  <span className="text-[14px] text-[#111] font-medium">
                    {selectedAppointment.assignedInspector
                      ? `${selectedAppointment.assignedInspector.firstName || ""} ${selectedAppointment.assignedInspector.lastName || ""}`.trim()
                      : "غير محدد"}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[12px] text-gray-500">التاريخ</span>
                  <span className="text-[14px] text-[#111] font-medium">
                    {selectedAppointment.scheduledDate}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[12px] text-gray-500">الوقت</span>
                  <span className="text-[14px] text-[#111] font-medium">
                    {selectedAppointment.scheduledTime}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[12px] text-gray-500">السيارة</span>
                  <span className="text-[14px] text-[#111] font-medium">
                    {selectedAppointment.brand} {selectedAppointment.model} ({selectedAppointment.year})
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[12px] text-gray-500">المسافة المقطوعة</span>
                  <span className="text-[14px] text-[#111] font-medium">
                    {selectedAppointment.mileage.toLocaleString()} كم
                  </span>
                </div>
                <div className="flex flex-col gap-1 col-span-2">
                  <span className="text-[12px] text-gray-500">العنوان</span>
                  <span className="text-[14px] text-[#111] font-medium">
                    {selectedAppointment.address}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}