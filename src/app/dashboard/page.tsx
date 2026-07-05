import type { ReactNode } from "react";
import { getLocale, getTranslations } from "next-intl/server";
import { LogInIcon, LogOutIcon, SendIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { verifySession } from "@/lib/supabase/dal";
import { createClient } from "@/lib/supabase/server";
import { getOwnProperty } from "@/lib/property/current";
import { addDaysToISO, todayInBatumiISO } from "@/lib/dates";
import { renderTemplate, templateFor, type TemplateRow } from "@/lib/messaging/render-template";
import { SendButton } from "./send-button";

const WEEK_LENGTH_DAYS = 7;

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
  check_out_date: string;
  rooms: Room | null;
};

type Labels = {
  sendCheckinInfo: string;
  sendCheckoutReminder: string;
  sendReviewRequest: string;
};

function guestVars(guest: Guest, defaultCheckoutTime: string) {
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

function groupByDate<T extends { check_in_date: string; check_out_date: string }>(
  guests: T[],
  dateField: "check_in_date" | "check_out_date",
  days: string[],
): Map<string, T[]> {
  const groups = new Map<string, T[]>();
  for (const day of days) {
    const dayGuests = guests.filter((guest) => guest[dateField] === day);
    if (dayGuests.length > 0) groups.set(day, dayGuests);
  }
  return groups;
}

function ArrivalRow({
  guest,
  templates,
  defaultCheckoutTime,
  labels,
}: {
  guest: Guest;
  templates: TemplateRow[];
  defaultCheckoutTime: string;
  labels: Labels;
}) {
  const room = guest.rooms as unknown as Room | null;
  const template = templateFor(templates, "checkin_day", guest.language);
  const message = template
    ? renderTemplate(template.content, guestVars(guest, defaultCheckoutTime))
    : "";
  return (
    <div className="flex items-center justify-between gap-4 p-3">
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="text-sm font-medium">{guest.name}</span>
        <span className="text-sm text-muted-foreground">{room?.label ?? "—"}</span>
      </div>
      <SendButton
        guestId={guest.id}
        templateId={template?.id ?? null}
        phone={guest.phone}
        message={message}
        label={labels.sendCheckinInfo}
      />
    </div>
  );
}

function DepartureRow({
  guest,
  templates,
  defaultCheckoutTime,
  labels,
}: {
  guest: Guest;
  templates: TemplateRow[];
  defaultCheckoutTime: string;
  labels: Labels;
}) {
  const room = guest.rooms as unknown as Room | null;
  const checkoutTemplate = templateFor(templates, "checkout", guest.language);
  const reviewTemplate = templateFor(templates, "review_request", guest.language);
  const vars = guestVars(guest, defaultCheckoutTime);
  const checkoutMessage = checkoutTemplate ? renderTemplate(checkoutTemplate.content, vars) : "";
  const reviewMessage = reviewTemplate ? renderTemplate(reviewTemplate.content, vars) : "";
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-3">
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
          label={labels.sendCheckoutReminder}
        />
        <SendButton
          guestId={guest.id}
          templateId={reviewTemplate?.id ?? null}
          phone={guest.phone}
          message={reviewMessage}
          label={labels.sendReviewRequest}
          variant="outline"
        />
      </div>
    </div>
  );
}

function DayGroupedList({
  guests,
  dateField,
  weekDays,
  today,
  todayLabel,
  dayFormatter,
  renderRow,
  emptyLabel,
}: {
  guests: Guest[];
  dateField: "check_in_date" | "check_out_date";
  weekDays: string[];
  today: string;
  todayLabel: string;
  dayFormatter: Intl.DateTimeFormat;
  renderRow: (guest: Guest) => ReactNode;
  emptyLabel: string;
}) {
  const groups = groupByDate(guests, dateField, weekDays);
  if (groups.size === 0) {
    return <p className="text-sm text-muted-foreground">{emptyLabel}</p>;
  }
  return (
    <div className="flex flex-col gap-4">
      {Array.from(groups.entries()).map(([day, dayGuests]) => (
        <div key={day} className="flex flex-col gap-2">
          <p className="text-xs font-medium text-muted-foreground">
            {day === today ? todayLabel : dayFormatter.format(new Date(`${day}T00:00:00Z`))}
          </p>
          <div className="flex flex-col divide-y rounded-lg border">
            {dayGuests.map((guest) => (
              <div key={guest.id}>{renderRow(guest)}</div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default async function DashboardPage() {
  const user = await verifySession();
  const t = await getTranslations("dashboard");
  const locale = await getLocale();
  const property = await getOwnProperty();
  const supabase = await createClient();
  const today = todayInBatumiISO();
  const weekEnd = addDaysToISO(today, WEEK_LENGTH_DAYS - 1);
  const weekDays = Array.from({ length: WEEK_LENGTH_DAYS }, (_, i) => addDaysToISO(today, i));
  const dayFormatter = new Intl.DateTimeFormat(locale, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  const guestSelect =
    "id, name, phone, language, check_in_date, check_out_date, rooms(label, wifi_ssid, wifi_password, checkout_time)";

  const [
    { data: weekArriving },
    { data: weekDeparting },
    { data: templates },
    { count: sentCount },
  ] = await Promise.all([
    supabase
      .from("guests")
      .select(guestSelect)
      .gte("check_in_date", today)
      .lte("check_in_date", weekEnd)
      .order("check_in_date"),
    supabase
      .from("guests")
      .select(guestSelect)
      .gte("check_out_date", today)
      .lte("check_out_date", weekEnd)
      .order("check_out_date"),
    supabase
      .from("message_templates")
      .select("id, stage, language, content")
      .in("stage", ["checkin_day", "checkout", "review_request"]),
    supabase.from("message_log").select("id", { count: "exact", head: true }),
  ]);

  const defaultCheckoutTime = property?.default_checkout_time?.slice(0, 5) ?? "";
  const allTemplates = templates ?? [];
  const labels: Labels = {
    sendCheckinInfo: t("sendCheckinInfo"),
    sendCheckoutReminder: t("sendCheckoutReminder"),
    sendReviewRequest: t("sendReviewRequest"),
  };

  // ~3 minutes of manual typing/lookup saved per message — a documented
  // starting assumption, not a measured figure. See CLAUDE.md.
  const minutesSaved = (sentCount ?? 0) * 3;
  const hoursSaved = (minutesSaved / 60).toFixed(1);

  const weekArrivingList = (weekArriving ?? []) as unknown as Guest[];
  const weekDepartingList = (weekDeparting ?? []) as unknown as Guest[];
  const arrivingToday = weekArrivingList.filter((g) => g.check_in_date === today);
  const departingToday = weekDepartingList.filter((g) => g.check_out_date === today);

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 sm:p-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">
          {t("signedInAs", { email: user.email ?? "" })}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-primary/20 bg-primary/10 px-4 py-3">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/15">
          <SendIcon className="size-4 text-primary" />
        </div>
        <span className="text-sm font-medium">{t("messagesSent", { count: sentCount ?? 0 })}</span>
        <span className="text-sm text-muted-foreground">{t("timeSaved", { hours: hoursSaved })}</span>
      </div>

      <Tabs defaultValue="today">
        <TabsList>
          <TabsTrigger value="today">{t("tabs.today")}</TabsTrigger>
          <TabsTrigger value="week">{t("tabs.thisWeek")}</TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <div className="flex size-7 items-center justify-center rounded-lg bg-primary/15">
                  <LogInIcon className="size-4 text-primary" />
                </div>
                {t("arrivingToday")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {arrivingToday.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t("noArrivals")}</p>
              ) : (
                <div className="flex flex-col divide-y rounded-lg border">
                  {arrivingToday.map((guest) => (
                    <ArrivalRow
                      key={guest.id}
                      guest={guest}
                      templates={allTemplates}
                      defaultCheckoutTime={defaultCheckoutTime}
                      labels={labels}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <div className="flex size-7 items-center justify-center rounded-lg bg-primary/15">
                  <LogOutIcon className="size-4 text-primary" />
                </div>
                {t("departingToday")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {departingToday.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t("noDepartures")}</p>
              ) : (
                <div className="flex flex-col divide-y rounded-lg border">
                  {departingToday.map((guest) => (
                    <DepartureRow
                      key={guest.id}
                      guest={guest}
                      templates={allTemplates}
                      defaultCheckoutTime={defaultCheckoutTime}
                      labels={labels}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="week" className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <div className="flex size-7 items-center justify-center rounded-lg bg-primary/15">
                  <LogInIcon className="size-4 text-primary" />
                </div>
                {t("arrivingThisWeek")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DayGroupedList
                guests={weekArrivingList}
                dateField="check_in_date"
                weekDays={weekDays}
                today={today}
                todayLabel={t("todayLabel")}
                dayFormatter={dayFormatter}
                renderRow={(guest) => (
                  <ArrivalRow
                    guest={guest}
                    templates={allTemplates}
                    defaultCheckoutTime={defaultCheckoutTime}
                    labels={labels}
                  />
                )}
                emptyLabel={t("noArrivalsWeek")}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <div className="flex size-7 items-center justify-center rounded-lg bg-primary/15">
                  <LogOutIcon className="size-4 text-primary" />
                </div>
                {t("departingThisWeek")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DayGroupedList
                guests={weekDepartingList}
                dateField="check_out_date"
                weekDays={weekDays}
                today={today}
                todayLabel={t("todayLabel")}
                dayFormatter={dayFormatter}
                renderRow={(guest) => (
                  <DepartureRow
                    guest={guest}
                    templates={allTemplates}
                    defaultCheckoutTime={defaultCheckoutTime}
                    labels={labels}
                  />
                )}
                emptyLabel={t("noDeparturesWeek")}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
