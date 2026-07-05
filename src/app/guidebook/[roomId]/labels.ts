// The guidebook page is guest-facing, not staff-facing — it deliberately
// does NOT use src/i18n (that system is scoped to the staff dashboard's
// ka/en locales, cookie-based, tied to one staff account's preference).
// A guest has no account and needs ka/en/ru with a simple in-page switch,
// so this is a small standalone dictionary instead of extending next-intl
// to a use case it wasn't designed for.
export const GUIDEBOOK_LOCALES = ["ka", "en", "ru"] as const;
export type GuidebookLocale = (typeof GUIDEBOOK_LOCALES)[number];

type ExtraCategory = "recommendation" | "taxi" | "offering";

export type GuidebookLabels = {
  wifiNetwork: string;
  wifiPassword: string;
  copy: string;
  copied: string;
  checkoutTime: string;
  houseRules: string;
  openMap: string;
  localGuide: string;
  category: Record<ExtraCategory, string>;
  notFoundTitle: string;
  notFoundBody: string;
};

export const GUIDEBOOK_LABELS: Record<GuidebookLocale, GuidebookLabels> = {
  ka: {
    wifiNetwork: "WiFi ქსელი",
    wifiPassword: "WiFi პაროლი",
    copy: "კოპირება",
    copied: "დაკოპირდა",
    checkoutTime: "გასვლის დრო",
    houseRules: "სახლის წესები",
    openMap: "რუკაზე ნახვა",
    localGuide: "ადგილობრივი გზამკვლევი",
    category: {
      recommendation: "რეკომენდაციები",
      taxi: "ტაქსი",
      offering: "შეთავაზებები",
    },
    notFoundTitle: "ბმული ვერ მოიძებნა",
    notFoundBody: "ეს ბმული აღარ არის აქტიური. დაუკავშირდით მასპინძელს.",
  },
  en: {
    wifiNetwork: "WiFi network",
    wifiPassword: "WiFi password",
    copy: "Copy",
    copied: "Copied",
    checkoutTime: "Checkout time",
    houseRules: "House rules",
    openMap: "Open map",
    localGuide: "Local guide",
    category: {
      recommendation: "Recommendations",
      taxi: "Taxi",
      offering: "Offerings",
    },
    notFoundTitle: "Link not found",
    notFoundBody: "This link isn't active. Please contact your host.",
  },
  ru: {
    wifiNetwork: "Сеть WiFi",
    wifiPassword: "Пароль WiFi",
    copy: "Копировать",
    copied: "Скопировано",
    checkoutTime: "Время выезда",
    houseRules: "Правила проживания",
    openMap: "Открыть карту",
    localGuide: "Гид по окрестностям",
    category: {
      recommendation: "Рекомендации",
      taxi: "Такси",
      offering: "Услуги",
    },
    notFoundTitle: "Ссылка не найдена",
    notFoundBody: "Эта ссылка больше не активна. Свяжитесь с хозяином.",
  },
};
