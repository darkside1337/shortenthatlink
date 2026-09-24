"use client";

import { useState, useRef, useCallback, useEffect } from "react";

export function useCopyToClipboard<T extends string | number = string | number>(duration = 2000) {
  const [copiedId, setCopiedId] = useState<T | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const copy = useCallback(
    async (id: T, text: string): Promise<boolean> => {
      try {
        await navigator.clipboard.writeText(text);
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }
        setCopiedId(id);
        timerRef.current = setTimeout(() => {
          setCopiedId(null);
        }, duration);
        return true;
      } catch {
        return false;
      }
    },
    [duration]
  );

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return { copiedId, copy };
}
