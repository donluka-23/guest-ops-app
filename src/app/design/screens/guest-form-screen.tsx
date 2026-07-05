"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardChrome } from "../dashboard-chrome"
import { KA, MOCK_GUESTS, MOCK_ROOMS } from "../mock-data"

const LANGS = ["en", "ru", "ka"] as const
const SOURCES = [
  "booking_com",
  "airbnb",
  "home_ge",
  "myhome_ge",
  "ss_ge",
  "direct",
  "walk_in",
] as const
const STATUSES = ["upcoming", "checked_in", "checked_out"] as const

export function GuestFormScreen() {
  const [mode, setMode] = useState<"create" | "edit">("edit")
  const g = MOCK_GUESTS[0]
  const roomItems = Object.fromEntries(MOCK_ROOMS.map((r) => [r.id, r.label]))
  const langItems = Object.fromEntries(LANGS.map((l) => [l, KA.language[l]]))
  const sourceItems = Object.fromEntries(SOURCES.map((s) => [s, KA.sourceChannel[s]]))
  const statusItems = Object.fromEntries(STATUSES.map((s) => [s, KA.guestStatus[s]]))

  const isEdit = mode === "edit"

  return (
    <DashboardChrome active="guests">
      <div className="flex flex-1 flex-col items-center gap-4 p-4">
        <div className="flex w-full max-w-lg justify-center">
          <div className="inline-flex items-center gap-1 rounded-lg bg-muted p-[3px] text-sm">
            <button
              type="button"
              onClick={() => setMode("create")}
              className={`rounded-md px-3 py-1 font-medium transition-colors ${
                mode === "create" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              {KA.guests.addGuest}
            </button>
            <button
              type="button"
              onClick={() => setMode("edit")}
              className={`rounded-md px-3 py-1 font-medium transition-colors ${
                mode === "edit" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              {KA.guests.editGuest}
            </button>
          </div>
        </div>

        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle>{isEdit ? KA.guests.editGuest : KA.guests.addGuest}</CardTitle>
          </CardHeader>
          <CardContent>
            {/* key forces defaultValue-based fields to reset when switching mode */}
            <form
              key={mode}
              className="flex flex-col gap-4"
              onSubmit={(e) => e.preventDefault()}
            >
              <div className="flex flex-col gap-2">
                <Label htmlFor="name">{KA.guests.form.name}</Label>
                <Input id="name" defaultValue={isEdit ? g.name : ""} />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="phone">{KA.guests.form.phone}</Label>
                <Input id="phone" inputMode="tel" defaultValue={isEdit ? g.phone : ""} />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="room">{KA.guests.form.room}</Label>
                <Select defaultValue={isEdit ? "r1" : undefined} items={roomItems}>
                  <SelectTrigger id="room" className="w-full">
                    <SelectValue placeholder={KA.guests.form.roomPlaceholder} />
                  </SelectTrigger>
                  <SelectContent>
                    {MOCK_ROOMS.map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="checkIn">{KA.guests.form.checkIn}</Label>
                  <Input id="checkIn" type="date" defaultValue={isEdit ? g.checkIn : "2026-07-05"} />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="checkOut">{KA.guests.form.checkOut}</Label>
                  <Input id="checkOut" type="date" defaultValue={isEdit ? g.checkOut : "2026-07-06"} />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="language">{KA.guests.form.language}</Label>
                <Select defaultValue={isEdit ? g.language : "en"} items={langItems}>
                  <SelectTrigger id="language" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGS.map((l) => (
                      <SelectItem key={l} value={l}>
                        {KA.language[l]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="source">{KA.guests.form.source}</Label>
                <Select defaultValue={isEdit ? g.source : undefined} items={sourceItems}>
                  <SelectTrigger id="source" className="w-full">
                    <SelectValue placeholder={KA.guests.form.sourcePlaceholder} />
                  </SelectTrigger>
                  <SelectContent>
                    {SOURCES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {KA.sourceChannel[s]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {isEdit && (
                <div className="flex flex-col gap-2">
                  <Label htmlFor="status">{KA.guests.form.status}</Label>
                  <Select defaultValue={g.status} items={statusItems}>
                    <SelectTrigger id="status" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {KA.guestStatus[s]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex flex-col gap-2">
                <Label htmlFor="notes">{KA.guests.form.notes}</Label>
                <Textarea
                  id="notes"
                  rows={3}
                  placeholder={KA.guests.form.notesPlaceholder}
                  defaultValue={
                    isEdit ? "ადრეული ჩამოსვლა 10:00-ზე, ლიფტი მუშაობს." : ""
                  }
                />
              </div>

              <Button type="submit" className="mt-2">
                {isEdit ? KA.guests.form.submitEdit : KA.guests.form.submitCreate}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardChrome>
  )
}
