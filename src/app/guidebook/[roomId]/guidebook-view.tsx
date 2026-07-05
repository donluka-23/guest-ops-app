"use client";

import { useState } from "react";
import { WifiIcon, ClockIcon, NotebookTextIcon, MapPinIcon, CompassIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CopyableText } from "./copyable-text";
import { GUIDEBOOK_LOCALES, GUIDEBOOK_LABELS, type GuidebookLocale } from "./labels";

type ExtraCategory = "recommendation" | "taxi" | "offering";

type Extra = {
  category: ExtraCategory;
  title: string;
  description: string | null;
  contact_info: string | null;
  price: string | null;
};

export type GuidebookData = {
  room_label: string;
  wifi_ssid: string | null;
  wifi_password: string | null;
  checkout_time: string | null;
  house_rules: string | null;
  map_url: string | null;
  property_name: string;
  property_address: string | null;
  extras: Extra[];
};

const EXTRA_CATEGORIES: ExtraCategory[] = ["recommendation", "taxi", "offering"];

export function GuidebookView({ data }: { data: GuidebookData }) {
  const [locale, setLocale] = useState<GuidebookLocale>("ka");
  const t = GUIDEBOOK_LABELS[locale];

  const groupedExtras = EXTRA_CATEGORIES.map((category) => ({
    category,
    items: data.extras.filter((extra) => extra.category === category),
  })).filter((group) => group.items.length > 0);

  return (
    <div className="relative mx-auto flex min-h-dvh w-full max-w-lg flex-col gap-4 overflow-hidden p-4 pb-10">
      <div
        aria-hidden
        className="pointer-events-none absolute top-[-20%] left-1/2 h-[380px] w-[380px] -translate-x-1/2 rounded-full bg-primary/25 blur-[90px]"
      />

      <div className="z-10 flex items-center justify-between gap-2 pt-2">
        <div className="min-w-0">
          <h1 className="truncate text-xl font-semibold tracking-tight">
            {data.property_name}
          </h1>
          <p className="text-sm text-muted-foreground">{data.room_label}</p>
        </div>
        <div className="flex shrink-0 gap-1">
          {GUIDEBOOK_LOCALES.map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLocale(l)}
              className={`rounded-md border px-2 py-1 text-xs font-medium transition-colors ${
                l === locale
                  ? "border-primary bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="z-10 flex flex-col gap-4">
        {(data.wifi_ssid || data.wifi_password) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <WifiIcon className="size-4 text-primary" />
                WiFi
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {data.wifi_ssid && (
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">{t.wifiNetwork}</span>
                  <CopyableText
                    value={data.wifi_ssid}
                    copyLabel={t.copy}
                    copiedLabel={t.copied}
                  />
                </div>
              )}
              {data.wifi_password && (
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">{t.wifiPassword}</span>
                  <CopyableText
                    value={data.wifi_password}
                    copyLabel={t.copy}
                    copiedLabel={t.copied}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {data.checkout_time && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ClockIcon className="size-4 text-primary" />
                {t.checkoutTime}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{data.checkout_time.slice(0, 5)}</p>
            </CardContent>
          </Card>
        )}

        {data.house_rules && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <NotebookTextIcon className="size-4 text-primary" />
                {t.houseRules}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-line">{data.house_rules}</p>
            </CardContent>
          </Card>
        )}

        {data.map_url && (
          <a
            href={data.map_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium hover:bg-muted"
          >
            <MapPinIcon className="size-4 text-primary" />
            {t.openMap}
          </a>
        )}

        {groupedExtras.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <CompassIcon className="size-4 text-primary" />
                {t.localGuide}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {groupedExtras.map(({ category, items }) => (
                <div key={category} className="flex flex-col gap-2">
                  <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                    {t.category[category]}
                  </h3>
                  <div className="flex flex-col gap-3">
                    {items.map((item, index) => (
                      <div key={index} className="flex flex-col gap-0.5">
                        <span className="text-sm font-medium">{item.title}</span>
                        {item.description && (
                          <span className="text-sm text-muted-foreground">
                            {item.description}
                          </span>
                        )}
                        {(item.contact_info || item.price) && (
                          <span className="text-sm text-muted-foreground">
                            {[item.contact_info, item.price].filter(Boolean).join(" · ")}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
