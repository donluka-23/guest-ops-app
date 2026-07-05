import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { verifySession } from "@/lib/supabase/dal";
import { createClient } from "@/lib/supabase/server";
import { GuestForm } from "../guest-form";
import { createGuest } from "../actions";

export default async function NewGuestPage() {
  await verifySession();
  const supabase = await createClient();

  // RLS on `rooms` already scopes this to properties the signed-in staff
  // member belongs to — a room from another property never appears here.
  const { data: rooms } = await supabase
    .from("rooms")
    .select("id, label")
    .order("label");

  return (
    <div className="flex flex-1 items-start justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Add guest</CardTitle>
        </CardHeader>
        <CardContent>
          <GuestForm mode="create" rooms={rooms ?? []} action={createGuest} />
        </CardContent>
      </Card>
    </div>
  );
}
