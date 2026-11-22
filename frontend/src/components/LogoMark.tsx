// The SolarSkin logo mark: a green leaf whose surface is a grid of solar cells,
// with a small sun at its tip. Leaf = sustainability, cells = solar, sun = energy.
export function LogoMark({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden>
      <defs>
        {/* A leaf shape: two curves meeting at the tips */}
        <clipPath id="leaf-clip">
          <path d="M6 34 C6 16 16 6 34 6 C34 24 24 34 6 34 Z" />
        </clipPath>
      </defs>
      <path d="M6 34 C6 16 16 6 34 6 C34 24 24 34 6 34 Z" fill="#4cc27a" />
      {/* Solar-cell grid, only visible inside the leaf */}
      <g clipPath="url(#leaf-clip)" stroke="#04160f" strokeWidth="1.2" opacity="0.55">
        {[12, 18, 24, 30].map((v) => (
          <g key={v}>
            <line x1={v} y1="0" x2={v} y2="40" />
            <line x1="0" y1={v} x2="40" y2={v} />
          </g>
        ))}
      </g>
      {/* The leaf's central vein */}
      <path d="M6 34 L30 10" stroke="#04160f" strokeWidth="1.6" strokeLinecap="round" />
      {/* The sun */}
      <circle cx="33" cy="7" r="5" fill="#f5b82e" />
    </svg>
  );
}
