"use client";

import { useState, useEffect } from "react";
import { format, startOfDay, isAfter, isBefore } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, ArrowRight } from "lucide-react";

interface DateRangePickerProps {
  from: Date;
  to: Date;
  onChange: (from: Date, to: Date) => void;
  minDate?: Date;
  maxDate?: Date;
}

function SingleDatePicker({
  label,
  value,
  onChange,
  minDate,
  maxDate,
}: {
  label: string;
  value: Date;
  onChange: (d: Date) => void;
  minDate?: Date;
  maxDate?: Date;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="flex items-center gap-2 w-full rounded-xl border border-white/15 bg-white/8 px-3 py-2.5 text-sm text-white hover:bg-white/15 hover:border-emerald-500/50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
        >
          <CalendarIcon className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
          <span className="text-left flex-1">
            <span className="block text-[10px] font-medium uppercase tracking-widest text-slate-400 leading-tight">
              {label}
            </span>
            <span className="font-medium text-white">
              {format(value, "dd MMM yyyy")}
            </span>
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto border border-white/15 bg-slate-900/95 backdrop-blur-sm p-0 shadow-2xl shadow-black/50"
        align="start"
        sideOffset={8}
      >
        <Calendar
          mode="single"
          selected={value}
          onSelect={(d) => {
            if (d) { onChange(d); setOpen(false); }
          }}
          defaultMonth={value}
          disabled={(date: Date) => {
            if (minDate && isBefore(date, startOfDay(minDate))) return true;
            if (maxDate && isAfter(date, startOfDay(maxDate))) return true;
            return false;
          }}
          className="rounded-md border-0 text-white"
        />
      </PopoverContent>
    </Popover>
  );
}

export function DateRangePicker({ from, to, onChange, minDate, maxDate }: DateRangePickerProps) {
  const [startDate, setStartDate] = useState(from);
  const [endDate, setEndDate] = useState(to);


  useEffect(() => { setStartDate(from); }, [from]);
  useEffect(() => { setEndDate(to); }, [to]);

  const handleStartChange = (d: Date) => {
    const newStart = startOfDay(d);
    const newEnd = isAfter(newStart, endDate) ? newStart : endDate;
    setStartDate(newStart);
    setEndDate(newEnd);
    onChange(newStart, newEnd);
  };

  const handleEndChange = (d: Date) => {
    const newEnd = startOfDay(d);
    const newStart = isBefore(newEnd, startDate) ? newEnd : startDate;
    setStartDate(newStart);
    setEndDate(newEnd);
    onChange(newStart, newEnd);
  };

  return (
    <div className="flex items-center gap-2">
      <SingleDatePicker
        label="Start Date"
        value={startDate}
        onChange={handleStartChange}
        minDate={minDate}
        maxDate={maxDate}
      />
      <ArrowRight className="h-4 w-4 text-slate-500 shrink-0" />
      <SingleDatePicker
        label="End Date"
        value={endDate}
        onChange={handleEndChange}
        minDate={minDate}
        maxDate={maxDate}
      />
    </div>
  );
}
