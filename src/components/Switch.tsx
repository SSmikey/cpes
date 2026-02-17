import * as React from "react";

interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> { }

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
    ({ className = "", ...props }, ref) => {
        return (
            <label className={`relative inline-flex items-center cursor-pointer ${className}`}>
                <input
                    type="checkbox"
                    className="sr-only peer"
                    ref={ref}
                    {...props}
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-slate-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:after:w-5 after:transition-all peer-checked:bg-slate-900"></div>
            </label>
        );
    }
);

Switch.displayName = "Switch";
