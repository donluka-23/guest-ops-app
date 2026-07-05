"use client"

import {
  BedDoubleIcon,
  ClockIcon,
  CompassIcon,
  MessageSquareTextIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DashboardChrome } from "../dashboard-chrome"
import {
  EXTRA_CATEGORY_ORDER,
  KA,
  MOCK_EXTRAS,
  MOCK_ROOMS,
  MOCK_TEMPLATES,
  TEMPLATE_STAGE_ORDER,
} from "../mock-data"

function SectionCardHeader({
  icon,
  title,
  action,
}: {
  icon: React.ReactNode
  title: string
  action: string
}) {
  return (
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <div className="flex size-7 items-center justify-center rounded-lg bg-primary/15">
          {icon}
        </div>
        {title}
      </CardTitle>
      <CardAction>
        <Button size="sm">{action}</Button>
      </CardAction>
    </CardHeader>
  )
}

function RoomsTab() {
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-primary/15">
              <ClockIcon className="size-4 text-primary" />
            </div>
            {KA.settings.propertyDefaults.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2 sm:max-w-xs">
            <Label htmlFor="defaultCheckout">
              {KA.settings.propertyDefaults.defaultCheckoutTime}
            </Label>
            <div className="flex items-center gap-2">
              <Input id="defaultCheckout" type="time" defaultValue="12:00" className="w-40" />
              <Button size="sm">{KA.common.save}</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <SectionCardHeader
          icon={<BedDoubleIcon className="size-4 text-primary" />}
          title={KA.settings.rooms.title}
          action={KA.settings.rooms.addRoom}
        />
        <CardContent>
          <div className="flex flex-col divide-y rounded-lg border">
            {MOCK_ROOMS.map((room) => (
              <div key={room.id} className="flex items-center justify-between gap-4 p-3">
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium">{room.label}</span>
                  <span className="text-sm text-muted-foreground">
                    {room.checkoutTime ?? KA.settings.rooms.inheritsDefault}
                  </span>
                </div>
                <Button variant="outline" size="sm">
                  {KA.common.edit}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function TemplatesTab() {
  return (
    <Card>
      <SectionCardHeader
        icon={<MessageSquareTextIcon className="size-4 text-primary" />}
        title={KA.settings.templates.title}
        action={KA.settings.templates.addTemplate}
      />
      <CardContent>
        <div className="flex flex-col gap-6">
          {TEMPLATE_STAGE_ORDER.map((stage) => {
            const items = MOCK_TEMPLATES.filter((t) => t.stage === stage)
            if (items.length === 0) return null
            return (
              <div key={stage} className="flex flex-col gap-2">
                <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  {KA.templateStage[stage]}
                </h3>
                <div className="flex flex-col divide-y rounded-lg border">
                  {items.map((t) => (
                    <div key={t.id} className="flex items-center justify-between gap-4 p-3">
                      <div className="flex min-w-0 flex-col gap-0.5">
                        <span className="text-sm font-medium">{KA.language[t.language]}</span>
                        <span className="truncate text-sm text-muted-foreground">{t.content}</span>
                      </div>
                      <div className="flex shrink-0 gap-2">
                        <Button variant="outline" size="sm">
                          {KA.common.edit}
                        </Button>
                        <Button variant="destructive" size="sm">
                          {KA.common.delete}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

function LocalGuideTab() {
  return (
    <Card>
      <SectionCardHeader
        icon={<CompassIcon className="size-4 text-primary" />}
        title={KA.settings.localGuide.title}
        action={KA.settings.localGuide.addExtra}
      />
      <CardContent>
        <div className="flex flex-col gap-6">
          {EXTRA_CATEGORY_ORDER.map((category) => {
            const items = MOCK_EXTRAS.filter((e) => e.category === category)
            if (items.length === 0) return null
            return (
              <div key={category} className="flex flex-col gap-2">
                <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  {KA.extraCategory[category]}
                </h3>
                <div className="flex flex-col divide-y rounded-lg border">
                  {items.map((e) => (
                    <div key={e.id} className="flex items-center justify-between gap-4 p-3">
                      <div className="flex min-w-0 flex-col gap-0.5">
                        <span className="text-sm font-medium">{e.title}</span>
                        <span className="truncate text-sm text-muted-foreground">
                          {[e.description, e.contact, e.price].filter(Boolean).join(" · ")}
                        </span>
                      </div>
                      <div className="flex shrink-0 gap-2">
                        <Button variant="outline" size="sm">
                          {KA.common.edit}
                        </Button>
                        <Button variant="destructive" size="sm">
                          {KA.common.delete}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

export function SettingsScreen() {
  return (
    <DashboardChrome active="settings">
      <div className="flex flex-1 flex-col gap-5 p-4 sm:p-8">
        <h1 className="text-2xl font-semibold tracking-tight">{KA.settings.title}</h1>
        <Tabs defaultValue="rooms">
          <TabsList>
            <TabsTrigger value="rooms">{KA.settings.tabs.rooms}</TabsTrigger>
            <TabsTrigger value="templates">{KA.settings.tabs.templates}</TabsTrigger>
            <TabsTrigger value="localGuide">{KA.settings.tabs.localGuide}</TabsTrigger>
          </TabsList>
          <TabsContent value="rooms">
            <RoomsTab />
          </TabsContent>
          <TabsContent value="templates">
            <TemplatesTab />
          </TabsContent>
          <TabsContent value="localGuide">
            <LocalGuideTab />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardChrome>
  )
}
