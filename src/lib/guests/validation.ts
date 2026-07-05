import {
  LANGUAGE_VALUES,
  SOURCE_CHANNEL_VALUES,
  STATUS_VALUES,
  normalizePhone,
} from "@/lib/guests/constants";

// Error values are translation keys under the "guests.form.errors"
// namespace (see messages/*.json), not text — this module stays
// i18n-agnostic and the form translates them at render time.
export type GuestFieldErrors = Partial<
  Record<
    | "name"
    | "phone"
    | "roomId"
    | "checkInDate"
    | "checkOutDate"
    | "language"
    | "sourceChannel"
    | "status",
    string
  >
>;

export type GuestFormValues = {
  name: string;
  phone: string;
  roomId: string;
  checkInDate: string;
  checkOutDate: string;
  language: string;
  sourceChannel: string;
  status: string;
};

function isIsoDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value));
}

export function validateGuestForm(
  formData: FormData,
): { data: GuestFormValues } | { fieldErrors: GuestFieldErrors } {
  const errors: GuestFieldErrors = {};

  const name = String(formData.get("name") ?? "").trim();
  if (!name) errors.name = "nameRequired";

  const phone = normalizePhone(String(formData.get("phone") ?? "")).trim();
  const phoneDigitCount = phone.replace(/\D/g, "").length;
  if (!phone) {
    errors.phone = "phoneRequired";
  } else if (phoneDigitCount < 7) {
    errors.phone = "phoneTooShort";
  }

  const roomId = String(formData.get("roomId") ?? "");
  if (!roomId) errors.roomId = "roomRequired";

  const checkInDate = String(formData.get("checkInDate") ?? "");
  if (!isIsoDate(checkInDate)) errors.checkInDate = "checkInInvalid";

  const checkOutDate = String(formData.get("checkOutDate") ?? "");
  if (!isIsoDate(checkOutDate)) {
    errors.checkOutDate = "checkOutInvalid";
  } else if (isIsoDate(checkInDate) && checkOutDate <= checkInDate) {
    errors.checkOutDate = "checkOutBeforeCheckIn";
  }

  const language = String(formData.get("language") ?? "");
  if (!LANGUAGE_VALUES.includes(language as (typeof LANGUAGE_VALUES)[number])) {
    errors.language = "languageRequired";
  }

  const sourceChannel = String(formData.get("sourceChannel") ?? "");
  if (
    !SOURCE_CHANNEL_VALUES.includes(
      sourceChannel as (typeof SOURCE_CHANNEL_VALUES)[number],
    )
  ) {
    errors.sourceChannel = "sourceRequired";
  }

  const status = String(formData.get("status") ?? "upcoming");
  if (!STATUS_VALUES.includes(status as (typeof STATUS_VALUES)[number])) {
    errors.status = "statusRequired";
  }

  if (Object.keys(errors).length > 0) {
    return { fieldErrors: errors };
  }

  return {
    data: {
      name,
      phone,
      roomId,
      checkInDate,
      checkOutDate,
      language,
      sourceChannel,
      status,
    },
  };
}
