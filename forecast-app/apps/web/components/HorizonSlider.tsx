"use client";

import * as Slider from "@radix-ui/react-slider";

interface HorizonSliderProps {
  value: number;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

export function HorizonSlider({ value, onChange, min = 0, max = 48, step = 1 }: HorizonSliderProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-400">Forecast Horizon</span>
        <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 font-mono text-emerald-400 text-sm">
          {value}h
        </span>
      </div>
      <Slider.Root
        className="relative flex h-5 w-full touch-none select-none items-center"
        value={[value]}
        onValueChange={(values) => { if (values[0] !== undefined) onChange(values[0]); }}
        min={min}
        max={max}
        step={step}
      >
        <Slider.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-white/10">
          <Slider.Range className="absolute h-full bg-gradient-to-r from-emerald-600 to-emerald-400" />
        </Slider.Track>
        <Slider.Thumb
          className="block h-4 w-4 rounded-full border-2 border-emerald-400 bg-slate-900 shadow-lg ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2"
          aria-label="Forecast horizon"
        />
      </Slider.Root>
      <div className="flex justify-between text-xs text-slate-500">
        <span>{min}h</span>
        <span>{max}h</span>
      </div>
    </div>
  );
}
