"use client"
import * as React from "react"
import { cn } from "@/lib/utils"

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "green" | "purple" | "orange" | "red" | "blue"
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-[4px] px-[9px] py-[3px] text-[10px] font-medium border",
        {
          "border-[#2a2a3a] text-white/60 bg-transparent": variant === "default",
          "border-[#00d4a8]/25 text-[#00d4a8] bg-[#00d4a8]/06": variant === "green",
          "border-purple-500/25 text-purple-400 bg-purple-500/06": variant === "purple",
          "border-orange-500/25 text-orange-400 bg-orange-500/06": variant === "orange",
          "border-red-500/25 text-red-400 bg-red-500/06": variant === "red",
          "border-blue-500/25 text-blue-400 bg-blue-500/06": variant === "blue",
        },
        className
      )}
      {...props}
    />
  )
}
