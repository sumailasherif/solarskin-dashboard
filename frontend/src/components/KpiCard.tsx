// One "headline number" card, e.g. "Energy generated: 412 kWh".
// Dark, leaf-shaped card (two round corners, two tight ones) on the yellow section.

type KpiCardProps = {
  /** Small number in the corner, e.g. "01". */
  index: string;
  label: string;
  /** The number to show. null = we have no data yet (we never invent a value). */
  value: number | null;
  unit: string;
  /** Optional small line under the value, e.g. the source of a factor. */
  note?: string;
  noDataText: string;
};

export function KpiCard({ index, label, value, unit, note, noDataText }: KpiCardProps) {
  return (
    <article className="group flex min-h-56 flex-col justify-between rounded-tl-[2.75rem] rounded-tr-lg rounded-br-[2.75rem] rounded-bl-lg bg-forest-950 p-6 text-white transition hover:-translate-y-1">
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-sm font-semibold">{label}</h3>
        <span className="rounded-full bg-leaf/15 px-2 py-0.5 text-xs text-leaf-300 tabular-nums">
          {index}
        </span>
      </div>

      <div>
        {value === null ? (
          <p className="font-display text-xl text-white/35">{noDataText}</p>
        ) : (
          <p className="font-display text-4xl tabular-nums">
            {value.toLocaleString()}
            <span className="ml-2 font-sans text-base font-semibold text-solar">{unit}</span>
          </p>
        )}
        <p className="mt-2 text-xs text-white/50">
          {value === null ? unit : null}
          {value === null && note ? ' · ' : null}
          {note}
        </p>
      </div>
    </article>
  );
}
