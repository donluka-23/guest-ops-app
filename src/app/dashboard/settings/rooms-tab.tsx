"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PropertyDefaultsForm } from "./property-defaults-form";
import { RoomDialog, type Room } from "./room-dialog";

type Property = { default_checkout_time: string };

export function RoomsTab({ property, rooms }: { property: Property; rooms: Room[] }) {
  const t = useTranslations("settings.rooms");
  const tCommon = useTranslations("common");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | undefined>(undefined);

  function openAdd() {
    setEditingRoom(undefined);
    setDialogOpen(true);
  }

  function openEdit(room: Room) {
    setEditingRoom(room);
    setDialogOpen(true);
  }

  return (
    <div className="flex flex-col gap-4">
      <PropertyDefaultsForm property={property} />

      <Card>
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
          <CardAction>
            <Button size="sm" onClick={openAdd}>
              {t("addRoom")}
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          {rooms.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("empty")}</p>
          ) : (
            <div className="flex flex-col divide-y rounded-lg border">
              {rooms.map((room) => (
                <div
                  key={room.id}
                  className="flex items-center justify-between gap-4 p-3"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium">{room.label}</span>
                    <span className="text-sm text-muted-foreground">
                      {room.checkout_time
                        ? room.checkout_time.slice(0, 5)
                        : t("inheritsDefault")}
                    </span>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => openEdit(room)}>
                    {tCommon("edit")}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <RoomDialog
        key={editingRoom?.id ?? "new"}
        room={editingRoom}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
}
