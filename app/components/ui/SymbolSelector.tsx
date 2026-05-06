import { useEffect, useRef, useState } from "react";
import { fetchApi } from "../../services/api";

interface SymbolSelectorProps {
  value: string;
  onChange: (symbol: string) => void;
  disabled?: boolean;
  /** Extra classes on the outer wrapper */
  className?: string;
}

/**
 * Searchable symbol dropdown that:
 *  1. On mount fetches GET /symbols from the backend (MT5-backed or config fallback)
 *  2. Filters client-side as the user types
 *  3. On selection shows a live bid/ask preview via GET /symbols/{name}/tick
 */
export function SymbolSelector({ value, onChange, disabled = false, className = "" }: SymbolSelectorProps) {
  const [symbols, setSymbols] = useState<string[]>([]);
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const [tick, setTick] = useState<{ bid: number; ask: number } | null>(null);
  const [loadingTick, setLoadingTick] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Fetch symbol list once
  useEffect(() => {
    fetchApi<string[]>("symbols")
      .then((data) => setSymbols(data || []))
      .catch(() => setSymbols(["EURUSD", "GBPUSD", "USDJPY"]));
  }, []);

  // Sync query when value changes externally
  useEffect(() => { setQuery(value); }, [value]);

  // Live tick preview on selection
  useEffect(() => {
    if (!value) return;
    setLoadingTick(true);
    setTick(null);
    fetchApi<{ bid: number; ask: number }>(`symbols/${value}/tick`)
      .then((data) => setTick(data))
      .catch(() => setTick(null))
      .finally(() => setLoadingTick(false));
  }, [value]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = symbols.filter((s) =>
    s.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 30);

  const select = (sym: string) => {
    onChange(sym);
    setQuery(sym);
    setOpen(false);
  };

  return (
    <div ref={wrapRef} className={`relative flex flex-col gap-1.5 ${className}`}>
      <label className="text-xs text-gray-400 uppercase tracking-wider">Symbol</label>

      <div className="relative">
        <input
          value={query}
          disabled={disabled}
          onChange={(e) => {
            setQuery(e.target.value.toUpperCase());
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="EURUSD"
          className="w-36 bg-gray-900/50 border border-white/10 px-3 py-2 rounded-lg text-sm text-white font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/60 disabled:opacity-50 pr-7"
        />
        {/* Caret icon */}
        <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 text-xs">▾</span>
      </div>

      {/* Live tick preview */}
      {value && (
        <div className="flex gap-3 text-xs font-mono">
          {loadingTick ? (
            <span className="text-gray-500">Loading…</span>
          ) : tick ? (
            <>
              <span className="text-emerald-400">B {tick.bid.toFixed(5)}</span>
              <span className="text-rose-400">A {tick.ask.toFixed(5)}</span>
            </>
          ) : null}
        </div>
      )}

      {/* Dropdown */}
      {open && filtered.length > 0 && (
        <div className="absolute top-full left-0 mt-1 z-50 w-48 max-h-56 overflow-y-auto rounded-xl border border-white/10 bg-gray-900 shadow-2xl">
          {filtered.map((sym) => (
            <button
              key={sym}
              type="button"
              onMouseDown={() => select(sym)}
              className={`w-full text-left px-4 py-2 text-sm font-mono transition-colors ${sym === value
                  ? "bg-emerald-500/20 text-emerald-300"
                  : "text-gray-200 hover:bg-white/5 hover:text-white"
                }`}
            >
              {sym}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
