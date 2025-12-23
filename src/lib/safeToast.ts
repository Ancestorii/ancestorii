import toast from "react-hot-toast";

let lastMsg = "";
let lastTime = 0;

/* ---------- Prevent Duplicate Toasts ---------- */
function shouldSkip(msgKey: string) {
  const now = Date.now();
  const diff = now - lastTime;
  if (msgKey === lastMsg && diff < 2500) return true;
  lastMsg = msgKey;
  lastTime = now;
  return false;
}

/* ---------- Toast Wrapper ---------- */
export const safeToast = {
  success(msg: string) {
    if (shouldSkip(msg)) return;
    toast.success(msg, {
      style: {
        background: "#ffffff",
        color: "#0F2040",
        border: "1px solid #D4AF37",
        padding: "12px 16px",
        fontFamily: "Inter, sans-serif",
        fontWeight: 500,
      },
      iconTheme: {
        primary: "#D4AF37",
        secondary: "#ffffff",
      },
    });
  },

  error(msg: string) {
    if (shouldSkip(msg)) return;
    toast.error(msg, {
      style: {
        background: "#ffffff",
        color: "#B91C1C",
        border: "1px solid #F87171",
        padding: "12px 16px",
        fontFamily: "Inter, sans-serif",
        fontWeight: 500,
      },
    });
  },

  info(msg: string) {
    if (shouldSkip(msg)) return;
    toast(msg, {
      icon: "✨",
      style: {
        background: "#fffdfa",
        color: "#0F2040",
        border: "1px solid #D4AF37",
        boxShadow: "0 0 15px rgba(212,175,55,0.25)",
        padding: "12px 16px",
        fontFamily: "Inter, sans-serif",
        fontWeight: 500,
      },
    });
  },

  custom(
    renderer: Parameters<typeof toast.custom>[0],
    opts?: Parameters<typeof toast.custom>[1]
  ) {
    const msgKey =
      typeof renderer === "string"
        ? renderer
        : renderer?.toString().slice(0, 200) || "custom";
    if (shouldSkip(msgKey)) return;
    toast.custom(renderer, opts);
  },
};
