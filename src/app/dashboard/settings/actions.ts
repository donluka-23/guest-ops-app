"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { verifySession } from "@/lib/supabase/dal";
import { getOwnProperty } from "@/lib/property/current";
import {
  validateRoomForm,
  validateTemplateForm,
  validateExtraForm,
  type RoomFieldErrors,
  type TemplateFieldErrors,
  type ExtraFieldErrors,
} from "@/lib/settings/validation";
import { isValidTimeString } from "@/lib/settings/constants";

// fieldErrors/formError values are translation keys — see
// messages/*.json under "settings.rooms.errors" / "settings.templates.errors".

export type PropertyDefaultsState = { formError?: string; success?: boolean } | undefined;

export async function updatePropertyDefaults(
  _prevState: PropertyDefaultsState,
  formData: FormData,
): Promise<PropertyDefaultsState> {
  await verifySession();

  const checkoutTime = String(formData.get("defaultCheckoutTime") ?? "").trim();
  if (!isValidTimeString(checkoutTime)) {
    return { formError: "checkoutTimeInvalid" };
  }

  const property = await getOwnProperty();
  if (!property) {
    return { formError: "saveFailed" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("properties")
    .update({ default_checkout_time: checkoutTime })
    .eq("id", property.id);

  if (error) {
    return { formError: "saveFailed" };
  }

  revalidatePath("/dashboard/settings");
  return { success: true };
}

export type RoomFormState =
  | { fieldErrors?: RoomFieldErrors; formError?: string; success?: boolean }
  | undefined;

export async function upsertRoom(
  _prevState: RoomFormState,
  formData: FormData,
): Promise<RoomFormState> {
  await verifySession();

  const result = validateRoomForm(formData);
  if ("fieldErrors" in result) return { fieldErrors: result.fieldErrors };
  const { data } = result;

  const roomId = String(formData.get("id") ?? "").trim();
  const supabase = await createClient();

  const payload = {
    label: data.label,
    wifi_ssid: data.wifiSsid || null,
    wifi_password: data.wifiPassword || null,
    checkout_time: data.checkoutTime || null,
    house_rules: data.houseRules || null,
  };

  if (roomId) {
    // Existing row's property_id (unchanged by this update) is what RLS
    // checks — a room from another property simply isn't visible/updatable
    // regardless of what's submitted here.
    const { error } = await supabase.from("rooms").update(payload).eq("id", roomId);
    if (error) return { formError: "saveFailed" };
  } else {
    const property = await getOwnProperty();
    if (!property) return { formError: "saveFailed" };

    const { error } = await supabase
      .from("rooms")
      .insert({ ...payload, property_id: property.id });
    if (error) return { formError: "saveFailed" };
  }

  revalidatePath("/dashboard/settings");
  return { success: true };
}

export type TemplateFormState =
  | { fieldErrors?: TemplateFieldErrors; formError?: string; success?: boolean }
  | undefined;

export async function upsertTemplate(
  _prevState: TemplateFormState,
  formData: FormData,
): Promise<TemplateFormState> {
  await verifySession();

  const result = validateTemplateForm(formData);
  if ("fieldErrors" in result) return { fieldErrors: result.fieldErrors };
  const { data } = result;

  const templateId = String(formData.get("id") ?? "").trim();
  const supabase = await createClient();

  const payload = {
    stage: data.stage,
    language: data.language,
    content: data.content,
  };

  if (templateId) {
    const { error } = await supabase
      .from("message_templates")
      .update(payload)
      .eq("id", templateId);
    if (error) return { formError: "saveFailed" };
  } else {
    const property = await getOwnProperty();
    if (!property) return { formError: "saveFailed" };

    const { error } = await supabase
      .from("message_templates")
      .insert({ ...payload, property_id: property.id });
    if (error) return { formError: "saveFailed" };
  }

  revalidatePath("/dashboard/settings");
  return { success: true };
}

export async function deleteTemplate(templateId: string) {
  await verifySession();
  const supabase = await createClient();
  await supabase.from("message_templates").delete().eq("id", templateId);
  revalidatePath("/dashboard/settings");
}

export type ExtraFormState =
  | { fieldErrors?: ExtraFieldErrors; formError?: string; success?: boolean }
  | undefined;

export async function upsertExtra(
  _prevState: ExtraFormState,
  formData: FormData,
): Promise<ExtraFormState> {
  await verifySession();

  const result = validateExtraForm(formData);
  if ("fieldErrors" in result) return { fieldErrors: result.fieldErrors };
  const { data } = result;

  const extraId = String(formData.get("id") ?? "").trim();
  const supabase = await createClient();

  const payload = {
    category: data.category,
    title: data.title,
    description: data.description || null,
    contact_info: data.contactInfo || null,
    price: data.price || null,
    display_order: data.displayOrder,
  };

  if (extraId) {
    const { error } = await supabase.from("property_extras").update(payload).eq("id", extraId);
    if (error) return { formError: "saveFailed" };
  } else {
    const property = await getOwnProperty();
    if (!property) return { formError: "saveFailed" };

    const { error } = await supabase
      .from("property_extras")
      .insert({ ...payload, property_id: property.id });
    if (error) return { formError: "saveFailed" };
  }

  revalidatePath("/dashboard/settings");
  return { success: true };
}

export async function deleteExtra(extraId: string) {
  await verifySession();
  const supabase = await createClient();
  await supabase.from("property_extras").delete().eq("id", extraId);
  revalidatePath("/dashboard/settings");
}
