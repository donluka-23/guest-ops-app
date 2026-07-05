import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { MessageCircleIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { verifySession } from "@/lib/supabase/dal";
import { createClient } from "@/lib/supabase/server";
import { getOwnProperty } from "@/lib/property/current";
import { renderTemplate, templateFor } from "@/lib/messaging/render-template";
import { GuestForm } from "../../guest-form";
import { updateGuest } from "../../actions";
import { SendButton } from "../../../send-button";

const MANUAL_STAGES = ["welcome", "pre_arrival", "mid_stay"] as const;

export default async function EditGuestPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await verifySession();
  const { id } = await params;
  const supabase = await createClient();
  const t = await getTranslations("guests");
  const tMessaging = await getTranslations("guests.messaging");
  const property = await getOwnProperty();

  // RLS scopes this to the signed-in staff member's own property; a guest
  // belonging to a property they aren't linked to simply doesn't come back
  // here (not a 403 — it's invisible, same as it not existing).
  const [{ data: guest }, { data: rooms }, { data: templates }] = await Promise.all([
    supabase
      .from("guests")
      .select(
        "id, name, phone, room_id, check_in_date, check_out_date, language, source_channel, status, rooms(label, wifi_ssid, wifi_password, checkout_time)",
      )
      .eq("id", id)
      .maybeSingle(),
    supabase.from("rooms").select("id, label").order("label"),
    supabase
      .from("message_templates")
      .select("id, stage, language, content")
      .in("stage", MANUAL_STAGES),
  ]);

  if (!guest) {
    notFound();
  }

  const boundUpdateGuest = updateGuest.bind(null, guest.id);
  const room = guest.rooms as unknown as {
    label: string;
    wifi_ssid: string | null;
    wifi_password: string | null;
    checkout_time: string | null;
  } | null;
  const defaultCheckoutTime = property?.default_checkout_time?.slice(0, 5) ?? "";
  const vars = {
    guest_name: guest.name,
    room_label: room?.label ?? "",
    checkin_date: guest.check_in_date,
    checkout_time: room?.checkout_time?.slice(0, 5) || defaultCheckoutTime,
    wifi_ssid: room?.wifi_ssid ?? "",
    wifi_password: room?.wifi_password ?? "",
  };
  const allTemplates = templates ?? [];
  const stageLabels: Record<(typeof MANUAL_STAGES)[number], string> = {
    welcome: tMessaging("sendWelcome"),
    pre_arrival: tMessaging("sendPreArrival"),
    mid_stay: tMessaging("sendMidStay"),
  };

  return (
    <div className="flex flex-1 flex-col items-center gap-6 p-4">
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

      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="flex size-7 items-center justify-center rounded-lg bg-primary/15">
              <MessageCircleIcon className="size-4 text-primary" />
            </div>
            {tMessaging("title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {MANUAL_STAGES.map((stage) => {
            const template = templateFor(allTemplates, stage, guest.language);
            const message = template ? renderTemplate(template.content, vars) : "";
            return (
              <SendButton
                key={stage}
                guestId={guest.id}
                templateId={template?.id ?? null}
                phone={guest.phone}
                message={message}
                label={stageLabels[stage]}
                variant="outline"
              />
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
