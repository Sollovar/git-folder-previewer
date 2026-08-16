import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Plus } from "lucide-react";
import { toast } from "sonner";

import { ConnectButton } from "@/components/ConnectButton";
import { useWallet } from "@/hooks/use-wallet";
import { useTicker } from "@/hooks/use-ticker";
import { getMarketPrice } from "@/lib/tick-size";

const TABS = ["Market", "Limit", "Stop Limit"] as const;
const PERCENTS = [0, 25, 50, 75, 100];

function sanitize(v: string): string {
  const cleaned = v.replace(/[^\d.]/g, "");
  const parts = cleaned.split(".");
  return parts.length > 2 ? `${parts[0]}.${parts.slice(1).join("")}` : cleaned;
}

function Check({
  label,
  checked,
  onChange,
  trailing,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  trailing?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between py-[3px]">
      <button
        onClick={() => onChange(!checked)}
        className="flex items-center gap-2 text-[12px] text-muted-foreground hover:text-foreground"
      >
        <span
          className={`flex size-3.5 items-center justify-center rounded-[4px] border ${
            checked ? "border-primary bg-primary" : "border-border"
          }`}
        >
          {checked && <span className="size-1.5 rounded-[1px] bg-primary-foreground" />}
        </span>
        {label}
      </button>
      {trailing}
    </div>
  );
}

/** Order entry / trading panel on the far right of the terminal. */
export function OrderEntry({ symbol }: { symbol: string }) {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Limit");
  const [margin, setMargin] = useState<"Cross" | "Isolated">("Cross");
  const [leverage, setLeverage] = useState(20);
  const [price, setPrice] = useState("");
  const [priceTouched, setPriceTouched] = useState(false);
  const [size, setSize] = useState("");
  const [pct, setPct] = useState(0);
  const [tpsl, setTpsl] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [reduceOnly, setReduceOnly] = useState(false);

  const { authenticated } = useWallet();
  const ticker = useTicker(symbol);
  const last = ticker?.last && ticker.last > 0 ? ticker.last : getMarketPrice(symbol);
  const precision = ticker?.pricePrecision ?? (last >= 100 ? 1 : 3);

  useEffect(() => {
    if (!priceTouched) setPrice(last.toFixed(precision));
  }, [last, precision, priceTouched]);

  const effPrice = tab === "Market" ? last : Number(price) || last;
  const orderValue = useMemo(() => (Number(size) || 0), [size]);

  return (
    <div className="flex h-[538px] max-h-[calc(100vh-53px)] flex-col overflow-hidden rounded-xl border border-border bg-card">
      {/* order type tabs */}
      <div className="flex h-9 shrink-0 items-center border-b border-border">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`relative h-full flex-1 text-[12.5px] transition-colors ${
              tab === t ? "font-semibold text-foreground" : "text-muted-foreground"
            }`}
          >
            {t}
            {tab === t && (
              <span className="absolute inset-x-3 bottom-0 h-[2px] rounded-full bg-primary" />
            )}
          </button>
        ))}
      </div>

      <div className="no-scrollbar flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto p-2">
        {/* available balance */}
        <div className="flex items-center gap-1.5 text-[12px]">
          <span className="text-muted-foreground">Avbl</span>
          <span className="font-num tabular-nums">0.00 USDT</span>
          <button
            aria-label="Deposit"
            onClick={() => toast.info("Deposits open once your wallet is connected.")}
            className="ml-auto flex size-4 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground"
          >
            <Plus className="size-3" />
          </button>
        </div>

        {/* margin + leverage */}
        <div className="grid grid-cols-3 gap-1.5">
          <button
            onClick={() => setMargin((m) => (m === "Cross" ? "Isolated" : "Cross"))}
            className="rounded-lg border border-border bg-secondary py-1.5 text-[12px]"
          >
            {margin}
          </button>
          <button
            onClick={() => setLeverage((l) => (l >= 50 ? 5 : l + 5))}
            className="rounded-lg border border-border bg-secondary py-1.5 font-num text-[12px]"
          >
            {leverage}x
          </button>
          <button className="rounded-lg border border-border bg-secondary py-1.5 text-[12px]">
            M
          </button>
        </div>

        {/* price */}
        <div className="rounded-lg border border-border bg-secondary px-2.5 py-1.5">
          <div className="flex items-baseline justify-between">
            <span className="text-[10.5px] text-muted-foreground">
              {tab === "Market" ? "Market price" : "Order price"}
            </span>
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <span>USDT</span>
              <button
                onClick={() => {
                  setPrice(last.toFixed(precision));
                  setPriceTouched(false);
                }}
                className="border-b border-dashed border-muted-foreground/60 hover:text-foreground"
              >
                BBO
              </button>
            </div>
          </div>
          <input
            inputMode="decimal"
            value={tab === "Market" ? "" : price}
            placeholder={tab === "Market" ? "Market" : ""}
            disabled={tab === "Market"}
            onChange={(e) => {
              setPriceTouched(true);
              setPrice(sanitize(e.target.value));
            }}
            className="w-full bg-transparent font-num text-[14px] tabular-nums outline-none placeholder:text-muted-foreground"
          />
        </div>

        {/* size */}
        <div className="rounded-lg border border-border bg-secondary px-2.5 py-1.5">
          <div className="flex items-center justify-between">
            <input
              inputMode="decimal"
              value={size}
              placeholder="Size"
              onChange={(e) => setSize(sanitize(e.target.value))}
              className="w-full bg-transparent font-num text-[14px] tabular-nums outline-none placeholder:text-muted-foreground"
            />
            <button className="flex shrink-0 items-center gap-0.5 text-[11.5px] text-muted-foreground">
              USDT
              <ChevronDown className="size-3" />
            </button>
          </div>
        </div>

        {/* percentage slider */}
        <div className="px-0.5 pt-1 pb-2">
          <div className="relative flex h-4 items-center">
            <span className="absolute inset-x-0 h-[3px] rounded-full bg-border" />
            <span
              className="absolute h-[3px] rounded-full bg-primary"
              style={{ width: `${pct}%` }}
            />
            {PERCENTS.map((p) => (
              <button
                key={p}
                aria-label={`${p}%`}
                onClick={() => setPct(p)}
                className="absolute -translate-x-1/2"
                style={{ left: `${p}%` }}
              >
                <span
                  className={`block rounded-full border ${
                    pct >= p
                      ? "size-2.5 border-primary bg-primary"
                      : "size-1.5 border-border bg-card"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* toggles */}
        <div className="border-t border-border pt-1.5">
          <Check label="TP/SL" checked={tpsl} onChange={setTpsl} />
          <Check label="Hidden Order" checked={hidden} onChange={setHidden} />
          <Check
            label="Reduce-Only"
            checked={reduceOnly}
            onChange={setReduceOnly}
            trailing={
              <button className="flex items-center gap-0.5 text-[11.5px] text-muted-foreground">
                GTC
                <ChevronDown className="size-3" />
              </button>
            }
          />
        </div>

        <div className="flex items-center justify-between text-[11.5px]">
          <span className="text-muted-foreground">Order value</span>
          <span className="font-num tabular-nums">
            {orderValue.toLocaleString("en-US", { maximumFractionDigits: 2 })} USDT
          </span>
        </div>

        <ConnectButton
          variant="block"
          className="!py-2.5 !text-[13.5px]"
          connectedLabel={authenticated ? "Buy / Long" : undefined}
          showIcon={!authenticated}
          connectedAction="custom"
          onConnectedClick={() =>
            toast.success(
              `Limit order queued · ${(Number(size) || 0).toFixed(2)} USDT @ ${effPrice.toFixed(precision)}`,
            )
          }
        />

      </div>
    </div>
  );
}
