import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "accent" | "danger" | "ghost";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary: "bg-cream text-background hover:bg-piece-white border-transparent",
  secondary: "bg-surface-2 text-ink hover:bg-surface-3 border-line",
  accent: "bg-move-best text-cream hover:brightness-110 border-transparent",
  danger: "bg-surface-2 text-danger hover:bg-surface-3 border-danger/40",
  ghost: "bg-transparent text-ink-soft hover:bg-surface-2 hover:text-cream border-transparent",
};

const sizes: Record<Size, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2.5 text-sm",
  lg: "px-6 py-3 text-base",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export function Button({ variant = "secondary", size = "md", className = "", ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg border font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    />
  );
}
