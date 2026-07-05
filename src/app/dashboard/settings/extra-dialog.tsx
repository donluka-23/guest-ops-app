"use client";

import { useActionState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { LockIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EXTRA_CATEGORY_VALUES } from "@/lib/settings/constants";
import { upsertExtra, type ExtraFormState } from "./actions";

export type Extra = {
  id: string;
  category: string;
  title: string;
  description: string | null;
  contact_info: string | null;
  price: string | null;
  display_order: number;
};

type ExtraDialogProps = {
  extra?: Extra;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ExtraDialog({ extra, open, onOpenChange }: ExtraDialogProps) {
  const t = useTranslations("settings.localGuide");
  const tForm = useTranslations("settings.localGuide.form");
  const tErrors = useTranslations("settings.localGuide.form.errors");
  const tCategory = useTranslations("extraCategory");
  const tCommon = useTranslations("common");

  const [state, formAction, pending] = useActionState<ExtraFormState, FormData>(
    upsertExtra,
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
          <DialogTitle>{extra ? t("editExtra") : t("addExtra")}</DialogTitle>
          {extra && (
            <DialogDescription className="flex items-center gap-1.5">
              <LockIcon className="size-3.5" />
              {t("identityLocked")}
            </DialogDescription>
          )}
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          {extra && <input type="hidden" name="id" value={extra.id} />}

          <div className="flex flex-col gap-2">
            <Label htmlFor="category">{tForm("category")}</Label>
            {extra ? (
              <>
                <p className="flex h-8 items-center rounded-lg border bg-muted px-2.5 text-sm text-muted-foreground">
                  {tCategory(extra.category as never)}
                </p>
                <input type="hidden" name="category" value={extra.category} />
              </>
            ) : (
              <Select name="category">
                <SelectTrigger id="category" className="w-full">
                  <SelectValue placeholder={tForm("categoryPlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  {EXTRA_CATEGORY_VALUES.map((value) => (
                    <SelectItem key={value} value={value}>
                      {tCategory(value)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {errors.category && (
              <p className="text-sm text-destructive">{tErrors(errors.category as never)}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="title">{tForm("title")}</Label>
            <Input id="title" name="title" defaultValue={extra?.title} required />
            {errors.title && (
              <p className="text-sm text-destructive">{tErrors(errors.title as never)}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="description">{tForm("description")}</Label>
            <Textarea
              id="description"
              name="description"
              rows={3}
              defaultValue={extra?.description ?? ""}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="contactInfo">{tForm("contactInfo")}</Label>
              <Input
                id="contactInfo"
                name="contactInfo"
                defaultValue={extra?.contact_info ?? ""}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="price">{tForm("price")}</Label>
              <Input
                id="price"
                name="price"
                placeholder={tForm("pricePlaceholder")}
                defaultValue={extra?.price ?? ""}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="displayOrder">{tForm("displayOrder")}</Label>
            <Input
              id="displayOrder"
              name="displayOrder"
              type="number"
              inputMode="numeric"
              defaultValue={extra?.display_order ?? 0}
            />
            {errors.displayOrder && (
              <p className="text-sm text-destructive">
                {tErrors(errors.displayOrder as never)}
              </p>
            )}
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
