import { DesktopTopNav } from "@/components/desktop/DesktopTopNav";
import { MarketHeader } from "@/components/desktop/MarketHeader";
import { TradingChart } from "@/components/desktop/TradingChart";
import { OrderBook } from "@/components/desktop/OrderBook";
import { OrderEntry } from "@/components/desktop/OrderEntry";
import { DesktopOrdersPanel } from "@/components/desktop/DesktopOrdersPanel";
import { BottomStatusBar } from "@/components/desktop/BottomStatusBar";
import { usePair } from "@/hooks/use-pair";

/**
 * Full-viewport desktop perpetual-futures terminal:
 * nav → market header → chart | order book | order entry → orders → status bar.
 */
export function DesktopTerminal() {
  const [pair] = usePair();

  return (
    <div className="flex h-screen min-h-0 flex-col overflow-hidden bg-background text-foreground">
      <DesktopTopNav />

      <main className="no-scrollbar grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_268px_268px] grid-rows-[auto_auto] items-stretch gap-[3px] overflow-y-auto p-[3px]">
        <div className="flex h-[calc(100vh-112px)] min-h-[560px] min-w-0 flex-col gap-[3px]">
          <MarketHeader />
          <TradingChart symbol={pair} />
        </div>

        <div className="h-[calc(100vh-112px)] min-h-[560px]">
          <OrderBook symbol={pair} />
        </div>

        <div className="row-span-2 self-start">
          <OrderEntry symbol={pair} />
        </div>

        <div className="col-span-2 min-h-[420px]">
          <DesktopOrdersPanel />
        </div>
      </main>

      <BottomStatusBar />
    </div>
  );
}


