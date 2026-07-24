import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface FrostedGlassProps extends React.HTMLAttributes<HTMLElement> {
  className?: string
  children: ReactNode
  as?: "div" | "section" | "header" | "footer" | "aside" | "button"
}

export function FrostedGlass({ className, children, as: Tag = "div", ...props }: FrostedGlassProps) {
  return (
    <Tag
      className={cn(
        "bg-[rgba(255,248,246,0.45)] backdrop-blur-[32px] saturate-[120%] border border-white/40",
        "shadow-[0_12px_48px_rgba(114,90,57,0.12)]",
        className,
      )}
      {...props}
    >
      {children}
    </Tag>
  )
}
