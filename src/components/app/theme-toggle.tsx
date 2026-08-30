"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

// No-op subscription: there's nothing to subscribe to, this just gives us a
// snapshot that's false during SSR/hydration and true once mounted on the
// client, without a setState-in-effect (the usual `useState` + `useEffect`
// mount-detection trick triggers the react-hooks/set-state-in-effect rule).
function useMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  // Avoid a hydration mismatch: resolvedTheme is unknown on the server, so
  // render a neutral placeholder until we're mounted client-side.
  const mounted = useMounted();

  function toggleTheme(e: React.MouseEvent<HTMLButtonElement>) {
    const next = resolvedTheme === "dark" ? "light" : "dark";

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // Feature-detect at runtime — lib.dom types this as always present, but
    // older/non-Chromium browsers (Firefox, older Safari) don't have it yet.
    if (!("startViewTransition" in document) || reduceMotion) {
      setTheme(next);
      return;
    }

    // Reveal circle grows outward from wherever the toggle button was
    // clicked (the icon lives top-right of the header), covering the
    // farthest corner so it always fills the whole viewport.
    const x = e.clientX;
    const y = e.clientY;
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    document.documentElement.style.setProperty("--vt-x", `${x}px`);
    document.documentElement.style.setProperty("--vt-y", `${y}px`);
    document.documentElement.style.setProperty("--vt-r", `${endRadius}px`);

    document.startViewTransition(() => {
      setTheme(next);
    });
  }

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="size-8 text-muted-foreground"
        aria-label="Toggle theme"
        disabled
      />
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="size-8 text-muted-foreground hover:text-foreground"
      onClick={toggleTheme}
      aria-label={resolvedTheme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    >
      {resolvedTheme === "dark" ? (
        <Sun className="size-4" />
      ) : (
        <Moon className="size-4" />
      )}
    </Button>
  );
}
