import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-2xl text-sm font-semibold transition disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60",
  {
    variants: {
      variant: {
        primary:
          "bg-amber-400 px-4 py-3 text-slate-950 shadow-[0_12px_32px_rgba(250,204,21,0.25)] hover:bg-amber-300",
        secondary:
          "border border-white/10 bg-white/5 px-4 py-3 text-white hover:bg-white/10",
        ghost: "px-3 py-2 text-slate-300 hover:bg-white/5 hover:text-white",
        danger:
          "bg-rose-500 px-4 py-3 text-white hover:bg-rose-400 shadow-[0_12px_32px_rgba(244,63,94,0.2)]",
      },
      size: {
        default: "h-11",
        sm: "h-9 rounded-xl px-3 text-xs",
        lg: "h-12 rounded-2xl px-6",
        icon: "h-10 w-10 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
