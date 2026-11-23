// Small helpers to show numbers and times the same way on every screen.
// All times are shown in Fergana local time (Asia/Tashkent, UTC+5).
const TZ = 'Asia/Tashkent';

const clockFmt = new Intl.DateTimeFormat('en-GB', {
  timeZone: TZ,
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});
const secondsFmt = new Intl.DateTimeFormat('en-GB', {
  timeZone: TZ,
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
});
const dateFmt = new Intl.DateTimeFormat('en-GB', {
  timeZone: TZ,
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});
const shortDateFmt = new Intl.DateTimeFormat('en-GB', {
  timeZone: TZ,
  weekday: 'short',
  day: 'numeric',
});

/** "14:05" */
export const clock = (ms: number) => clockFmt.format(ms);
/** "14:05:09" */
export const clockSeconds = (ms: number) => secondsFmt.format(ms);
/** "Mon, 23 Nov 2026" */
export const longDate = (ms: number) => dateFmt.format(ms);
/** 'YYYY-MM-DD' → "Mon 23" */
export const dayLabel = (date: string) => shortDateFmt.format(Date.parse(`${date}T12:00:00+05:00`));

/** 1234.5 → "1,234.5" with a fixed number of decimals */
export const num = (x: number, decimals = 0) =>
  x.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

/** 93784 s → "1 d 02:03" */
export function duration(seconds: number) {
  const d = Math.floor(seconds / 86_400);
  const h = Math.floor((seconds % 86_400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const hhmm = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  return d > 0 ? `${d} d ${hhmm}` : hhmm;
}

/** "Good morning" / "Good afternoon" / "Good evening" for a Fergana hour */
export function greeting(hours: number) {
  if (hours < 5 || hours >= 18) return 'Good evening';
  return hours < 12 ? 'Good morning' : 'Good afternoon';
}
