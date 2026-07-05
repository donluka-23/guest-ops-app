"use client"

import { useState } from "react"
import {
  ClockIcon,
  CompassIcon,
  CopyIcon,
  CheckIcon,
  MapPinIcon,
  NotebookTextIcon,
  WifiIcon,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type GLocale = "ka" | "en" | "ru"

const GUIDE_LABELS: Record<
  GLocale,
  {
    wifiNetwork: string
    wifiPassword: string
    checkoutTime: string
    houseRules: string
    openMap: string
    localGuide: string
    copy: string
    copied: string
    category: { recommendation: string; taxi: string; offering: string }
  }
> = {
  ka: {
    wifiNetwork: "ქსელის სახელი",
    wifiPassword: "პაროლი",
    checkoutTime: "გასვლის დრო",
    houseRules: "სახლის წესები",
    openMap: "რუკის გახსნა",
    localGuide: "ადგილობრივი გზამკვლევი",
    copy: "კოპირება",
    copied: "დაკოპირდა",
    category: { recommendation: "რეკომენდაციები", taxi: "ტაქსი", offering: "შეთავაზებები" },
  },
  en: {
    wifiNetwork: "Network",
    wifiPassword: "Password",
    checkoutTime: "Checkout time",
    houseRules: "House rules",
    openMap: "Open map",
    localGuide: "Local guide",
    copy: "Copy",
    copied: "Copied",
    category: { recommendation: "Recommendations", taxi: "Taxi", offering: "Offerings" },
  },
  ru: {
    wifiNetwork: "Сеть",
    wifiPassword: "Пароль",
    checkoutTime: "Время выезда",
    houseRules: "Правила дома",
    openMap: "Открыть карту",
    localGuide: "Гид по району",
    copy: "Копировать",
    copied: "Скопировано",
    category: { recommendation: "Рекомендации", taxi: "Такси", offering: "Услуги" },
  },
}

const HOUSE_RULES: Record<GLocale, string> = {
  ka: "ჩუმი საათები 23:00–08:00.\nმოწევა აკრძალულია ოთახში.\nნაგავი დატოვეთ დერეფნის ბოლოს.",
  en: "Quiet hours 23:00–08:00.\nNo smoking indoors.\nLeave trash at the end of the hallway.",
  ru: "Тихие часы 23:00–08:00.\nНе курить в помещении.\nМусор оставляйте в конце коридора.",
}

const GUIDE_EXTRAS: {
  category: "recommendation" | "taxi" | "offering"
  title: string
  description: string | null
  meta: string | null
}[] = [
  { category: "recommendation", title: "Café Batumi Boulevard", description: "Seaside breakfast from 8am.", meta: null },
  { category: "recommendation", title: "Old Town walking route", description: "15 min walk, historic center.", meta: null },
  { category: "taxi", title: "Giorgi (trusted driver)", description: null, meta: "+995 577 10 20 30 · from 25 GEL to airport" },
  { category: "offering", title: "Airport transfer", description: "Book ahead at reception.", meta: "ask reception · from 25 GEL" },
]

function CopyableText({ value, label }: { value: string; label: { copy: string; copied: string } }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard?.writeText(value)
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
      }}
      className="flex items-center justify-between gap-2 rounded-lg border bg-muted/40 px-3 py-2 text-left text-sm font-medium transition-colors hover:bg-muted"
    >
      <span className="truncate">{value}</span>
      <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
        {copied ? <CheckIcon className="size-3.5" /> : <CopyIcon className="size-3.5" />}
        {copied ? label.copied : label.copy}
      </span>
    </button>
  )
}

export function GuidebookScreen() {
  const [locale, setLocale] = useState<GLocale>("ka")
  const t = GUIDE_LABELS[locale]
  const categories: ("recommendation" | "taxi" | "offering")[] = [
    "recommendation",
    "taxi",
    "offering",
  ]

  return (
    <div className="relative mx-auto flex min-h-full w-full max-w-lg flex-col gap-4 overflow-hidden bg-background p-4 pb-10">
      <div
        aria-hidden
        className="pointer-events-none absolute top-[-20%] left-1/2 h-[380px] w-[380px] -translate-x-1/2 rounded-full bg-primary/25 blur-[90px]"
      />

      <div className="z-10 flex items-center justify-between gap-2 pt-2">
        <div className="min-w-0">
          <h1 className="truncate text-xl font-semibold tracking-tight">ORBI City</h1>
          <p className="text-sm text-muted-foreground">ოთახი 1</p>
        </div>
        <div className="flex shrink-0 gap-1">
          {(["ka", "en", "ru"] as GLocale[]).map((l) => (
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <div className="flex size-7 items-center justify-center rounded-lg bg-primary/15">
                <WifiIcon className="size-4 text-primary" />
              </div>
              WiFi
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">{t.wifiNetwork}</span>
              <CopyableText value="ORBI_City_Room1" label={t} />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">{t.wifiPassword}</span>
              <CopyableText value="batumi2026" label={t} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <div className="flex size-7 items-center justify-center rounded-lg bg-primary/15">
                <ClockIcon className="size-4 text-primary" />
              </div>
              {t.checkoutTime}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">12:00</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <div className="flex size-7 items-center justify-center rounded-lg bg-primary/15">
                <NotebookTextIcon className="size-4 text-primary" />
              </div>
              {t.houseRules}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-line">{HOUSE_RULES[locale]}</p>
          </CardContent>
        </Card>

        <a
          href="https://maps.google.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium hover:bg-muted"
        >
          <MapPinIcon className="size-4 text-primary" />
          {t.openMap}
        </a>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <div className="flex size-7 items-center justify-center rounded-lg bg-primary/15">
                <CompassIcon className="size-4 text-primary" />
              </div>
              {t.localGuide}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {categories.map((category) => {
              const items = GUIDE_EXTRAS.filter((e) => e.category === category)
              if (items.length === 0) return null
              return (
                <div key={category} className="flex flex-col gap-2">
                  <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                    {t.category[category]}
                  </h3>
                  <div className="flex flex-col gap-3">
                    {items.map((item, i) => (
                      <div key={i} className="flex flex-col gap-0.5">
                        <span className="text-sm font-medium">{item.title}</span>
                        {item.description && (
                          <span className="text-sm text-muted-foreground">{item.description}</span>
                        )}
                        {item.meta && (
                          <span className="text-sm text-muted-foreground">{item.meta}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
