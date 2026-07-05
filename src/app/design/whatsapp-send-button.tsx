"use client"

import { useState } from "react"
import { CheckIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { KA } from "./mock-data"

// Minimal WhatsApp glyph — the "send" action's brand-color exception per the
// Design system section (a second deliberate exception alongside destructive
// red). Kept as a small functional icon, not decorative illustration.
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 18.15h-.01a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.11.82.83-3.04-.2-.31a8.19 8.19 0 0 1-1.26-4.38c0-4.54 3.7-8.23 8.24-8.23 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.82c0 4.54-3.7 8.23-8.24 8.23Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.13-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.42l-.48-.01c-.17 0-.43.06-.66.31-.23.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.1-.22-.16-.47-.28Z" />
    </svg>
  )
}

export function WhatsAppSendButton({
  label,
  variant = "whatsapp",
  disabled = false,
}: {
  label: string
  variant?: "whatsapp" | "outline"
  disabled?: boolean
}) {
  const [sent, setSent] = useState(false)

  if (variant === "outline") {
    return (
      <Button
        variant="outline"
        size="sm"
        disabled={disabled}
        onClick={() => {
          setSent(true)
          setTimeout(() => setSent(false), 2000)
        }}
      >
        {sent ? (
          <>
            <CheckIcon className="size-4" /> {KA.dashboard.sent}
          </>
        ) : (
          <>
            <WhatsAppIcon className="size-4" /> {label}
          </>
        )}
      </Button>
    )
  }

  return (
    <Button
      size="sm"
      disabled={disabled}
      className="bg-[#25d366] text-white shadow-sm hover:bg-[#1fbe5a] active:bg-[#1fbe5a] disabled:opacity-50"
      onClick={() => {
        setSent(true)
        setTimeout(() => setSent(false), 2000)
      }}
    >
      {sent ? (
        <>
          <CheckIcon className="size-4" /> {KA.dashboard.sent}
        </>
      ) : (
        <>
          <WhatsAppIcon className="size-4" /> {label}
        </>
      )}
    </Button>
  )
}
