import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  init,
  dispose,
  getSupportedIndicators,
  getSupportedOverlays,
  type Chart,
  type CandleType,
  type OverlayMode,
  type Period,
  type DeepPartial,
  type Styles,
} from "klinecharts";
import {
  CandlestickChart,
  Camera,
  Check,
  ChevronDown,
  Expand,
  Eraser,
  Lock,
  Magnet,
  MousePointer2,
  Settings,
  SlidersHorizontal,
  Trash2,
  Unlock,
} from "lucide-react";

import { fetchCandles, subscribeCandles, type Interval } from "@/lib/market-data";
import { useSource } from "@/hooks/use-source";
import { useTheme } from "@/hooks/use-theme";
import {
  CANDLE_TYPES,
  MAIN_PANE_INDICATORS,
  OVERLAY_GROUPS,
  indicatorLabel,
  overlayLabel,
} from "./chart-catalog";

type Timeframe = { label: string; value: Interval; period: Period; quick?: boolean };

/** Full KLineChart period set, mapped to the intervals the data layer supports. */
const TIMEFRAMES: Timeframe[] = [
  { label: "1m", value: "1m", period: { type: "minute", span: 1 }, quick: true },
  { label: "3m", value: "3m", period: { type: "minute", span: 3 } },
  { label: "5m", value: "5m", period: { type: "minute", span: 5 }, quick: true },
  { label: "15m", value: "15m", period: { type: "minute", span: 15 }, quick: true },
  { label: "30m", value: "30m", period: { type: "minute", span: 30 } },
  { label: "1H", value: "1h", period: { type: "hour", span: 1 }, quick: true },
  { label: "2H", value: "2h", period: { type: "hour", span: 2 } },
  { label: "4H", value: "4h", period: { type: "hour", span: 4 }, quick: true },
  { label: "6H", value: "6h", period: { type: "hour", span: 6 } },
  { label: "12H", value: "12h", period: { type: "hour", span: 12 } },
  { label: "1D", value: "1d", period: { type: "day", span: 1 }, quick: true },
  { label: "3D", value: "3d", period: { type: "day", span: 3 } },
  { label: "1W", value: "1w", period: { type: "week", span: 1 }, quick: true },
  { label: "1M", value: "1M", period: { type: "month", span: 1 } },
];

const QUICK_TIMEFRAMES = TIMEFRAMES.filter((t) => t.quick);

type YAxisType = "normal" | "percentage" | "logarithm";

type ChartSettings = {
  candleType: CandleType;
  grid: boolean;
  lastPriceLine: boolean;
  highLowMarks: boolean;
  tooltip: "always" | "follow_cross" | "none";
  yAxisType: YAxisType;
  reverseYAxis: boolean;
  yAxisInside: boolean;
};

const DEFAULT_SETTINGS: ChartSettings = {
  candleType: "candle_solid",
  grid: true,
  lastPriceLine: true,
  highLowMarks: true,
  // Keep the OHLC / indicator legend pinned on screen instead of only on hover.
  tooltip: "always",
  yAxisType: "normal",
  reverseYAxis: false,
  yAxisInside: false,
};

function readTheme(el: HTMLElement) {
  const cs = getComputedStyle(el);
  const v = (name: string, fallback: string) => cs.getPropertyValue(name).trim() || fallback;
  return {
    up: v("--bid", "#16a34a"),
    down: v("--ask", "#dc2626"),
    text: v("--foreground", "#111"),
    muted: v("--muted-foreground", "#888"),
    grid: v("--border", "#e5e5e5"),
    card: v("--card", "#fff"),
  };
}

function buildStyles(
  t: ReturnType<typeof readTheme>,
  s: ChartSettings,
): DeepPartial<Styles> {
  const axis = {
    show: true,
    axisLine: { show: true, color: t.grid, size: 1 },
    tickLine: { show: true, color: t.grid, size: 1, length: 3 },
    tickText: { show: true, color: t.muted, size: 10, weight: "normal", family: "inherit" },
  };
  return {
    grid: {
      show: s.grid,
      horizontal: { show: true, size: 1, color: t.grid, style: "dashed", dashedValue: [2, 4] },
      vertical: { show: true, size: 1, color: t.grid, style: "dashed", dashedValue: [2, 4] },
    },
    candle: {
      type: s.candleType,
      bar: {
        upColor: t.up,
        downColor: t.down,
        noChangeColor: t.muted,
        upBorderColor: t.up,
        downBorderColor: t.down,
        noChangeBorderColor: t.muted,
        upWickColor: t.up,
        downWickColor: t.down,
        noChangeWickColor: t.muted,
      },
      priceMark: {
        show: true,
        high: { show: s.highLowMarks, color: t.muted, textSize: 10 },
        low: { show: s.highLowMarks, color: t.muted, textSize: 10 },
        last: {
          show: s.lastPriceLine,
          line: { show: true, style: "dashed", dashedValue: [4, 4], size: 1 },
          text: { size: 10, paddingLeft: 4, paddingRight: 4, borderRadius: 2 },
        },
      },
      tooltip: {
        showRule: s.tooltip,
        offsetTop: 2,
        title: { show: true, color: t.muted, size: 11 },
        legend: { color: t.text, size: 11 },
        rect: { color: "transparent", borderColor: "transparent", paddingLeft: 0 },
      },
    },
    indicator: {
      tooltip: {
        showRule: s.tooltip,
        title: { color: t.muted, size: 10 },
        legend: { color: t.text, size: 10 },
      },
      lastValueMark: { show: false },
    },
    xAxis: axis,
    yAxis: axis,
    crosshair: {
      horizontal: {
        line: { color: t.muted, style: "dashed", dashedValue: [4, 3], size: 1 },
        text: { backgroundColor: t.text, color: t.card, size: 10, borderRadius: 2 },
      },
      vertical: {
        line: { color: t.muted, style: "dashed", dashedValue: [4, 3], size: 1 },
        text: { backgroundColor: t.text, color: t.card, size: 10, borderRadius: 2 },
      },
    },
    separator: { size: 1, color: t.grid },
    overlay: { point: { color: t.up, borderColor: t.grid } },
  };
}

/** Small popover panel anchored under a toolbar button. */
function Popover({
  open,
  onClose,
  align = "left",
  children,
  className = "",
}: {
  open: boolean;
  onClose: () => void;
  align?: "left" | "right";
  children: React.ReactNode;
  className?: string;
}) {
  if (!open) return null;
  return (
    <>
      <div className="fixed inset-0 z-30" onClick={onClose} />
      <div
        className={`absolute top-full z-40 mt-1 rounded-lg border border-border bg-card shadow-xl ${
          align === "right" ? "right-0" : "left-0"
        } ${className}`}
      >
        {children}
      </div>
    </>
  );
}

function Row({
  active,
  onClick,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center justify-between gap-3 rounded px-2 py-1.5 text-left text-[12px] text-foreground transition-colors hover:bg-secondary"
    >
      <span className="truncate">{children}</span>
      {active ? <Check className="size-3.5 shrink-0 text-primary" /> : null}
    </button>
  );
}

/**
 * Desktop candlestick chart panel wired to the full KLineChart feature set:
 * every built-in indicator, every built-in drawing overlay, magnet/lock modes,
 * chart styling settings, screenshot export and fullscreen.
 */
export function TradingChart({ symbol }: { symbol: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<Chart | null>(null);

  const [interval, setIntervalValue] = useState<Interval>("1d");
  const [settings, setSettings] = useState<ChartSettings>(DEFAULT_SETTINGS);
  const [indicators, setIndicators] = useState<string[]>(["MA", "VOL"]);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [magnet, setMagnet] = useState<OverlayMode>("normal");
  const [locked, setLocked] = useState(false);
  const [menu, setMenu] = useState<"indicators" | "settings" | "tools" | "timeframe" | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [source] = useSource();
  const { theme } = useTheme();

  const allIndicators = useMemo(() => getSupportedIndicators().sort(), []);
  const supportedOverlays = useMemo(() => new Set(getSupportedOverlays()), []);
  const overlayGroups = useMemo(() => {
    const known = new Set(OVERLAY_GROUPS.flatMap((g) => g.names));
    const extras = [...supportedOverlays].filter((n) => !known.has(n)).sort();
    return [
      ...OVERLAY_GROUPS.map((g) => ({
        title: g.title,
        names: g.names.filter((n) => supportedOverlays.has(n)),
      })).filter((g) => g.names.length > 0),
      ...(extras.length ? [{ title: "More tools", names: extras }] : []),
    ];
  }, [supportedOverlays]);

  const mainIndicators = useMemo(
    () => allIndicators.filter((n) => MAIN_PANE_INDICATORS.has(n)),
    [allIndicators],
  );
  const subIndicators = useMemo(
    () => allIndicators.filter((n) => !MAIN_PANE_INDICATORS.has(n)),
    [allIndicators],
  );

  const active = useMemo(
    () => TIMEFRAMES.find((t) => t.value === interval) ?? TIMEFRAMES[10]!,
    [interval],
  );

  // init
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const chart = init(el, {
      styles: buildStyles(readTheme(el), DEFAULT_SETTINGS),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
    chartRef.current = chart;
    const ro = new ResizeObserver(() => chart?.resize());
    ro.observe(el);
    return () => {
      ro.disconnect();
      chartRef.current = null;
      dispose(el);
    };
  }, []);

  // styles
  useEffect(() => {
    const el = containerRef.current;
    if (!el || !chartRef.current) return;
    chartRef.current.setStyles(buildStyles(readTheme(el), settings));
  }, [settings, theme]);

  // y axis mode
  useEffect(() => {
    chartRef.current?.overrideYAxis({
      paneId: "candle_pane",
      name: settings.yAxisType,
      reverse: settings.reverseYAxis,
      inside: settings.yAxisInside,
    });
  }, [settings.yAxisType, settings.reverseYAxis, settings.yAxisInside]);

  // indicators: sync chart with state
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;
    const existing = chart.getIndicators().map((i) => i.name);
    for (const name of existing) {
      if (!indicators.includes(name)) chart.removeIndicator({ name });
    }
    for (const name of indicators) {
      if (existing.includes(name)) continue;
      if (MAIN_PANE_INDICATORS.has(name)) {
        chart.createIndicator({ name, paneId: "candle_pane" }, true);
      } else {
        const paneId = chart.createIndicator({ name }, false);
        if (paneId) chart.setPaneOptions({ id: paneId, height: 84, dragEnabled: true });
      }
    }
  }, [indicators]);

  // data
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;
    let unsubscribe: (() => void) | null = null;
    setLoading(true);
    setError(null);

    chart.setDataLoader({
      getBars: async ({ type, timestamp, callback }) => {
        try {
          const range =
            type === "forward" && timestamp
              ? { endTime: timestamp - 1 }
              : type === "backward" && timestamp
                ? { startTime: timestamp + 1 }
                : {};
          const { candles, pricePrecision } = await fetchCandles(symbol, interval, {
            limit: 500,
            source,
            ...range,
          });
          if (type === "init") {
            chart.setSymbol({ ticker: symbol, pricePrecision, volumePrecision: 2 });
            setLoading(false);
          }
          callback(candles, type === "init" ? true : candles.length >= 500);
        } catch (e) {
          setLoading(false);
          setError(e instanceof Error ? e.message : "Unable to load market data");
          callback([], false);
        }
      },
      subscribeBar: ({ callback }) => {
        unsubscribe?.();
        unsubscribe = subscribeCandles(symbol, interval, callback, source);
      },
      unsubscribeBar: () => {
        unsubscribe?.();
        unsubscribe = null;
      },
    });

    chart.setSymbol({ ticker: symbol, pricePrecision: 2, volumePrecision: 2 });
    chart.setPeriod(active.period);
    chart.setOffsetRightDistance(30);
    chart.setBarSpace(6);
    requestAnimationFrame(() => chart.scrollToRealTime(0));

    return () => unsubscribe?.();
  }, [symbol, interval, active.period, source]);

  const toggleIndicator = useCallback((name: string) => {
    setIndicators((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name],
    );
  }, []);

  const startDrawing = useCallback(
    (name: string) => {
      const chart = chartRef.current;
      if (!chart) return;
      setActiveTool(name);
      setMenu(null);
      chart.createOverlay({ name, mode: magnet, lock: locked });
    },
    [magnet, locked],
  );

  const cycleMagnet = useCallback(() => {
    setMagnet((m) => {
      const next: OverlayMode =
        m === "normal" ? "weak_magnet" : m === "weak_magnet" ? "strong_magnet" : "normal";
      chartRef.current?.overrideOverlay({ mode: next });
      return next;
    });
  }, []);

  const toggleLock = useCallback(() => {
    setLocked((l) => {
      chartRef.current?.overrideOverlay({ lock: !l });
      return !l;
    });
  }, []);

  const removeLastOverlay = useCallback(() => {
    const chart = chartRef.current;
    const all = chart?.getOverlays() ?? [];
    const last = all[all.length - 1];
    if (last) chart?.removeOverlay({ id: last.id });
  }, []);

  const clearOverlays = useCallback(() => {
    chartRef.current?.removeOverlay();
    setActiveTool(null);
  }, []);

  const snapshot = useCallback(() => {
    const url = chartRef.current?.getConvertPictureUrl(true, "png");
    if (!url) return;
    const a = document.createElement("a");
    a.href = url;
    a.download = `${symbol}-${interval}.png`;
    a.click();
  }, [symbol, interval]);

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void wrapperRef.current?.requestFullscreen?.();
  }, []);

  const railTools = useMemo(
    () =>
      [
        "segment",
        "straightLine",
        "horizontalStraightLine",
        "verticalStraightLine",
        "rayLine",
        "priceChannelLine",
        "parallelStraightLine",
        "fibonacciLine",
        "rect",
        "circle",
        "polygon",
        "brush",
        "text",
        "simpleAnnotation",
      ].filter((n) => supportedOverlays.has(n)),
    [supportedOverlays],
  );

  return (
    <div
      ref={wrapperRef}
      className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-xl border border-border bg-card"
    >
      {/* toolbar */}
      <div className="relative flex h-9 shrink-0 items-center gap-0.5 border-b border-border px-2 text-[12px]">
        {QUICK_TIMEFRAMES.map((t) => (
          <button
            key={t.value}
            onClick={() => setIntervalValue(t.value)}
            className={`rounded px-2 py-0.5 transition-colors ${
              interval === t.value
                ? "bg-secondary font-semibold text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}

        {/* all periods */}
        <div className="relative">
          <button
            aria-label="All timeframes"
            onClick={() => setMenu((m) => (m === "timeframe" ? null : "timeframe"))}
            className={`flex items-center gap-0.5 rounded px-1.5 py-0.5 transition-colors ${
              active.quick
                ? "text-muted-foreground hover:bg-secondary hover:text-foreground"
                : "bg-secondary font-semibold text-foreground"
            }`}
          >
            {active.quick ? "" : active.label}
            <ChevronDown className="size-3.5" />
          </button>
          <Popover
            open={menu === "timeframe"}
            onClose={() => setMenu(null)}
            className="grid w-[168px] grid-cols-3 gap-0.5 p-1.5"
          >
            {TIMEFRAMES.map((t) => (
              <button
                key={t.value}
                onClick={() => {
                  setIntervalValue(t.value);
                  setMenu(null);
                }}
                className={`rounded px-1 py-1 text-[12px] transition-colors ${
                  interval === t.value
                    ? "bg-secondary font-semibold text-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                {t.label}
              </button>
            ))}
          </Popover>
        </div>


        <span className="mx-1.5 h-4 w-px bg-border" />

        {/* chart type + indicators */}
        <div className="relative">
          <button
            aria-label="Indicators"
            onClick={() => setMenu((m) => (m === "indicators" ? null : "indicators"))}
            className="flex items-center gap-1 rounded px-1.5 py-0.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            <SlidersHorizontal className="size-4" />
            <span className="hidden lg:inline">Indicators</span>
          </button>
          <Popover
            open={menu === "indicators"}
            onClose={() => setMenu(null)}
            className="max-h-[420px] w-[300px] overflow-y-auto p-2"
          >
            <p className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Main chart ({mainIndicators.length})
            </p>
            {mainIndicators.map((n) => (
              <Row key={n} active={indicators.includes(n)} onClick={() => toggleIndicator(n)}>
                <span className="font-num font-semibold">{n}</span>{" "}
                <span className="text-muted-foreground">{indicatorLabel(n)}</span>
              </Row>
            ))}
            <p className="mt-2 px-2 pb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Sub charts ({subIndicators.length})
            </p>
            {subIndicators.map((n) => (
              <Row key={n} active={indicators.includes(n)} onClick={() => toggleIndicator(n)}>
                <span className="font-num font-semibold">{n}</span>{" "}
                <span className="text-muted-foreground">{indicatorLabel(n)}</span>
              </Row>
            ))}
          </Popover>
        </div>

        <div className="relative">
          <button
            aria-label="Chart settings"
            onClick={() => setMenu((m) => (m === "settings" ? null : "settings"))}
            className="flex items-center gap-1 rounded px-1.5 py-0.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            <Settings className="size-4" />
          </button>
          <Popover
            open={menu === "settings"}
            onClose={() => setMenu(null)}
            className="max-h-[420px] w-[240px] overflow-y-auto p-2"
          >
            <p className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Chart type
            </p>
            {CANDLE_TYPES.map((c) => (
              <Row
                key={c.value}
                active={settings.candleType === c.value}
                onClick={() => setSettings((s) => ({ ...s, candleType: c.value as CandleType }))}
              >
                {c.label}
              </Row>
            ))}
            <p className="mt-2 px-2 pb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Price axis
            </p>
            {(["normal", "percentage", "logarithm"] as YAxisType[]).map((t) => (
              <Row
                key={t}
                active={settings.yAxisType === t}
                onClick={() => setSettings((s) => ({ ...s, yAxisType: t }))}
              >
                {t === "normal" ? "Regular" : t === "percentage" ? "Percentage" : "Logarithmic"}
              </Row>
            ))}
            <Row
              active={settings.reverseYAxis}
              onClick={() => setSettings((s) => ({ ...s, reverseYAxis: !s.reverseYAxis }))}
            >
              Invert scale
            </Row>
            <Row
              active={settings.yAxisInside}
              onClick={() => setSettings((s) => ({ ...s, yAxisInside: !s.yAxisInside }))}
            >
              Axis inside chart
            </Row>
            <p className="mt-2 px-2 pb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Display
            </p>
            <Row active={settings.grid} onClick={() => setSettings((s) => ({ ...s, grid: !s.grid }))}>
              Grid lines
            </Row>
            <Row
              active={settings.lastPriceLine}
              onClick={() => setSettings((s) => ({ ...s, lastPriceLine: !s.lastPriceLine }))}
            >
              Last price line
            </Row>
            <Row
              active={settings.highLowMarks}
              onClick={() => setSettings((s) => ({ ...s, highLowMarks: !s.highLowMarks }))}
            >
              High / low marks
            </Row>
            <p className="mt-2 px-2 pb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Tooltip
            </p>
            {(["always", "follow_cross", "none"] as const).map((t) => (
              <Row
                key={t}
                active={settings.tooltip === t}
                onClick={() => setSettings((s) => ({ ...s, tooltip: t }))}
              >
                {t === "always" ? "Always" : t === "follow_cross" ? "On crosshair" : "Hidden"}
              </Row>
            ))}
          </Popover>
        </div>

        <button
          aria-label="Download snapshot"
          onClick={snapshot}
          className="rounded px-1.5 py-0.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
        >
          <Camera className="size-4" />
        </button>

        <span className="mx-1.5 h-4 w-px bg-border" />

        <div className="flex items-center gap-1 overflow-x-auto text-[11px] text-muted-foreground">
          {indicators.map((n) => (
            <button
              key={n}
              onClick={() => toggleIndicator(n)}
              className="font-num rounded bg-secondary px-1.5 py-0.5 text-foreground"
              title={`Remove ${indicatorLabel(n)}`}
            >
              {n} ×
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-1">
          <button
            aria-label="Fullscreen chart"
            onClick={toggleFullscreen}
            className="rounded p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            <Expand className="size-4" />
          </button>
        </div>
      </div>

      {/* body: drawing rail + chart */}
      <div className="flex min-h-0 flex-1">
        <div className="relative flex w-9 shrink-0 flex-col items-center gap-0.5 border-r border-border py-1.5">
          <button
            aria-label="Cursor"
            title="Cursor"
            onClick={() => setActiveTool(null)}
            className={`flex size-7 items-center justify-center rounded-md transition-colors ${
              activeTool === null
                ? "bg-secondary text-foreground"
                : "text-muted-foreground hover:bg-secondary/60"
            }`}
          >
            <MousePointer2 className="size-[15px]" />
          </button>

          {railTools.map((name) => (
            <button
              key={name}
              aria-label={overlayLabel(name)}
              title={overlayLabel(name)}
              onClick={() => startDrawing(name)}
              className={`flex size-7 items-center justify-center rounded-md text-[9px] font-semibold uppercase transition-colors ${
                activeTool === name
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:bg-secondary/60"
              }`}
            >
              <ToolGlyph name={name} />
            </button>
          ))}

          <button
            aria-label="All drawing tools"
            title="All drawing tools"
            onClick={() => setMenu((m) => (m === "tools" ? null : "tools"))}
            className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary/60"
          >
            <CandlestickChart className="size-[15px]" />
          </button>
          {menu === "tools" && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setMenu(null)} />
              <div className="absolute left-full top-1 z-40 ml-1 max-h-[420px] w-[220px] overflow-y-auto rounded-lg border border-border bg-card p-2 shadow-xl">
                {overlayGroups.map((g) => (
                  <div key={g.title} className="mb-1">
                    <p className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                      {g.title}
                    </p>
                    {g.names.map((n) => (
                      <Row key={n} active={activeTool === n} onClick={() => startDrawing(n)}>
                        {overlayLabel(n)}
                      </Row>
                    ))}
                  </div>
                ))}
              </div>
            </>
          )}

          <span className="my-1 h-px w-5 bg-border" />

          <button
            aria-label="Magnet mode"
            title={`Magnet: ${magnet.replace("_", " ")}`}
            onClick={cycleMagnet}
            className={`flex size-7 items-center justify-center rounded-md transition-colors ${
              magnet === "normal"
                ? "text-muted-foreground hover:bg-secondary/60"
                : "bg-secondary text-primary"
            }`}
          >
            <Magnet className="size-[15px]" />
          </button>
          <button
            aria-label="Lock drawings"
            title={locked ? "Unlock drawings" : "Lock drawings"}
            onClick={toggleLock}
            className={`flex size-7 items-center justify-center rounded-md transition-colors ${
              locked ? "bg-secondary text-primary" : "text-muted-foreground hover:bg-secondary/60"
            }`}
          >
            {locked ? <Lock className="size-[15px]" /> : <Unlock className="size-[15px]" />}
          </button>
          <button
            aria-label="Remove last drawing"
            title="Remove last drawing"
            onClick={removeLastOverlay}
            className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary/60"
          >
            <Eraser className="size-[15px]" />
          </button>
          <button
            aria-label="Clear all drawings"
            title="Clear all drawings"
            onClick={clearOverlays}
            className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary/60"
          >
            <Trash2 className="size-[15px]" />
          </button>
        </div>

        <div className="relative min-h-0 min-w-0 flex-1">
          <div ref={containerRef} className="size-full" />
          {(loading || error) && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <span className="rounded-md bg-secondary px-3 py-1.5 text-[11px] text-muted-foreground">
                {error ?? "Loading market data…"}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/** Tiny SVG glyphs so each drawing tool reads like a TradingView icon. */
function ToolGlyph({ name }: { name: string }) {
  const p = "currentColor";
  const common = { width: 15, height: 15, viewBox: "0 0 24 24", fill: "none", stroke: p, strokeWidth: 1.6 };
  switch (name) {
    case "segment":
      return <svg {...common}><path d="M4 19 20 5" /><circle cx="4" cy="19" r="1.6" fill={p} /><circle cx="20" cy="5" r="1.6" fill={p} /></svg>;
    case "straightLine":
      return <svg {...common}><path d="M3 20 21 4" /></svg>;
    case "horizontalStraightLine":
      return <svg {...common}><path d="M3 12h18" /></svg>;
    case "verticalStraightLine":
      return <svg {...common}><path d="M12 3v18" /></svg>;
    case "rayLine":
      return <svg {...common}><path d="M5 18 21 6" /><circle cx="5" cy="18" r="1.6" fill={p} /></svg>;
    case "priceChannelLine":
      return <svg {...common}><path d="M3 17 17 5M7 21 21 9" /></svg>;
    case "parallelStraightLine":
      return <svg {...common}><path d="M3 15h18M3 9h18" /></svg>;
    case "fibonacciLine":
      return <svg {...common}><path d="M3 5h18M3 10h18M3 15h18M3 20h18" /></svg>;
    case "rect":
      return <svg {...common}><rect x="4" y="6" width="16" height="12" rx="1" /></svg>;
    case "circle":
      return <svg {...common}><circle cx="12" cy="12" r="7" /></svg>;
    case "polygon":
      return <svg {...common}><path d="M12 4l7 5-2.5 9h-9L5 9z" /></svg>;
    case "brush":
      return <svg {...common}><path d="M4 18c4-1 4-9 8-9s3 6 8 4" /></svg>;
    case "text":
      return <svg {...common}><path d="M6 6h12M12 6v12" /></svg>;
    case "simpleAnnotation":
      return <svg {...common}><path d="M5 5h14v10H9l-4 4z" /></svg>;
    default:
      return <svg {...common}><circle cx="12" cy="12" r="6" /></svg>;
  }
}

export default TradingChart;
