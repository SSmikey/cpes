import * as React from "react";

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
    value?: number;
}

export function Progress({ className = "", value = 0, ...props }: ProgressProps) {
    return (
        <div
            className={`relative h-2 w-full overflow-hidden rounded-full bg-slate-200 ${className}`}
            {...props}
        >
            <div
                className="h-full bg-slate-900 transition-all duration-300 ease-in-out"
                style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
            />
        </div>
    );
}
