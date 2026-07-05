import {
  TEMPLATE_STAGE_VALUES,
  TEMPLATE_LANGUAGE_VALUES,
  EXTRA_CATEGORY_VALUES,
  isValidTimeString,
} from "@/lib/settings/constants";

// Error/field values are translation keys (see messages/*.json under
// "settings.rooms.errors" / "settings.templates.errors") — kept
// i18n-agnostic here, translated at render time.

export type RoomFieldErrors = Partial<
  Record<"label" | "checkoutTime", string>
>;

export type RoomFormValues = {
  label: string;
  wifiSsid: string;
  wifiPassword: string;
  checkoutTime: string;
  houseRules: string;
};

export function validateRoomForm(
  formData: FormData,
): { data: RoomFormValues } | { fieldErrors: RoomFieldErrors } {
  const errors: RoomFieldErrors = {};

  const label = String(formData.get("label") ?? "").trim();
  if (!label) errors.label = "labelRequired";

  const checkoutTime = String(formData.get("checkoutTime") ?? "").trim();
  if (checkoutTime && !isValidTimeString(checkoutTime)) {
    errors.checkoutTime = "checkoutTimeInvalid";
  }

  if (Object.keys(errors).length > 0) {
    return { fieldErrors: errors };
  }

  return {
    data: {
      label,
      wifiSsid: String(formData.get("wifiSsid") ?? "").trim(),
      wifiPassword: String(formData.get("wifiPassword") ?? "").trim(),
      checkoutTime,
      houseRules: String(formData.get("houseRules") ?? "").trim(),
    },
  };
}

export type TemplateFieldErrors = Partial<
  Record<"stage" | "language" | "content", string>
>;

export type TemplateFormValues = {
  stage: string;
  language: string;
  content: string;
};

export function validateTemplateForm(
  formData: FormData,
): { data: TemplateFormValues } | { fieldErrors: TemplateFieldErrors } {
  const errors: TemplateFieldErrors = {};

  const stage = String(formData.get("stage") ?? "");
  if (!TEMPLATE_STAGE_VALUES.includes(stage as (typeof TEMPLATE_STAGE_VALUES)[number])) {
    errors.stage = "stageRequired";
  }

  const language = String(formData.get("language") ?? "");
  if (
    !TEMPLATE_LANGUAGE_VALUES.includes(
      language as (typeof TEMPLATE_LANGUAGE_VALUES)[number],
    )
  ) {
    errors.language = "languageRequired";
  }

  const content = String(formData.get("content") ?? "").trim();
  if (!content) errors.content = "contentRequired";

  if (Object.keys(errors).length > 0) {
    return { fieldErrors: errors };
  }

  return { data: { stage, language, content } };
}

export type ExtraFieldErrors = Partial<Record<"category" | "title" | "displayOrder", string>>;

export type ExtraFormValues = {
  category: string;
  title: string;
  description: string;
  contactInfo: string;
  price: string;
  displayOrder: number;
};

export function validateExtraForm(
  formData: FormData,
): { data: ExtraFormValues } | { fieldErrors: ExtraFieldErrors } {
  const errors: ExtraFieldErrors = {};

  const category = String(formData.get("category") ?? "");
  if (!EXTRA_CATEGORY_VALUES.includes(category as (typeof EXTRA_CATEGORY_VALUES)[number])) {
    errors.category = "categoryRequired";
  }

  const title = String(formData.get("title") ?? "").trim();
  if (!title) errors.title = "titleRequired";

  const rawDisplayOrder = String(formData.get("displayOrder") ?? "0").trim();
  const displayOrder = Number.parseInt(rawDisplayOrder, 10);
  if (rawDisplayOrder && Number.isNaN(displayOrder)) {
    errors.displayOrder = "displayOrderInvalid";
  }

  if (Object.keys(errors).length > 0) {
    return { fieldErrors: errors };
  }

  return {
    data: {
      category,
      title,
      description: String(formData.get("description") ?? "").trim(),
      contactInfo: String(formData.get("contactInfo") ?? "").trim(),
      price: String(formData.get("price") ?? "").trim(),
      displayOrder: Number.isNaN(displayOrder) ? 0 : displayOrder,
    },
  };
}
