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
import { TEMPLATE_STAGE_VALUES } from "@/lib/settings/constants";
import { TemplateDialog, type Template } from "./template-dialog";
import { deleteTemplate } from "./actions";

export function TemplatesTab({ templates }: { templates: Template[] }) {
  const t = useTranslations("settings.templates");
  const tStage = useTranslations("templateStage");
  const tLanguage = useTranslations("language");
  const tCommon = useTranslations("common");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | undefined>(undefined);

  function openAdd() {
    setEditingTemplate(undefined);
    setDialogOpen(true);
  }

  function openEdit(template: Template) {
    setEditingTemplate(template);
    setDialogOpen(true);
  }

  async function handleDelete(id: string) {
    if (!window.confirm(t("deleteConfirm"))) return;
    await deleteTemplate(id);
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
          <CardAction>
            <Button size="sm" onClick={openAdd}>
              {t("addTemplate")}
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          {templates.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("empty")}</p>
          ) : (
            <div className="flex flex-col gap-6">
              {TEMPLATE_STAGE_VALUES.map((stage) => {
                const stageTemplates = templates.filter((tpl) => tpl.stage === stage);
                if (stageTemplates.length === 0) return null;

                return (
                  <div key={stage} className="flex flex-col gap-2">
                    <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                      {tStage(stage)}
                    </h3>
                    <div className="flex flex-col divide-y rounded-lg border">
                      {stageTemplates.map((tpl) => (
                        <div
                          key={tpl.id}
                          className="flex items-center justify-between gap-4 p-3"
                        >
                          <div className="flex min-w-0 flex-col gap-0.5">
                            <span className="text-sm font-medium">
                              {tLanguage(tpl.language as "en" | "ru" | "ka")}
                            </span>
                            <span className="truncate text-sm text-muted-foreground">
                              {tpl.content}
                            </span>
                          </div>
                          <div className="flex shrink-0 gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEdit(tpl)}
                            >
                              {tCommon("edit")}
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(tpl.id)}
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

      <TemplateDialog
        key={editingTemplate?.id ?? "new"}
        template={editingTemplate}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
}
