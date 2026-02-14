import { toast } from "react-toastify";

// Generate a stable toastId from the message to prevent duplicate toasts
const toastId = (message) =>
  typeof message === "string" ? message.slice(0, 64) : undefined;

export const showToast = {
  success: (message) => {
    toast.success(message, {
      toastId: toastId(message),
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  },
  error: (message) => {
    toast.error(message, {
      toastId: toastId(message),
      position: "top-right",
      autoClose: 4000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  },
  warning: (message) => {
    toast.warning(message, {
      toastId: toastId(message),
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  },
  info: (message) => {
    toast.info(message, {
      toastId: toastId(message),
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  },
};
