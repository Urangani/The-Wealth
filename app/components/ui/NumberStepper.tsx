import React from "react";

interface NumberStepperProps {
  label?: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
  min?: number;
  max?: number;
  disabled?: boolean;
  className?: string;
  /** Extra classes applied to the outer wrapper */
  wrapperClassName?: string;
}

/**
 * A themed +/- stepper that replaces browser-native number spinners.
 * The global CSS reset in app.css hides the OS arrows; this component
 * provides its own styled increment/decrement buttons that match the
 * dark dashboard palette.
 */
export function NumberStepper({
  label,
  value,
  onChange,
  step = 0.01,
  min,
  max,
  disabled = false,
  className = "",
  wrapperClassName = "",
}: NumberStepperProps) {
  const precision = step.toString().split(".")[1]?.length ?? 0;

  const clamp = (v: number) => {
    let r = v;
    if (min !== undefined) r = Math.max(min, r);
    if (max !== undefined) r = Math.min(max, r);
    return parseFloat(r.toFixed(precision));
  };

  const decrement = () => onChange(clamp(value - step));
  const increment = () => onChange(clamp(value + step));

  const btnBase =
    "flex items-center justify-center w-8 h-8 rounded-md text-sm font-bold transition-all duration-150 select-none " +
    "border border-white/10 bg-white/5 text-gray-300 " +
    "hover:bg-white/10 hover:text-white hover:border-white/20 " +
    "active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed";

  return (
    <div className={`flex flex-col gap-1.5 ${wrapperClassName}`}>
      {label && (
        <label className="text-xs text-gray-400 uppercase tracking-wider">
          {label}
        </label>
      )}
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={decrement}
          disabled={disabled || (min !== undefined && value <= min)}
          className={btnBase}
          aria-label="Decrease"
        >
          −
        </button>

        <input
          type="number"
          value={value}
          step={step}
          min={min}
          max={max}
          disabled={disabled}
          onChange={(e) => {
            const v = parseFloat(e.target.value);
            if (!isNaN(v)) onChange(clamp(v));
          }}
          className={`w-20 text-center bg-gray-900/50 border border-white/10 px-2 py-1.5 rounded-lg text-sm text-white font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/60 disabled:opacity-50 ${className}`}
        />

        <button
          type="button"
          onClick={increment}
          disabled={disabled || (max !== undefined && value >= max)}
          className={btnBase}
          aria-label="Increase"
        >
          +
        </button>
      </div>
    </div>
  );
}
