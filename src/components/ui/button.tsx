import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// The app kit's buttons (src/components/dashboard/ui): ink primary, 2px ink outline, soft
// hairline, ghost, danger; radius 12 to 16px, 700 labels, the kit's blue 3px focus ring.
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2.5 whitespace-nowrap rounded-[14px] text-[15px] leading-[1.15] font-bold cursor-pointer transition-[translate,scale,background-color,color,box-shadow,opacity] duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-brand-blue active:scale-[0.97] aria-invalid:shadow-[inset_0_0_0_1.5px_#e0004d]",
  {
    variants: {
      variant: {
        default: "bg-brand-ink text-white hover:-translate-y-0.5",
        destructive: "bg-brand-danger text-white hover:-translate-y-0.5",
        outline:
          "bg-white text-brand-ink shadow-[inset_0_0_0_2px_#0a0a0f] hover:bg-brand-ink hover:text-white",
        secondary:
          "bg-white text-brand-ink shadow-[inset_0_0_0_1.5px_rgba(10,10,15,0.14)] hover:shadow-[inset_0_0_0_1.5px_#0a0a0f]",
        ghost: "bg-transparent text-brand-ink hover:bg-brand-hover",
        link: "text-brand-blue font-extrabold underline decoration-2 underline-offset-[3px]",
      },
      size: {
        default: "h-12 px-[22px] has-[>svg]:px-5",
        sm: "h-10 rounded-[12px] gap-2 px-4 text-sm has-[>svg]:px-3.5",
        lg: "h-14 rounded-[16px] px-[26px] text-base has-[>svg]:px-6",
        icon: "size-11",
        "icon-sm": "size-9 rounded-[12px]",
        "icon-lg": "size-12 rounded-[16px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
