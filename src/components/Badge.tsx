import * as React from "react";

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: "default" | "secondary" | "destructive" | "outline";
}

export function Badge({
    className = "",
    variant = "default",
    ...props
}: BadgeProps) {
    const variants = {
        default: "bg-slate-900 text-white hover:bg-slate-800",
        secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200",
        destructive: "bg-red-600 text-white hover:bg-red-700",
        outline: "border border-slate-300 text-slate-900",
    };

    return (
        <div
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors ${variants[variant]} ${className}`}
            {...props}
        />
    );
}
