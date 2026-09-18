"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useResetPasswordMutation } from "@/hooks/mutations/useAuthRecovery";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmError, setConfirmError] = useState("");

  const phone = typeof window !== "undefined" ? sessionStorage.getItem("recoveryPhone") || "" : "";
  const otpCode = typeof window !== "undefined" ? sessionStorage.getItem("recoveryOtp") || "" : "";
  const resetPasswordMutation = useResetPasswordMutation();

  // Redirect if no phone or otp in session
  useEffect(() => {
    if ((!phone || !otpCode) && typeof window !== "undefined") {
      window.location.href = "/forgot-password";
    }
  }, [phone, otpCode]);

  const validate = (): boolean => {
    setPasswordError("");
    setConfirmError("");

    if (password.length < 6) {
      setPasswordError("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      return false;
    }

    if (password !== confirmPassword) {
      setConfirmError("كلمتا المرور غير متطابقتين");
      return false;
    }

    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    resetPasswordMutation.mutate({ phone, otpCode, newPassword: password });
  };

  return (
    <div className="space-y-[52px]">
      {/* Header */}
      <div className="text-center space-y-3">
        <h1 className="text-white text-[28px] font-semibold leading-[1.5]">
          إعادة تعين كلمة المرور؟
        </h1>
        <p className="text-gray-300 text-[16px] font-light">
          من فضلك أدخل كلمة المرور الجديدة
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-[52px]">
        <div className="space-y-6">
          {/* New Password */}
          <div className="space-y-2">
            <label className="text-white text-[14px] text-right block opacity-90">
              كلمة المرور الجديدة
            </label>
            <div className="bg-white/[0.05] border border-white/[0.1] rounded-[16px] relative">
              <input
                type="password"
                placeholder="أدخل كلمة المرور الجديدة"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-[54px] pr-[20px] pl-[50px] bg-transparent rounded-[16px] text-white text-right placeholder-gray-500 focus:outline-none focus:bg-white/[0.08] transition-all text-[14px]"
              />
              <div className="absolute left-[20px] top-1/2 -translate-y-1/2 cursor-pointer">
                <img
                  src="/assets/eye-slash.svg"
                  alt="Toggle password"
                  width={24}
                  height={24}
                  className="opacity-60 hover:opacity-100 transition-opacity"
                />
              </div>
            </div>
            {passwordError && (
              <p className="text-red-400 text-[12px]">{passwordError}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <label className="text-white text-[14px] text-right block opacity-90">
              تأكيد كلمة المرور الجديدة
            </label>
            <div className="bg-white/[0.05] border border-white/[0.1] rounded-[16px] relative">
              <input
                type="password"
                placeholder="أدخل كلمة المرور الجديدة"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full h-[54px] pr-[20px] pl-[50px] bg-transparent rounded-[16px] text-white text-right placeholder-gray-500 focus:outline-none focus:bg-white/[0.08] transition-all text-[14px]"
              />
              <div className="absolute left-[20px] top-1/2 -translate-y-1/2 cursor-pointer">
                <img
                  src="/assets/eye-slash.svg"
                  alt="Toggle password"
                  width={24}
                  height={24}
                  className="opacity-60 hover:opacity-100 transition-opacity"
                />
              </div>
            </div>
            {confirmError && (
              <p className="text-red-400 text-[12px]">{confirmError}</p>
            )}
          </div>
        </div>

        {/* Action Button */}
        <button
          type="submit"
          disabled={resetPasswordMutation.isPending}
          className="w-full h-[54px] bg-[#002ec1] hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-semibold rounded-[16px] transition-all text-[14px] shadow-lg shadow-blue-900/20 flex items-center justify-center"
        >
          {resetPasswordMutation.isPending ? "جاري الحفظ..." : "حفظ"}
        </button>
      </form>
    </div>
  );
}