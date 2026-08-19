'use client';

import { useState } from "react";
import { useLoginMutation } from "../../../hooks/mutations/useAuth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const loginMutation = useLoginMutation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ email, password });
  };

  return (
    <div className="space-y-[52px]">
      {/* Welcome Text */}
      <div className="text-center">
        <h1 className="text-white text-[24px] lg:text-[28px] font-light leading-[1.6]">
          أهلاً بعودتك إلى <span className="font-medium">elGARAGE</span>، سجّل
          <br />
          دخولك للوصول إلى{" "}
          <span className="text-[#2563eb] font-semibold">لوحة التحكم.</span>
        </h1>
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-[72px]">
        <div className="space-y-4">
          {/* Error Message */}
          {loginMutation.isError && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-[16px] p-4">
              <p className="text-red-400 text-[14px] text-right">
                {loginMutation.error?.message || 'فشل تسجيل الدخول. تأكد من صحة البيانات'}
              </p>
            </div>
          )}

          {/* Email Input */}
          <div className="space-y-2">
            <label className="text-white text-[14px] text-right block opacity-90">
              البريد الالكتروني
            </label>
            <div className="bg-white/[0.05] border border-white/[0.1] rounded-[16px]">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="أدخل البريد الالكتروني"
                required
                disabled={loginMutation.isPending}
                className="w-full h-[54px] px-[20px] bg-transparent rounded-[16px] text-white text-right placeholder-gray-500 focus:outline-none focus:bg-white/[0.08] transition-all text-[14px] disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <label className="text-white text-[14px] text-right block opacity-90">
              كلمة السر
            </label>
            <div className="bg-white/[0.05] border border-white/[0.1] rounded-[16px] relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="أدخل كلمة السر"
                required
                disabled={loginMutation.isPending}
                className="w-full h-[54px] pr-[20px] pl-[50px] bg-transparent rounded-[16px] text-white text-right placeholder-gray-500 focus:outline-none focus:bg-white/[0.08] transition-all text-[14px] disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-[20px] top-1/2 -translate-y-1/2"
                disabled={loginMutation.isPending}
              >
                <img
                  src="/assets/eye-slash.svg"
                  alt="Toggle password"
                  width={24}
                  height={24}
                  className={`opacity-60 hover:opacity-100 transition-opacity ${showPassword ? 'opacity-100' : ''}`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loginMutation.isPending}
          className="w-full h-[54px] bg-[#002ec1] hover:bg-blue-700 text-white font-semibold rounded-[16px] transition-all text-[14px] shadow-lg shadow-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loginMutation.isPending ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>جاري تسجيل الدخول...</span>
            </>
          ) : (
            "تسجيل الدخول"
          )}
        </button>
      </form>
    </div>
  );
}