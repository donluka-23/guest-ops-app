"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DashboardChrome } from "../dashboard-chrome"
import { KA, MOCK_GUESTS, STATUS_BADGE_CLASS } from "../mock-data"

export function GuestsScreen({ onAddGuest }: { onAddGuest?: () => void }) {
  return (
    <DashboardChrome active="guests">
      <div className="flex flex-1 flex-col gap-5 p-4 sm:p-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">{KA.guests.title}</h1>
          <Button onClick={onAddGuest}>{KA.guests.addGuest}</Button>
        </div>

        <div className="flex flex-col divide-y rounded-lg border bg-card">
          {MOCK_GUESTS.map((guest) => (
            <div
              key={guest.id}
              className="flex items-center justify-between gap-4 p-4 hover:bg-muted/50"
            >
              <div className="min-w-0">
                <p className="font-medium">{guest.name}</p>
                <p className="text-sm text-muted-foreground">
                  {guest.room} · {guest.checkIn} → {guest.checkOut}
                </p>
              </div>
              <Badge className={`shrink-0 border-transparent ${STATUS_BADGE_CLASS[guest.status]}`}>
                {KA.guestStatus[guest.status]}
              </Badge>
            </div>
          ))}
        </div>
      </div>
    </DashboardChrome>
  )
}
