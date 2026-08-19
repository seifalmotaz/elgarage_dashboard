"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { createAppointment, searchUsers } from "@/lib/api/inspectors";
import toast from "react-hot-toast";

const TIME_SLOTS = [
  "08:00-10:00",
  "10:00-12:00",
  "12:00-14:00",
  "14:00-16:00",
  "16:00-18:00",
  "18:00-20:00",
] as const;

const appointmentSchema = z.object({
  clientPhone: z.string().min(1, "رقم هاتف العميل مطلوب"),
  brand: z.string().min(1, "ماركة السيارة مطلوبة"),
  model: z.string().min(1, "موديل السيارة مطلوب"),
  year: z
    .number({ message: "سنة الصنع مطلوبة" })
    .min(1990, "سنة الصنع يجب أن تكون 1990 أو أحدث")
    .max(new Date().getFullYear() + 1, "سنة الصنع غير صالحة"),
  mileage: z
    .number({ message: "المسافة المقطوعة مطلوبة" })
    .min(0, "المسافة المقطوعة يجب أن تكون صفر أو أكبر"),
  address: z.string().min(1, "العنوان مطلوب"),
  scheduledDate: z.string().min(1, "التاريخ مطلوب"),
  scheduledTime: z.string().min(1, "الوقت مطلوب"),
});

type AppointmentFormData = z.infer<typeof appointmentSchema>;

interface CreateAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  inspectorId: string;
  inspectorName: string;
}

interface FoundUser {
  id: string;
  firstName: string | null;
  lastName: string | null;
  phone: string;
}

export default function CreateAppointmentModal({
  isOpen,
  onClose,
  onSuccess,
  inspectorId,
  inspectorName,
}: CreateAppointmentModalProps) {
  const [foundUser, setFoundUser] = useState<FoundUser | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    getValues,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
  });

  const handleSearchClient = async (phone: string) => {
    if (!phone || phone.length < 8) {
      setSearchError("رقم الهاتف غير صالح");
      return;
    }

    try {
      setSearchLoading(true);
      setSearchError(null);
      const users = await searchUsers(phone);
      if (users.length === 0) {
        setSearchError("العميل غير موجود");
        setFoundUser(null);
      } else {
        const user = users[0];
        setFoundUser(user);
        setSearchError(null);
      }
    } catch (error) {
      setSearchError("حدث خطأ أثناء البحث عن العميل");
      setFoundUser(null);
    } finally {
      setSearchLoading(false);
    }
  };

  const onSubmit = async (data: AppointmentFormData) => {
    if (!foundUser) {
      toast.error("يرجى البحث عن العميل أولاً");
      return;
    }

    try {
      await createAppointment({
        userId: foundUser.id,
        assignedInspectorId: inspectorId,
        brand: data.brand,
        model: data.model,
        year: data.year,
        mileage: data.mileage,
        address: data.address,
        latitude: 0,
        longitude: 0,
        scheduledDate: data.scheduledDate,
        scheduledTime: data.scheduledTime,
      });
      toast.success("تم حجز الموعد بنجاح");
      reset();
      setFoundUser(null);
      onSuccess();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "حدث خطأ أثناء حجز الموعد";
      toast.error(message);
    }
  };

  const handleClose = () => {
    reset();
    setFoundUser(null);
    setSearchError(null);
    onClose();
  };

  const footer = (
    <div className="flex items-center justify-end gap-[12px]">
      <Button variant="outline" onClick={handleClose}>
        إلغاء
      </Button>
      <Button
        variant="primary"
        onClick={handleSubmit(onSubmit)}
        disabled={isSubmitting}
      >
        {isSubmitting ? "جارٍ الحجز..." : "حجز الموعد"}
      </Button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="حجز موعد جديد"
      footer={footer}
      maxWidth="540px"
    >
      <form className="flex flex-col gap-[16px]">
        {/* Client Search */}
        <div className="flex flex-col gap-[6px]">
          <label className="text-[14px] text-[#1a1a1a] font-medium text-right">
            البحث عن العميل <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-[8px]">
            <input
              type="tel"
              placeholder="0501234567"
              className="flex-1 h-[48px] px-[16px] rounded-[16px] border border-[#f2f2f2] bg-white text-[14px] text-[#1a1a1a] placeholder-[#d1d5db] outline-none focus:border-[#002ec1] transition-colors"
              {...register("clientPhone")}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => handleSearchClient(getValues("clientPhone"))}
              disabled={searchLoading}
            >
              {searchLoading ? "جارٍ البحث..." : "بحث"}
            </Button>
          </div>
          {errors.clientPhone && (
            <span className="text-[12px] text-red-500 text-right">
              {errors.clientPhone.message}
            </span>
          )}
          {searchError && (
            <span className="text-[12px] text-red-500 text-right">
              {searchError}
            </span>
          )}
          {foundUser && (
            <div className="flex items-center gap-[8px] p-[12px] bg-[#F0FDF4] rounded-[12px]">
              <span className="text-[14px] text-[#16A34A] font-medium">
                {foundUser.firstName || ""} {foundUser.lastName || ""}
              </span>
              <span className="text-[14px] text-[#6b7280]">
                {foundUser.phone}
              </span>
            </div>
          )}
        </div>

        {/* Inspector (read-only) */}
        <div className="flex flex-col gap-[6px]">
          <label className="text-[14px] text-[#1a1a1a] font-medium text-right">
            المفتش
          </label>
          <div className="h-[48px] px-[16px] rounded-[16px] border border-[#f2f2f2] bg-[#f9fafb] text-[14px] text-[#6b7280] flex items-center">
            {inspectorName}
          </div>
        </div>

        {/* Brand + Model */}
        <div className="grid grid-cols-2 gap-[12px]">
          <div className="flex flex-col gap-[6px]">
            <label className="text-[14px] text-[#1a1a1a] font-medium text-right">
              الماركة <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register("brand")}
              className="h-[48px] px-[16px] rounded-[16px] border border-[#f2f2f2] bg-white text-[14px] text-[#1a1a1a] placeholder-[#d1d5db] outline-none focus:border-[#002ec1] transition-colors"
              placeholder="تويوتا"
            />
            {errors.brand && (
              <span className="text-[12px] text-red-500 text-right">
                {errors.brand.message}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-[6px]">
            <label className="text-[14px] text-[#1a1a1a] font-medium text-right">
              الموديل <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register("model")}
              className="h-[48px] px-[16px] rounded-[16px] border border-[#f2f2f2] bg-white text-[14px] text-[#1a1a1a] placeholder-[#d1d5db] outline-none focus:border-[#002ec1] transition-colors"
              placeholder="كامري"
            />
            {errors.model && (
              <span className="text-[12px] text-red-500 text-right">
                {errors.model.message}
              </span>
            )}
          </div>
        </div>

        {/* Year + Mileage */}
        <div className="grid grid-cols-2 gap-[12px]">
          <div className="flex flex-col gap-[6px]">
            <label className="text-[14px] text-[#1a1a1a] font-medium text-right">
              سنة الصنع <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              {...register("year", { valueAsNumber: true })}
              className="h-[48px] px-[16px] rounded-[16px] border border-[#f2f2f2] bg-white text-[14px] text-[#1a1a1a] placeholder-[#d1d5db] outline-none focus:border-[#002ec1] transition-colors"
              placeholder="2023"
              min="1990"
            />
            {errors.year && (
              <span className="text-[12px] text-red-500 text-right">
                {errors.year.message}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-[6px]">
            <label className="text-[14px] text-[#1a1a1a] font-medium text-right">
              المسافة المقطوعة <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              {...register("mileage", { valueAsNumber: true })}
              className="h-[48px] px-[16px] rounded-[16px] border border-[#f2f2f2] bg-white text-[14px] text-[#1a1a1a] placeholder-[#d1d5db] outline-none focus:border-[#002ec1] transition-colors"
              placeholder="50000"
              min="0"
            />
            {errors.mileage && (
              <span className="text-[12px] text-red-500 text-right">
                {errors.mileage.message}
              </span>
            )}
          </div>
        </div>

        {/* Address */}
        <div className="flex flex-col gap-[6px]">
          <label className="text-[14px] text-[#1a1a1a] font-medium text-right">
            العنوان <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            {...register("address")}
            className="h-[48px] px-[16px] rounded-[16px] border border-[#f2f2f2] bg-white text-[14px] text-[#1a1a1a] placeholder-[#d1d5db] outline-none focus:border-[#002ec1] transition-colors"
            placeholder="شارع الملك فهد، الرياض"
          />
          {errors.address && (
            <span className="text-[12px] text-red-500 text-right">
              {errors.address.message}
            </span>
          )}
        </div>

        {/* Date + Time */}
        <div className="grid grid-cols-2 gap-[12px]">
          <div className="flex flex-col gap-[6px]">
            <label className="text-[14px] text-[#1a1a1a] font-medium text-right">
              التاريخ <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              {...register("scheduledDate")}
              className="h-[48px] px-[16px] rounded-[16px] border border-[#f2f2f2] bg-white text-[14px] text-[#1a1a1a] outline-none focus:border-[#002ec1] transition-colors"
            />
            {errors.scheduledDate && (
              <span className="text-[12px] text-red-500 text-right">
                {errors.scheduledDate.message}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-[6px]">
            <label className="text-[14px] text-[#1a1a1a] font-medium text-right">
              الوقت <span className="text-red-500">*</span>
            </label>
            <select
              {...register("scheduledTime")}
              className="h-[48px] px-[16px] rounded-[16px] border border-[#f2f2f2] bg-white text-[14px] text-[#1a1a1a] outline-none focus:border-[#002ec1] transition-colors"
            >
              <option value="">اختر الوقت</option>
              {TIME_SLOTS.map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
            {errors.scheduledTime && (
              <span className="text-[12px] text-red-500 text-right">
                {errors.scheduledTime.message}
              </span>
            )}
          </div>
        </div>
      </form>
    </Modal>
  );
}
