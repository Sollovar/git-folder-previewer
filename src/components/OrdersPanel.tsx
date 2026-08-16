import { useMemo, useState } from "react";
import { History, MoreHorizontal, Search, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";

const TABS = ["Open Orders", "Ladder History", "Order History", "Trade History"] as const;
type Tab = (typeof TABS)[number];

type MockOrder = {
  pair: string;
  side: "Buy" | "Sell";
  type: string;
  price: string;
  amount: string;
  filled: string;
  time: string;
  status: string;
};

const OPEN_ORDERS: MockOrder[] = [
  {
    pair: "BTC/USDT",
    side: "Buy",
    type: "Limit",
    price: "66,850.00",
    amount: "0.0250",
    filled: "0.00",
    time: "2026-08-02 12:41",
    status: "Open",
  },
  {
    pair: "ETH/USDT",
    side: "Sell",
    type: "Limit",
    price: "3,248.60",
    amount: "1.2500",
    filled: "0.00",
    time: "2026-08-02 12:52",
    status: "Open",
  },
  {
    pair: "SOL/USDT",
    side: "Buy",
    type: "Limit",
    price: "178.90",
    amount: "24.000",
    filled: "6.000",
    time: "2026-08-02 13:04",
    status: "Partial",
  },
  {
    pair: "BNB/USDT",
    side: "Sell",
    type: "Limit",
    price: "612.40",
    amount: "3.500",
    filled: "0.00",
    time: "2026-08-02 13:18",
    status: "Open",
  },
  {
    pair: "XRP/USDT",
    side: "Buy",
    type: "Limit",
    price: "0.6120",
    amount: "5,000",
    filled: "1,250",
    time: "2026-08-02 13:29",
    status: "Partial",
  },
  {
    pair: "DOGE/USDT",
    side: "Sell",
    type: "Limit",
    price: "0.1180",
    amount: "12,000",
    filled: "0.00",
    time: "2026-08-02 13:41",
    status: "Open",
  },
  {
    pair: "ADA/USDT",
    side: "Buy",
    type: "Limit",
    price: "0.4520",
    amount: "8,000",
    filled: "0.00",
    time: "2026-08-02 13:55",
    status: "Open",
  },
];

const ORDER_HISTORY: MockOrder[] = [
  {
    pair: "SOL/USDT",
    side: "Sell",
    type: "Limit",
    price: "182.40",
    amount: "12.500",
    filled: "12.500",
    time: "2026-08-01 19:04",
    status: "Filled",
  },
  {
    pair: "ETH/USDT",
    side: "Buy",
    type: "Limit",
    price: "3,120.00",
    amount: "0.800",
    filled: "0.000",
    time: "2026-08-01 09:22",
    status: "Cancelled",
  },
];

const TRADE_HISTORY: MockOrder[] = [
  {
    pair: "SOL/USDT",
    side: "Sell",
    type: "Taker",
    price: "182.40",
    amount: "12.500",
    filled: "2,280.00",
    time: "2026-08-01 19:04",
    status: "Fee 0.68 USDT",
  },
];

type LadderChild = MockOrder & { level: number };

const LADDER_CHILDREN: LadderChild[] = [
  { level: 1, pair: "BTC/USDT", side: "Buy", type: "Limit", price: "66,400.00", amount: "0.0250", filled: "0.0250", time: "2026-08-02 11:10", status: "Filled" },
  { level: 2, pair: "BTC/USDT", side: "Buy", type: "Limit", price: "66,600.00", amount: "0.0250", filled: "0.0250", time: "2026-08-02 11:10", status: "Filled" },
  { level: 3, pair: "BTC/USDT", side: "Buy", type: "Limit", price: "66,800.00", amount: "0.0250", filled: "0.0000", time: "2026-08-02 11:10", status: "Open" },
  { level: 4, pair: "BTC/USDT", side: "Buy", type: "Limit", price: "67,000.00", amount: "0.0250", filled: "0.0000", time: "2026-08-02 11:10", status: "Open" },
  { level: 5, pair: "BTC/USDT", side: "Buy", type: "Limit", price: "67,200.00", amount: "0.0250", filled: "0.0000", time: "2026-08-02 11:10", status: "Open" },
];

const LADDER_PARENT: MockOrder = {
  pair: "BTC/USDT",
  side: "Buy",
  type: "Ladder 5",
  price: "66,400.00 / 67,200.00",
  amount: "0.1250",
  filled: "0.0500",
  time: "2026-08-02 11:10",
  status: "Running",
};

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-4 py-14">
      <History className="size-8 text-muted-foreground" />
      <p className="text-sm text-muted-foreground">No {label.toLowerCase()} yet</p>
    </div>
  );
}

function parseNumeric(value: string) {
  return parseFloat(value.replace(/,/g, ""));
}

function filledPercent(amount: string, filled: string) {
  const a = parseNumeric(amount);
  const f = parseNumeric(filled);
  if (!a) return 0;
  return Math.min(100, Math.max(0, (f / a) * 100));
}

function OrderCard({
  o,
  onCancel,
  onClick,
  showFilled = false,
  showStatus = false,
}: {
  o: MockOrder;
  onCancel?: () => void;
  onClick?: () => void;
  showFilled?: boolean;
  showStatus?: boolean;
}) {
  const pct = filledPercent(o.amount, o.filled);
  const isBuy = o.side === "Buy";
  const sideColor = isBuy ? "text-bid" : "text-ask";
  const fillColor = isBuy ? "bg-bid" : "bg-ask";
  const fillTrack = isBuy ? "bg-bid/10" : "bg-ask/10";

  return (
    <div
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onClick();
        }
      }}
      className={`rounded-xl border border-border bg-card p-4 shadow-sm transition-transform active:scale-[0.99] ${
        onClick ? "cursor-pointer hover:border-primary/40" : ""
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-foreground">{o.pair}</span>
            <span
              className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase ${
                isBuy ? "bg-bid/10 text-bid" : "bg-ask/10 text-ask"
              }`}
            >
              {o.side}
            </span>
            <span className="text-[10px] uppercase text-muted-foreground">{o.type}</span>
          </div>
          <p className="mt-0.5 text-[11px] text-muted-foreground">{o.time}</p>
        </div>

        {onCancel ? (
          <button
            type="button"
            aria-label={`Cancel ${o.pair} order`}
            onClick={(e) => {
              e.stopPropagation();
              onCancel();
            }}
            className="inline-flex items-center gap-1 rounded-lg bg-secondary px-3 py-1.5 text-[12px] font-medium text-muted-foreground transition-colors hover:bg-destructive hover:text-destructive-foreground"
          >
            <X className="size-3.5" />
            Cancel
          </button>
        ) : showStatus ? (
          <span className="text-[10px] font-medium uppercase text-muted-foreground">{o.status}</span>
        ) : null}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-y-3">
        <div>
          <p className="text-[11px] text-muted-foreground">Price</p>
          <p className="mt-0.5 text-sm font-medium tabular-nums text-foreground">{o.price}</p>
        </div>
        <div className="text-right">
          <p className="text-[11px] text-muted-foreground">Amount</p>
          <p className="mt-0.5 text-sm font-medium tabular-nums text-foreground">{o.amount}</p>
        </div>
      </div>

      {showFilled && (
        <div className="mt-3 space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-muted-foreground">Filled</span>
            <span className={`font-medium tabular-nums ${pct >= 100 ? sideColor : "text-foreground"}`}>
              {pct.toFixed(2)}%
            </span>
          </div>
          <div className={`h-1.5 w-full overflow-hidden rounded-full ${fillTrack}`}>
            <div
              className={`h-full rounded-full ${fillColor} transition-all duration-500`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

const STATUS_FILTERS = ["All", "Open", "Partial"] as const;
type StatusFilter = (typeof STATUS_FILTERS)[number];

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <span className="text-[12px] text-muted-foreground">{label}</span>
      <span className="text-[13px] font-medium tabular-nums text-foreground">{value}</span>
    </div>
  );
}

export function OrdersPanel() {
  const [tab, setTab] = useState<Tab>("Open Orders");
  const [ladderOpen, setLadderOpen] = useState(false);
  const [cancelledOpen, setCancelledOpen] = useState<Set<string>>(new Set());
  const [cancelledChildren, setCancelledChildren] = useState<Set<number>>(new Set());
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("All");
  const [detail, setDetail] = useState<MockOrder | null>(null);

  const openOrders = useMemo(
    () =>
      OPEN_ORDERS.filter((o) => !cancelledOpen.has(o.pair + o.price))
        .filter((o) => o.pair.toLowerCase().includes(search.trim().toLowerCase()))
        .filter((o) => status === "All" || o.status === status),
    [cancelledOpen, search, status]
  );


  const rows =
    tab === "Open Orders"
      ? openOrders
      : tab === "Ladder History"
        ? [LADDER_PARENT]
        : tab === "Order History"
          ? ORDER_HISTORY
          : TRADE_HISTORY;

  const children = LADDER_CHILDREN.filter((c) => !cancelledChildren.has(c.level));

  const cancelOrder = (o: MockOrder) => {
    setCancelledOpen((prev) => {
      const next = new Set(prev);
      next.add(o.pair + o.price);
      return next;
    });
    toast(`Cancelled ${o.pair} order`);
  };

  const cancelAll = () => {
    setCancelledOpen((prev) => {
      const next = new Set(prev);
      openOrders.forEach((o) => next.add(o.pair + o.price));
      return next;
    });
    toast("Cancelled all open orders");
  };

  return (
    <section className="mt-2 flex flex-col rounded-2xl bg-card">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <h2 className="text-xl font-semibold text-foreground">Orders</h2>
        <button
          type="button"
          className="text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Orders options"
        >
          <MoreHorizontal className="size-5" />
        </button>
      </div>

      {/* Sticky tab bar */}
      <div className="sticky top-0 z-10 border-b border-border bg-card/95 px-4 backdrop-blur-sm">
        <div className="flex gap-5 overflow-x-auto scrollbar-hide">
          {TABS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`relative whitespace-nowrap py-3 text-sm font-medium transition-colors ${
                tab === t ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t}
              {tab === t && (
                <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-primary" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="min-h-0 flex-1 space-y-3 px-3 pb-4 pt-3">
        {tab === "Ladder History" ? (
          <>
            <button
              type="button"
              onClick={() => setLadderOpen(true)}
              className="w-full text-left"
            >
              <OrderCard
                o={{
                  ...LADDER_PARENT,
                  filled: `${children.filter((c) => c.status === "Filled").length} / ${children.length}`,
                }}
                showStatus
                showFilled
              />
            </button>
            <Drawer open={ladderOpen} onOpenChange={setLadderOpen}>
              <DrawerContent>
                <DrawerHeader className="pb-2 text-left">
                  <DrawerTitle className="text-base">Child orders ({children.length})</DrawerTitle>
                </DrawerHeader>
                <div className="max-h-[60vh] overflow-y-auto px-4 pb-6">
                  {children.length === 0 ? (
                    <p className="py-6 text-center text-sm text-muted-foreground">
                      All child orders cancelled
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {children.map((c) => (
                        <div
                          key={c.level}
                          className="flex items-center gap-3 rounded-xl bg-secondary px-3 py-3"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] text-muted-foreground">L{c.level}</span>
                              <span className="text-sm tabular-nums font-medium">{c.price}</span>
                              <span className="text-[11px] text-muted-foreground">{c.status}</span>
                            </div>
                            <p className="mt-0.5 text-[11px] tabular-nums text-muted-foreground">
                              {c.filled} / {c.amount}
                            </p>
                          </div>
                          <button
                            type="button"
                            aria-label={`Cancel level ${c.level}`}
                            onClick={() => {
                              setCancelledChildren((prev) => {
                                const next = new Set(prev);
                                next.add(c.level);
                                return next;
                              });
                              toast(`Cancelled child order L${c.level}`);
                            }}
                            className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-card text-muted-foreground transition-colors hover:bg-destructive hover:text-destructive-foreground"
                          >
                            <X className="size-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {children.length > 0 && (
                    <div className="mt-4 flex justify-center">
                      <button
                        type="button"
                        onClick={() => {
                          setCancelledChildren(new Set(LADDER_CHILDREN.map((c) => c.level)));
                          toast("Cancelled all child orders");
                        }}
                        className="flex items-center gap-2 rounded-xl bg-secondary px-6 py-2.5 text-sm font-medium text-ask transition-colors hover:bg-destructive hover:text-destructive-foreground"
                      >
                        <Trash2 className="size-4" />
                        Cancel All
                      </button>
                    </div>
                  )}
                </div>
              </DrawerContent>
            </Drawer>
          </>
        ) : tab === "Open Orders" ? (
          <>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search symbol"
                  aria-label="Search open orders by symbol"
                  className="w-full rounded-xl bg-secondary py-2.5 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="flex rounded-xl bg-secondary p-0.5">
                {STATUS_FILTERS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatus(s)}
                    className={`rounded-[10px] px-2.5 py-2 text-[12px] font-medium transition-colors ${
                      status === s
                        ? "bg-card text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {openOrders.length === 0 ? (
              <EmptyState label="Open Orders" />
            ) : (
              <div className="space-y-3">
                {openOrders.map((o) => (
                  <OrderCard
                    key={o.pair + o.price}
                    o={o}
                    showFilled
                    onClick={() => setDetail(o)}
                    onCancel={() => cancelOrder(o)}
                  />
                ))}
              </div>
            )}
            {openOrders.length > 0 && (
              <div className="sticky bottom-0 -mx-3 border-t border-border bg-card/95 px-3 py-3 backdrop-blur-sm">
                <button
                  type="button"
                  onClick={cancelAll}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-secondary py-3 text-sm font-medium text-ask transition-colors hover:bg-destructive hover:text-destructive-foreground"
                >
                  <Trash2 className="size-4" />
                  Cancel All Open Orders
                </button>
              </div>
            )}
          </>
        ) : rows.length === 0 ? (
          <EmptyState label={tab} />
        ) : (
          <div className="space-y-3">
            {rows.map((o, i) => (
              <OrderCard
                key={i}
                o={o}
                showFilled={tab === "Order History"}
                showStatus
                onClick={() => setDetail(o)}
              />
            ))}
          </div>
        )}
      </div>

      <Drawer open={!!detail} onOpenChange={(v) => !v && setDetail(null)}>
        <DrawerContent>
          <DrawerHeader className="pb-1 text-left">
            <DrawerTitle className="flex items-center gap-2 text-base">
              {detail?.pair}
              {detail && (
                <span
                  className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase ${
                    detail.side === "Buy" ? "bg-bid/10 text-bid" : "bg-ask/10 text-ask"
                  }`}
                >
                  {detail.side}
                </span>
              )}
            </DrawerTitle>
          </DrawerHeader>
          {detail && (
            <div className="max-h-[65vh] overflow-y-auto px-4 pb-6">
              <div className="divide-y divide-border">
                <DetailRow label="Symbol" value={detail.pair} />
                <DetailRow label="Side" value={detail.side} />
                <DetailRow label="Order type" value={detail.type} />
                <DetailRow label="Status" value={detail.status} />
                <DetailRow label="Price" value={detail.price} />
                <DetailRow label="Amount" value={detail.amount} />
                <DetailRow label="Filled" value={detail.filled} />
                <DetailRow
                  label="Filled %"
                  value={`${filledPercent(detail.amount, detail.filled).toFixed(2)}%`}
                />
                <DetailRow label="Created" value={detail.time} />
                <DetailRow label="Last updated" value={detail.time} />
                <DetailRow label="Order ID" value={`#${detail.pair.replace("/", "")}-${detail.time.slice(-5).replace(":", "")}`} />
              </div>

              {tab === "Open Orders" && (
                <button
                  type="button"
                  onClick={() => {
                    cancelOrder(detail);
                    setDetail(null);
                  }}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-secondary py-3 text-sm font-medium text-ask transition-colors hover:bg-destructive hover:text-destructive-foreground"
                >
                  <X className="size-4" />
                  Cancel Order
                </button>
              )}
            </div>
          )}
        </DrawerContent>
      </Drawer>
    </section>
  );
}
