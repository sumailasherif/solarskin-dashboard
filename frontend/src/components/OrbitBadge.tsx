// A round yellow button with text slowly spinning around it.
type OrbitBadgeProps = { text: string; href: string; label: string };

export function OrbitBadge({ text, href, label }: OrbitBadgeProps) {
  return (
    <a href={href} aria-label={label} className="group relative grid h-36 w-36 place-items-center">
      {/* The spinning ring of text, drawn along an invisible circle */}
      <svg viewBox="0 0 100 100" className="absolute inset-0 animate-orbit" aria-hidden>
        <defs>
          <path id="orbit-path" d="M50,50 m-42,0 a42,42 0 1,1 84,0 a42,42 0 1,1 -84,0" />
        </defs>
        <text className="fill-white text-[7.4px] font-semibold tracking-[0.18em] uppercase">
          <textPath href="#orbit-path">{text.repeat(2)}</textPath>
        </text>
      </svg>

      {/* The yellow centre with a sun icon */}
      <span className="grid h-20 w-20 place-items-center rounded-full bg-solar text-forest-950 shadow-[0_0_40px_-4px] shadow-solar/70 transition group-hover:scale-110">
        <svg
          viewBox="0 0 24 24"
          className="h-8 w-8"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
      </span>
    </a>
  );
}
