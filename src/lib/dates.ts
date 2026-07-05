// Georgia (Batumi) is fixed UTC+4 year-round — no DST since 2017 — so a
// simple, deterministic offset is reliable here without a timezone
// library. Deriving "today" from server time (Vercel runs UTC) directly
// would show yesterday's date for a 4-hour window every evening.
const BATUMI_UTC_OFFSET_HOURS = 4;

export function todayInBatumiISO(): string {
  const now = new Date();
  const batumiNow = new Date(now.getTime() + BATUMI_UTC_OFFSET_HOURS * 60 * 60 * 1000);
  return batumiNow.toISOString().slice(0, 10);
}
