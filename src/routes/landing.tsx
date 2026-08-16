import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Globe,
  EyeOff,
  Gauge,
  Boxes,
  ArrowUpRight,
  Apple,
  Smartphone,
  Download,
  Menu,
  Twitter,
  Send,
  Github,
} from "lucide-react";
import heroRing from "@/assets/hero-ring.jpg";
import phoneInHand from "@/assets/phone-in-hand.jpg";
import trendingTokens from "@/assets/trending-tokens.jpg";
import orderbookDepth from "@/assets/orderbook-depth.jpg";
import { LiveOrderBook } from "@/components/LiveOrderBook";


export const Route = createFileRoute("/landing")({
  head: () => ({
    meta: [
      { title: "Aster — The Frontier of On-chain Trading" },
      {
        name: "description",
        content:
          "Trade crypto, stocks, forex, commodities and prediction markets on Aster. Built on advanced tech for efficiency, privacy and open composability.",
      },
      { property: "og:title", content: "Aster — The Frontier of On-chain Trading" },
      {
        property: "og:description",
        content:
          "Trade crypto, stocks, forex, commodities and prediction markets on Aster. Built on advanced tech for efficiency, privacy and open composability.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/landing" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/landing" }],
  }),
  component: Landing,
});

const stats = [
  { label: "Assets", value: "483" },
  { label: "TVL", value: "$1.46B" },
  { label: "Open Interest", value: "$1.9B" },
  { label: "Users", value: "41.04M" },
  { label: "Total trading volume", value: "$4.80T" },
];

const why = [
  { icon: Globe, title: "Universal Access", body: "One account. Unlock every market." },
  {
    icon: EyeOff,
    title: "Native Privacy",
    body: "Show only what you want to show, privacy option at protocol layer.",
  },
  { icon: Gauge, title: "Capital Efficiency", body: "Higher leverage. Margin that earns." },
  { icon: Boxes, title: "Open Composability", body: "Built to be built on." },
];



const book = [
  { pair: "BTC/USDT", tag: "Perp", price: "67,384.59", chg: "+2.35%", up: true },
  { pair: "AAPL / USD", tag: "Equity", price: "228.14", chg: "-0.42%", up: false },
  { pair: "EUR/USD", tag: "Forex", price: "1.0914", chg: "+0.11%", up: true },
  { pair: "XAU/USD", tag: "Gold", price: "2,391.20", chg: "+1.04%", up: true },
];

function Landing() {
  return (
    <div className="min-h-screen bg-card text-foreground">
      {/* ===== Header ===== */}
      <header className="sticky top-0 z-30 flex items-center gap-3 bg-card/85 px-5 py-4 backdrop-blur">
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-full bg-foreground">
            <i className="size-3 rotate-45 rounded-[3px] bg-primary" />
          </span>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <Link
            to="/"
            className="rounded-full bg-secondary px-4 py-2 text-xs font-semibold text-foreground ring-1 ring-border"
          >
            Request Alpha
          </Link>
          <button aria-label="Open menu" className="text-foreground/70">
            <Menu className="size-5" />
          </button>
        </div>
      </header>

      {/* ===== Hero ===== */}
      <section className="relative px-5 pb-4 pt-8 text-center">
        <h1 className="text-[2.5rem] font-bold leading-[1.05] tracking-tight text-foreground">
          The Frontier of
          <br />
          On-chain Trading
        </h1>
        <p className="mx-auto mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
          Built on advanced tech for efficiency, privacy, and composability.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-[0_18px_40px_-18px_oklch(0.18_0.008_62_/_0.7)]"
          >
            Start Trading <ArrowUpRight className="size-4" />
          </Link>
        </div>

        {/* Spherical trading asset */}
        <div className="relative mx-auto mt-6 aspect-square w-full max-w-md overflow-hidden rounded-full">
          <img
            src={heroRing}
            alt="Spherical ring of live market chart data"
            width={1024}
            height={1536}
            className="h-full w-full scale-[1.35] object-cover object-center"
          />
          <div className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-border" />
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at 50% 50%, transparent 52%, var(--card) 84%)",
            }}
          />
        </div>

        {/* Data table */}
        <dl className="-mt-6 text-left">
          {stats.map((s) => (
            <div
              key={s.label}
              className="flex items-center justify-between border-b border-border py-3.5 last:border-b-0"
            >
              <dt className="text-sm text-muted-foreground">{s.label}</dt>
              <dd className="text-sm font-semibold text-foreground">{s.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* ===== Why Aster ===== */}
      <section className="bg-sand px-5 py-14">
        <h2 className="text-center text-3xl font-bold tracking-tight">Why Aster</h2>
        <div className="mx-auto mt-8 max-w-xl space-y-3">
          {why.map(({ icon: Icon, title, body }) => (
            <div key={title} className="flex gap-4 rounded-2xl bg-ink p-4 border border-ink-border">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-ink-elevated">
                <Icon className="size-4 text-primary" />
              </span>
              <div className="min-w-0">
                <h3 className="text-base font-semibold text-ink-foreground">{title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-ink-muted">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== The Aster Experience ===== */}
      <section className="px-5 py-14">
        <h2 className="text-center text-2xl font-bold tracking-tight">The Aster Experience</h2>
        <LiveOrderBook />

      </section>

      {/* ===== Trade every frontier ===== */}
      <section className="bg-sand px-5 py-14">
        <SectionHead
          title="Trade every frontier"
          body="Crypto, stocks, forex, commodities, prediction markets. All on Aster."
          pills={["24/7", "Permissionless"]}
        />
        <div className="mx-auto mt-6 max-w-xl overflow-hidden rounded-3xl bg-ink border border-ink-border">
          <div className="flex items-center justify-between border-b border-ink-border px-4 py-3">
            <span className="text-xs font-medium text-ink-foreground">Open Orders</span>
            <span className="rounded-full bg-ink-elevated px-3 py-1 text-[11px] text-ink-muted">
              Market Data
            </span>
          </div>
          {book.map((b) => (
            <div
              key={b.pair}
              className="flex items-center gap-3 border-b border-ink-border px-4 py-3 last:border-b-0"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-ink-foreground">{b.pair}</p>
                <p className="text-[11px] text-ink-muted">{b.tag}</p>
              </div>
              <div className="ml-auto shrink-0 text-right">
                <p className="text-sm font-semibold text-ink-foreground">{b.price}</p>
                <p className={`text-[11px] ${b.up ? "text-bid" : "text-ask"}`}>{b.chg}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== Trending tokens, three chains ===== */}
      <section className="px-5 py-14">
        <SectionHead
          title="Trending tokens, three chains"
          body="Catch what's moving on BNB Chain, Base and Solana — one account, one book, no bridging headaches."
          pills={["BNB Chain", "Base", "Solana"]}
        />
        <img
          src={trendingTokens}
          alt="Tokens flowing between BNB Chain, Base and Solana liquidity nodes"
          loading="lazy"
          width={1024}
          height={1024}
          className="mx-auto mt-6 w-full max-w-md rounded-3xl object-cover"
        />
        <div className="mx-auto mt-4 max-w-xl grid grid-cols-3 gap-2 text-center">
          {[
            { v: "3", l: "Chains live" },
            { v: "Spot", l: "No perps" },
            { v: "24/7", l: "Markets" },
          ].map((s) => (
            <div key={s.l} className="rounded-xl bg-ink px-2 py-3 border border-ink-border">
              <p className="text-sm font-semibold text-ink-foreground">{s.v}</p>
              <p className="text-[11px] text-ink-muted">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== A real order book ===== */}
      <section className="bg-sand px-5 py-14">
        <SectionHead
          title="A real order book, on-chain"
          body="Limit orders, visible depth and an honest spread. Price what you want, see exactly who's on the other side — no AMM slippage, no hidden routing."
          pills={["Limit Orders", "Live Depth", "Transparent Spread"]}
        />
        <img
          src={orderbookDepth}
          alt="Order book depth ladder showing bids, asks and the spread"
          loading="lazy"
          width={1024}
          height={1024}
          className="mx-auto mt-6 w-full max-w-md rounded-3xl object-cover"
        />
      </section>


      {/* ===== Ecosystem ===== */}
      <section className="bg-sand px-5 py-12">
        <h2 className="text-center text-sm font-medium text-muted-foreground">
          Trusted by the Ecosystem
        </h2>
        <div className="mx-auto mt-6 flex max-w-xl items-center justify-between gap-4 text-sm font-semibold text-foreground/70">
          <span>YZi Labs</span>
          <span>Franklin</span>
          <span>Lista DAO</span>
        </div>
      </section>

      {/* ===== Aster in Your Pocket ===== */}
      <section className="px-5 py-14 text-center">
        <h2 className="text-2xl font-bold tracking-tight">Aster in Your Pocket</h2>
        <div className="mt-2 flex justify-center">
          <span className="rounded-full bg-primary/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-primary ring-1 ring-primary/30">
            Coming Soon
          </span>
        </div>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
          Never miss an opportunity with the Aster Mobile app. The markets move at your fingertips
          24/7.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <StoreButton icon={Apple} label="App Store" />
          <StoreButton icon={Smartphone} label="Play Store" />
          <StoreButton icon={Download} label="APK (Android)" />
        </div>
        <img
          src={phoneInHand}
          alt="Hand holding a phone running the Aster mobile trading app"
          loading="lazy"
          width={768}
          height={1024}
          className="mx-auto mt-10 w-full max-w-xs rounded-3xl object-cover"
        />
      </section>

      {/* ===== Footer ===== */}
      <footer className="bg-sand px-5 py-10">
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-full bg-foreground">
            <i className="size-2.5 rotate-45 rounded-[2px] bg-primary" />
          </span>
          <span className="text-sm font-bold tracking-wide text-foreground">ASTER</span>
        </div>
        <div className="mt-6 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
          <span>About</span>
          <span>Support</span>
          <span>Privacy Policy</span>
          <span>Brand Kit</span>
        </div>
        <div className="mt-6 flex items-center gap-3 text-foreground/60">
          <Twitter className="size-4" aria-label="X" />
          <Send className="size-4" aria-label="Telegram" />
          <Github className="size-4" aria-label="GitHub" />
        </div>
        <p className="mt-8 text-[11px] text-muted-foreground">
          © 2024 Aster Foundation. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

function SectionHead({
  title,
  body,
  pills,
}: {
  title: string;
  body: string;
  pills: string[];
}) {
  return (
    <div className="mx-auto max-w-xl">
      <h2 className="text-xl font-bold tracking-tight text-foreground">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {pills.map((p) => (
          <span
            key={p}
            className="rounded-full bg-ink px-3.5 py-1.5 text-[11px] font-medium text-ink-foreground border border-ink-border"
          >
            {p}
          </span>
        ))}
      </div>
    </div>
  );
}

function StoreButton({ icon: Icon, label }: { icon: typeof Apple; label: string }) {
  return (
    <button
      disabled
      aria-disabled="true"
      className="flex cursor-not-allowed items-center gap-2 rounded-full bg-primary/60 px-4 py-2.5 text-xs font-medium text-primary-foreground"
    >
      <Icon className="size-4" /> {label}
    </button>
  );
}
