import Link from "next/link";
import { Button } from "@/components/ui/button";
import { verifySession } from "@/lib/supabase/dal";
import { createClient } from "@/lib/supabase/server";
import { STATUS_OPTIONS } from "@/lib/guests/constants";

function statusLabel(value: string) {
  return STATUS_OPTIONS.find((s) => s.value === value)?.label ?? value;
}

export default async function GuestsPage() {
  await verifySession();
  const supabase = await createClient();

  const { data: guests } = await supabase
    .from("guests")
    .select("id, name, phone, check_in_date, check_out_date, status, rooms(label)")
    .order("check_in_date", { ascending: true });

  return (
    <div className="flex flex-1 flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Guests</h1>
        <Button render={<Link href="/dashboard/guests/new" />} nativeButton={false}>
          Add guest
        </Button>
      </div>

      {!guests || guests.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No guests yet. Add your first booking to get started.
        </p>
      ) : (
        <div className="flex flex-col divide-y rounded-lg border">
          {guests.map((guest) => (
            <Link
              key={guest.id}
              href={`/dashboard/guests/${guest.id}/edit`}
              className="flex items-center justify-between gap-4 p-4 hover:bg-muted/50"
            >
              <div>
                <p className="font-medium">{guest.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(guest.rooms as unknown as { label: string } | null)?.label ?? "—"} ·{" "}
                  {guest.check_in_date} → {guest.check_out_date}
                </p>
              </div>
              <span className="text-sm text-muted-foreground">
                {statusLabel(guest.status)}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
