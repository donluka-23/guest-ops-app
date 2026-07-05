// Presentational-only mock data + Georgian labels for the design showcase.
// Georgian strings are copied verbatim from messages/ka.json so the showcase
// reflects the real staff-facing copy without depending on next-intl / the
// cookie locale system. This file feeds ONLY /design — it is not wired to
// Supabase, auth, or the production screens.

export const KA = {
  nav: { today: "დღეს", guests: "სტუმრები", settings: "პარამეტრები", logout: "გასვლა" },
  login: {
    property: "ORBI City",
    subtitle: "პერსონალის შესვლა",
    email: "ელფოსტა",
    password: "პაროლი",
    signIn: "შესვლა",
  },
  dashboard: {
    title: "დღეს",
    signedInAs: "შესული ხართ როგორც nino@orbicity.ge",
    tabs: { today: "დღეს", thisWeek: "ამ კვირას" },
    arrivingToday: "დღეს ჩამოდიან",
    departingToday: "დღეს მიემგზავრებიან",
    arrivingThisWeek: "ამ კვირას ჩამოდიან",
    departingThisWeek: "ამ კვირას მიემგზავრებიან",
    todayLabel: "დღეს",
    noArrivals: "დღეს ჩამოსვლები არ არის.",
    noDepartures: "დღეს გამგზავრებები არ არის.",
    sendCheckinInfo: "ჩამოსვლის ინფოს გაგზავნა",
    sendCheckoutReminder: "გასვლის შეხსენების გაგზავნა",
    sendReviewRequest: "შეფასების თხოვნის გაგზავნა",
    sent: "გაგზავნილია",
    noTemplate: "შაბლონი არ არის დამატებული",
    messagesSent: (count: number) => `გაგზავნილია ${count} შეტყობინება`,
    timeSaved: (hours: string) => `დაზოგილია დაახლოებით ${hours} საათი`,
  },
  guestStatus: {
    upcoming: "მოსალოდნელი",
    checked_in: "დარეგისტრირებული",
    checked_out: "გასული",
  },
  sourceChannel: {
    booking_com: "Booking.com",
    airbnb: "Airbnb",
    home_ge: "Home.ge",
    myhome_ge: "MyHome.ge",
    ss_ge: "SS.ge",
    direct: "პირდაპირი / Instagram",
    walk_in: "დაუჯავშნებელი სტუმარი",
  },
  language: { en: "ინგლისური", ru: "რუსული", ka: "ქართული" },
  guests: {
    title: "სტუმრები",
    addGuest: "სტუმრის დამატება",
    editGuest: "სტუმრის რედაქტირება",
    empty: "სტუმრები ჯერ არ არის. დაამატეთ პირველი ჯავშანი დასაწყებად.",
    form: {
      name: "სახელი",
      phone: "ტელეფონი",
      room: "ოთახი",
      roomPlaceholder: "აირჩიეთ ოთახი",
      checkIn: "ჩამოსვლა",
      checkOut: "გამგზავრება",
      language: "ენა",
      source: "ჯავშნის წყარო",
      sourcePlaceholder: "აირჩიეთ წყარო",
      status: "სტატუსი",
      notes: "შენიშვნები",
      notesPlaceholder:
        "ცვლის გადაცემის შენიშვნები, თავისებურებები, განსაკუთრებული თხოვნები…",
      submitCreate: "სტუმრის დამატება",
      submitEdit: "ცვლილებების შენახვა",
    },
  },
  templateStage: {
    welcome: "მისალმება",
    pre_arrival: "ჩამოსვლის წინ",
    checkin_day: "ჩამოსვლის დღეს",
    mid_stay: "ყოფნის შუა პერიოდი",
    checkout: "გასვლა",
    review_request: "შეფასების თხოვნა",
  },
  settings: {
    title: "პარამეტრები",
    tabs: { rooms: "ოთახები", templates: "შაბლონები", localGuide: "ადგილობრივი გზამკვლევი" },
    propertyDefaults: {
      title: "საერთო პარამეტრები",
      defaultCheckoutTime: "გასვლის დრო (ნაგულისხმევი)",
    },
    rooms: {
      title: "ოთახები",
      addRoom: "ოთახის დამატება",
      inheritsDefault: "ნაგულისხმევი გამოიყენება",
    },
    templates: { title: "შაბლონები", addTemplate: "შაბლონის დამატება" },
    localGuide: { title: "ადგილობრივი გზამკვლევი", addExtra: "ჩანაწერის დამატება" },
  },
  extraCategory: { recommendation: "რეკომენდაციები", taxi: "ტაქსი", offering: "შეთავაზებები" },
  common: { save: "შენახვა", cancel: "გაუქმება", edit: "რედაქტირება", delete: "წაშლა" },
} as const

export type Status = "upcoming" | "checked_in" | "checked_out"
export type SourceChannel = keyof typeof KA.sourceChannel
export type Lang = "en" | "ru" | "ka"

export type MockGuest = {
  id: string
  name: string
  phone: string
  room: string
  language: Lang
  source: SourceChannel
  checkIn: string
  checkOut: string
  status: Status
}

// A small, realistic ORBI City roster (Batumi). Names are fictional.
export const MOCK_GUESTS: MockGuest[] = [
  {
    id: "g1",
    name: "Lika Beridze",
    phone: "+995 599 12 34 56",
    room: "ოთახი 1",
    language: "ka",
    source: "booking_com",
    checkIn: "2026-07-05",
    checkOut: "2026-07-09",
    status: "checked_in",
  },
  {
    id: "g2",
    name: "Marco Rossi",
    phone: "+39 340 555 21 90",
    room: "ოთახი 3",
    language: "en",
    source: "airbnb",
    checkIn: "2026-07-05",
    checkOut: "2026-07-08",
    status: "upcoming",
  },
  {
    id: "g3",
    name: "Анна Смирнова",
    phone: "+7 921 448 10 22",
    room: "ოთახი 5",
    language: "ru",
    source: "direct",
    checkIn: "2026-07-02",
    checkOut: "2026-07-05",
    status: "checked_out",
  },
  {
    id: "g4",
    name: "David Green",
    phone: "+44 7700 900 812",
    room: "ოთახი 7",
    language: "en",
    source: "home_ge",
    checkIn: "2026-07-07",
    checkOut: "2026-07-11",
    status: "upcoming",
  },
]

export const ARRIVING_TODAY: MockGuest[] = [MOCK_GUESTS[0], MOCK_GUESTS[1]]
export const DEPARTING_TODAY: MockGuest[] = [MOCK_GUESTS[2]]

export type WeekGroup = { day: string; label: string; guests: MockGuest[] }

export const WEEK_ARRIVING: WeekGroup[] = [
  { day: "2026-07-05", label: KA.dashboard.todayLabel, guests: [MOCK_GUESTS[0], MOCK_GUESTS[1]] },
  { day: "2026-07-07", label: "ორშ, 7 ივლ", guests: [MOCK_GUESTS[3]] },
]

export const WEEK_DEPARTING: WeekGroup[] = [
  { day: "2026-07-05", label: KA.dashboard.todayLabel, guests: [MOCK_GUESTS[2]] },
  { day: "2026-07-08", label: "ოთხ, 8 ივლ", guests: [MOCK_GUESTS[1]] },
]

export type MockRoom = {
  id: string
  label: string
  checkoutTime: string | null
}

export const MOCK_ROOMS: MockRoom[] = [
  { id: "r1", label: "ოთახი 1", checkoutTime: null },
  { id: "r3", label: "ოთახი 3", checkoutTime: "11:00" },
  { id: "r5", label: "ოთახი 5", checkoutTime: null },
  { id: "r7", label: "ოთახი 7", checkoutTime: "12:30" },
]

export type MockTemplate = { id: string; stage: keyof typeof KA.templateStage; language: Lang; content: string }

export const MOCK_TEMPLATES: MockTemplate[] = [
  {
    id: "t1",
    stage: "checkin_day",
    language: "ka",
    content:
      "გამარჯობა {guest_name}! კეთილი იყოს თქვენი მობრძანება ORBI City-ში. თქვენი ოთახია {room_label}. WiFi: {wifi_ssid} / {wifi_password}.",
  },
  {
    id: "t2",
    stage: "checkin_day",
    language: "en",
    content:
      "Hi {guest_name}! Welcome to ORBI City. Your room is {room_label}. WiFi: {wifi_ssid} / {wifi_password}.",
  },
  {
    id: "t3",
    stage: "checkout",
    language: "ka",
    content: "გამარჯობა {guest_name}, გასვლის დროა {checkout_time}. გმადლობთ სტუმრობისთვის!",
  },
  {
    id: "t4",
    stage: "review_request",
    language: "en",
    content: "Thanks for staying with us, {guest_name}! A quick review would mean a lot.",
  },
  {
    id: "t5",
    stage: "welcome",
    language: "ka",
    content: "გმადლობთ ჯავშნისთვის, {guest_name}! ჩამოსვლამდე დაგიკავშირდებით.",
  },
]

export type MockExtra = {
  id: string
  category: keyof typeof KA.extraCategory
  title: string
  description: string | null
  contact: string | null
  price: string | null
}

export const MOCK_EXTRAS: MockExtra[] = [
  {
    id: "e1",
    category: "recommendation",
    title: "Café Batumi Boulevard",
    description: "ზღვის პირას, საუზმე დილის 8-დან.",
    contact: null,
    price: null,
  },
  {
    id: "e2",
    category: "recommendation",
    title: "Old Town walking route",
    description: "15 წუთის სავალზე, ისტორიული ცენტრი.",
    contact: null,
    price: null,
  },
  {
    id: "e3",
    category: "taxi",
    title: "Giorgi (trusted driver)",
    description: null,
    contact: "+995 577 10 20 30",
    price: "აეროპორტამდე 25 ლარიდან",
  },
  {
    id: "e4",
    category: "offering",
    title: "Airport transfer",
    description: "წინასწარ დაჯავშნეთ რეცეფციაში.",
    contact: "ask reception",
    price: "from 25 GEL",
  },
]

export const STATUS_BADGE_CLASS: Record<Status, string> = {
  upcoming: "bg-accent text-accent-foreground",
  checked_in: "bg-primary text-primary-foreground",
  checked_out: "bg-secondary text-secondary-foreground",
}

export const TEMPLATE_STAGE_ORDER = [
  "welcome",
  "pre_arrival",
  "checkin_day",
  "mid_stay",
  "checkout",
  "review_request",
] as const

export const EXTRA_CATEGORY_ORDER = ["recommendation", "taxi", "offering"] as const

export const TEMPLATE_VARIABLES = [
  "guest_name",
  "room_label",
  "checkin_date",
  "checkout_time",
  "wifi_ssid",
  "wifi_password",
] as const
