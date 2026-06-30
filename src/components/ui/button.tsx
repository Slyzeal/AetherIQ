"use client"
import * as React from "react"
import { cn } from "@/lib/utils"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "destructive"
  size?: "sm" | "md" | "lg" | "icon"
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center font-semibold transition-all duration-150 focus-visible:outline-none disabled:opacity-40 disabled:pointer-events-none cursor-pointer",
        {
          "bg-[#00d4a8] text-black hover:bg-[#00bfa0] rounded-[7px]": variant === "default",
          "border border-[#2a2a3a] text-white/70 hover:border-white/30 hover:text-white rounded-[7px] bg-transparent": variant === "outline",
          "text-white/50 hover:text-white hover:bg-white/5 rounded-[6px] bg-transparent": variant === "ghost",
          "bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 rounded-[7px]": variant === "destructive",
        },
        {
          "h-8 px-3 text-xs": size === "sm",
          "h-9 px-4 text-sm": size === "md",
          "h-11 px-6 text-sm": size === "lg",
          "h-9 w-9 p-0": size === "icon",
        },
        className
      )}
      {...props}
    />
  )
)
Button.displayName = "Button"
