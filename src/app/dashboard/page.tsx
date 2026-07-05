import { getTranslations } from "next-intl/server";
import { verifySession } from "@/lib/supabase/dal";

export default async function DashboardPage() {
  const user = await verifySession();
  const t = await getTranslations("dashboard");

  return (
    <div className="flex flex-1 flex-col gap-4 p-6">
      <div>
        <h1 className="text-xl font-semibold">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">
          {t("signedInAs", { email: user.email ?? "" })}
        </p>
      </div>
      <p className="text-sm text-muted-foreground">{t("placeholder")}</p>
    </div>
  );
}
