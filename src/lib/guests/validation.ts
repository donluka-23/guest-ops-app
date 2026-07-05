import {
  LANGUAGE_VALUES,
  SOURCE_CHANNEL_VALUES,
  STATUS_VALUES,
  normalizePhone,
} from "@/lib/guests/constants";

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
  if (!name) errors.name = "Enter the guest's name.";

  const phone = normalizePhone(String(formData.get("phone") ?? "")).trim();
  const phoneDigitCount = phone.replace(/\D/g, "").length;
  if (!phone) {
    errors.phone = "Enter a phone number.";
  } else if (phoneDigitCount < 7) {
    errors.phone = "Phone number looks too short.";
  }

  const roomId = String(formData.get("roomId") ?? "");
  if (!roomId) errors.roomId = "Select a room.";

  const checkInDate = String(formData.get("checkInDate") ?? "");
  if (!isIsoDate(checkInDate)) errors.checkInDate = "Enter a valid check-in date.";

  const checkOutDate = String(formData.get("checkOutDate") ?? "");
  if (!isIsoDate(checkOutDate)) {
    errors.checkOutDate = "Enter a valid check-out date.";
  } else if (isIsoDate(checkInDate) && checkOutDate <= checkInDate) {
    errors.checkOutDate = "Check-out must be after check-in.";
  }

  const language = String(formData.get("language") ?? "");
  if (!LANGUAGE_VALUES.includes(language as (typeof LANGUAGE_VALUES)[number])) {
    errors.language = "Select a language.";
  }

  const sourceChannel = String(formData.get("sourceChannel") ?? "");
  if (
    !SOURCE_CHANNEL_VALUES.includes(
      sourceChannel as (typeof SOURCE_CHANNEL_VALUES)[number],
    )
  ) {
    errors.sourceChannel = "Select a booking source.";
  }

  const status = String(formData.get("status") ?? "upcoming");
  if (!STATUS_VALUES.includes(status as (typeof STATUS_VALUES)[number])) {
    errors.status = "Select a status.";
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
