"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface SelectProps {
    value?: string;
    onChange?: (e: { target: { value: string } }) => void;
    children: React.ReactNode;
    className?: string;
    placeholder?: string;
}

export const Select = ({ value, onChange, children, className = "", placeholder = "Select option..." }: SelectProps) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const containerRef = React.useRef<HTMLDivElement>(null);

    // Close on outside click
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Find selected label
    const items = React.Children.toArray(children).filter(
        (child) => React.isValidElement(child) && child.type === SelectItem
    ) as React.ReactElement[];

    const selectedItem = items.find((item) => item.props.value === value);
    const displayText = selectedItem ? selectedItem.props.children : placeholder;

    return (
        <div ref={containerRef} className={cn("relative w-full", className)}>
            <div
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "flex h-11 w-full items-center justify-between rounded-2xl border-2 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition-all cursor-pointer",
                    isOpen ? "border-indigo-500 shadow-lg shadow-indigo-100 ring-2 ring-indigo-50" : "border-slate-100 hover:border-slate-200 shadow-sm"
                )}
            >
                <span className="truncate">{displayText}</span>
                <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                    className="ml-2 flex-shrink-0 text-slate-400"
                >
                    <ChevronDown className="size-4 stroke-[3]" />
                </motion.div>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 4 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                        className="absolute z-50 mt-1 max-h-64 w-full overflow-hidden rounded-2xl border border-slate-100 bg-white/95 backdrop-blur-xl p-1 shadow-2xl shadow-indigo-200/40"
                    >
                        <div className="custom-scrollbar overflow-y-auto max-h-60 p-1">
                            {React.Children.map(children, (child) => {
                                if (React.isValidElement(child) && child.type === SelectItem) {
                                    return React.cloneElement(child as React.ReactElement<any>, {
                                        isSelected: child.props.value === value,
                                        onClick: () => {
                                            if (onChange) {
                                                onChange({ target: { value: child.props.value } });
                                            }
                                            setIsOpen(false);
                                        },
                                    });
                                }
                                return child;
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export function SelectItem({ value, children, isSelected, onClick }: any) {
    return (
        <div
            onClick={onClick}
            className={cn(
                "group relative flex w-full cursor-pointer select-none items-center rounded-[12px] py-3 pl-4 pr-9 text-sm font-bold transition-all duration-200",
                isSelected
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-200/40"
                    : "text-slate-600 hover:bg-slate-50 hover:text-indigo-600"
            )}
        >
            <span className="truncate">{children}</span>
            {isSelected && (
                <span className="absolute right-3 flex items-center justify-center">
                    <Check className="size-4 stroke-[3]" />
                </span>
            )}
        </div>
    );
}

// Keep these for compatibility if needed, though Select does most of the work now
export function SelectTrigger({ children, className = "", ...props }: any) {
    return <div className={cn("flex items-center justify-between", className)} {...props}>{children}</div>;
}

export function SelectValue({ placeholder }: any) {
    return <span>{placeholder}</span>;
}

export function SelectContent({ children }: any) {
    return <>{children}</>;
}
