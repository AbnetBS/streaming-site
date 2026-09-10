"use client";

import { useState } from "react";
import type { Match, StreamLink } from "@/lib/types";

function reportClick(linkId: string) {
  // Fire-and-forget click counter (used to see which links are popular in admin)
  fetch("/api/click", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ linkId }),
    keepalive: true,
  }).catch(() => {});
}

function StreamButton({ link }: { link: StreamLink }) {
  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer nofollow"
      onClick={() => reportClick(link.id)}
      className="flex items-center justify-between gap-3 rounded-xl border border-accent/40 bg-accent/10 hover:bg-accent/20 transition-colors px-4 py-3"
    >
      <span>
        <span className="block font-semibold text-accent">{link.label}</span>
        <span className="block text-xs text-muted mt-0.5">
          Opens the stream in a new tab — provided by a third-party source
        </span>
      </span>
      <span className="flex items-center gap-2 shrink-0">
        {link.quality && (
          <span className="text-[10px] font-bold uppercase bg-surface-2 border border-line rounded px-1.5 py-0.5 text-muted">
            {link.quality}
          </span>
        )}
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-accent">
          <path
            fillRule="evenodd"
            d="M4.25 5.5a.75.75 0 0 1 .75-.75h5.5a.75.75 0 0 1 0 1.5h-3.69l7.44 7.44a.75.75 0 1 1-1.06 1.06L5.75 7.31v3.69a.75.75 0 0 1-1.5 0v-5.5Z"
          />
        </svg>
      </span>
    </a>
  );
}

export default function StreamTabs({ match }: { match: Match }) {
  const [active, setActive] = useState(0);
  const links = match.links;

  if (match.status === "scheduled") {
    return (
      <div className="rounded-xl border border-line bg-surface p-5 text-center">
        <p className="text-sm text-muted">
          Stream links for this match will be available here before and during kickoff.
        </p>
        <p className="text-xs text-muted/70 mt-1">
          (Admins: add links for this match in the{" "}
          <a href="/admin" className="text-accent underline underline-offset-2">
            admin panel
          </a>
          .)
        </p>
      </div>
    );
  }

  if (links.length === 0) {
    return (
      <div className="rounded-xl border border-line bg-surface p-5 text-center">
        <p className="text-sm text-muted">
          {match.status === "live"
            ? "No stream links have been added for this match yet — check back shortly."
            : "No replay links available for this match."}
        </p>
      </div>
    );
  }

  const current = links[Math.min(active, links.length - 1)];

  return (
    <div className="space-y-3">
      {links.length > 1 && (
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Stream links">
          {links.map((l, i) => (
            <button
              key={l.id}
              role="tab"
              aria-selected={i === active}
              onClick={() => setActive(i)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                i === active
                  ? "border-accent bg-accent/15 text-accent"
                  : "border-line bg-surface text-muted hover:text-white hover:border-accent/40"
              }`}
            >
              {l.label}
              {l.quality && (
                <span className="ml-2 text-[10px] font-bold uppercase opacity-70">{l.quality}</span>
              )}
            </button>
          ))}
        </div>
      )}

      {current.embeddable ? (
        <div className="relative rounded-xl overflow-hidden border border-line bg-black aspect-video">
          <iframe
            src={current.url}
            className="absolute inset-0 w-full h-full"
            allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
            allowFullScreen
            referrerPolicy="no-referrer"
            sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
            title={`${match.homeTeam} vs ${match.awayTeam} — ${current.label}`}
          />
        </div>
      ) : (
        <StreamButton link={current} />
      )}

      {!current.embeddable && links.length > 1 && (
        <div className="grid gap-2">
          {links
            .filter((l) => l.id !== current.id)
            .map((l) => (
              <StreamButton key={l.id} link={l} />
            ))}
        </div>
      )}

      <p className="text-[11px] text-muted/70 leading-relaxed">
        Stream links point to third-party websites. MatchDay does not host video. Availability and
        legality depend on your region and the source.
      </p>
    </div>
  );
}
