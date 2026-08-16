import { useState } from "react";
import { Megaphone, ShieldCheck, TrendingUp, Wallet, X } from "lucide-react";

type Notice = {
  id: number;
  title: string;
  body: string;
  time: string;
  kind: "trade" | "wallet" | "news" | "security";
  unread: boolean;
};

const ICONS = {
  trade: TrendingUp,
  wallet: Wallet,
  news: Megaphone,
  security: ShieldCheck,
} as const;

const SEED: Notice[] = [
  {
    id: 1,
    title: "Order filled",
    body: "Your BTCUSDT limit buy of 0.05 filled at 64,120.50.",
    time: "2m ago",
    kind: "trade",
    unread: true,
  },
  {
    id: 2,
    title: "Funding payment",
    body: "You paid 0.42 USDT funding on your ETHUSDT long position.",
    time: "38m ago",
    kind: "wallet",
    unread: true,
  },
  {
    id: 3,
    title: "Price alert",
    body: "SOLUSDT moved +6.2% in the last hour.",
    time: "1h ago",
    kind: "trade",
    unread: true,
  },
  {
    id: 4,
    title: "Deposit confirmed",
    body: "500.00 USDT credited to your trading account.",
    time: "5h ago",
    kind: "wallet",
    unread: false,
  },
  {
    id: 5,
    title: "New markets listed",
    body: "TIAUSDT and JUPUSDT perpetuals are now live with up to 25x leverage.",
    time: "Yesterday",
    kind: "news",
    unread: false,
  },
  {
    id: 6,
    title: "New device sign-in",
    body: "A wallet session was started from a new browser.",
    time: "2d ago",
    kind: "security",
    unread: false,
  },
];

/** Desktop notifications dropdown panel, anchored under the bell icon. */
export function DesktopNotificationsPopover({ onClose }: { onClose: () => void }) {
  const [items, setItems] = useState<Notice[]>(SEED);
  const [filter, setFilter] = useState<"All" | "Unread">("All");

  const shown = filter === "All" ? items : items.filter((i) => i.unread);
  const unread = items.filter((i) => i.unread).length;

  return (
    <div className="absolute right-0 top-[calc(100%+8px)] z-[70] w-[360px] overflow-hidden rounded-xl border border-border bg-card shadow-[0_20px_50px_-20px_rgba(0,0,0,0.45)]">
      <header className="flex items-center gap-2 border-b border-border px-3.5 py-3">
        <h3 className="text-[13px] font-semibold">Notifications</h3>
        {unread > 0 ? (
          <span className="rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-medium text-primary">
            {unread} new
          </span>
        ) : null}
        <button
          type="button"
          aria-label="Close notifications"
          onClick={onClose}
          className="ml-auto text-muted-foreground hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      </header>

      <div className="flex items-center gap-3 border-b border-border px-3.5 py-2">
        {(["All", "Unread"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`rounded-full px-2.5 py-1 text-[11.5px] transition-colors ${
              filter === f
                ? "bg-secondary font-medium text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {f}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setItems((s) => s.map((i) => ({ ...i, unread: false })))}
          className="ml-auto text-[11.5px] text-primary hover:underline"
        >
          Mark all read
        </button>
      </div>

      <ul className="max-h-[340px] overflow-y-auto">
        {shown.length === 0 ? (
          <li className="px-3.5 py-12 text-center text-[12.5px] text-muted-foreground">
            You&apos;re all caught up.
          </li>
        ) : (
          shown.map((n) => {
            const Icon = ICONS[n.kind];
            return (
              <li key={n.id} className="border-b border-border/60 last:border-0">
                <button
                  type="button"
                  onClick={() =>
                    setItems((s) => s.map((i) => (i.id === n.id ? { ...i, unread: false } : i)))
                  }
                  className="flex w-full gap-3 px-3.5 py-3 text-left transition-colors hover:bg-secondary/50"
                >
                  <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary">
                    <Icon className="size-3.5 text-muted-foreground" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="truncate text-[12.5px] font-medium">{n.title}</span>
                      {n.unread ? <span className="size-1.5 rounded-full bg-primary" /> : null}
                      <span className="ml-auto shrink-0 text-[10.5px] text-muted-foreground">
                        {n.time}
                      </span>
                    </span>
                    <span className="mt-0.5 block text-[11.5px] leading-snug text-muted-foreground">
                      {n.body}
                    </span>
                  </span>
                </button>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}
