"use client";

import { useCallback, useEffect, useState } from "react";
import type { Match, MatchStatus } from "@/lib/types";

/* ---------------------------------- helpers ---------------------------------- */

async function api<T>(
  url: string,
  options?: RequestInit
): Promise<{ ok: boolean; data?: T; error?: string }> {
  try {
    const res = await fetch(url, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: (json as { error?: string }).error || `Error ${res.status}` };
    return { ok: true, data: json as T };
  } catch {
    return { ok: false, error: "Network error" };
  }
}

const inputCls =
  "w-full rounded-lg border border-line bg-surface-2 px-3 py-2 text-sm text-slate-100 placeholder:text-muted/60 focus:outline-none focus:border-accent/60";
const labelCls = "block text-xs font-semibold uppercase tracking-wider text-muted mb-1";
const btnPrimary =
  "rounded-lg bg-accent text-[#052e12] font-semibold text-sm px-4 py-2 hover:bg-accent-strong transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
const btnGhost =
  "rounded-lg border border-line bg-surface px-3 py-1.5 text-sm text-muted hover:text-white hover:border-accent/40 transition-colors";

function fmtLocalInputValue(iso: string) {
  // ISO -> value usable in <input type="datetime-local">
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(
    d.getMinutes()
  )}`;
}

/* ---------------------------------- login ---------------------------------- */

function Login({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const r = await api("/api/admin/login", {
      method: "POST",
      body: JSON.stringify({ password }),
    });
    setBusy(false);
    if (r.ok) onLogin();
    else setError(r.error || "Login failed");
  }

  return (
    <form onSubmit={submit} className="max-w-sm mx-auto mt-16 rounded-2xl border border-line bg-surface p-6 space-y-4">
      <h1 className="text-lg font-bold">Admin sign in</h1>
      <p className="text-xs text-muted">
        Default password is <code className="text-accent">admin123</code> — change it by setting the{" "}
        <code>ADMIN_PASSWORD</code> environment variable (see README).
      </p>
      <div>
        <label className={labelCls} htmlFor="pw">
          Password
        </label>
        <input
          id="pw"
          type="password"
          className={inputCls}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          autoFocus
        />
      </div>
      {error && <p className="text-sm text-live">{error}</p>}
      <button className={btnPrimary} disabled={busy}>
        {busy ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}

/* ---------------------------------- link manager ---------------------------------- */

function LinkManager({ match, onChanged }: { match: Match; onChanged: () => void }) {
  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");
  const [quality, setQuality] = useState("HD");
  const [language, setLanguage] = useState("EN");
  const [embeddable, setEmbeddable] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function addLink(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const r = await api(`/api/admin/matches/${match.id}/links`, {
      method: "POST",
      body: JSON.stringify({ label, url, quality, language, embeddable }),
    });
    setBusy(false);
    if (r.ok) {
      setLabel("");
      setUrl("");
      onChanged();
    } else setError(r.error || "Failed to add link");
  }

  async function removeLink(linkId: string) {
    await api(`/api/admin/links/${linkId}`, { method: "DELETE" });
    onChanged();
  }

  return (
    <div className="mt-4 border-t border-line pt-4 space-y-3">
      <div className="space-y-2">
        {match.links.length === 0 && <p className="text-xs text-muted">No links yet for this match.</p>}
        {match.links.map((l) => (
          <div
            key={l.id}
            className="flex items-center justify-between gap-3 rounded-lg border border-line bg-surface-2 px-3 py-2"
          >
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">
                {l.label}{" "}
                <span className="ml-1 text-[10px] font-bold uppercase text-muted border border-line rounded px-1 py-0.5">
                  {l.quality}
                </span>
                {l.embeddable && (
                  <span className="ml-1 text-[10px] font-bold uppercase text-accent border border-accent/40 rounded px-1 py-0.5">
                    embed
                  </span>
                )}
              </p>
              <p className="text-xs text-muted truncate">
                {l.url} · {l.clicks} clicks
              </p>
            </div>
            <button onClick={() => removeLink(l.id)} className="text-muted hover:text-live text-sm shrink-0">
              Delete
            </button>
          </div>
        ))}
      </div>

      <form onSubmit={addLink} className="grid gap-2 sm:grid-cols-2 items-end">
        <div className="sm:col-span-2">
          <label className={labelCls}>Link label (shown to users)</label>
          <input
            className={inputCls}
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="e.g. Stream 1 · English"
            required
          />
        </div>
        <div className="sm:col-span-2">
          <label className={labelCls}>URL</label>
          <input
            className={inputCls}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://…"
            required
          />
        </div>
        <div>
          <label className={labelCls}>Quality</label>
          <select className={inputCls} value={quality} onChange={(e) => setQuality(e.target.value)}>
            {["HD", "FHD", "SD", "4K"].map((q) => (
              <option key={q}>{q}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>Language</label>
          <select className={inputCls} value={language} onChange={(e) => setLanguage(e.target.value)}>
            {["EN", "AM", "ES", "AR", "FR", "PT", "Other"].map((l) => (
              <option key={l}>{l}</option>
            ))}
          </select>
        </div>
        <label className="flex items-center gap-2 text-sm text-muted select-none">
          <input
            type="checkbox"
            checked={embeddable}
            onChange={(e) => setEmbeddable(e.target.checked)}
            className="accent-[#22c55e] w-4 h-4"
          />
          Embed in player (embeddable source)
        </label>
        <div className="flex items-center justify-end gap-2">
          {error && <span className="text-xs text-live mr-auto">{error}</span>}
          <button className={btnPrimary} disabled={busy}>
            {busy ? "Adding…" : "Add link"}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ---------------------------------- dashboard ---------------------------------- */

function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);

  // create-match form
  const [competition, setCompetition] = useState("");
  const [homeTeam, setHomeTeam] = useState("");
  const [awayTeam, setAwayTeam] = useState("");
  const [kickoff, setKickoff] = useState("");
  const [createError, setCreateError] = useState("");
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    const r = await api<{ matches: Match[] }>("/api/matches");
    if (r.data) setMatches(r.data.matches);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function createMatch(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setCreateError("");
    const r = await api("/api/admin/matches", {
      method: "POST",
      body: JSON.stringify({ competition, homeTeam, awayTeam, kickoff: new Date(kickoff).toISOString() }),
    });
    setBusy(false);
    if (r.ok) {
      setCompetition("");
      setHomeTeam("");
      setAwayTeam("");
      setKickoff("");
      refresh();
    } else setCreateError(r.error || "Failed to create match");
  }

  async function setStatus(id: string, status: MatchStatus) {
    await api(`/api/admin/matches/${id}`, { method: "PATCH", body: JSON.stringify({ status }) });
    refresh();
  }

  async function removeMatch(id: string) {
    if (!confirm("Delete this match and all its links?")) return;
    await api(`/api/admin/matches/${id}`, { method: "DELETE" });
    refresh();
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Match management</h1>
        <button
          onClick={async () => {
            await api("/api/admin/logout", { method: "POST" });
            onLogout();
          }}
          className={btnGhost}
        >
          Sign out
        </button>
      </div>

      {/* Create match */}
      <form onSubmit={createMatch} className="rounded-2xl border border-line bg-surface p-5 space-y-4">
        <h2 className="font-bold">Add a match</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className={labelCls}>Competition</label>
            <input className={inputCls} value={competition} onChange={(e) => setCompetition(e.target.value)} placeholder="e.g. Premier League" required />
          </div>
          <div>
            <label className={labelCls}>Home team</label>
            <input className={inputCls} value={homeTeam} onChange={(e) => setHomeTeam(e.target.value)} placeholder="e.g. Arsenal" required />
          </div>
          <div>
            <label className={labelCls}>Away team</label>
            <input className={inputCls} value={awayTeam} onChange={(e) => setAwayTeam(e.target.value)} placeholder="e.g. Chelsea" required />
          </div>
          <div>
            <label className={labelCls}>Kickoff (your local time)</label>
            <input type="datetime-local" className={inputCls} value={kickoff} onChange={(e) => setKickoff(e.target.value)} required />
          </div>
        </div>
        {createError && <p className="text-sm text-live">{createError}</p>}
        <button className={btnPrimary} disabled={busy}>
          {busy ? "Creating…" : "Create match"}
        </button>
      </form>

      {/* Match list */}
      <div className="space-y-3">
        {matches.length === 0 && <p className="text-sm text-muted">No matches yet — add one above.</p>}
        {matches.map((m) => (
          <div key={m.id} className="rounded-2xl border border-line bg-surface p-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-xs uppercase tracking-wider text-muted font-semibold">{m.competition}</p>
                <p className="font-semibold truncate">
                  {m.homeTeam} <span className="text-muted">vs</span> {m.awayTeam}
                </p>
                <p className="text-xs text-muted mt-0.5">
                  {new Date(m.kickoff).toLocaleString()} · {m.links.length} link{m.links.length === 1 ? "" : "s"}
                </p>
              </div>
              <select
                value={m.status}
                onChange={(e) => setStatus(m.id, e.target.value as MatchStatus)}
                className={`${inputCls} w-auto`}
                aria-label="Match status"
              >
                <option value="scheduled">Scheduled</option>
                <option value="live">Live</option>
                <option value="finished">Finished</option>
              </select>
              <a href={`/match/${m.id}`} target="_blank" rel="noreferrer" className={btnGhost}>
                View
              </a>
              <button
                className={btnGhost}
                onClick={() => setExpanded(expanded === m.id ? null : m.id)}
              >
                {expanded === m.id ? "Close" : "Manage links"}
              </button>
              <button onClick={() => removeMatch(m.id)} className="text-sm text-muted hover:text-live">
                Delete
              </button>
            </div>

            {expanded === m.id && <LinkManager match={m} onChanged={refresh} />}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------- page ---------------------------------- */

export default function AdminPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    api<{ authed: boolean }>("/api/admin/session").then((r) => {
      setAuthed(r.data?.authed ?? false);
    });
  }, []);

  if (authed === null) {
    return <p className="text-sm text-muted text-center mt-16">Loading…</p>;
  }
  if (!authed) return <Login onLogin={() => setAuthed(true)} />;
  return <Dashboard onLogout={() => setAuthed(false)} />;
}
