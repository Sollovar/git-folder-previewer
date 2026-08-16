import { useEffect, useRef, useState } from "react";
import { Search, Star } from "lucide-react";

import { markets } from "@/components/MarketSelector";

const TABS = ["Favorites", "Futures", "Spot", "Prediction"];
const FILTERS = [
  "All markets",
  "Top",
  "New",
  "Meme",
  "AI",
  "Pre-launch",
  "Stocks",
  "Commodities",
  "ETF",
  "Semiconductor",
  "Listing Vote",
];

/** Deterministic funding-rate display value per symbol (presentation only). */
function fundingRate(symbol: string) {
  let h = 0;
  for (const c of symbol) h = (h * 31 + c.charCodeAt(0)) % 1000;
  const v = (h % 90) / 10000 - 0.005;
  return `${v >= 0 ? "" : "-"}${Math.abs(v).toFixed(4)}%`;
}

/**
 * Aster-style desktop pair selector. Anchored to the market header, it keeps
 * its width within the chart column and supports keyboard navigation with the
 * up/down arrow keys to scroll through pairs.
 */
export function DesktopMarketSelector({
  open,
  onClose,
  onSelect,
  current,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (symbol: string) => void;
  current: string;
}) {
  const [tab, setTab] = useState("Futures");
  const [filter, setFilter] = useState("All markets");
  const [query, setQuery] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const rows = markets.filter((m) => m.symbol.toLowerCase().includes(query.toLowerCase()));

  // Reset highlight on open and clamp it when the filtered list changes.
  useEffect(() => {
    if (!open) return;
    setQuery("");
    const start = current ? markets.findIndex((m) => m.symbol === current) : 0;
    setHighlightedIndex(start >= 0 ? start : 0);
  }, [open, current]);

  useEffect(() => {
    setHighlightedIndex((i) => Math.max(0, Math.min(i, rows.length - 1)));
  }, [rows.length]);

  // Keyboard navigation: Down/Up scroll the highlight, Enter selects, Esc closes.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlightedIndex((i) => Math.min(i + 1, rows.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter") {
        const row = rows[highlightedIndex];
        if (row) {
          e.preventDefault();
          onSelect(row.symbol);
          onClose();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, highlightedIndex, rows]);

  // Scroll the highlighted row into view as the user arrows through the list.
  useEffect(() => {
    const el = rowRefs.current[highlightedIndex];
    if (el) el.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [highlightedIndex]);

  if (!open) return null;

  return (
    <>
      <button
        aria-label="Close pair selector"
        onClick={onClose}
        className="fixed inset-0 z-40 cursor-default bg-foreground/20"
      />
      <div
        ref={panelRef}
        className="absolute left-0 top-[calc(100%+6px)] z-50 w-full overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
      >
        <div className="px-4 pt-4">
          <div className="flex items-center gap-3 rounded-xl bg-secondary px-4 py-2.5">
            <Search className="size-4 text-muted-foreground" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search"
              className="w-full bg-transparent text-[14px] outline-none placeholder:text-muted-foreground"
            />
          </div>
        </div>

        <div className="mt-3 flex items-center gap-6 border-b border-border px-4">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`relative -mb-px whitespace-nowrap border-b-2 pb-2.5 text-[13.5px] ${
                tab === t
                  ? "border-primary font-medium text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t}
              {t === "Prediction" ? (
                <span className="ml-1.5 inline-block size-1.5 rounded-full bg-ask align-middle" />
              ) : null}
            </button>
          ))}
        </div>

        <div className="no-scrollbar flex items-center gap-2 overflow-x-auto px-4 py-2.5">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-[12.5px] ${
                filter === f
                  ? "bg-secondary font-medium text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-[minmax(0,1.4fr)_repeat(5,minmax(0,1fr))] items-center px-4 pb-2 text-[12.5px] text-muted-foreground">
          <span>Symbols</span>
          <span className="block min-w-0 truncate text-right">Last price</span>
          <span className="block min-w-0 truncate text-right">24h change</span>
          <span className="block min-w-0 truncate text-right">Funding Rate</span>
          <span className="block min-w-0 truncate text-right">Volume</span>
          <span className="block min-w-0 truncate text-right">Open interest</span>
        </div>

        <div className="no-scrollbar max-h-[430px] overflow-y-auto pb-3">
          {rows.map((m, i) => (
            <button
              key={m.symbol}
              ref={(el) => { rowRefs.current[i] = el; }}
              onClick={() => {
                onSelect(m.symbol);
                onClose();
              }}
              onMouseEnter={() => setHighlightedIndex(i)}
              className={`grid w-full min-w-0 grid-cols-[minmax(0,1.4fr)_repeat(5,minmax(0,1fr))] items-center px-4 py-2.5 text-left transition-colors ${
                i === highlightedIndex ? "bg-secondary/80" : ""
              } ${m.symbol === current ? "bg-secondary/50" : "hover:bg-secondary/70"}`}
            >
              <span className="flex items-center gap-2">
                <Star
                  className={`size-4 shrink-0 ${
                    m.fav ? "fill-primary text-primary" : "text-muted-foreground"
                  }`}
                />
                <span
                  className={`flex size-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${m.iconClass}`}
                >
                  {m.icon}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[13.5px] leading-tight">{m.symbol}</span>
                  <span className="mt-1 inline-block rounded bg-secondary px-1.5 py-px font-num text-[10.5px] leading-tight text-muted-foreground">
                    {m.lev}
                  </span>
                </span>
              </span>
              <span className="block min-w-0 truncate text-right font-num text-[13px] tabular-nums">
                {m.price}
              </span>
              <span
                className={`block min-w-0 truncate text-right font-num text-[13px] tabular-nums ${
                  m.up ? "text-bid" : "text-ask"
                }`}
              >
                {m.change}
              </span>
              <span className="block min-w-0 truncate text-right font-num text-[13px] tabular-nums">
                {fundingRate(m.symbol)}
              </span>
              <span className="block min-w-0 truncate text-right font-num text-[13px] tabular-nums">
                {m.volume}
              </span>
              <span className="block min-w-0 truncate text-right font-num text-[13px] tabular-nums">
                {m.openInterest}
              </span>
            </button>
          ))}
          {rows.length === 0 ? (
            <p className="px-4 py-8 text-center text-[13.5px] text-muted-foreground">
              No markets found
            </p>
          ) : null}
        </div>
      </div>
    </>
  );
}
