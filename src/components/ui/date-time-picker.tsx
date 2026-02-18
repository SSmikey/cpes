"use client";

import { useState } from "react";
import { CalendarIcon, ClockIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Calendar } from "./calendar";
import { cn } from "@/lib/utils";

interface DateTimePickerProps {
  value: string; // ISO string or ""
  onChange: (value: string) => void;
  className?: string;
}

function formatDisplay(value: string) {
  if (!value) return null;
  const d = new Date(value);
  if (isNaN(d.getTime())) return null;
  return d;
}

export function DateTimePicker({ value, onChange, className }: DateTimePickerProps) {
  const [open, setOpen] = useState(false);
  const selected = formatDisplay(value);

  const [timeH, setTimeH] = useState(() => {
    if (selected) return selected.getHours().toString().padStart(2, "0");
    return "00";
  });
  const [timeM, setTimeM] = useState(() => {
    if (selected) return selected.getMinutes().toString().padStart(2, "0");
    return "00";
  });

  const handleSelectDay = (day: Date | undefined) => {
    if (!day) return;
    const d = new Date(day);
    d.setHours(parseInt(timeH, 10));
    d.setMinutes(parseInt(timeM, 10));
    d.setSeconds(0);
    onChange(d.toISOString().slice(0, 16));
  };

  const handleTimeChange = (h: string, m: string) => {
    setTimeH(h);
    setTimeM(m);
    if (selected) {
      const d = new Date(selected);
      d.setHours(parseInt(h, 10));
      d.setMinutes(parseInt(m, 10));
      d.setSeconds(0);
      onChange(d.toISOString().slice(0, 16));
    }
  };

  const displayText = selected
    ? `${selected.getDate()} ${[
        "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
        "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค.",
      ][selected.getMonth()]} ${selected.getFullYear() + 543} ${timeH}:${timeM} น.`
    : null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "h-12 w-full flex items-center gap-3 px-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-left transition-all",
            "hover:border-indigo-300 hover:bg-indigo-50/50 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100",
            displayText ? "text-slate-700" : "text-slate-300",
            className
          )}
        >
          <CalendarIcon className="size-4 text-indigo-400 shrink-0" />
          <span className="flex-1 text-sm">
            {displayText ?? "เลือกวันที่และเวลา"}
          </span>
        </button>
      </PopoverTrigger>

      <PopoverContent className="w-auto" align="start">
        <Calendar
          mode="single"
          selected={selected ?? undefined}
          onSelect={handleSelectDay}
          initialFocus
        />

        {/* Time picker */}
        <div className="border-t border-slate-100 px-4 pb-4 pt-3 flex items-center gap-2">
          <ClockIcon className="size-4 text-indigo-400 shrink-0" />
          <div className="flex items-center gap-1 flex-1">
            <select
              value={timeH}
              onChange={(e) => handleTimeChange(e.target.value, timeM)}
              className="flex-1 h-9 rounded-xl border border-slate-200 bg-slate-50 text-center text-sm font-bold text-slate-700 focus:outline-none focus:border-indigo-400 cursor-pointer"
            >
              {Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0")).map((h) => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
            <span className="text-slate-400 font-black">:</span>
            <select
              value={timeM}
              onChange={(e) => handleTimeChange(timeH, e.target.value)}
              className="flex-1 h-9 rounded-xl border border-slate-200 bg-slate-50 text-center text-sm font-bold text-slate-700 focus:outline-none focus:border-indigo-400 cursor-pointer"
            >
              {["00","05","10","15","20","25","30","35","40","45","50","55"].map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <span className="text-slate-500 text-sm font-bold ml-1">น.</span>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="ml-2 h-9 px-3 rounded-xl bg-indigo-600 text-white text-xs font-black hover:bg-indigo-700 transition-colors"
          >
            ตกลง
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
