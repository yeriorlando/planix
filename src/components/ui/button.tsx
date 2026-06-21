import * as React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    let baseStyles = "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer active:scale-95";
    
    let variantStyles = "";
    switch (variant) {
      case "destructive":
        variantStyles = "bg-red-500 text-white hover:bg-red-650 shadow-sm";
        break;
      case "outline":
        variantStyles = "border border-neutral-200 bg-white text-neutral-800 hover:bg-neutral-50 shadow-xs";
        break;
      case "secondary":
        variantStyles = "bg-neutral-100 text-neutral-900 hover:bg-neutral-200/80";
        break;
      case "ghost":
        variantStyles = "text-neutral-700 hover:bg-neutral-100/80 dark:text-neutral-300 dark:hover:bg-neutral-850/60";
        break;
      case "link":
        variantStyles = "text-blue-600 underline-offset-4 hover:underline";
        break;
      case "default":
      default:
        variantStyles = "bg-[#1B1B1B] text-white hover:bg-slate-850 shadow-sm";
        break;
    }

    let sizeStyles = "";
    switch (size) {
      case "sm":
        sizeStyles = "h-8 px-3 text-xs";
        break;
      case "lg":
        sizeStyles = "h-10 px-8 text-sm";
        break;
      case "icon":
        sizeStyles = "h-9 w-9 p-0";
        break;
      case "default":
      default:
        sizeStyles = "h-9 px-4 py-2";
        break;
    }

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variantStyles} ${sizeStyles} ${className || ""}`}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
