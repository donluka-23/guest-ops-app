"use client";

import { useTransition } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { setLocale } from "./actions";
import { LOCALES, LOCALE_LABELS, type Locale } from "./config";

export function LocaleSwitcher({ currentLocale }: { currentLocale: Locale }) {
  const [pending, startTransition] = useTransition();

  return (
    <Select
      value={currentLocale}
      onValueChange={(value) => {
        if (value) startTransition(() => setLocale(value));
      }}
      disabled={pending}
      items={LOCALE_LABELS}
    >
      <SelectTrigger aria-label="Language" className="w-fit">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {LOCALES.map((locale) => (
          <SelectItem key={locale} value={locale}>
            {LOCALE_LABELS[locale]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
