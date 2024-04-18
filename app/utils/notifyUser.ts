import { toast } from "react-toastify";
import type { ToastContent, ToastOptions } from "react-toastify";

export default function notifyUser(
  message: ToastContent,
  options: ToastOptions
) {
  toast(message, {
    position: "bottom-right",
    autoClose: 3000,
    theme: "dark",
    hideProgressBar: true,
    closeOnClick: true,
    rtl: false,
    pauseOnFocusLoss: true,
    pauseOnHover: true,
    draggable: true,
    ...options,
  });
};

export function clearToastQueue() {
  toast.clearWaitingQueue();
}
