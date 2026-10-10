import React from "react";
import clsx from "clsx";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "teal" | "outline";
  className?: string;
  size?: "sm" | "md";
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "default",
  className,
  size = "md",
}) => {
  const base = "inline-flex items-center font-medium rounded-full";
  const sizeStyles = size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs";
  
  const variants = {
    default: "bg-slate-100 text-slate-800 border border-slate-200",
    success: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    warning: "bg-amber-50 text-amber-800 border border-amber-200",
    danger: "bg-rose-50 text-rose-700 border border-rose-200",
    teal: "bg-teal-50 text-teal-700 border border-teal-200",
    outline: "bg-transparent text-slate-600 border border-slate-300",
  };

  return (
    <span className={clsx(base, sizeStyles, variants[variant], className)}>
      {children}
    </span>
  );
};
