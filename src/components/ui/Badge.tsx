import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outline' | 'success' | 'warning' | 'danger';
}

const Badge = ({ className, variant = 'default', ...props }: BadgeProps) => {
  const variants = {
    default: "bg-primary/10 text-primary border-primary/20",
    outline: "border-zinc-700 text-zinc-400",
    success: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    warning: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    danger: "bg-rose-500/10 text-rose-500 border-rose-500/20",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2",
        variants[variant],
        className
      )}
      {...props}
    />
  );
};

export { Badge };
