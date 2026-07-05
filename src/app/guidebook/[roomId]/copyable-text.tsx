"use client";

import { useState } from "react";
import { CopyIcon, CheckIcon } from "lucide-react";

export function CopyableText({
  value,
  copyLabel,
  copiedLabel,
}: {
  value: string;
  copyLabel: string;
  copiedLabel: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard API unavailable (e.g. insecure context) — the text is
      // still visible and selectable, so this fails silently.
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm font-medium hover:bg-muted"
      aria-label={copied ? copiedLabel : copyLabel}
    >
      <span className="flex-1 truncate">{value}</span>
      {copied ? (
        <CheckIcon className="size-4 shrink-0" />
      ) : (
        <CopyIcon className="size-4 shrink-0 text-muted-foreground" />
      )}
    </button>
  );
}
