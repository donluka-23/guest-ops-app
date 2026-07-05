"use client"

import type { ReactNode } from "react"
import { ChevronDownIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { KA } from "./mock-data"

// Presentational replica of src/app/dashboard/layout.tsx's header — the single
// nav source for every staff screen. Links are inert here (showcase only).
const LINKS = [
  { key: "today", label: KA.nav.today },
  { key: "guests", label: KA.nav.guests },
  { key: "settings", label: KA.nav.settings },
] as const

export function DashboardChrome({
  active,
  children,
}: {
  active: "today" | "guests" | "settings"
  children: ReactNode
}) {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-background">
      <header className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 border-b bg-background/95 px-4 py-3.5 shadow-sm backdrop-blur-sm sm:px-6">
        <nav className="flex items-center gap-1">
          {LINKS.map(({ key, label }) => {
            const isActive = key === active
            return (
              <span
                key={key}
                className={`relative px-3 py-2 text-sm font-medium transition-colors after:absolute after:inset-x-3 after:-bottom-[13px] after:h-0.5 after:rounded-full after:transition-colors ${
                  isActive
                    ? "text-foreground after:bg-primary"
                    : "text-muted-foreground after:bg-transparent hover:text-foreground"
                }`}
              >
                {label}
              </span>
            )
          })}
        </nav>
        <div className="flex items-center gap-2">
          <span className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-input px-3 text-sm text-muted-foreground">
            {KA.language.ka}
            <ChevronDownIcon className="size-4" />
          </span>
          <span className="hidden text-sm text-muted-foreground sm:inline">
            nino@orbicity.ge
          </span>
          <Button variant="outline" size="sm">
            {KA.nav.logout}
          </Button>
        </div>
      </header>
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  )
}
