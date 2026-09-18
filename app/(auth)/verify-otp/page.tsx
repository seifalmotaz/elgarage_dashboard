"use client";

import { useState, useEffect, useRef } from "react";
import { useVerifyOtpMutation, useResendOtpMutation } from "@/hooks/mutations/useAuthRecovery";

const OTP_LENGTH = 6;
const TIMER_SECONDS = 60;

export default function VerifyOtpPage() {
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [timer, setTimer] = useState(TIMER_SECONDS);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const phone = typeof window !== "undefined" ? sessionStorage.getItem("recoveryPhone") || "" : "";
  const verifyOtpMutation = useVerifyOtpMutation();
  const resendOtpMutation = useResendOtpMutation();

  // Redirect if no phone in session
  useEffect(() => {
    if (!phone && typeof window !== "undefined") {
      window.location.href = "/forgot-password";
    }
  }, [phone]);

  // Timer countdown
  useEffect(() => {
    if (timer <= 0) {
      setCanResend(true);
      return;
    }
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleOtpChange = (index: number, value: string) => {
    // Only allow numeric input
    const digit = value.replace(/\D/g, "").slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    // Auto-focus next input
    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResend = () => {
    if (canResend && phone) {
      resendOtpMutation.mutate({ phone });
      setTimer(TIMER_SECONDS);
      setCanResend(false);
      setOtp(Array(OTP_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
    }
  };

  const handleSubmit = () => {
    const otpCode = otp.join("");
    if (otpCode.length === OTP_LENGTH && phone) {
      verifyOtpMutation.mutate({ phone, otpCode });
    }
  };

  const isOtpComplete = otp.every((digit) => digit.length === 1);
  const formattedTime = `${Math.floor(timer / 60)
    .toString()
    .padStart(2, "0")}:${(timer % 60).toString().padStart(2, "0")}`;

  // Mask phone number for display
  const maskedPhone = phone
    ? phone.length > 8
      ? `*****${phone.slice(-4)}`
      : phone
    : "";

  return (
    <div className="space-y-[52px]">
      {/* Header */}
      <div className="text-center space-y-3">
        <h1 className="text-white text-[28px] font-semibold leading-[1.5]">
          كود التحقق
        </h1>
        <p className="text-gray-300 text-[16px] font-light">
          من فضلك أدخل الرمز الذي تم إرساله إلى {maskedPhone}
        </p>
      </div>

      {/* OTP Input and Actions */}
      <div className="space-y-[52px]">
        <div className="space-y-8">
          {/* OTP Digits */}
          <div className="flex justify-center gap-5" dir="ltr">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-[62px] h-[62px] bg-white/[0.05] border border-white/[0.1] rounded-[16px] flex items-center justify-center text-white text-[24px] font-medium text-center focus:outline-none focus:bg-white/[0.08] focus:border-white/[0.3] transition-all"
              />
            ))}
          </div>

          {/* Resend Actions */}
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center gap-2">
              <span className="text-gray-400 text-[14px]">لم يتم إرسال الكود؟</span>
              <button
                type="button"
                onClick={handleResend}
                disabled={!canResend || resendOtpMutation.isPending}
                className={`text-[16px] font-medium transition-all ${
                  canResend
                    ? "text-white hover:underline cursor-pointer"
                    : "text-gray-500 cursor-not-allowed"
                }`}
              >
                إعادة الإرسال
              </button>
            </div>
            <div className="text-white text-[16px]">{formattedTime}</div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!isOtpComplete || verifyOtpMutation.isPending}
          className="w-full h-[54px] bg-[#002ec1] hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-semibold rounded-[16px] transition-all text-[14px] shadow-lg shadow-blue-900/20 flex items-center justify-center"
        >
          {verifyOtpMutation.isPending ? "جاري التحقق..." : "إرسال"}
        </button>
      </div>
    </div>
  );
}