"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { LockIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import {
  TEMPLATE_STAGE_VALUES,
  TEMPLATE_LANGUAGE_VALUES,
  TEMPLATE_VARIABLES,
} from "@/lib/settings/constants";
import { upsertTemplate, type TemplateFormState } from "./actions";

export type Template = {
  id: string;
  stage: string;
  language: string;
  content: string;
};

type TemplateDialogProps = {
  template?: Template;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function TemplateDialog({ template, open, onOpenChange }: TemplateDialogProps) {
  const t = useTranslations("settings.templates");
  const tForm = useTranslations("settings.templates.form");
  const tErrors = useTranslations("settings.templates.form.errors");
  const tStage = useTranslations("templateStage");
  const tLanguage = useTranslations("language");
  const tCommon = useTranslations("common");

  const [state, formAction, pending] = useActionState<TemplateFormState, FormData>(
    upsertTemplate,
    undefined,
  );

  const [content, setContent] = useState(template?.content ?? "");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (state?.success) onOpenChange(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  function insertVariable(token: string) {
    const tokenText = `{${token}}`;
    const textarea = textareaRef.current;

    if (!textarea) {
      setContent((prev) => prev + tokenText);
      return;
    }

    const start = textarea.selectionStart ?? content.length;
    const end = textarea.selectionEnd ?? content.length;
    const next = content.slice(0, start) + tokenText + content.slice(end);
    setContent(next);

    const cursor = start + tokenText.length;
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(cursor, cursor);
    });
  }

  const errors = state?.fieldErrors ?? {};

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{template ? t("editTemplate") : t("addTemplate")}</DialogTitle>
          {template && (
            <DialogDescription className="flex items-center gap-1.5">
              <LockIcon className="size-3.5" />
              {t("identityLocked")}
            </DialogDescription>
          )}
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          {template && <input type="hidden" name="id" value={template.id} />}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="stage">{tForm("stage")}</Label>
              {template ? (
                <>
                  <p className="flex h-8 items-center rounded-lg border bg-muted px-2.5 text-sm text-muted-foreground">
                    {tStage(template.stage as never)}
                  </p>
                  <input type="hidden" name="stage" value={template.stage} />
                </>
              ) : (
                <Select name="stage">
                  <SelectTrigger id="stage" className="w-full">
                    <SelectValue placeholder={tForm("stagePlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    {TEMPLATE_STAGE_VALUES.map((value) => (
                      <SelectItem key={value} value={value}>
                        {tStage(value)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {errors.stage && (
                <p className="text-sm text-destructive">{tErrors(errors.stage as never)}</p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="language">{tForm("language")}</Label>
              {template ? (
                <>
                  <p className="flex h-8 items-center rounded-lg border bg-muted px-2.5 text-sm text-muted-foreground">
                    {tLanguage(template.language as never)}
                  </p>
                  <input type="hidden" name="language" value={template.language} />
                </>
              ) : (
                <Select name="language" defaultValue="ka">
                  <SelectTrigger id="language" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TEMPLATE_LANGUAGE_VALUES.map((value) => (
                      <SelectItem key={value} value={value}>
                        {tLanguage(value)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {errors.language && (
                <p className="text-sm text-destructive">
                  {tErrors(errors.language as never)}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="content">{tForm("content")}</Label>
            <div className="flex flex-wrap gap-1">
              {TEMPLATE_VARIABLES.map((token) => (
                <button
                  key={token}
                  type="button"
                  onClick={() => insertVariable(token)}
                  className="rounded-md border px-2 py-0.5 text-xs text-muted-foreground hover:bg-muted"
                >
                  {`{${token}}`}
                </button>
              ))}
            </div>
            <Textarea
              ref={textareaRef}
              id="content"
              name="content"
              rows={6}
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            {errors.content && (
              <p className="text-sm text-destructive">{tErrors(errors.content as never)}</p>
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
