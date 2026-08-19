"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import CitySelect from "@/components/dashboard/CitySelect";
import { useCreateUserMutation } from "@/hooks/mutations/useUsers";

const createUserSchema = z.object({
  firstName: z.string().min(1, "الاسم الأول مطلوب"),
  lastName: z.string().min(1, "الاسم الأخير مطلوب"),
  phone: z.string().min(1, "رقم الهاتف مطلوب"),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
  email: z.string().email("البريد الإلكتروني غير صالح").optional().or(z.literal("")),
  city: z.string().optional(),
  region: z.string().optional(),
});

type CreateUserFormData = z.infer<typeof createUserSchema>;

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateUserModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateUserModalProps) {
  const createMutation = useCreateUserMutation();
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
  });

  const onSubmit = (data: CreateUserFormData) => {
    createMutation.mutate(
      {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        password: data.password,
        email: data.email || undefined,
        city: data.city || undefined,
        region: data.region || undefined,
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
        disabled={createMutation.isPending}
      >
        {createMutation.isPending ? "جارٍ الإضافة..." : "إضافة"}
      </Button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="إضافة حساب جديد"
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

        {/* Password */}
        <div className="flex flex-col gap-[6px]">
          <label className="text-[14px] text-[#1a1a1a] font-medium text-right">
            كلمة المرور <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            {...register("password")}
            className="h-[48px] px-[16px] rounded-[16px] border border-[#f2f2f2] bg-white text-[14px] text-[#1a1a1a] placeholder-[#d1d5db] outline-none focus:border-[#002ec1] transition-colors"
            placeholder="********"
          />
          {errors.password && (
            <span className="text-[12px] text-red-500 text-right">
              {errors.password.message}
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
      </form>
    </Modal>
  );
}