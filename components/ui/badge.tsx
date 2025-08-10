import * as React from "react";

type BadgeVariant = "default" | "secondary" | "destructive";

export function Badge({
  children,
  className = "",
  variant = "default",
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: BadgeVariant }) {
  const color =
    variant === "secondary"
      ? "bg-gray-100 text-black"
      : variant === "destructive"
      ? "bg-red-100 text-red-700"
      : "bg-black text-white";
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${color} ${className}`}>
      {children}
    </span>
  );
}

export default Badge;
