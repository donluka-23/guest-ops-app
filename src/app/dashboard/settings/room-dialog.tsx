"use client";

import { useActionState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { upsertRoom, type RoomFormState } from "./actions";

export type Room = {
  id: string;
  label: string;
  wifi_ssid: string | null;
  wifi_password: string | null;
  checkout_time: string | null;
  house_rules: string | null;
};

type RoomDialogProps = {
  room?: Room;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function RoomDialog({ room, open, onOpenChange }: RoomDialogProps) {
  const t = useTranslations("settings.rooms");
  const tForm = useTranslations("settings.rooms.form");
  const tErrors = useTranslations("settings.rooms.form.errors");
  const tCommon = useTranslations("common");
  const [state, formAction, pending] = useActionState<RoomFormState, FormData>(
    upsertRoom,
    undefined,
  );

  useEffect(() => {
    if (state?.success) onOpenChange(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const errors = state?.fieldErrors ?? {};

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{room ? t("editRoom") : t("addRoom")}</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          {room && <input type="hidden" name="id" value={room.id} />}
          <div className="flex flex-col gap-2">
            <Label htmlFor="label">{tForm("label")}</Label>
            <Input id="label" name="label" defaultValue={room?.label} required />
            {errors.label && (
              <p className="text-sm text-destructive">{tErrors(errors.label as never)}</p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="wifiSsid">{tForm("wifiSsid")}</Label>
            <Input id="wifiSsid" name="wifiSsid" defaultValue={room?.wifi_ssid ?? ""} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="wifiPassword">{tForm("wifiPassword")}</Label>
            <Input
              id="wifiPassword"
              name="wifiPassword"
              defaultValue={room?.wifi_password ?? ""}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="checkoutTime">{tForm("checkoutTime")}</Label>
            <Input
              id="checkoutTime"
              name="checkoutTime"
              type="time"
              defaultValue={room?.checkout_time?.slice(0, 5) ?? ""}
              placeholder={tForm("checkoutTimePlaceholder")}
            />
            {errors.checkoutTime && (
              <p className="text-sm text-destructive">
                {tErrors(errors.checkoutTime as never)}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="houseRules">{tForm("houseRules")}</Label>
            <Textarea
              id="houseRules"
              name="houseRules"
              rows={3}
              defaultValue={room?.house_rules ?? ""}
            />
          </div>
          {state?.formError && (
            <p className="text-sm text-destructive">{tErrors(state.formError as never)}</p>
          )}
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? tCommon("saving") : tCommon("save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
