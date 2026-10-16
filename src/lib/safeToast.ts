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

/* ---------- Toast Wrapper ----------
   The look (ink background, white text, aqua/pink icons) comes from the root <Toaster> in
   app/layout.tsx, so every toast on the site and in the dashboard matches. */
export const safeToast = {
  success(msg: string) {
    if (shouldSkip(msg)) return;
    toast.success(msg);
  },

  error(msg: string) {
    if (shouldSkip(msg)) return;
    toast.error(msg);
  },

  info(msg: string) {
    if (shouldSkip(msg)) return;
    toast(msg, { icon: "✨" });
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
