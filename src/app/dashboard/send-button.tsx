"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { CheckIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buildWhatsAppLink } from "@/lib/messaging/whatsapp";
import { logMessageSent } from "./actions";

type SendButtonProps = {
  guestId: string;
  templateId: string | null;
  phone: string;
  message: string;
  label: string;
  variant?: "default" | "outline";
};

export function SendButton({
  guestId,
  templateId,
  phone,
  message,
  label,
  variant = "default",
}: SendButtonProps) {
  const t = useTranslations("dashboard");
  const [justSent, setJustSent] = useState(false);

  if (!templateId) {
    return (
      <Button size="sm" variant="outline" disabled title={t("noTemplate")}>
        {label}
      </Button>
    );
  }

  function handleClick() {
    // Open first, synchronously, in direct response to the click — some
    // browsers block window.open from async callbacks as an unwanted
    // popup. The optimistic "sent" state and the log write both happen
    // without making the host wait on either.
    window.open(buildWhatsAppLink(phone, message), "_blank", "noopener,noreferrer");
    setJustSent(true);
    setTimeout(() => setJustSent(false), 2000);
    logMessageSent(guestId, templateId as string).catch(() => {});
  }

  return (
    <Button size="sm" variant={variant} onClick={handleClick}>
      {justSent ? (
        <>
          <CheckIcon className="size-4" />
          {t("sent")}
        </>
      ) : (
        label
      )}
    </Button>
  );
}
