export const LANGUAGE_OPTIONS = [
  { value: "en", label: "English" },
  { value: "ru", label: "Русский" },
  { value: "ka", label: "ქართული" },
] as const;

export const SOURCE_CHANNEL_OPTIONS = [
  { value: "booking_com", label: "Booking.com" },
  { value: "airbnb", label: "Airbnb" },
  { value: "home_ge", label: "Home.ge" },
  { value: "myhome_ge", label: "MyHome.ge" },
  { value: "ss_ge", label: "SS.ge" },
  { value: "direct", label: "Direct / Instagram" },
  { value: "walk_in", label: "Walk-in" },
] as const;

export const STATUS_OPTIONS = [
  { value: "upcoming", label: "Upcoming" },
  { value: "checked_in", label: "Checked in" },
  { value: "checked_out", label: "Checked out" },
] as const;

export const LANGUAGE_VALUES = LANGUAGE_OPTIONS.map((o) => o.value);
export const SOURCE_CHANNEL_VALUES = SOURCE_CHANNEL_OPTIONS.map((o) => o.value);
export const STATUS_VALUES = STATUS_OPTIONS.map((o) => o.value);

export function normalizePhone(raw: string): string {
  return raw.replace(/[^\d+ ()-]/g, "");
}
