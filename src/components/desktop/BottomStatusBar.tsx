import { useEffect, useState } from "react";
import { Filter, MessageCircle, Send, Twitter } from "lucide-react";

const ANNOUNCEMENTS = [
  "Welcome to Aster — trade perpetual futures with up to 1001x leverage",
  "Small Amount Exchange Now Available on Spot",
  "0% Fee on USDC ↔ USDT for 30 Days",
  "Migrate to Pro API | V1 API Sunset Notice",
  "Staking is live on Aster",
];

/** Compact status / announcement bar pinned to the bottom of the terminal. */
export function BottomStatusBar() {
  const [latency, setLatency] = useState(451);

  useEffect(() => {
    const id = setInterval(() => setLatency(380 + Math.round(Math.random() * 160)), 4000);
    return () => clearInterval(id);
  }, []);

  return (
    <footer className="relative z-30 flex h-7 shrink-0 items-center gap-3 border-t border-border bg-card px-3 text-[11px] text-muted-foreground">
      <span className="flex shrink-0 items-center gap-1.5">
        <span className="size-1.5 rounded-full bg-bid" />
        <span className="text-bid">Connected {latency}ms</span>
      </span>
      <button aria-label="Filter announcements" className="shrink-0 hover:text-foreground">
        <Filter className="size-3" />
      </button>
      <span className="h-3 w-px shrink-0 bg-border" />

      <div className="group relative min-w-0 flex-1 overflow-hidden">
        <div className="animate-marquee flex w-max items-center group-hover:[animation-play-state:paused]">
          {[0, 1].map((copy) => (
            <div key={copy} aria-hidden={copy === 1} className="flex items-center">
              {ANNOUNCEMENTS.map((a) => (
                <span key={a} className="flex shrink-0 items-center whitespace-nowrap">
                  <span className="hover:text-foreground">{a}</span>
                  <span className="mx-4 text-border">•</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>


      <div className="flex shrink-0 items-center gap-2.5">
        <Twitter className="size-3 hover:text-foreground" />
        <MessageCircle className="size-3 hover:text-foreground" />
        <Send className="size-3 hover:text-foreground" />
      </div>
    </footer>
  );
}
