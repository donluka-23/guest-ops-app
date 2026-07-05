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
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-4">
      <div className="w-full max-w-sm flex justify-end">
        <LocaleSwitcher currentLocale={locale} />
      </div>
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>ORBI City</CardTitle>
          <CardDescription>{t("subtitle")}</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm next={next} />
        </CardContent>
      </Card>
    </div>
  );
}
