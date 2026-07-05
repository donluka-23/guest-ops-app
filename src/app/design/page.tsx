"use client"

import { useState } from "react"
import { MonitorIcon, SmartphoneIcon } from "lucide-react"
import { LoginScreen } from "./screens/login-screen"
import { TodayScreen } from "./screens/today-screen"
import { GuestsScreen } from "./screens/guests-screen"
import { GuestFormScreen } from "./screens/guest-form-screen"
import { SettingsScreen } from "./screens/settings-screen"
import { GuidebookScreen } from "./screens/guidebook-screen"

type ScreenKey = "login" | "today" | "guests" | "guestForm" | "settings" | "guidebook"

const SCREENS: { key: ScreenKey; label: string; zone: "auth" | "staff" | "public" }[] = [
  { key: "login", label: "Login", zone: "auth" },
  { key: "today", label: "Today dashboard", zone: "staff" },
  { key: "guests", label: "Guests", zone: "staff" },
  { key: "guestForm", label: "Guest form", zone: "staff" },
  { key: "settings", label: "Settings", zone: "staff" },
  { key: "guidebook", label: "Guidebook (public)", zone: "public" },
]

const ZONE_LABEL: Record<string, string> = {
  auth: "Auth",
  staff: "Staff · Georgian",
  public: "Public · guest",
}

export default function DesignShowcasePage() {
  const [screen, setScreen] = useState<ScreenKey>("today")
  const [viewport, setViewport] = useState<"mobile" | "desktop">("mobile")

  const active = SCREENS.find((s) => s.key === screen)!
  const frameWidth =
    viewport === "mobile" ? "w-[390px]" : "w-full max-w-[1100px]"

  function renderScreen() {
    switch (screen) {
      case "login":
        return <LoginScreen />
      case "today":
        return <TodayScreen />
      case "guests":
        return <GuestsScreen onAddGuest={() => setScreen("guestForm")} />
      case "guestForm":
        return <GuestFormScreen />
      case "settings":
        return <SettingsScreen />
      case "guidebook":
        return <GuidebookScreen />
    }
  }

  return (
    <div className="flex min-h-dvh flex-col bg-muted/40">
      <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-3 px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-xs font-bold text-primary-foreground">
                GO
              </span>
              <div className="leading-tight">
                <p className="text-sm font-semibold tracking-tight">Guest Ops · Design system</p>
                <p className="text-xs text-muted-foreground">ORBI City aparthotel — Batumi</p>
              </div>
            </div>
            <div className="inline-flex items-center gap-1 rounded-lg bg-muted p-[3px]">
              <button
                type="button"
                onClick={() => setViewport("mobile")}
                className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  viewport === "mobile"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground"
                }`}
              >
                <SmartphoneIcon className="size-3.5" /> Mobile
              </button>
              <button
                type="button"
                onClick={() => setViewport("desktop")}
                className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  viewport === "desktop"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground"
                }`}
              >
                <MonitorIcon className="size-3.5" /> Desktop
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {SCREENS.map((s) => (
              <button
                key={s.key}
                type="button"
                onClick={() => setScreen(s.key)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  s.key === screen
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-muted-foreground hover:text-foreground"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col items-center gap-3 px-4 py-6">
        <div className="flex w-full items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">{active.label}</h2>
          <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
            {ZONE_LABEL[active.zone]}
          </span>
        </div>

        <div
          className={`${frameWidth} flex h-[760px] flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-md transition-all`}
        >
          <div className="flex-1 overflow-y-auto">{renderScreen()}</div>
        </div>

        <p className="max-w-lg text-center text-xs text-muted-foreground text-pretty">
          Presentational showcase with mock data. The production screens live behind Supabase
          auth at <code className="font-mono">/login</code>, <code className="font-mono">/dashboard</code>,{" "}
          and <code className="font-mono">/guidebook/[roomId]</code> — same tokens, primitives, and layout.
        </p>
      </div>
    </div>
  )
}
