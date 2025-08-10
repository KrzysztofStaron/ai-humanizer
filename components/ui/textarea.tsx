"use client";

import * as React from "react";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className = "", ...props },
  ref
) {
  const base =
    "w-full rounded-md border border-black/10 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-black/20 min-h-[140px]";
  return <textarea ref={ref} className={`${base} ${className}`} {...props} />;
});

export default Textarea;
