"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import CitySelect from "@/components/dashboard/CitySelect";
import { useUpdateInspectorMutation } from "@/hooks/mutations/useInspectors";
import { InspectorListItem } from "@/lib/api/inspectors";
import toast from "react-hot-toast";

const inspectorSchema = z.object({
  firstName: z.string().min(1, "الاسم الأول مطلوب"),
  lastName: z.string().min(1, "الاسم الأخير مطلوب"),
  email: z.string().email("البريد الإلكتروني غير صالح").optional().or(z.literal("")),
  phone: z.string().min(1, "رقم الهاتف مطلوب"),
  city: z.string().optional(),
  region: z.string().optional(),
  isActive: z.boolean(),
});

type InspectorFormData = z.infer<typeof inspectorSchema>;

interface EditInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  inspector: InspectorListItem;
}

export default function EditInspectorModal({
  isOpen,
  onClose,
  onSuccess,
  inspector,
}: EditInspectorModalProps) {
  const updateMutation = useUpdateInspectorMutation();
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<InspectorFormData>({
    resolver: zodResolver(inspectorSchema),
    defaultValues: {
      firstName: inspector.firstName || "",
      lastName: inspector.lastName || "",
      email: inspector.email || "",
      phone: inspector.phone,
      city: inspector.city || "",
      region: inspector.region || "",
      isActive: inspector.isActive,
    },
  });

  const onSubmit = (data: InspectorFormData) => {
    updateMutation.mutate(
      {
        id: inspector.id,
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email || null,
          phone: data.phone,
          city: data.city || undefined,
          region: data.region || undefined,
          isActive: data.isActive,
        },
      },
      {
        onSuccess: () => {
          reset();
          onSuccess();
        },
      }
    );
  };

  const handleClose = () => {
    reset();
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
        disabled={updateMutation.isPending}
      >
        {updateMutation.isPending ? "جارٍ التحديث..." : "تحديث"}
      </Button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="تعديل بيانات المفتش"
      footer={footer}
      maxWidth="540px"
    >
      <form className="flex flex-col gap-[16px]">
        {/* Row 1: First Name + Last Name */}
        <div className="grid grid-cols-2 gap-[12px]">
          <div className="flex flex-col gap-[6px]">
            <label className="text-[14px] text-[#1a1a1a] font-medium text-right">
              الاسم الأول <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register("firstName")}
              className="h-[48px] px-[16px] rounded-[16px] border border-[#f2f2f2] bg-white text-[14px] text-[#1a1a1a] placeholder-[#d1d5db] outline-none focus:border-[#002ec1] transition-colors"
              placeholder="أدخل الاسم الأول"
            />
            {errors.firstName && (
              <span className="text-[12px] text-red-500 text-right">
                {errors.firstName.message}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-[6px]">
            <label className="text-[14px] text-[#1a1a1a] font-medium text-right">
              الاسم الأخير <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register("lastName")}
              className="h-[48px] px-[16px] rounded-[16px] border border-[#f2f2f2] bg-white text-[14px] text-[#1a1a1a] placeholder-[#d1d5db] outline-none focus:border-[#002ec1] transition-colors"
              placeholder="أدخل الاسم الأخير"
            />
            {errors.lastName && (
              <span className="text-[12px] text-red-500 text-right">
                {errors.lastName.message}
              </span>
            )}
          </div>
        </div>

        {/* Phone */}
        <div className="flex flex-col gap-[6px]">
          <label className="text-[14px] text-[#1a1a1a] font-medium text-right">
            رقم الهاتف <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            {...register("phone")}
            className="h-[48px] px-[16px] rounded-[16px] border border-[#f2f2f2] bg-white text-[14px] text-[#1a1a1a] placeholder-[#d1d5db] outline-none focus:border-[#002ec1] transition-colors"
            placeholder="0501234567"
          />
          {errors.phone && (
            <span className="text-[12px] text-red-500 text-right">
              {errors.phone.message}
            </span>
          )}
        </div>

        {/* Email (optional) */}
        <div className="flex flex-col gap-[6px]">
          <label className="text-[14px] text-[#1a1a1a] font-medium text-right">
            البريد الإلكتروني <span className="text-[#9ca3af] font-light">(اختياري)</span>
          </label>
          <input
            type="email"
            {...register("email")}
            className="h-[48px] px-[16px] rounded-[16px] border border-[#f2f2f2] bg-white text-[14px] text-[#1a1a1a] placeholder-[#d1d5db] outline-none focus:border-[#002ec1] transition-colors"
            placeholder="example@email.com"
          />
          {errors.email && (
            <span className="text-[12px] text-red-500 text-right">
              {errors.email.message}
            </span>
          )}
        </div>

        {/* Row: City + Region */}
        <div className="grid grid-cols-2 gap-[12px]">
          <CitySelect
            label="المدينة"
            optional
            value={watch("city") || ""}
            onChange={(city) => setValue("city", city)}
            placeholder="اختر المدينة"
          />

          <div className="flex flex-col gap-[6px]">
            <label className="text-[14px] text-[#1a1a1a] font-medium text-right">
              المنطقة <span className="text-[#9ca3af] font-light">(اختياري)</span>
            </label>
            <input
              type="text"
              {...register("region")}
              className="h-[48px] px-[16px] rounded-[16px] border border-[#f2f2f2] bg-white text-[14px] text-[#1a1a1a] placeholder-[#d1d5db] outline-none focus:border-[#002ec1] transition-colors"
              placeholder="الشمالية"
            />
          </div>
        </div>

        {/* Active Status Toggle */}
        <div className="flex flex-col gap-[6px]">
          <label className="text-[14px] text-[#1a1a1a] font-medium text-right">
            الحالة
          </label>
          <div className="flex items-center gap-[12px]">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                {...register("isActive")}
                className="sr-only peer"
              />
              <div className="w-[52px] h-[28px] bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-[24px] after:w-[24px] after:transition-all peer-checked:bg-[#002ec1]"></div>
            </label>
            <span className="text-[14px] text-[#1a1a1a]">
              {inspector.isActive ? "نشط" : "غير نشط"}
            </span>
          </div>
        </div>
      </form>
    </Modal>
  );
}