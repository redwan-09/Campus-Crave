import { InputHTMLAttributes, SelectHTMLAttributes, forwardRef } from "react";

interface FieldWrapperProps {
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}

export function FieldWrapper({ label, error, hint, children }: FieldWrapperProps) {
  return (
    <label className="block">
      <span className="block font-display font-semibold text-sm mb-1.5 text-ink">
        {label}
      </span>
      {children}
      {hint && !error && <span className="block text-xs text-ink-soft mt-1.5">{hint}</span>}
      {error && <span className="block text-xs text-chili mt-1.5 font-medium">{error}</span>}
    </label>
  );
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className = "", ...props }, ref) => (
    <FieldWrapper label={label} error={error} hint={hint}>
      <input
        ref={ref}
        className={`w-full rounded-xl border ${
          error ? "border-chili" : "border-line"
        } bg-white px-4 py-2.5 text-[15px] outline-none focus:border-periwinkle focus:ring-2 focus:ring-periwinkle/25 transition ${className}`}
        {...props}
      />
    </FieldWrapper>
  )
);
Input.displayName = "Input";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  hint?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, hint, className = "", children, ...props }, ref) => (
    <FieldWrapper label={label} error={error} hint={hint}>
      <select
        ref={ref}
        className={`w-full rounded-xl border ${
          error ? "border-chili" : "border-line"
        } bg-white px-4 py-2.5 text-[15px] outline-none focus:border-periwinkle focus:ring-2 focus:ring-periwinkle/25 transition ${className}`}
        {...props}
      >
        {children}
      </select>
    </FieldWrapper>
  )
);
Select.displayName = "Select";
