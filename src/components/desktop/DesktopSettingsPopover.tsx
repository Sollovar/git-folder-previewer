import { useState } from "react";
import { X } from "lucide-react";

import { useTheme } from "@/hooks/use-theme";

type ToggleKey = "orderConfirm" | "oneClickTrading" | "soundEffects" | "hideBalances";

const TOGGLES: { key: ToggleKey; label: string; hint: string }[] = [
  { key: "orderConfirm", label: "Order confirmation", hint: "Ask before submitting an order" },
  { key: "oneClickTrading", label: "One-click trading", hint: "Skip the confirmation step" },
  { key: "soundEffects", label: "Sound effects", hint: "Play a sound on fills" },
  { key: "hideBalances", label: "Hide balances", hint: "Mask amounts across the app" },
];

const CURRENCIES = ["USD", "EUR", "USDT"] as const;
const LEVERAGE = ["5x", "10x", "25x"] as const;

/** Desktop settings dropdown panel, anchored under the gear icon. */
export function DesktopSettingsPopover({ onClose }: { onClose: () => void }) {
  const { theme, setTheme } = useTheme();
  const [toggles, setToggles] = useState<Record<ToggleKey, boolean>>({
    orderConfirm: true,
    oneClickTrading: false,
    soundEffects: false,
    hideBalances: false,
  });
  const [currency, setCurrency] = useState<string>("USD");
  const [leverage, setLeverage] = useState<string>("10x");

  const Segment = ({
    options,
    value,
    onChange,
  }: {
    options: readonly string[];
    value: string;
    onChange: (v: string) => void;
  }) => (
    <div className="flex rounded-lg border border-border p-0.5">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          onClick={() => onChange(o)}
          className={`flex-1 rounded-md px-2 py-1 text-[11.5px] transition-colors ${
            value === o
              ? "bg-secondary font-medium text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {o}
        </button>
      ))}
    </div>
  );

  return (
    <div className="absolute right-0 top-[calc(100%+8px)] z-[70] w-[340px] overflow-hidden rounded-xl border border-border bg-card shadow-[0_20px_50px_-20px_rgba(0,0,0,0.45)]">
      <header className="flex items-center border-b border-border px-3.5 py-3">
        <h3 className="text-[13px] font-semibold">Settings</h3>
        <button
          type="button"
          aria-label="Close settings"
          onClick={onClose}
          className="ml-auto text-muted-foreground hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      </header>

      <div className="max-h-[380px] space-y-4 overflow-y-auto px-3.5 py-3">
        <div className="space-y-1.5">
          <p className="text-[10.5px] uppercase tracking-wide text-muted-foreground">Appearance</p>
          <Segment
            options={["light", "warm"]}
            value={theme}
            onChange={(v) => setTheme(v as typeof theme)}
          />
        </div>

        <div className="space-y-1.5">
          <p className="text-[10.5px] uppercase tracking-wide text-muted-foreground">Currency</p>
          <Segment options={CURRENCIES} value={currency} onChange={setCurrency} />
        </div>

        <div className="space-y-1.5">
          <p className="text-[10.5px] uppercase tracking-wide text-muted-foreground">
            Default leverage
          </p>
          <Segment options={LEVERAGE} value={leverage} onChange={setLeverage} />
        </div>

        <div className="space-y-1">
          <p className="text-[10.5px] uppercase tracking-wide text-muted-foreground">Trading</p>
          {TOGGLES.map((t) => (
            <div key={t.key} className="flex items-center gap-3 py-1.5">
              <div className="min-w-0">
                <p className="text-[12.5px] font-medium">{t.label}</p>
                <p className="text-[11px] text-muted-foreground">{t.hint}</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={toggles[t.key]}
                aria-label={t.label}
                onClick={() => setToggles((s) => ({ ...s, [t.key]: !s[t.key] }))}
                className={`ml-auto flex h-5 w-9 shrink-0 items-center rounded-full p-0.5 transition-colors ${
                  toggles[t.key] ? "bg-primary" : "bg-secondary"
                }`}
              >
                <span
                  className={`size-4 rounded-full bg-card shadow transition-transform ${
                    toggles[t.key] ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
