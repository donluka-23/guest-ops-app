import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { GuidebookView, type GuidebookData } from "./guidebook-view";

// Fully public — no verifySession(), no auth of any kind. The Supabase
// client here has no session cookie to work with for an anonymous guest,
// so it operates as the `anon` role, exactly what get_room_guidebook() is
// granted EXECUTE to. There is no RLS policy on `rooms`/`property_extras`
// for anon — this RPC is the only path to this data, by design.
export default async function GuidebookPage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .rpc("get_room_guidebook", { p_room_id: roomId })
    .maybeSingle();

  // Covers both an invalid roomId (not a UUID — the RPC call errors) and a
  // valid-but-unknown room (RPC succeeds with no row): either way, a
  // not-found page, never a raw Postgres error or a blank screen.
  if (error || !data) {
    notFound();
  }

  return <GuidebookView data={data as GuidebookData} />;
}
