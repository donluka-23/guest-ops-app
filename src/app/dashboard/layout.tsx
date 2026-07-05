import { getLocale, getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { verifySession } from "@/lib/supabase/dal";
import { LocaleSwitcher } from "@/i18n/locale-switcher";
import type { Locale } from "@/i18n/config";
import { NavLinks } from "./nav-links";
import { logout } from "./actions";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await verifySession();
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("nav");

  return (
    <div className="flex flex-1 flex-col">
      <header className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 border-b bg-background/95 px-4 py-3.5 shadow-sm backdrop-blur-sm sm:px-6">
        <NavLinks
          labels={{ today: t("today"), guests: t("guests"), settings: t("settings") }}
        />
        <div className="flex items-center gap-2">
          <LocaleSwitcher currentLocale={locale} />
          <span className="hidden text-sm text-muted-foreground sm:inline">
            {user.email}
          </span>
          <form action={logout}>
            <Button type="submit" variant="outline" size="sm">
              {t("logout")}
            </Button>
          </form>
        </div>
      </header>
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
}
