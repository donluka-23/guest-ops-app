"use client"

import { ChevronDownIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { KA } from "../mock-data"

export function LoginScreen() {
  return (
    <div className="relative flex min-h-full flex-1 flex-col items-center justify-center gap-6 overflow-hidden bg-background p-4">
      <div
        aria-hidden
        className="pointer-events-none absolute top-[-25%] left-1/2 h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-primary/30 blur-[100px]"
      />
      <div className="z-10 flex w-full max-w-sm justify-end">
        <span className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-input px-3 text-sm text-muted-foreground">
          {KA.language.ka}
          <ChevronDownIcon className="size-4" />
        </span>
      </div>
      <Card className="z-10 w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">{KA.login.property}</CardTitle>
          <CardDescription>{KA.login.subtitle}</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">{KA.login.email}</Label>
              <Input id="email" type="email" defaultValue="nino@orbicity.ge" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">{KA.login.password}</Label>
              <Input id="password" type="password" defaultValue="password" />
            </div>
            <Button type="submit" className="mt-2">
              {KA.login.signIn}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
