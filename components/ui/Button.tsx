import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg" | "xl";
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  loading?: boolean;
  children: React.ReactNode;
}

export default function Button({
  variant = "primary",
  size = "md",
  icon,
  iconPosition = "left",
  loading = false,
  children,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = "inline-flex items-center justify-center gap-2 transition-all duration-300 font-medium shrink-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-[#002ec1] text-white shadow-lg shadow-blue-900/10 hover:bg-blue-700",
    secondary: "bg-[#f8fafc] text-[#1a1a1a] border border-[#f2f2f2] hover:bg-gray-100",
    outline: "bg-white border border-[#f2f2f2] text-[#002ec1] hover:bg-gray-50",
    ghost: "bg-transparent text-[#6b7280] hover:bg-gray-50 hover:text-[#111]",
  };

  const sizes = {
    sm: "px-3 py-1.5 rounded-full text-[12px]",
    md: "px-5 py-2.5 rounded-full text-[14px]",
    lg: "px-6 py-3 rounded-[16px] text-[14px]",
    xl: "px-8 py-3.5 rounded-[16px] text-[16px]",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {/* In RTL, left child appears on right. If iconPosition is 'right', icon should be first in DOM */}
      {loading ? (
        <>
          <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
          <span className="mt-[1px]">{children}</span>
        </>
      ) : (
        <>
          {icon && iconPosition === "right" && <span className="flex items-center shrink-0">{icon}</span>}
          <span className={icon ? "mt-[1px]" : ""}>{children}</span>
          {icon && iconPosition === "left" && <span className="flex items-center shrink-0">{icon}</span>}
        </>
      )}
    </button>
  );
}
