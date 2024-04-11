import { toast } from "react-toastify";
import type { ToastContent, ToastOptions } from "react-toastify";

export default function notifyUser(
  message: ToastContent,
  options: ToastOptions
) {
  toast(message, {
    position: "bottom-right",
    autoClose: 5000,
    theme: "dark",
    hideProgressBar: false,
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
