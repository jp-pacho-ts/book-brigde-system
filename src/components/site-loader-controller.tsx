"use client";

import { useEffect } from "react";

const LOADER_SEEN_KEY = "bookbridge_loader_seen";
const HARD_REFRESH_KEY = "bookbridge_hard_refresh_requested";
const VISIBLE_MS = 1200;
const FADE_MS = 450;

function isHardRefreshShortcut(event: KeyboardEvent) {
  const key = event.key.toLowerCase();

  return (
    (event.ctrlKey && key === "f5") ||
    (event.ctrlKey && event.shiftKey && key === "r") ||
    (event.metaKey && event.shiftKey && key === "r")
  );
}

function setSessionFlag(key: string, value: string) {
  try {
    window.sessionStorage.setItem(key, value);
  } catch {
    // Storage can be unavailable in strict privacy modes.
  }
}

function removeSessionFlag(key: string) {
  try {
    window.sessionStorage.removeItem(key);
  } catch {
    // Storage can be unavailable in strict privacy modes.
  }
}

export function SiteLoaderController() {
  useEffect(() => {
    const root = document.documentElement;
    const shouldShow = root.dataset.siteLoader === "show";
    let fadeTimer: number | undefined;
    let hideTimer: number | undefined;

    if (shouldShow) {
      setSessionFlag(LOADER_SEEN_KEY, "true");
      removeSessionFlag(HARD_REFRESH_KEY);

      fadeTimer = window.setTimeout(() => {
        root.dataset.siteLoader = "leaving";
      }, VISIBLE_MS);

      hideTimer = window.setTimeout(() => {
        root.dataset.siteLoader = "hide";
      }, VISIBLE_MS + FADE_MS);
    }

    const rememberHardRefresh = (event: KeyboardEvent) => {
      if (isHardRefreshShortcut(event)) {
        setSessionFlag(HARD_REFRESH_KEY, "true");
      }
    };

    window.addEventListener("keydown", rememberHardRefresh, true);

    return () => {
      window.removeEventListener("keydown", rememberHardRefresh, true);

      if (fadeTimer) {
        window.clearTimeout(fadeTimer);
      }

      if (hideTimer) {
        window.clearTimeout(hideTimer);
      }
    };
  }, []);

  return null;
}
