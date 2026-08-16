import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronDown, Globe, Moon, Settings, Sun, Bell } from "lucide-react";

import { ConnectButton } from "@/components/ConnectButton";
import { useTheme } from "@/hooks/use-theme";
import { DesktopNotificationsPopover } from "@/components/desktop/DesktopNotificationsPopover";
import { DesktopSettingsPopover } from "@/components/desktop/DesktopSettingsPopover";

const NAV: { label: string; active?: boolean; to: string }[] = [
  { label: "Trade", active: true, to: "/" },
  { label: "Portfolio", to: "/account" },
];

const MORE_ITEMS = ["Docs", "Legal"];

function useClickOutside(
  ref: React.RefObject<HTMLElement | null>,
  onClickOutside: () => void,
) {
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClickOutside();
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [ref, onClickOutside]);
}

/** Thin, dense top navigation bar for the desktop terminal. */
export function DesktopTopNav() {
  const [moreOpen, setMoreOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const notificationsRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);

  useClickOutside(notificationsRef, () => setNotificationsOpen(false));
  useClickOutside(settingsRef, () => setSettingsOpen(false));

  const linkCls = (active?: boolean) =>
    `px-2.5 py-1 text-[12.5px] transition-colors hover:text-foreground ${
      active ? "font-medium text-foreground" : "text-muted-foreground"
    }`;

  return (
    <header className="flex h-11 shrink-0 items-center gap-1 border-b border-border bg-card px-3">
      <Link to="/" className="mr-3 flex items-center gap-2">
        <span className="flex size-6 items-center justify-center rounded-full bg-primary">
          <span className="size-2.5 rotate-45 rounded-[2px] bg-card" />
        </span>
        <span className="text-[13px] font-semibold tracking-tight">ASTER</span>
      </Link>

      <nav className="flex items-center">
        {NAV.map((item) => (
          <Link key={item.label} to={item.to} className={linkCls(item.active)}>
            <span className="flex items-center gap-0.5">{item.label}</span>
          </Link>
        ))}

        <div
          className="relative"
          onMouseEnter={() => setMoreOpen(true)}
          onMouseLeave={() => setMoreOpen(false)}
        >
          <button
            type="button"
            aria-haspopup="menu"
            aria-expanded={moreOpen}
            onClick={() => setMoreOpen((o) => !o)}
            className={linkCls(false)}
          >
            <span className="flex items-center gap-0.5">
              More
              <ChevronDown className="size-3 opacity-70" />
            </span>
          </button>

          {moreOpen ? (
            <div className="absolute left-0 top-full z-50 min-w-[140px] rounded-lg border border-border bg-card p-1 shadow-lg">
              {MORE_ITEMS.map((label) => (
                <button
                  key={label}
                  type="button"
                  className="block w-full rounded-md px-3 py-2 text-left text-[12.5px] text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                >
                  {label}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </nav>

      <div className="ml-auto flex items-center gap-2">
        <ConnectButton className="!px-3.5 !py-1 !text-[12.5px]" />
        <button
          aria-label={theme === "light" ? "Switch to warm theme" : "Switch to light theme"}
          title={theme === "light" ? "Warm theme" : "Light theme"}
          onClick={() => setTheme(theme === "light" ? "warm" : "light")}
          className="flex size-6 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground"
        >
          {theme === "light" ? <Moon className="size-3.5" /> : <Sun className="size-3.5" />}
        </button>

        <div className="relative" ref={notificationsRef}>
          <button
            type="button"
            aria-label="Notifications"
            aria-expanded={notificationsOpen}
            aria-haspopup="dialog"
            onClick={() => setNotificationsOpen((o) => !o)}
            className="relative flex size-6 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground"
          >
            <Bell className="size-3.5" />
            <span className="absolute right-0.5 top-0.5 size-1.5 rounded-full bg-primary" />
          </button>
          {notificationsOpen ? <DesktopNotificationsPopover onClose={() => setNotificationsOpen(false)} /> : null}
        </div>

        <div className="relative" ref={settingsRef}>
          <button
            type="button"
            aria-label="Settings"
            aria-expanded={settingsOpen}
            aria-haspopup="dialog"
            onClick={() => setSettingsOpen((o) => !o)}
            className="flex size-6 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground"
          >
            <Settings className="size-3.5" />
          </button>
          {settingsOpen ? <DesktopSettingsPopover onClose={() => setSettingsOpen(false)} /> : null}
        </div>

        <button aria-label="Language" className="p-1 text-muted-foreground hover:text-foreground">
          <Globe className="size-4" />
        </button>
      </div>
    </header>
  );
}
