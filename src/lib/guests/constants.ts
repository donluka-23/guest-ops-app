// Labels for these values come from translations (messages/*.json,
// namespaces "language", "sourceChannel", "guestStatus") — these arrays are
// just the allowed values, matching the DB CHECK constraints.
export const LANGUAGE_VALUES = ["en", "ru", "ka"] as const;
export const SOURCE_CHANNEL_VALUES = [
  "booking_com",
  "airbnb",
  "home_ge",
  "myhome_ge",
  "ss_ge",
  "direct",
  "walk_in",
] as const;
export const STATUS_VALUES = ["upcoming", "checked_in", "checked_out"] as const;

export function normalizePhone(raw: string): string {
  return raw.replace(/[^\d+ ()-]/g, "");
}
