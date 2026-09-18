import toast from 'react-hot-toast';

export function showError(message: string) {
  toast.error(message, {
    duration: 4000,
    position: 'top-left',
  });
}

export function showSuccess(message: string) {
  toast.success(message, {
    duration: 3000,
    position: 'top-left',
  });
}

export function showInfo(message: string) {
  toast(message, {
    duration: 3000,
    position: 'top-left',
  });
}

export function showLoading(message: string) {
  return toast.loading(message, {
    position: 'top-left',
  });
}

export function dismissToast(toastId: string) {
  toast.dismiss(toastId);
}