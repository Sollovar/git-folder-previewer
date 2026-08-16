/**
 * Catalog + labels for every built-in KLineChart indicator and drawing tool.
 * Names are read from the library at runtime; these maps only add display text
 * and grouping so nothing is hard-coded away.
 */

export const MAIN_PANE_INDICATORS = new Set([
  "MA",
  "EMA",
  "SMA",
  "BBI",
  "BOLL",
  "SAR",
  "AVP",
]);

export const INDICATOR_LABELS: Record<string, string> = {
  MA: "Moving Average",
  EMA: "Exponential MA",
  SMA: "Smoothed MA",
  BBI: "Bull & Bear Index",
  BOLL: "Bollinger Bands",
  SAR: "Parabolic SAR",
  AVP: "Average Price",
  VOL: "Volume",
  MACD: "MACD",
  KDJ: "KDJ Stochastic",
  RSI: "Relative Strength",
  BIAS: "Bias",
  BRAR: "BRAR",
  CCI: "Commodity Channel",
  DMI: "Directional Movement",
  CR: "CR Energy",
  PSY: "Psychological Line",
  DMA: "Diff of MA",
  TRIX: "TRIX",
  OBV: "On Balance Volume",
  VR: "Volume Ratio",
  WR: "Williams %R",
  MTM: "Momentum",
  EMV: "Ease of Movement",
  ROC: "Rate of Change",
  PVT: "Price Volume Trend",
  AO: "Awesome Oscillator",
};

export const OVERLAY_GROUPS: { title: string; names: string[] }[] = [
  {
    title: "Lines",
    names: [
      "horizontalStraightLine",
      "verticalStraightLine",
      "straightLine",
      "horizontalRayLine",
      "verticalRayLine",
      "rayLine",
      "horizontalSegment",
      "verticalSegment",
      "segment",
      "arrow",
      "priceLine",
    ],
  },
  {
    title: "Channels",
    names: [
      "priceChannelLine",
      "parallelStraightLine",
      "fibonacciLine",
    ],
  },
  {
    title: "Shapes",
    names: ["rect", "circle", "triangle", "parallelogram", "polygon", "arc"],
  },
  {
    title: "Freehand & notes",
    names: ["brush", "text", "simpleAnnotation", "simpleTag"],
  },
];

export const OVERLAY_LABELS: Record<string, string> = {
  horizontalStraightLine: "Horizontal line",
  verticalStraightLine: "Vertical line",
  straightLine: "Trend line (infinite)",
  horizontalRayLine: "Horizontal ray",
  verticalRayLine: "Vertical ray",
  rayLine: "Ray",
  horizontalSegment: "Horizontal segment",
  verticalSegment: "Vertical segment",
  segment: "Trend line",
  arrow: "Arrow",
  priceLine: "Price line",
  priceChannelLine: "Price channel",
  parallelStraightLine: "Parallel channel",
  fibonacciLine: "Fibonacci retracement",
  rect: "Rectangle",
  circle: "Circle",
  triangle: "Triangle",
  parallelogram: "Parallelogram",
  polygon: "Polygon",
  arc: "Arc",
  brush: "Brush",
  text: "Text",
  simpleAnnotation: "Annotation",
  simpleTag: "Tag",
};

export function overlayLabel(name: string) {
  return (
    OVERLAY_LABELS[name] ??
    name.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase())
  );
}

export function indicatorLabel(name: string) {
  return INDICATOR_LABELS[name] ?? name;
}

export const CANDLE_TYPES = [
  { value: "candle_solid", label: "Candles" },
  { value: "candle_stroke", label: "Hollow candles" },
  { value: "candle_up_stroke", label: "Hollow up" },
  { value: "candle_down_stroke", label: "Hollow down" },
  { value: "ohlc", label: "Bars (OHLC)" },
  { value: "area", label: "Area" },
] as const;
