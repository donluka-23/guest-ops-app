"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { CompassIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EXTRA_CATEGORY_VALUES } from "@/lib/settings/constants";
import { ExtraDialog, type Extra } from "./extra-dialog";
import { deleteExtra } from "./actions";

export function LocalGuideTab({ extras }: { extras: Extra[] }) {
  const t = useTranslations("settings.localGuide");
  const tCategory = useTranslations("extraCategory");
  const tCommon = useTranslations("common");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingExtra, setEditingExtra] = useState<Extra | undefined>(undefined);

  function openAdd() {
    setEditingExtra(undefined);
    setDialogOpen(true);
  }

  function openEdit(extra: Extra) {
    setEditingExtra(extra);
    setDialogOpen(true);
  }

  async function handleDelete(id: string) {
    if (!window.confirm(t("deleteConfirm"))) return;
    await deleteExtra(id);
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-primary/15">
              <CompassIcon className="size-4 text-primary" />
            </div>
            {t("title")}
          </CardTitle>
          <CardAction>
            <Button size="sm" onClick={openAdd}>
              {t("addExtra")}
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          {extras.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("empty")}</p>
          ) : (
            <div className="flex flex-col gap-6">
              {EXTRA_CATEGORY_VALUES.map((category) => {
                const categoryExtras = extras
                  .filter((extra) => extra.category === category)
                  .sort((a, b) => a.display_order - b.display_order);
                if (categoryExtras.length === 0) return null;

                return (
                  <div key={category} className="flex flex-col gap-2">
                    <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                      {tCategory(category)}
                    </h3>
                    <div className="flex flex-col divide-y rounded-lg border">
                      {categoryExtras.map((extra) => (
                        <div
                          key={extra.id}
                          className="flex items-center justify-between gap-4 p-3"
                        >
                          <div className="flex min-w-0 flex-col gap-0.5">
                            <span className="text-sm font-medium">{extra.title}</span>
                            <span className="truncate text-sm text-muted-foreground">
                              {[extra.description, extra.contact_info, extra.price]
                                .filter(Boolean)
                                .join(" · ")}
                            </span>
                          </div>
                          <div className="flex shrink-0 gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEdit(extra)}
                            >
                              {tCommon("edit")}
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(extra.id)}
                            >
                              {tCommon("delete")}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <ExtraDialog
        key={editingExtra?.id ?? "new"}
        extra={editingExtra}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
}
