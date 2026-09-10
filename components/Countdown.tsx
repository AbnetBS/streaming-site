"use client";

import { useEffect, useState } from "react";

function pad(n: number) {
  return String(Math.max(0, n)).padStart(2, "0");
}

export default function Countdown({ kickoff, compact = false }: { kickoff: string; compact?: boolean }) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  if (now === null) return <span className="tabular-nums">—</span>;

  const diff = new Date(kickoff).getTime() - now;
  if (diff <= 0) return <span className="text-accent font-semibold">Kicking off now</span>;

  const totalSec = Math.floor(diff / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;

  if (compact) {
    return (
      <span className="tabular-nums">
        {days > 0 ? `${days}d ` : ""}
        {pad(hours)}:{pad(mins)}:{pad(secs)}
      </span>
    );
  }

  return (
    <span className="tabular-nums font-mono text-lg">
      {days > 0 && <span>{days}d </span>}
      {pad(hours)}:{pad(mins)}:{pad(secs)}
    </span>
  );
}
