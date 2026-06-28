import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "primary", size = "md", isLoading, disabled, children, ...props }, ref) => {
    // AWS flat console style configurations
    const baseStyles = "inline-flex items-center justify-center font-semibold rounded-[3px] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all select-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50";
    
    const variants = {
      primary: "bg-[#0066cc] hover:bg-[#0052a3] text-white focus:ring-[#0066cc]",
      secondary: "bg-white hover:bg-[#f2f3f3] text-zinc-700 border border-[#aab7b7] focus:ring-[#aab7b7]",
      danger: "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500",
    };

    const sizes = {
      sm: "h-8 px-3 text-xs",
      md: "h-9 px-4 text-xs",
      lg: "h-10 px-6 text-sm",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {isLoading ? "Loading..." : children}
      </button>
    );
  }
);

Button.displayName = "Button";
