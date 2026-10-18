import * as React from "react"
import * as SheetPrimitive from "@radix-ui/react-dialog"
import { XIcon } from "lucide-react"

import { cn } from "@/lib/utils"

// The app kit's sheet (src/components/dashboard/ui): a white panel with a 28px radius on its
// inner edge and the kit's float shadow over an ink scrim, the kit's header, title, line and
// footer, and a square close button with the hairline ring. Radix renders it in a portal,
// outside the dashboard's .app root: put `appRoot` (AppBits) on SheetContent for the kit's
// tokens and Plus Jakarta Sans.

function Sheet({ ...props }: React.ComponentProps<typeof SheetPrimitive.Root>) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />
}

function SheetTrigger({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Trigger>) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />
}

function SheetClose({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Close>) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />
}

function SheetPortal({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Portal>) {
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />
}

function SheetOverlay({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Overlay>) {
  return (
    <SheetPrimitive.Overlay
      data-slot="sheet-overlay"
      // scrim-blur (globals.css) blurs only with a mouse, as the kit's other drawers do
      className={cn(
        "scrim-blur data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-[200] bg-[rgba(10,10,15,0.45)]",
        className
      )}
      {...props}
    />
  )
}

function SheetContent({
  className,
  children,
  side = "right",
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Content> & {
  side?: "top" | "right" | "bottom" | "left"
}) {
  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Content
        data-slot="sheet-content"
        className={cn(
          "bg-white text-brand-ink data-[state=open]:animate-in data-[state=closed]:animate-out fixed z-[200] flex flex-col overflow-hidden shadow-[0_30px_70px_-30px_rgba(10,10,15,0.45)] outline-none transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500",
          side === "right" &&
            "data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right inset-y-0 right-0 h-full w-3/4 rounded-l-[28px] sm:max-w-sm",
          side === "left" &&
            "data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left inset-y-0 left-0 h-full w-3/4 rounded-r-[28px] sm:max-w-sm",
          side === "top" &&
            "data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top inset-x-0 top-0 h-auto rounded-b-[28px]",
          side === "bottom" &&
            "data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom inset-x-0 bottom-0 h-auto rounded-t-[28px]",
          className
        )}
        {...props}
      >
        {children}
        <SheetPrimitive.Close className="absolute top-[22px] right-5 inline-flex size-11 items-center justify-center rounded-[14px] bg-white text-brand-ink shadow-[inset_0_0_0_1.5px_rgba(10,10,15,0.14)] transition-[box-shadow,scale] duration-200 hover:shadow-[inset_0_0_0_1.5px_#0a0a0f] active:scale-[0.94] focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-brand-blue disabled:pointer-events-none max-[599px]:top-[18px] max-[599px]:right-4">
          <XIcon className="size-5" strokeWidth={2.4} aria-hidden="true" />
          <span className="sr-only">Close</span>
        </SheetPrimitive.Close>
      </SheetPrimitive.Content>
    </SheetPortal>
  )
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-header"
      // Room on the right for the close button.
      className={cn(
        "flex flex-none flex-col gap-1.5 pt-[22px] pr-20 pb-3.5 pl-6 max-[599px]:pt-[18px] max-[599px]:pr-[72px] max-[599px]:pb-3 max-[599px]:pl-5",
        className
      )}
      {...props}
    />
  )
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-footer"
      // Actions on the right; on phones they share the row.
      className={cn(
        "mt-auto flex flex-none flex-wrap items-center justify-end gap-2.5 border-t-[1.5px] border-[rgba(10,10,15,0.1)] bg-white px-6 pt-4 pb-[calc(18px+env(safe-area-inset-bottom,0px))] max-[599px]:px-5 max-[599px]:pt-3.5 max-[599px]:pb-[calc(16px+env(safe-area-inset-bottom,0px))] max-[599px]:[&>*]:flex-auto",
        className
      )}
      {...props}
    />
  )
}

function SheetTitle({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Title>) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn(
        "m-0 text-[clamp(22px,2vw,26px)] leading-[1.1] font-extrabold tracking-[-0.04em] text-balance [overflow-wrap:anywhere]",
        className
      )}
      {...props}
    />
  )
}

function SheetDescription({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Description>) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn("m-0 text-[14.5px] leading-[1.5] font-medium", className)}
      {...props}
    />
  )
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
}
