"use client";

import { useEffect, useCallback } from "react";

interface KeyboardShortcutOptions {
  key: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  meta?: boolean;
  preventDefault?: boolean;
  enabled?: boolean;
}

export function useKeyboardShortcut(
  options: KeyboardShortcutOptions,
  callback: () => void
) {
  const {
    key,
    ctrl = false,
    alt = false,
    shift = false,
    meta = false,
    preventDefault = true,
    enabled = true,
  } = options;

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      const matchesKey = event.key.toLowerCase() === key.toLowerCase();
      const matchesCtrl = ctrl ? event.ctrlKey : !event.ctrlKey;
      const matchesAlt = alt ? event.altKey : !event.altKey;
      const matchesShift = shift ? event.shiftKey : !event.shiftKey;
      const matchesMeta = meta ? event.metaKey : !event.metaKey;

      if (matchesKey && matchesCtrl && matchesAlt && matchesShift && matchesMeta) {
        if (preventDefault) {
          event.preventDefault();
        }
        callback();
      }
    },
    [key, ctrl, alt, shift, meta, preventDefault, enabled, callback]
  );

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown, enabled]);
}
