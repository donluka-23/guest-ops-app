import { createClient } from "@/lib/supabase/server";

// Returns the signed-in staff member's own property (RLS on `properties`
// already scopes SELECT to is_staff_of(id), so this can never return
// another property). Picks the first if a user is ever staff of more than
// one — fine for this single-property pilot; a future multi-property
// build would need an explicit property switcher instead of this helper.
export async function getOwnProperty() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("properties")
    .select("id, name, address, default_checkout_time")
    .limit(1)
    .maybeSingle();
  return data;
}
