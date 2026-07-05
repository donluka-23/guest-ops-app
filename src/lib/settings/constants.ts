// Labels for these values come from translations (messages/*.json,
// namespaces "language" and "templateStage") — these arrays are just the
// allowed values, matching the DB CHECK constraints.
export const TEMPLATE_STAGE_VALUES = [
  "welcome",
  "pre_arrival",
  "checkin_day",
  "mid_stay",
  "checkout",
  "review_request",
] as const;

export const TEMPLATE_LANGUAGE_VALUES = ["en", "ru", "ka"] as const;

// Tokens hosts can insert into template content. Actual substitution
// happens at send-time (Today dashboard, a later step) — this is just the
// literal text the editor inserts.
export const TEMPLATE_VARIABLES = [
  "guest_name",
  "room_label",
  "checkin_date",
  "checkout_time",
  "wifi_ssid",
  "wifi_password",
] as const;

function isValidTimeString(value: string) {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

export { isValidTimeString };

export const EXTRA_CATEGORY_VALUES = ["recommendation", "taxi", "offering"] as const;
