"use client";

import * as React from "react";

type ButtonVariant = "default" | "outline" | "hero" | "secondary";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

function getVariantClasses(variant: ButtonVariant): string {
  switch (variant) {
    case "outline":
      return "border border-black/10 bg-white text-black hover:bg-black/5";
    case "hero":
      return "bg-black text-white hover:bg-black/90";
    case "secondary":
      return "bg-gray-100 text-black hover:bg-gray-200";
    default:
      return "bg-black text-white hover:bg-black/90";
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
