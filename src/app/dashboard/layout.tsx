import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { verifySession } from "@/lib/supabase/dal";
import { LocaleSwitcher } from "@/i18n/locale-switcher";
import type { Locale } from "@/i18n/config";
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
      <header className="flex flex-wrap items-center justify-between gap-3 border-b p-4">
        <nav className="flex items-center gap-4">
          <Link href="/dashboard" className="text-sm font-medium">
            {t("today")}
          </Link>
          <Link href="/dashboard/guests" className="text-sm font-medium">
            {t("guests")}
          </Link>
          <Link href="/dashboard/settings" className="text-sm font-medium">
            {t("settings")}
          </Link>
        </nav>
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
