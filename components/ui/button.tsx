"use client";

import * as React from "react";

type ButtonVariant = "default" | "outline" | "hero" | "secondary";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

function getVariantClasses(variant: ButtonVariant): string {
  switch (variant) {
    case "outline":
      return "border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50";
    case "hero":
      return "bg-zinc-900 text-white hover:bg-zinc-800";
    case "secondary":
      return "bg-zinc-100 text-zinc-900 hover:bg-zinc-200";
    default:
      return "bg-zinc-900 text-white hover:bg-zinc-800";
  }
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className = "", variant = "default", ...props },
  ref
) {
  const base =
    "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed";
  const variantClasses = getVariantClasses(variant);
  return <button ref={ref} className={`${base} ${variantClasses} ${className}`} {...props} />;
});

export default Button;
