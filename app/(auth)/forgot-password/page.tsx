"use client";

import { useState } from "react";
import Link from "next/link";
import { useForgotPasswordMutation } from "@/hooks/mutations/useAuthRecovery";

export default function ForgotPasswordPage() {
  const [phone, setPhone] = useState("");
  const forgotPasswordMutation = useForgotPasswordMutation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) return;
    forgotPasswordMutation.mutate({ phone });
  };

  return (
    <div className="space-y-[52px]">
      {/* Title */}
      <div className="text-center">
        <h1 className="text-white text-[28px] font-semibold leading-[1.5]">
          نسيت كلمة المرور؟
        </h1>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-[52px]">
        <div className="space-y-4">
          {/* Email/Phone Input */}
          <div className="space-y-2">
            <label className="text-white text-[14px] text-right block opacity-90">
              رقم الجوال أو البريد الالكتروني
            </label>
            <div className="bg-white/[0.05] border border-white/[0.1] rounded-[16px]">
              <input
                type="text"
                placeholder="أدخل رقم الجوال أو البريد الالكتروني"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full h-[54px] px-[20px] bg-transparent rounded-[16px] text-white text-right placeholder-gray-500 focus:outline-none focus:bg-white/[0.08] transition-all text-[14px]"
              />
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="space-y-4">
          <button
            type="submit"
            disabled={forgotPasswordMutation.isPending || !phone.trim()}
            className="w-full h-[54px] bg-[#002ec1] hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-semibold rounded-[16px] transition-all text-[14px] shadow-lg shadow-blue-900/20 flex items-center justify-center"
          >
            {forgotPasswordMutation.isPending ? "جاري الإرسال..." : "تحقق"}
          </button>
          <div className="text-center">
            <Link href="/login" className="text-white/60 text-[14px] hover:text-white transition-all hover:underline">
              العودة لتسجيل الدخول
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}