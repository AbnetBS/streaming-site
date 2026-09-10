"use client";

import { useEffect, useState } from "react";

/** Renders an ISO datetime in the visitor's local timezone + timezone name. */
export default function KickoffTime({ iso, className = "" }: { iso: string; className?: string }) {
  const [text, setText] = useState<string>("");

  useEffect(() => {
    const d = new Date(iso);
    const time = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const day = d.toLocaleDateString([], { weekday: "short", day: "numeric", month: "short" });
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setText(`${day} · ${time} (${tz})`);
  }, [iso]);

  return (
    <span className={className} suppressHydrationWarning>
      {text || "\u00A0"}
    </span>
  );
}
