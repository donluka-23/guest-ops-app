"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updatePropertyDefaults, type PropertyDefaultsState } from "./actions";

type Property = { default_checkout_time: string };

export function PropertyDefaultsForm({ property }: { property: Property }) {
  const t = useTranslations("settings.propertyDefaults");
  const tCommon = useTranslations("common");
  const [state, formAction, pending] = useActionState<PropertyDefaultsState, FormData>(
    updatePropertyDefaults,
    undefined,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-2">
            <Label htmlFor="defaultCheckoutTime">{t("defaultCheckoutTime")}</Label>
            <Input
              id="defaultCheckoutTime"
              name="defaultCheckoutTime"
              type="time"
              defaultValue={property.default_checkout_time.slice(0, 5)}
              required
            />
          </div>
          <Button type="submit" disabled={pending}>
            {pending ? tCommon("saving") : tCommon("save")}
          </Button>
          {state?.success && (
            <span className="text-sm text-muted-foreground">{t("saved")}</span>
          )}
          {state?.formError && (
            <p className="w-full text-sm text-destructive">
              {t(`errors.${state.formError}` as never)}
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
