"use client";

import { useState, useEffect } from "react";

export function useOrigin() {
  const [origin, setOrigin] = useState<string>("");
  const [host, setHost] = useState<string>("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
      setHost(window.location.host);
    }
  }, []);

  return { origin, host };
}
