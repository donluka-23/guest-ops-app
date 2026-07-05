"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { verifySession } from "@/lib/supabase/dal";

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

// Fire-and-forget from the client (SendButton already shows "sent"
// optimistically before this resolves). Resolves the guest's property_id
// through the caller's own RLS-scoped client rather than trusting a
// client-supplied value — same pattern as guests/settings actions — so
// this can only ever log against a property the signed-in staff member is
// actually linked to.
export async function logMessageSent(guestId: string, templateId: string) {
  const user = await verifySession();
  const supabase = await createClient();

  const { data: guest } = await supabase
    .from("guests")
    .select("property_id")
    .eq("id", guestId)
    .maybeSingle();

  if (!guest) return;

  await supabase.from("message_log").insert({
    property_id: guest.property_id,
    guest_id: guestId,
    template_id: templateId,
    sent_by: user.id,
  });
}
