"use client";

import { useActionState, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LANGUAGE_VALUES,
  SOURCE_CHANNEL_VALUES,
  STATUS_VALUES,
  normalizePhone,
} from "@/lib/guests/constants";
import type { GuestFormState } from "./actions";

type Room = { id: string; label: string };

export type GuestFormValues = {
  name: string;
  phone: string;
  roomId: string;
  checkInDate: string;
  checkOutDate: string;
  language: string;
  sourceChannel: string;
  status: string;
};

type GuestFormProps = {
  mode: "create" | "edit";
  rooms: Room[];
  action: (prevState: GuestFormState, formData: FormData) => Promise<GuestFormState>;
  initialValues?: GuestFormValues;
};

function todayISO() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

function addDaysISO(dateISO: string, days: number) {
  const date = new Date(`${dateISO}T00:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

export function GuestForm({ mode, rooms, action, initialValues }: GuestFormProps) {
  const t = useTranslations("guests.form");
  const tErrors = useTranslations("guests.form.errors");
  const tLanguage = useTranslations("language");
  const tChannel = useTranslations("sourceChannel");
  const tStatus = useTranslations("guestStatus");

  const [state, formAction, pending] = useActionState<GuestFormState, FormData>(
    action,
    undefined,
  );

  // Lazy initializers (not an effect) so the default is computed once, from
  // the browser's own local date — Batumi is UTC+4, so deriving "today" from
  // server time would show yesterday's date for a ~4-hour window every
  // evening. suppressHydrationWarning below acknowledges the one-time SSR
  // (server-clock) vs. hydration (browser-clock) mismatch this can cause;
  // the browser's value is the correct one and wins immediately.
  const [checkInDate, setCheckInDate] = useState(
    () => initialValues?.checkInDate ?? (mode === "create" ? todayISO() : ""),
  );
  const [checkOutDate, setCheckOutDate] = useState(
    () =>
      initialValues?.checkOutDate ??
      (mode === "create" ? addDaysISO(todayISO(), 1) : ""),
  );
  // In edit mode the existing checkout is already a deliberate value, not a
  // default to auto-shift when check-in changes.
  const [checkoutTouched, setCheckoutTouched] = useState(mode === "edit");
  const [phone, setPhone] = useState(initialValues?.phone ?? "");

  function handleCheckInChange(value: string) {
    setCheckInDate(value);
    if (!checkoutTouched && value) {
      setCheckOutDate(addDaysISO(value, 1));
    }
  }

  const errors = state?.fieldErrors ?? {};

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="name">{t("name")}</Label>
        <Input id="name" name="name" defaultValue={initialValues?.name} required />
        {errors.name && (
          <p className="text-sm text-destructive">{tErrors(errors.name as never)}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="phone">{t("phone")}</Label>
        <Input
          id="phone"
          name="phone"
          inputMode="tel"
          autoComplete="tel"
          value={phone}
          onChange={(e) => setPhone(normalizePhone(e.target.value))}
          required
        />
        {errors.phone && (
          <p className="text-sm text-destructive">{tErrors(errors.phone as never)}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="roomId">{t("room")}</Label>
        <Select
          name="roomId"
          defaultValue={initialValues?.roomId}
          items={Object.fromEntries(rooms.map((room) => [room.id, room.label]))}
        >
          <SelectTrigger id="roomId" className="w-full">
            <SelectValue placeholder={t("roomPlaceholder")} />
          </SelectTrigger>
          <SelectContent>
            {rooms.map((room) => (
              <SelectItem key={room.id} value={room.id}>
                {room.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.roomId && (
          <p className="text-sm text-destructive">{tErrors(errors.roomId as never)}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="checkInDate">{t("checkIn")}</Label>
          <Input
            id="checkInDate"
            name="checkInDate"
            type="date"
            value={checkInDate}
            onChange={(e) => handleCheckInChange(e.target.value)}
            suppressHydrationWarning
            required
          />
          {errors.checkInDate && (
            <p className="text-sm text-destructive">
              {tErrors(errors.checkInDate as never)}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="checkOutDate">{t("checkOut")}</Label>
          <Input
            id="checkOutDate"
            name="checkOutDate"
            type="date"
            value={checkOutDate}
            onChange={(e) => {
              setCheckoutTouched(true);
              setCheckOutDate(e.target.value);
            }}
            suppressHydrationWarning
            required
          />
          {errors.checkOutDate && (
            <p className="text-sm text-destructive">
              {tErrors(errors.checkOutDate as never)}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="language">{t("language")}</Label>
        <Select
          name="language"
          defaultValue={initialValues?.language ?? "en"}
          items={Object.fromEntries(LANGUAGE_VALUES.map((value) => [value, tLanguage(value)]))}
        >
          <SelectTrigger id="language" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LANGUAGE_VALUES.map((value) => (
              <SelectItem key={value} value={value}>
                {tLanguage(value)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.language && (
          <p className="text-sm text-destructive">{tErrors(errors.language as never)}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="sourceChannel">{t("source")}</Label>
        <Select
          name="sourceChannel"
          defaultValue={initialValues?.sourceChannel}
          items={Object.fromEntries(SOURCE_CHANNEL_VALUES.map((value) => [value, tChannel(value)]))}
        >
          <SelectTrigger id="sourceChannel" className="w-full">
            <SelectValue placeholder={t("sourcePlaceholder")} />
          </SelectTrigger>
          <SelectContent>
            {SOURCE_CHANNEL_VALUES.map((value) => (
              <SelectItem key={value} value={value}>
                {tChannel(value)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.sourceChannel && (
          <p className="text-sm text-destructive">
            {tErrors(errors.sourceChannel as never)}
          </p>
        )}
      </div>

      {mode === "edit" ? (
        <div className="flex flex-col gap-2">
          <Label htmlFor="status">{t("status")}</Label>
          <Select
            name="status"
            defaultValue={initialValues?.status ?? "upcoming"}
            items={Object.fromEntries(STATUS_VALUES.map((value) => [value, tStatus(value)]))}
          >
            <SelectTrigger id="status" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_VALUES.map((value) => (
                <SelectItem key={value} value={value}>
                  {tStatus(value)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.status && (
            <p className="text-sm text-destructive">{tErrors(errors.status as never)}</p>
          )}
        </div>
      ) : (
        <input type="hidden" name="status" value="upcoming" />
      )}

      {state?.formError && (
        <p className="text-sm text-destructive" role="alert">
          {tErrors(state.formError as never)}
        </p>
      )}

      <Button type="submit" disabled={pending} className="mt-2">
        {pending ? t("saving") : mode === "create" ? t("submitCreate") : t("submitEdit")}
      </Button>
    </form>
  );
}
