"use client";

import { DayPicker, type DayPickerProps } from "react-day-picker";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

type CalendarProps = DayPickerProps;

function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-4", className)}
      classNames={{
        root: "w-fit",
        months: "flex flex-col sm:flex-row gap-4",
        month: "flex flex-col gap-4",
        month_caption: "flex justify-center items-center relative h-7",
        caption_label: "text-sm font-bold text-slate-700",
        nav: "absolute inset-x-0 flex justify-between items-center px-0",
        button_previous:
          "size-7 flex items-center justify-center rounded-xl border border-slate-200 bg-white hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 transition-colors",
        button_next:
          "size-7 flex items-center justify-center rounded-xl border border-slate-200 bg-white hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 transition-colors",
        month_grid: "w-full border-collapse",
        weekdays: "flex",
        weekday: "text-slate-400 w-9 font-semibold text-[0.75rem] text-center",
        weeks: "w-full",
        week: "flex w-full mt-1",
        day: "relative p-0 text-center",
        day_button: cn(
          "size-9 p-0 font-medium text-slate-700 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
        ),
        selected:
          "[&>button]:bg-indigo-600 [&>button]:text-white [&>button]:hover:bg-indigo-700 [&>button]:hover:text-white [&>button]:rounded-xl",
        today: "[&>button]:bg-slate-100 [&>button]:text-slate-900 [&>button]:font-black",
        outside: "[&>button]:text-slate-300",
        disabled: "[&>button]:text-slate-300 [&>button]:opacity-50",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) =>
          orientation === "left" ? (
            <ChevronLeft className="size-4" />
          ) : (
            <ChevronRight className="size-4" />
          ),
      }}
      {...props}
    />
  );
}

export { Calendar };
