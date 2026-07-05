import { getTranslations } from "next-intl/server";
import { LogInIcon, LogOutIcon, SendIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { verifySession } from "@/lib/supabase/dal";
import { createClient } from "@/lib/supabase/server";
import { getOwnProperty } from "@/lib/property/current";
import { todayInBatumiISO } from "@/lib/dates";
import { renderTemplate } from "@/lib/messaging/render-template";
import { SendButton } from "./send-button";

type Room = {
  label: string;
  wifi_ssid: string | null;
  wifi_password: string | null;
  checkout_time: string | null;
};

type Guest = {
  id: string;
  name: string;
  phone: string;
  language: string;
  check_in_date: string;
  rooms: Room | null;
};

type Template = { id: string; content: string };

function templateFor(
  templates: { id: string; stage: string; language: string; content: string }[],
  stage: string,
  language: string,
): Template | null {
  const exact = templates.find((t) => t.stage === stage && t.language === language);
  if (exact) return exact;
  const fallback = templates.find((t) => t.stage === stage && t.language === "en");
  return fallback ?? null;
}

export default async function DashboardPage() {
  const user = await verifySession();
  const t = await getTranslations("dashboard");
  const property = await getOwnProperty();
  const supabase = await createClient();
  const today = todayInBatumiISO();

  const guestSelect =
    "id, name, phone, language, check_in_date, check_out_date, rooms(label, wifi_ssid, wifi_password, checkout_time)";

  const [{ data: arriving }, { data: departing }, { data: templates }, { count: sentCount }] =
    await Promise.all([
      supabase.from("guests").select(guestSelect).eq("check_in_date", today).order("check_in_date"),
      supabase.from("guests").select(guestSelect).eq("check_out_date", today).order("check_out_date"),
      supabase
        .from("message_templates")
        .select("id, stage, language, content")
        .in("stage", ["checkin_day", "checkout", "review_request"]),
      supabase.from("message_log").select("id", { count: "exact", head: true }),
    ]);

  const defaultCheckoutTime = property?.default_checkout_time?.slice(0, 5) ?? "";
  const allTemplates = templates ?? [];

  function guestVars(guest: Guest) {
    const room = guest.rooms as unknown as Room | null;
    return {
      guest_name: guest.name,
      room_label: room?.label ?? "",
      checkin_date: guest.check_in_date,
      checkout_time: room?.checkout_time?.slice(0, 5) || defaultCheckoutTime,
      wifi_ssid: room?.wifi_ssid ?? "",
      wifi_password: room?.wifi_password ?? "",
    };
  }

  // ~3 minutes of manual typing/lookup saved per message — a documented
  // starting assumption, not a measured figure. See CLAUDE.md.
  const minutesSaved = (sentCount ?? 0) * 3;
  const hoursSaved = (minutesSaved / 60).toFixed(1);

  const arrivingList = (arriving ?? []) as unknown as Guest[];
  const departingList = (departing ?? []) as unknown as Guest[];

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 sm:p-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">
          {t("signedInAs", { email: user.email ?? "" })}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
        <SendIcon className="size-4 shrink-0 text-primary" />
        <span className="text-sm font-medium">{t("messagesSent", { count: sentCount ?? 0 })}</span>
        <span className="text-sm text-muted-foreground">{t("timeSaved", { hours: hoursSaved })}</span>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <LogInIcon className="size-4 text-primary" />
            {t("arrivingToday")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {arrivingList.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("noArrivals")}</p>
          ) : (
            <div className="flex flex-col divide-y rounded-lg border">
              {arrivingList.map((guest) => {
                const room = guest.rooms as unknown as Room | null;
                const template = templateFor(allTemplates, "checkin_day", guest.language);
                const message = template
                  ? renderTemplate(template.content, guestVars(guest))
                  : "";
                return (
                  <div
                    key={guest.id}
                    className="flex items-center justify-between gap-4 p-3"
                  >
                    <div className="flex min-w-0 flex-col gap-0.5">
                      <span className="text-sm font-medium">{guest.name}</span>
                      <span className="text-sm text-muted-foreground">{room?.label ?? "—"}</span>
                    </div>
                    <SendButton
                      guestId={guest.id}
                      templateId={template?.id ?? null}
                      phone={guest.phone}
                      message={message}
                      label={t("sendCheckinInfo")}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <LogOutIcon className="size-4 text-primary" />
            {t("departingToday")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {departingList.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("noDepartures")}</p>
          ) : (
            <div className="flex flex-col divide-y rounded-lg border">
              {departingList.map((guest) => {
                const room = guest.rooms as unknown as Room | null;
                const checkoutTemplate = templateFor(allTemplates, "checkout", guest.language);
                const reviewTemplate = templateFor(allTemplates, "review_request", guest.language);
                const vars = guestVars(guest);
                const checkoutMessage = checkoutTemplate
                  ? renderTemplate(checkoutTemplate.content, vars)
                  : "";
                const reviewMessage = reviewTemplate
                  ? renderTemplate(reviewTemplate.content, vars)
                  : "";
                return (
                  <div
                    key={guest.id}
                    className="flex flex-wrap items-center justify-between gap-3 p-3"
                  >
                    <div className="flex min-w-0 flex-col gap-0.5">
                      <span className="text-sm font-medium">{guest.name}</span>
                      <span className="text-sm text-muted-foreground">{room?.label ?? "—"}</span>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <SendButton
                        guestId={guest.id}
                        templateId={checkoutTemplate?.id ?? null}
                        phone={guest.phone}
                        message={checkoutMessage}
                        label={t("sendCheckoutReminder")}
                      />
                      <SendButton
                        guestId={guest.id}
                        templateId={reviewTemplate?.id ?? null}
                        phone={guest.phone}
                        message={reviewMessage}
                        label={t("sendReviewRequest")}
                        variant="outline"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
