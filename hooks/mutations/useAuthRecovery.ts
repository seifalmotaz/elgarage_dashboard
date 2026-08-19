import { useMutation } from '@tanstack/react-query';
import { authApi } from '@/lib/api/auth';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export function useForgotPasswordMutation() {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: { phone: string }) => authApi.forgotPassword(data),
    onSuccess: (data, variables) => {
      toast.success('تم إرسال رمز التحقق');
      // Store phone for next step
      sessionStorage.setItem('recoveryPhone', variables.phone);
      router.push('/verify-otp');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إرسال رمز التحقق');
    },
  });
}

export function useVerifyOtpMutation() {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: { phone: string; otpCode: string }) => authApi.verifyOtp(data),
    onSuccess: (data, variables) => {
      toast.success('تم التحقق بنجاح');
      // Store otpCode for reset password step
      sessionStorage.setItem('recoveryPhone', variables.phone);
      sessionStorage.setItem('recoveryOtp', variables.otpCode);
      router.push('/reset-password');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل التحقق من رمز التحقق');
    },
  });
}

export function useResendOtpMutation() {
  return useMutation({
    mutationFn: (data: { phone: string }) => authApi.resendOtp(data),
    onSuccess: () => {
      toast.success('تم إعادة إرسال الرمز');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إعادة إرسال الرمز');
    },
  });
}

export function useResetPasswordMutation() {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: { phone: string; otpCode: string; newPassword: string }) =>
      authApi.resetPassword(data),
    onSuccess: () => {
      toast.success('تم إعادة تعيين كلمة المرور بنجاح');
      // Clear recovery session storage
      sessionStorage.removeItem('recoveryPhone');
      sessionStorage.removeItem('recoveryOtp');
      router.push('/login');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إعادة تعيين كلمة المرور');
    },
  });
}