import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'brutal';
  size?: 'sm' | 'md' | 'lg';
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    const variants = {
      primary: "bg-primary text-primary-foreground font-bold hover:bg-primary/90 shadow-sm",
      secondary: "bg-card text-foreground border border-border hover:bg-secondary/80",
      outline: "border-2 border-primary text-primary hover:bg-primary/10 font-semibold",
      ghost: "hover:bg-primary/10 text-foreground",
      brutal: "bg-primary text-primary-foreground font-bold border-2 border-primary shadow-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all",
    };

    const sizes = {
      sm: "px-4 py-2.5 text-sm",
      md: "px-6 py-3",
      lg: "px-8 py-4 text-lg",
    };

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button };
