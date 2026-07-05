import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { verifySession } from "@/lib/supabase/dal";
import { createClient } from "@/lib/supabase/server";
import { GuestForm } from "../../guest-form";
import { updateGuest } from "../../actions";

export default async function EditGuestPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await verifySession();
  const { id } = await params;
  const supabase = await createClient();
  const t = await getTranslations("guests");

  // RLS scopes this to the signed-in staff member's own property; a guest
  // belonging to a property they aren't linked to simply doesn't come back
  // here (not a 403 — it's invisible, same as it not existing).
  const [{ data: guest }, { data: rooms }] = await Promise.all([
    supabase
      .from("guests")
      .select(
        "id, name, phone, room_id, check_in_date, check_out_date, language, source_channel, status",
      )
      .eq("id", id)
      .maybeSingle(),
    supabase.from("rooms").select("id, label").order("label"),
  ]);

  if (!guest) {
    notFound();
  }

  const boundUpdateGuest = updateGuest.bind(null, guest.id);

  return (
    <div className="flex flex-1 items-start justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>{t("editGuest")}</CardTitle>
        </CardHeader>
        <CardContent>
          <GuestForm
            mode="edit"
            rooms={rooms ?? []}
            action={boundUpdateGuest}
            initialValues={{
              name: guest.name,
              phone: guest.phone,
              roomId: guest.room_id,
              checkInDate: guest.check_in_date,
              checkOutDate: guest.check_out_date,
              language: guest.language,
              sourceChannel: guest.source_channel,
              status: guest.status,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
