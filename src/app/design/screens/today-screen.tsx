"use client"

import { LogInIcon, LogOutIcon, SendIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DashboardChrome } from "../dashboard-chrome"
import { WhatsAppSendButton } from "../whatsapp-send-button"
import {
  ARRIVING_TODAY,
  DEPARTING_TODAY,
  KA,
  WEEK_ARRIVING,
  WEEK_DEPARTING,
  type MockGuest,
  type WeekGroup,
} from "../mock-data"

function ArrivalRow({ guest }: { guest: MockGuest }) {
  return (
    <div className="flex items-center justify-between gap-4 p-3">
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="text-sm font-medium">{guest.name}</span>
        <span className="text-sm text-muted-foreground">{guest.room}</span>
      </div>
      <WhatsAppSendButton label={KA.dashboard.sendCheckinInfo} />
    </div>
  )
}

function DepartureRow({ guest }: { guest: MockGuest }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-3">
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="text-sm font-medium">{guest.name}</span>
        <span className="text-sm text-muted-foreground">{guest.room}</span>
      </div>
      <div className="flex shrink-0 gap-2">
        <WhatsAppSendButton label={KA.dashboard.sendCheckoutReminder} />
        <WhatsAppSendButton label={KA.dashboard.sendReviewRequest} variant="outline" />
      </div>
    </div>
  )
}

function SectionCard({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode
  title: string
  children: React.ReactNode
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <div className="flex size-7 items-center justify-center rounded-lg bg-primary/15">
            {icon}
          </div>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

function DayGroupedList({
  groups,
  render,
}: {
  groups: WeekGroup[]
  render: (guest: MockGuest) => React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-4">
      {groups.map((group) => (
        <div key={group.day} className="flex flex-col gap-2">
          <p className="text-xs font-medium text-muted-foreground">{group.label}</p>
          <div className="flex flex-col divide-y rounded-lg border">
            {group.guests.map((guest) => (
              <div key={guest.id}>{render(guest)}</div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export function TodayScreen() {
  return (
    <DashboardChrome active="today">
      <div className="flex flex-1 flex-col gap-6 p-4 sm:p-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{KA.dashboard.title}</h1>
          <p className="text-sm text-muted-foreground">{KA.dashboard.signedInAs}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-primary/20 bg-primary/10 px-4 py-3">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/15">
            <SendIcon className="size-4 text-primary" />
          </div>
          <span className="text-sm font-medium">{KA.dashboard.messagesSent(148)}</span>
          <span className="text-sm text-muted-foreground">{KA.dashboard.timeSaved("7.4")}</span>
        </div>

        <Tabs defaultValue="today">
          <TabsList>
            <TabsTrigger value="today">{KA.dashboard.tabs.today}</TabsTrigger>
            <TabsTrigger value="week">{KA.dashboard.tabs.thisWeek}</TabsTrigger>
          </TabsList>

          <TabsContent value="today" className="flex flex-col gap-6">
            <SectionCard
              icon={<LogInIcon className="size-4 text-primary" />}
              title={KA.dashboard.arrivingToday}
            >
              <div className="flex flex-col divide-y rounded-lg border">
                {ARRIVING_TODAY.map((guest) => (
                  <ArrivalRow key={guest.id} guest={guest} />
                ))}
              </div>
            </SectionCard>

            <SectionCard
              icon={<LogOutIcon className="size-4 text-primary" />}
              title={KA.dashboard.departingToday}
            >
              <div className="flex flex-col divide-y rounded-lg border">
                {DEPARTING_TODAY.map((guest) => (
                  <DepartureRow key={guest.id} guest={guest} />
                ))}
              </div>
            </SectionCard>
          </TabsContent>

          <TabsContent value="week" className="flex flex-col gap-6">
            <SectionCard
              icon={<LogInIcon className="size-4 text-primary" />}
              title={KA.dashboard.arrivingThisWeek}
            >
              <DayGroupedList groups={WEEK_ARRIVING} render={(g) => <ArrivalRow guest={g} />} />
            </SectionCard>

            <SectionCard
              icon={<LogOutIcon className="size-4 text-primary" />}
              title={KA.dashboard.departingThisWeek}
            >
              <DayGroupedList groups={WEEK_DEPARTING} render={(g) => <DepartureRow guest={g} />} />
            </SectionCard>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardChrome>
  )
}
