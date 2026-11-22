// A yellow band of words scrolling sideways forever, e.g. "Generate power ✦ Cool the wall ✦ …".
// The list is drawn twice in a row; moving it left by half its width loops seamlessly.
export function Marquee({ items }: { items: string[] }) {
  const row = (hidden: boolean) => (
    <div className="flex shrink-0 items-center" aria-hidden={hidden || undefined}>
      {items.map((item) => (
        <span key={item} className="flex items-center">
          <span className="px-6 font-display text-lg uppercase sm:text-2xl">{item}</span>
          <svg viewBox="0 0 20 20" className="h-5 w-5 text-forest" aria-hidden>
            {/* a small leaf as the separator */}
            <path d="M3 17 C3 8 8 3 17 3 C17 12 12 17 3 17 Z" fill="currentColor" />
          </svg>
        </span>
      ))}
    </div>
  );

  return (
    <div className="overflow-hidden bg-solar py-4 text-forest-950">
      <div className="flex w-max animate-marquee">
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}
