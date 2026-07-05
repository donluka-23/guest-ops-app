import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { UsersIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { verifySession } from "@/lib/supabase/dal";
import { createClient } from "@/lib/supabase/server";

const STATUS_BADGE_VARIANT = {
  upcoming: "outline",
  checked_in: "default",
  checked_out: "secondary",
} as const;

export default async function GuestsPage() {
  await verifySession();
  const supabase = await createClient();
  const t = await getTranslations("guests");
  const tStatus = await getTranslations("guestStatus");

  const { data: guests } = await supabase
    .from("guests")
    .select("id, name, phone, check_in_date, check_out_date, status, rooms(label)")
    .order("check_in_date", { ascending: true });

  return (
    <div className="flex flex-1 flex-col gap-5 p-4 sm:p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <Button render={<Link href="/dashboard/guests/new" />} nativeButton={false}>
          {t("addGuest")}
        </Button>
      </div>

      {!guests || guests.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-10 text-center">
            <UsersIcon className="size-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">{t("empty")}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col divide-y rounded-lg border bg-card">
          {guests.map((guest) => (
            <Link
              key={guest.id}
              href={`/dashboard/guests/${guest.id}/edit`}
              className="flex items-center justify-between gap-4 p-4 hover:bg-muted/50"
            >
              <div className="min-w-0">
                <p className="font-medium">{guest.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(guest.rooms as unknown as { label: string } | null)?.label ?? "—"} ·{" "}
                  {guest.check_in_date} → {guest.check_out_date}
                </p>
              </div>
              <Badge
                variant={
                  STATUS_BADGE_VARIANT[guest.status as keyof typeof STATUS_BADGE_VARIANT]
                }
                className="shrink-0"
              >
                {tStatus(guest.status as "upcoming" | "checked_in" | "checked_out")}
              </Badge>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
