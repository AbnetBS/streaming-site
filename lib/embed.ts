/**
 * URL helpers for embeddable players (safe to use on client and server).
 *
 * Only video platforms with official embed players are treated as embeddable.
 * YouTube auto-embed means: if a club/league streams a match officially on
 * YouTube, the admin pastes the plain watch link and the site embeds it.
 */

export function toYouTubeEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    const h = u.hostname.replace(/^www\./, "");
    if (h === "youtu.be") {
      const id = u.pathname.slice(1).split("/")[0];
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (h.endsWith("youtube.com")) {
      if (u.pathname === "/watch") {
        const id = u.searchParams.get("v");
        return id ? `https://www.youtube.com/embed/${id}` : null;
      }
      const liveMatch = u.pathname.match(/^\/(?:live|embed|shorts)\/([\w-]{6,})/);
      if (liveMatch) return `https://www.youtube.com/embed/${liveMatch[1]}`;
    }
    return null;
  } catch {
    return null;
  }
}

export function toIframeSrc(url: string): string {
  return toYouTubeEmbedUrl(url) ?? url;
}
