import * as React from "react";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    children: React.ReactNode;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
    ({ className = "", children, ...props }, ref) => {
        return (
            <div className="relative">
                <select
                    ref={ref}
                    className={`flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none ${className}`}
                    {...props}
                >
                    {children}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-slate-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>
        );
    }
);

Select.displayName = "Select";

// Helper components to match shadcn structure where possible
export function SelectTrigger({ children, className = "", ...props }: any) {
    return <div className={`flex items-center justify-between ${className}`} {...props}>{children}</div>;
}

export function SelectValue({ placeholder }: any) {
    return <span>{placeholder}</span>;
}

export function SelectContent({ children }: any) {
    return <>{children}</>;
}

export function SelectItem({ value, children }: any) {
    return <option value={value}>{children}</option>;
}
