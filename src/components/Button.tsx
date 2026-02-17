import * as React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
    size?: "default" | "sm" | "lg" | "icon";
}

export function Button({
    className = "",
    variant = "default",
    size = "default",
    ...props
}: ButtonProps) {
    const baseStyles = "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";

    const variants = {
        default: "bg-slate-900 text-white hover:bg-slate-800 focus-visible:ring-slate-900",
        destructive: "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600",
        outline: "border border-slate-300 bg-white hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-slate-900",
        secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200 focus-visible:ring-slate-900",
        ghost: "hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-slate-900",
        link: "text-slate-900 underline-offset-4 hover:underline",
    };

    const sizes = {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-11 rounded-md px-8 text-base font-semibold",
        icon: "h-9 w-9",
    };

    const classes = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;

    return <button className={classes} {...props} />;
}
