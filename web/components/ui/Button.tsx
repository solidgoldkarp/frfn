'use client';

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';

const buttonVariants = cva(
  "inline-flex items-center justify-center text-sm font-medium transition-all duration-300 focus-visible:outline-none disabled:opacity-50 disabled:pointer-events-none backdrop-blur-md",
  {
    variants: {
      variant: {
        default: "bg-black/20 text-white border border-white/20 hover:border-white/50",
        primary: "bg-black/30 text-[#F900BF] border border-[#F900BF]/50 hover:border-[#F900BF] hover:shadow-[0_0_10px_rgba(249,0,191,0.5)]",
        destructive: "bg-black/30 text-red-500 border border-red-500/20 hover:border-red-500 hover:text-red-400",
        outline: "border border-white/20 hover:bg-white/5 hover:border-white/40",
        secondary: "bg-black/30 text-white border border-white/20 hover:border-white/50 hover:text-white/80",
        ghost: "hover:bg-white/5 text-white/70 hover:text-white",
        link: "underline-offset-4 hover:underline text-[#F900BF]",
        yes: "bg-black/20 text-green-400 border border-green-500/40 hover:border-green-500 hover:text-green-300",
        no: "bg-black/20 text-red-400 border border-red-500/40 hover:border-red-500 hover:text-red-300",
      },
      size: {
        default: "h-10 py-2 px-4",
        sm: "h-9 px-3",
        lg: "h-11 px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  glowing?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, glowing, children, ...props }, ref) => {
    return (
      <button
        className={cn(
          buttonVariants({ variant, size, className }),
          glowing && variant === 'primary' && "animate-pulse-subtle"
        )}
        ref={ref}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading ? (
          <svg
            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        ) : null}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };