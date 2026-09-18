"use client";

import React from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import CitySelect from "@/components/dashboard/CitySelect";
import { useUpdateUserMutation } from "@/hooks/mutations/useUsers";
import { UserDetail, UserListItem } from "@/lib/api/users";

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user: UserDetail | UserListItem;
}

export default function EditUserModal({
  isOpen,
  onClose,
  onSuccess,
  user,
}: EditUserModalProps) {
  // Local form state for controlled inputs
  const [formData, setFormData] = React.useState({
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    email: user.email || "",
    city: user.city || "",
    region: user.region || "",
  });

  const [errors, setErrors] = React.useState<Record<string, string>>({});

  // Submit handler
  const updateUserMutation = useUpdateUserMutation();

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user types
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'البريد الإلكتروني غير صالح';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmit = () => {
    if (!validateForm()) return;

    // Convert empty strings to undefined for optional fields
    const updateData = {
      firstName: formData.firstName || undefined,
      lastName: formData.lastName || undefined,
      email: formData.email || undefined,
      city: formData.city || undefined,
      region: formData.region || undefined,
    };

    updateUserMutation.mutate(
      { id: user.id, data: updateData },
      {
        onSuccess: () => {
          onSuccess();
        },
      }
    );
  };

  // Close handler
  const handleClose = () => {
    setFormData({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      email: user.email || "",
      city: user.city || "",
      region: user.region || "",
    });
    setErrors({});
    onClose();
  };

  // Footer with buttons
  const footer = (
    <div className="flex items-center justify-end gap-[12px]">
      <Button variant="outline" onClick={handleClose}>
        إلغاء
      </Button>
      <Button
        variant="primary"
        onClick={onSubmit}
        disabled={updateUserMutation.isPending}
      >
        {updateUserMutation.isPending ? "جارٍ الحفظ..." : "حفظ"}
      </Button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="تعديل بيانات المستخدم"
      footer={footer}
      maxWidth="540px"
    >
      <form className="flex flex-col gap-[16px]">
        {/* Row 1: First Name + Last Name */}
        <div className="grid grid-cols-2 gap-[12px]">
          <div className="flex flex-col gap-[6px]">
            <label className="text-[14px] text-[#1a1a1a] font-medium text-right">
              الاسم الأول
            </label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              className="h-[48px] px-[16px] rounded-[16px] border border-[#f2f2f2] bg-white text-[14px] text-[#1a1a1a] placeholder-[#d1d5db] outline-none focus:border-[#002ec1] transition-colors"
              placeholder="أدخل الاسم الأول"
            />
          </div>

          <div className="flex flex-col gap-[6px]">
            <label className="text-[14px] text-[#1a1a1a] font-medium text-right">
              الاسم الأخير
            </label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              className="h-[48px] px-[16px] rounded-[16px] border border-[#f2f2f2] bg-white text-[14px] text-[#1a1a1a] placeholder-[#d1d5db] outline-none focus:border-[#002ec1] transition-colors"
              placeholder="أدخل الاسم الأخير"
            />
          </div>
        </div>

        {/* Email */}
        <div className="flex flex-col gap-[6px]">
          <label className="text-[14px] text-[#1a1a1a] font-medium text-right">
            البريد الإلكتروني <span className="text-[#9ca3af] font-light">(اختياري)</span>
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className="h-[48px] px-[16px] rounded-[16px] border border-[#f2f2f2] bg-white text-[14px] text-[#1a1a1a] placeholder-[#d1d5db] outline-none focus:border-[#002ec1] transition-colors"
            placeholder="example@email.com"
          />
          {errors.email && (
            <span className="text-[12px] text-red-500 text-right">
              {errors.email}
            </span>
          )}
        </div>

        {/* Row: City + Region */}
        <div className="grid grid-cols-2 gap-[12px]">
          <CitySelect
            label="المدينة"
            optional
            value={formData.city}
            onChange={(city) => handleInputChange("city", city)}
            placeholder="اختر المدينة"
          />

          <div className="flex flex-col gap-[6px]">
            <label className="text-[14px] text-[#1a1a1a] font-medium text-right">
              المنطقة <span className="text-[#9ca3af] font-light">(اختياري)</span>
            </label>
            <input
              type="text"
              value={formData.region}
              onChange={(e) => handleInputChange('region', e.target.value)}
              className="h-[48px] px-[16px] rounded-[16px] border border-[#f2f2f2] bg-white text-[14px] text-[#1a1a1a] placeholder-[#d1d5db] outline-none focus:border-[#002ec1] transition-colors"
              placeholder="الشمالية"
            />
          </div>
        </div>

        {/* Read-only fields */}
        <div className="pt-[8px] border-t border-[#f2f2f2]">
          <p className="text-[12px] text-[#6b7280] font-light mb-[12px]">
            بيانات لا يمكن تعديلها:
          </p>
          <div className="grid grid-cols-2 gap-[12px]">
            <div className="bg-[#f9fafb] px-[12px] py-[10px] rounded-[8px]">
              <p className="text-[12px] text-[#6b7280] font-light">رقم الهاتف</p>
              <p className="text-[14px] text-[#1a1a1a] font-medium mt-[2px]">{user.phone}</p>
            </div>
            <div className="bg-[#f9fafb] px-[12px] py-[10px] rounded-[8px]">
              <p className="text-[12px] text-[#6b7280] font-light">الدور</p>
              <p className="text-[14px] text-[#1a1a1a] font-medium mt-[2px]">
                {user.role === 'USER' ? 'مستخدم' : user.role === 'INSPECTOR' ? 'مفتش' : 'مدير'}
              </p>
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
}