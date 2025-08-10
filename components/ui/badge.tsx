import * as React from "react";

type BadgeVariant = "default" | "secondary" | "destructive";

export function Badge({
  children,
  className = "",
  variant = "default",
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: BadgeVariant }) {
  const color =
    variant === "secondary"
      ? "bg-zinc-100 text-zinc-900"
      : variant === "destructive"
      ? "bg-red-100 text-red-700"
      : "bg-zinc-900 text-white";
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${color} ${className}`}>
      {children}
    </span>
  );
}

export default Badge;
