import { ButtonHTMLAttributes, forwardRef } from "react";
import Link from "next/link";

type Variant = "primary" | "ghost" | "accent" | "danger";
type Size = "sm" | "md" | "lg";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-ink text-cream shadow-sm hover:shadow-lg hover:-translate-y-0.5",
  ghost:
    "bg-transparent text-ink border border-line hover:border-ink hover:-translate-y-0.5",
  accent:
    "bg-marigold text-ink shadow-[0_10px_24px_rgba(245,166,35,0.35)] hover:shadow-[0_16px_32px_rgba(245,166,35,0.45)] hover:-translate-y-0.5",
  danger: "bg-chili text-white hover:bg-chili/90",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-[15px]",
  lg: "px-7 py-3.5 text-base",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className = "", ...props }, ref) => (
    <button
      ref={ref}
      className={`font-display font-semibold rounded-full inline-flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    />
  )
);
Button.displayName = "Button";

export function LinkButton({
  href,
  variant = "primary",
  size = "md",
  className = "",
  children,
}: {
  href: string;
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`font-display font-semibold rounded-full inline-flex items-center justify-center gap-2 transition-all duration-200 whitespace-nowrap ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {children}
    </Link>
  );
}
