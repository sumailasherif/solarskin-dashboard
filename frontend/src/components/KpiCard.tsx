// One "headline number" card, e.g. "Energy generated: 412 kWh".
// This replaces the four copy-pasted <div class="card"> blocks from the first prototype.

type KpiCardProps = {
  label: string;
  /** The number to show. null = we have no data yet (we never invent a value). */
  value: number | null;
  unit: string;
  /** Optional small grey line under the unit, e.g. the source of a factor. */
  note?: string;
  noDataText: string;
};

export function KpiCard({ label, value, unit, note, noDataText }: KpiCardProps) {
  return (
    <article className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-navy/5">
      <h2 className="text-sm font-semibold text-navy/70">{label}</h2>

      {value === null ? (
        <p className="mt-3 text-2xl font-bold text-navy/30">{noDataText}</p>
      ) : (
        <p className="mt-3 text-4xl font-extrabold tabular-nums">
          {value.toLocaleString()}
          <span className="ml-1.5 text-base font-semibold text-navy/60">{unit}</span>
        </p>
      )}

      {note && <p className="mt-1 text-xs text-navy/50">{note}</p>}
    </article>
  );
}
