/**
 * Ad slot component.
 *
 * When NEXT_PUBLIC_ADSENSE_CLIENT is set (e.g. "ca-pub-XXXXXXXXXXXXXXXX"),
 * real Google AdSense units render here. Otherwise a clearly-labelled
 * placeholder is shown so you can see where ads will appear.
 *
 * How to activate: see "Monetization" in README.md.
 */
const FORMATS = {
  leaderboard: { min: "min-h-[90px]", w: "max-w-[728px]", label: "Leaderboard 728×90" },
  billboard: { min: "min-h-[100px]", w: "max-w-[970px]", label: "Billboard 970×90 / responsive" },
  rectangle: { min: "min-h-[250px]", w: "max-w-[336px]", label: "Rectangle 336×280" },
  inline: { min: "min-h-[100px]", w: "max-w-full", label: "In-content responsive" },
} as const;

export type AdFormat = keyof typeof FORMATS;

export default function AdSlot({
  format = "inline",
  slotId,
  className = "",
}: {
  format?: AdFormat;
  slotId?: string;
  className?: string;
}) {
  const f = FORMATS[format];
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

  if (client) {
    return (
      <div className={`mx-auto ${f.w} ${className}`}>
        <ins
          className="adsbygoogle block"
          style={{ display: "block", minHeight: f.min.replace("min-h-[", "").replace("]", "") }}
          data-ad-client={client}
          data-ad-slot={slotId || "auto"}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
        <script
          dangerouslySetInnerHTML={{ __html: "(adsbygoogle = window.adsbygoogle || []).push({});" }}
        />
      </div>
    );
  }

  return (
    <div
      className={`mx-auto ${f.w} ${f.min} ${className} rounded-xl border border-dashed border-line bg-surface/40 flex flex-col items-center justify-center text-center px-4 py-3 select-none`}
      aria-hidden
    >
      <span className="text-[11px] font-semibold uppercase tracking-widest text-muted/70">
        Ad space · {f.label}
      </span>
      <span className="text-[10px] text-muted/50 mt-0.5">
        Set NEXT_PUBLIC_ADSENSE_CLIENT to go live — see README
      </span>
    </div>
  );
}
