import * as React from "react"

import { cn } from "@/lib/utils"

// The app kit's field (src/components/dashboard/ui): 52px tall, radius 14px, a hairline
// outline that turns pink with a soft pink ring on focus, 16px text (no iOS zoom on focus).
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-[52px] w-full min-w-0 rounded-[14px] border-[1.5px] border-[rgba(10,10,15,0.14)] bg-white px-4 text-base font-semibold text-brand-ink outline-none transition-[border-color,box-shadow] duration-200",
        "placeholder:font-medium placeholder:text-[rgba(10,10,15,0.42)]",
        "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-bold file:text-brand-ink",
        "focus:border-brand-pink focus:shadow-[0_0_0_4px_rgba(255,45,135,0.14)]",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60",
        "aria-invalid:border-brand-danger",
        className
      )}
      {...props}
    />
  )
}

export { Input }
