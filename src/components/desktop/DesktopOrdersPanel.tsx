import { useState } from "react";
import { Link2, Search } from "lucide-react";

const TABS = [
  "Open Orders",
  "Positions",
  "Predictions",
  "Assets",
  "Order History",
  "Trade History",
  "Transaction History",
] as const;

type Tab = (typeof TABS)[number];

/** Bottom account panel spanning the chart + order book columns. */
export function DesktopOrdersPanel() {
  const [tab, setTab] = useState<Tab>("Positions");

  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex shrink-0 items-center gap-1 overflow-x-auto border-b border-border px-2">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`relative whitespace-nowrap px-3 py-2.5 text-[13px] transition-colors ${
              tab === t
                ? "font-medium text-foreground after:absolute after:inset-x-3 after:bottom-0 after:h-[2px] after:rounded-full after:bg-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 overflow-y-auto px-4 py-8">
        <div className="relative flex size-16 items-center justify-center rounded-2xl bg-secondary/50">
          <Link2 className="size-7 text-muted-foreground" />
          <Search className="absolute -bottom-0.5 -right-0.5 size-6 rounded-full bg-card p-0.5 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">Please connect a wallet first</p>
      </div>
    </section>
  );
}
