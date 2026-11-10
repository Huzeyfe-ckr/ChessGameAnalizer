import type { SelectHTMLAttributes } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: { value: number | string; label: string }[];
}

export function Select({ options, className = "", ...props }: SelectProps) {
  return (
    <select
      className={`rounded-lg border border-line bg-background px-3 py-2.5 text-sm text-ink outline-none focus:border-brand ${className}`}
      {...props}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
