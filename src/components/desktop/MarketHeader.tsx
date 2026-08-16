import { useEffect, useState } from "react";
import { ChevronDown, Star } from "lucide-react";

import { DesktopMarketSelector } from "@/components/desktop/DesktopMarketSelector";
import { usePair } from "@/hooks/use-pair";
import {
  useTicker,
  formatPrice,
  formatCompact,
  formatCountdown,
} from "@/hooks/use-ticker";
import { getMarketPrice } from "@/lib/tick-size";

function Stat({ label, value, mono = true }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex min-w-0 flex-col justify-center px-4">
      <span className="truncate text-[10.5px] leading-tight text-muted-foreground">{label}</span>
      <span
        className={`truncate text-[12.5px] leading-tight font-medium tabular-nums ${
          mono ? "font-num" : ""
        }`}
      >
        {value}
      </span>
    </div>
  );
}

/** Dense market information bar sitting directly under the top navigation. */
export function MarketHeader() {
  const [pair, setPair] = usePair();
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [starred, setStarred] = useState(false);
  const [, setNow] = useState(0);

  const ticker = useTicker(pair);
  const last = ticker?.last && ticker.last > 0 ? ticker.last : getMarketPrice(pair);
  const precision = ticker?.pricePrecision ?? (last >= 100 ? 1 : 3);
  const change = ticker?.changePercent ?? 0;
  const up = change >= 0;

  useEffect(() => {
    const id = setInterval(() => setNow((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative flex h-16 shrink-0 items-stretch rounded-xl border border-border bg-card px-2">
      <DesktopMarketSelector
        open={selectorOpen}
        onClose={() => setSelectorOpen(false)}
        onSelect={setPair}
        current={pair}
      />

      <button
        onClick={() => setSelectorOpen(true)}
        aria-label="Select market"
        className="flex shrink-0 items-center gap-2 px-3 text-left hover:bg-secondary/60"
      >
        <span className="flex size-7 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
          {pair.replace(/USDT$/, "").slice(0, 3)}
        </span>
        <span className="flex flex-col">
          <span className="flex items-center gap-1.5">
            <h1 className="text-[15px] font-semibold leading-none">{pair}</h1>
            <span className="rounded bg-secondary px-1.5 py-px text-[10px] text-muted-foreground">
              Perp
            </span>
            <ChevronDown className="size-3.5 text-muted-foreground" />
          </span>
          <span
            className={`mt-1 flex items-center gap-2 font-num text-[12.5px] leading-none ${
              up ? "text-bid" : "text-ask"
            }`}
          >
            {formatPrice(last, precision)}
            <span>
              {up ? "+" : ""}
              {change.toFixed(2)}%
            </span>
          </span>
        </span>
      </button>

      <span className="my-3 w-px shrink-0 bg-border" />

      <div className="no-scrollbar flex min-w-0 flex-1 items-stretch overflow-x-auto">
        <Stat label="Mark" value={formatPrice(ticker?.markPrice ?? last, precision)} />
        <Stat label="Index" value={formatPrice(ticker?.indexPrice ?? last, precision)} />
        <Stat
          label="Funding (8h) / Countdown"
          value={`${((ticker?.fundingRate ?? 0) * 100).toFixed(4)}% / ${formatCountdown(
            ticker?.nextFundingTime,
          )}`}
        />
        <Stat label="24h Volume (USDT)" value={formatCompact(ticker?.quoteVolume)} />
        <Stat label="Open Interest (USDT)" value={formatCompact((ticker?.quoteVolume ?? 0) / 14)} />
        <Stat label="24h High" value={formatPrice(ticker?.high ?? last, precision)} />
        <Stat label="24h Low" value={formatPrice(ticker?.low ?? last, precision)} />
      </div>

      <button
        aria-label="Add to favourites"
        onClick={() => setStarred((s) => !s)}
        className="shrink-0 px-3 text-muted-foreground hover:text-foreground"
      >
        <Star className={`size-4 ${starred ? "fill-primary text-primary" : ""}`} />
      </button>
    </div>
  );
}
