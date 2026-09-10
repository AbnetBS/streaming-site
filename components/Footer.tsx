export default function Footer() {
  return (
    <footer className="border-t border-line mt-12">
      <div className="max-w-6xl mx-auto px-4 py-6 text-xs text-muted space-y-2">
        <p className="font-semibold text-sm text-slate-300">
          Match<span className="text-accent">Day</span>
        </p>
        <p>
          MatchDay lists football schedules and links to streams. MatchDay does not host, upload, or
          broadcast any video content. All stream links point to third-party sources; watch only
          content you are legally allowed to access in your region.
        </p>
        <p>© {new Date().getFullYear()} MatchDay. All trademarks belong to their respective owners.</p>
      </div>
    </footer>
  );
}
