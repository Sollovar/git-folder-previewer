import { Suspense, lazy, useEffect, useState } from "react";

/**
 * KLineChart touches `window` at import time, so the desktop chart panel is
 * only loaded after hydration.
 */
const TradingChartPanel = lazy(() => import("@/components/desktop/TradingChartPanel"));

function Placeholder() {
  return (
    <div className="min-h-0 min-w-0 flex-1 animate-pulse rounded-xl border border-border bg-card" />
  );
}

export function TradingChart({ symbol }: { symbol: string }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <Placeholder />;
  return (
    <Suspense fallback={<Placeholder />}>
      <TradingChartPanel symbol={symbol} />
    </Suspense>
  );
}
