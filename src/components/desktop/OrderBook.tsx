import { useEffect, useMemo, useRef, useState } from "react";
import { AlignJustify, Columns2, Rows3, ChevronDown } from "lucide-react";

import { getMarketPrice, getTickOptions } from "@/lib/tick-size";
import { useTicker } from "@/hooks/use-ticker";

type Level = { price: number; size: number; total: number };

function buildSide(base: number, tick: number, side: "ask" | "bid", rows: number): Level[] {
  let total = 0;
  return Array.from({ length: rows }, (_, i) => {
    const price = side === "ask" ? base + tick * (rows - i) : base - tick * (i + 1);
    const size = 8_000 + Math.random() * 340_000;
    total += size;
    return { price, size, total };
  });
}

function fmt(n: number, d: number) {
  return n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
}

function compact(n: number) {
  if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(2)}K`;
  return n.toFixed(2);
}

const ROWS = 11;

/** Dense order book / trades panel with depth bars behind each row. */
export function OrderBook({ symbol }: { symbol: string }) {
  const [tab, setTab] = useState<"book" | "trades">("book");
  const [mode, setMode] = useState<"both" | "bids" | "asks">("both");
  const tickOptions = useMemo(() => getTickOptions(symbol), [symbol]);
  const [tickIndex, setTickIndex] = useState(0);
  const tick = Number(tickOptions[tickIndex] ?? "0.1") || 0.1;

  const ticker = useTicker(symbol);
  const last = ticker?.last && ticker.last > 0 ? ticker.last : getMarketPrice(symbol);
  const precision = ticker?.pricePrecision ?? (last >= 100 ? 1 : 3);
  const lastRef = useRef(last);

  const [asks, setAsks] = useState<Level[]>([]);
  const [bids, setBids] = useState<Level[]>([]);
  const [trades, setTrades] = useState<{ price: number; size: number; t: string; up: boolean }[]>(
    [],
  );
  const [up, setUp] = useState(true);

  useEffect(() => {
    const build = () => {
      const base = lastRef.current;
      setAsks(buildSide(base, tick, "ask", ROWS));
      setBids(buildSide(base, tick, "bid", ROWS));
      setTrades((prev) => {
        const isUp = Math.random() > 0.5;
        const row = {
          price: base + (Math.random() - 0.5) * tick * 4,
          size: 2_000 + Math.random() * 90_000,
          t: new Date().toLocaleTimeString("en-GB"),
          up: isUp,
        };
        return [row, ...prev].slice(0, 24);
      });
      setUp(Math.random() > 0.45);
    };
    build();
    const id = setInterval(build, 1100);
    return () => clearInterval(id);
  }, [tick]);

  useEffect(() => {
    lastRef.current = last;
  }, [last]);

  const maxTotal = Math.max(
    asks[0]?.total ?? 1,
    bids[bids.length - 1]?.total ?? 1,
  );

  const Row = ({ level, side }: { level: Level; side: "ask" | "bid" }) => (
    <div className="relative grid grid-cols-[1fr_1fr_1fr] items-center px-2 py-[2.5px] font-num text-[11px] tabular-nums hover:bg-secondary/70">
      <span
        aria-hidden
        className={`absolute inset-y-0 right-0 ${side === "ask" ? "bg-ask-fill" : "bg-bid-fill"}`}
        style={{ width: `${Math.min(100, (level.total / maxTotal) * 100)}%` }}
      />
      <span className={`relative ${side === "ask" ? "text-ask" : "text-bid"}`}>
        {fmt(level.price, precision)}
      </span>
      <span className="relative text-right text-foreground/80">{compact(level.size)}</span>
      <span className="relative text-right text-muted-foreground">{compact(level.total)}</span>
    </div>
  );

  const visibleAsks = mode === "bids" ? [] : asks;
  const visibleBids = mode === "asks" ? [] : bids;

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card">
      {/* tabs */}
      <div className="flex h-9 shrink-0 items-center border-b border-border">
        {(["book", "trades"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`relative h-full flex-1 text-[12.5px] transition-colors ${
              tab === t ? "font-semibold text-foreground" : "text-muted-foreground"
            }`}
          >
            {t === "book" ? "Order Book" : "Trades"}
            {tab === t && (
              <span className="absolute inset-x-4 bottom-0 h-[2px] rounded-full bg-primary" />
            )}
          </button>
        ))}
      </div>

      {/* controls */}
      <div className="flex h-8 shrink-0 items-center gap-1 border-b border-border px-2">
        <button
          aria-label="Show both sides"
          onClick={() => setMode("both")}
          className={`rounded p-1 ${mode === "both" ? "bg-secondary text-foreground" : "text-muted-foreground"}`}
        >
          <Rows3 className="size-3.5" />
        </button>
        <button
          aria-label="Bids only"
          onClick={() => setMode("bids")}
          className={`rounded p-1 ${mode === "bids" ? "bg-secondary text-foreground" : "text-muted-foreground"}`}
        >
          <Columns2 className="size-3.5" />
        </button>
        <button
          aria-label="Asks only"
          onClick={() => setMode("asks")}
          className={`rounded p-1 ${mode === "asks" ? "bg-secondary text-foreground" : "text-muted-foreground"}`}
        >
          <AlignJustify className="size-3.5" />
        </button>

        <div className="ml-auto flex items-center gap-1">
          <button
            onClick={() => setTickIndex((i) => (i + 1) % Math.max(1, tickOptions.length))}
            className="flex items-center gap-0.5 rounded px-1.5 py-0.5 font-num text-[11.5px] text-muted-foreground hover:bg-secondary"
          >
            {tickOptions[tickIndex] ?? "0.1"}
            <ChevronDown className="size-3" />
          </button>
          <button className="flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[11.5px] text-muted-foreground hover:bg-secondary">
            USDT
            <ChevronDown className="size-3" />
          </button>
        </div>
      </div>

      {tab === "book" ? (
        <div className="flex flex-1 flex-col">
          <div className="grid shrink-0 grid-cols-[1fr_1fr_1fr] px-2 py-1 text-[10.5px] text-muted-foreground">
            <span>Price (USDT)</span>
            <span className="text-right">Size (USDT)</span>
            <span className="text-right">Total (USDT)</span>
          </div>

          <div className="flex flex-col">
            {visibleAsks.map((l, i) => (
              <Row key={`a${i}`} level={l} side="ask" />
            ))}
          </div>

          <div className="flex shrink-0 items-center justify-between border-y border-border bg-secondary/60 px-2 py-1.5">
            <span
              className={`font-num text-[15px] font-semibold tabular-nums ${up ? "text-bid" : "text-ask"}`}
            >
              {fmt(last, precision)}
            </span>
            <span className="font-num text-[11px] text-muted-foreground">
              {fmt(ticker?.markPrice ?? last, precision)}
            </span>
          </div>

          <div className="flex flex-col">
            {visibleBids.map((l, i) => (
              <Row key={`b${i}`} level={l} side="bid" />
            ))}
          </div>
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="grid shrink-0 grid-cols-[1fr_1fr_1fr] px-2 py-1 text-[10.5px] text-muted-foreground">
            <span>Price (USDT)</span>
            <span className="text-right">Size (USDT)</span>
            <span className="text-right">Time</span>
          </div>
          <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto">
            {trades.map((t, i) => (
              <div
                key={i}
                className="grid grid-cols-[1fr_1fr_1fr] px-2 py-[2.5px] font-num text-[11px] tabular-nums"
              >
                <span className={t.up ? "text-bid" : "text-ask"}>{fmt(t.price, precision)}</span>
                <span className="text-right text-foreground/80">{compact(t.size)}</span>
                <span className="text-right text-muted-foreground">{t.t}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
