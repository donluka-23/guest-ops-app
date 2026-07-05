"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { verifySession } from "@/lib/supabase/dal";
import { validateGuestForm, type GuestFieldErrors } from "@/lib/guests/validation";

// fieldErrors/formError values are translation keys under
// "guests.form.errors" (see messages/*.json) — this module stays
// i18n-agnostic and the form translates them at render time.
export type GuestFormState =
  | { fieldErrors?: GuestFieldErrors; formError?: string }
  | undefined;

// Looks up the room through the caller's own RLS-scoped client and derives
// property_id from it, rather than trusting a client-supplied property id.
// A room from a property the signed-in staff member isn't linked to via
// property_staff is invisible to this query (RLS on `rooms`), so it comes
// back null here — and even if it didn't, the `guests` insert/update below
// would still be rejected by is_staff_of(property_id) on the derived id.
async function resolveOwnRoom(roomId: string) {
  const supabase = await createClient();
  const { data: room } = await supabase
    .from("rooms")
    .select("id, property_id")
    .eq("id", roomId)
    .maybeSingle();
  return room;
}

export async function createGuest(
  _prevState: GuestFormState,
  formData: FormData,
): Promise<GuestFormState> {
  await verifySession();

  const result = validateGuestForm(formData);
  if ("fieldErrors" in result) return { fieldErrors: result.fieldErrors };
  const { data } = result;

  const room = await resolveOwnRoom(data.roomId);
  if (!room) {
    return { fieldErrors: { roomId: "roomNotAvailable" } };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("guests").insert({
    property_id: room.property_id,
    room_id: room.id,
    name: data.name,
    phone: data.phone,
    check_in_date: data.checkInDate,
    check_out_date: data.checkOutDate,
    language: data.language,
    source_channel: data.sourceChannel,
    status: data.status,
    notes: data.notes || null,
  });

  if (error) {
    return { formError: "saveFailedCreate" };
  }

  revalidatePath("/dashboard/guests");
  redirect("/dashboard/guests");
}

export async function updateGuest(
  guestId: string,
  _prevState: GuestFormState,
  formData: FormData,
): Promise<GuestFormState> {
  await verifySession();

  const result = validateGuestForm(formData);
  if ("fieldErrors" in result) return { fieldErrors: result.fieldErrors };
  const { data } = result;

  const room = await resolveOwnRoom(data.roomId);
  if (!room) {
    return { fieldErrors: { roomId: "roomNotAvailable" } };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("guests")
    .update({
      property_id: room.property_id,
      room_id: room.id,
      name: data.name,
      phone: data.phone,
      check_in_date: data.checkInDate,
      check_out_date: data.checkOutDate,
      language: data.language,
      source_channel: data.sourceChannel,
      status: data.status,
      notes: data.notes || null,
    })
    .eq("id", guestId);

  if (error) {
    return { formError: "saveFailedEdit" };
  }

  revalidatePath("/dashboard/guests");
  redirect("/dashboard/guests");
}
