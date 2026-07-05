import { getLocale, getTranslations } from "next-intl/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LocaleSwitcher } from "@/i18n/locale-switcher";
import type { Locale } from "@/i18n/config";
import { LoginForm } from "./login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("login");

  return (
    <div className="relative flex flex-1 flex-col items-center justify-center gap-6 overflow-hidden p-4">
      <div
        aria-hidden
        className="pointer-events-none absolute top-[-25%] left-1/2 h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-primary/30 blur-[100px]"
      />
      <div className="z-10 flex w-full max-w-sm justify-end">
        <LocaleSwitcher currentLocale={locale} />
      </div>
      <Card className="z-10 w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">ORBI City</CardTitle>
          <CardDescription>{t("subtitle")}</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm next={next} />
        </CardContent>
      </Card>
    </div>
  );
}
