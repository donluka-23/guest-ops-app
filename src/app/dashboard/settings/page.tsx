import { getTranslations } from "next-intl/server";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { verifySession } from "@/lib/supabase/dal";
import { createClient } from "@/lib/supabase/server";
import { getOwnProperty } from "@/lib/property/current";
import { RoomsTab } from "./rooms-tab";
import { TemplatesTab } from "./templates-tab";

export default async function SettingsPage() {
  await verifySession();
  const t = await getTranslations("settings");
  const property = await getOwnProperty();
  const supabase = await createClient();

  const [{ data: rooms }, { data: templates }] = await Promise.all([
    supabase
      .from("rooms")
      .select("id, label, wifi_ssid, wifi_password, checkout_time, house_rules")
      .order("label"),
    supabase
      .from("message_templates")
      .select("id, stage, language, content")
      .order("stage"),
  ]);

  if (!property) {
    return <div className="p-6 text-sm text-muted-foreground">{t("noProperty")}</div>;
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-6">
      <h1 className="text-xl font-semibold">{t("title")}</h1>
      <Tabs defaultValue="rooms">
        <TabsList>
          <TabsTrigger value="rooms">{t("tabs.rooms")}</TabsTrigger>
          <TabsTrigger value="templates">{t("tabs.templates")}</TabsTrigger>
        </TabsList>
        <TabsContent value="rooms">
          <RoomsTab property={property} rooms={rooms ?? []} />
        </TabsContent>
        <TabsContent value="templates">
          <TemplatesTab templates={templates ?? []} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
