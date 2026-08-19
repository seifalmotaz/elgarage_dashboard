"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import { useTestimonial } from "@/hooks/queries/useTestimonials";
import { useUpdateTestimonialMutation } from "@/hooks/mutations/useTestimonials";
import { uploadApi } from "@/lib/api/upload";
import toast from "react-hot-toast";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditTestimonialPage({ params }: PageProps) {
  const router = useRouter();
  const updateMutation = useUpdateTestimonialMutation();

  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [carInfo, setCarInfo] = useState("");
  const [comment, setComment] = useState("");
  const [avatar, setAvatar] = useState("");
  const [bgImage, setBgImage] = useState("");
  const [rating, setRating] = useState("5");
  const [order, setOrder] = useState("0");
  const [isActive, setIsActive] = useState("true");
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingBg, setIsUploadingBg] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    params.then((p) => setId(p.id));
  }, [params]);

  const { data, isLoading } = useTestimonial(id);

  useEffect(() => {
    if (data) {
      setName(data.name);
      setCarInfo(data.carInfo ?? "");
      setComment(data.comment);
      setAvatar(data.avatar ?? "");
      setBgImage(data.bgImage ?? "");
      setRating(data.rating != null ? String(data.rating) : "");
      setOrder(String(data.order ?? 0));
      setIsActive(data.isActive ? "true" : "false");
    }
  }, [data]);

  const uploadImage = async (
    file: File,
    kind: "avatar" | "bg",
  ): Promise<void> => {
    const validTypes = ["image/png", "image/jpeg", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast.error("صيغة الملف غير مدعومة. استخدم PNG, JPG, أو WebP");
      return;
    }

    if (kind === "avatar") setIsUploadingAvatar(true);
    else setIsUploadingBg(true);

    try {
      const result = await uploadApi.uploadFile(file, "car-image");
      if (kind === "avatar") setAvatar(result.url);
      else setBgImage(result.url);
      toast.success("تم رفع الصورة بنجاح");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "فشل رفع الصورة";
      toast.error(message);
    } finally {
      if (kind === "avatar") setIsUploadingAvatar(false);
      else setIsUploadingBg(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !comment.trim()) {
      toast.error("الاسم والتعليق مطلوبان");
      return;
    }

    const ratingNum = rating ? parseInt(rating, 10) : undefined;
    const orderNum = order ? parseInt(order, 10) : 0;

    updateMutation.mutate(
      {
        id,
        data: {
          name: name.trim(),
          carInfo: carInfo.trim() || null,
          comment: comment.trim(),
          avatar: avatar.trim() || null,
          bgImage: bgImage.trim() || null,
          rating:
            ratingNum != null && !Number.isNaN(ratingNum) ? ratingNum : null,
          order: Number.isNaN(orderNum) ? 0 : orderNum,
          isActive: isActive === "true",
        },
      },
      {
        onSuccess: () => {
          router.push("/dashboard/testimonials");
        },
      },
    );
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-[16px] h-[300px] animate-pulse" />
          <div className="lg:col-span-2 bg-white p-6 rounded-[16px] h-[300px] animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-[24px] font-semibold text-[#000a2a]">
          تعديل الرأي
        </h1>
        <Link
          href="/dashboard/testimonials"
          className="flex items-center gap-2 bg-white border border-[#f2f2f2] px-4 py-2 rounded-full text-[#1a1a1a] text-[14px] hover:bg-gray-50 transition-colors"
        >
          <span className="text-start">عودة</span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="bg-white p-6 rounded-[16px] border border-[#f2f2f2] flex flex-col gap-6 shadow-sm">
          <h2 className="text-[16px] font-semibold text-[#002ec1] border-b border-[#f2f2f2] pb-3 text-start">
            الاعدادات
          </h2>

          <Select
            label="الحالة"
            value={isActive}
            onChange={setIsActive}
            options={[
              { label: "نشط", value: "true" },
              { label: "غير نشط", value: "false" },
            ]}
          />

          <Select
            label="التقييم"
            value={rating}
            onChange={setRating}
            options={[
              { label: "بدون", value: "" },
              { label: "5", value: "5" },
              { label: "4", value: "4" },
              { label: "3", value: "3" },
              { label: "2", value: "2" },
              { label: "1", value: "1" },
            ]}
          />

          <div className="flex flex-col gap-2">
            <label className="text-[14px] text-[#1a1a1a] font-medium text-start">
              الترتيب
            </label>
            <input
              type="number"
              value={order}
              onChange={(e) => setOrder(e.target.value)}
              className="w-full bg-white border border-[#f2f2f2] h-[50px] rounded-[16px] px-4 text-[12px] text-gray-700 outline-none focus:border-[#002ec1]"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[14px] text-[#1a1a1a] font-medium text-start">
              صورة الشخصية
            </label>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void uploadImage(file, "avatar");
              }}
            />
            <Button
              type="button"
              variant="secondary"
              onClick={() => avatarInputRef.current?.click()}
              loading={isUploadingAvatar}
              disabled={isUploadingAvatar}
            >
              {avatar ? "تغيير الصورة" : "رفع صورة"}
            </Button>
            {avatar && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatar}
                alt="avatar"
                className="w-16 h-16 rounded-full object-cover border border-[#f2f2f2]"
              />
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[14px] text-[#1a1a1a] font-medium text-start">
              صورة الخلفية
            </label>
            <input
              ref={bgInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void uploadImage(file, "bg");
              }}
            />
            <Button
              type="button"
              variant="secondary"
              onClick={() => bgInputRef.current?.click()}
              loading={isUploadingBg}
              disabled={isUploadingBg}
            >
              {bgImage ? "تغيير الخلفية" : "رفع خلفية"}
            </Button>
            {bgImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={bgImage}
                alt="bg"
                className="w-full h-24 rounded-xl object-cover border border-[#f2f2f2]"
              />
            )}
          </div>

          <div className="flex gap-4 pt-4 border-t border-[#f2f2f2] mt-2">
            <Button
              variant="primary"
              className="flex-[2] h-[44px] rounded-full"
              onClick={handleSubmit}
              loading={updateMutation.isPending}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? "جاري التحديث..." : "تحديث الرأي"}
            </Button>
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 bg-[#fff5f5] text-[#ef4444] border border-[#ffe4e4] rounded-full h-[44px] text-[14px] font-medium hover:bg-[#ffeaea] transition-colors"
            >
              الغاء
            </button>
          </div>
        </div>

        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-white p-6 rounded-[16px] border border-[#f2f2f2] flex flex-col gap-2 shadow-sm">
            <label className="text-[14px] text-[#1a1a1a] font-medium text-start">
              اسم العميل
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white border border-[#f2f2f2] h-[50px] rounded-[16px] px-4 text-[12px] text-gray-700 outline-none focus:border-[#002ec1] text-start"
            />
          </div>

          <div className="bg-white p-6 rounded-[16px] border border-[#f2f2f2] flex flex-col gap-2 shadow-sm">
            <label className="text-[14px] text-[#1a1a1a] font-medium text-start">
              بيانات السيارة
            </label>
            <input
              type="text"
              value={carInfo}
              onChange={(e) => setCarInfo(e.target.value)}
              className="w-full bg-white border border-[#f2f2f2] h-[50px] rounded-[16px] px-4 text-[12px] text-gray-700 outline-none focus:border-[#002ec1] text-start"
            />
          </div>

          <div className="bg-white p-6 rounded-[16px] border border-[#f2f2f2] flex flex-col gap-2 shadow-sm">
            <label className="text-[14px] text-[#1a1a1a] font-medium text-start">
              الرأي / التعليق
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full bg-white border border-[#f2f2f2] rounded-[16px] p-4 text-[12px] text-gray-700 min-h-[200px] resize-none outline-none focus:border-[#002ec1] text-start"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
