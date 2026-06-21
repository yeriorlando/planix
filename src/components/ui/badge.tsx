import * as React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline";
  className?: string;
  children?: React.ReactNode;
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  let variantStyles = "";
  switch (variant) {
    case "secondary":
      variantStyles = "border-transparent bg-neutral-100 text-neutral-800 hover:bg-neutral-200/80";
      break;
    case "destructive":
      variantStyles = "border-transparent bg-red-500 text-white hover:bg-red-650";
      break;
    case "outline":
      variantStyles = "text-neutral-800 border-neutral-200";
      break;
    case "default":
    default:
      variantStyles = "border-transparent bg-[#1B1B1B] text-white";
      break;
  }
  return (
    <div
      className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${variantStyles} ${className || ""}`}
      {...props}
    />
  );
}
