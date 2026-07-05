export type TemplateVars = {
  guest_name: string;
  room_label: string;
  checkin_date: string;
  checkout_time: string;
  wifi_ssid: string;
  wifi_password: string;
};

// Replaces the {token} placeholders a host inserted via the Templates
// editor (src/lib/settings/constants.ts's TEMPLATE_VARIABLES) with real
// values at send-time. A token with no value available (e.g. a room with
// no WiFi configured yet) renders as an empty string rather than leaving
// the literal "{wifi_ssid}" visible in a guest-facing message.
export function renderTemplate(content: string, vars: Partial<TemplateVars>): string {
  return content.replace(/\{(\w+)\}/g, (_match, token: string) => {
    return vars[token as keyof TemplateVars] ?? "";
  });
}

export type TemplateRow = { id: string; stage: string; language: string; content: string };

// Picks the template matching the guest's own language for a stage,
// falling back to the `en` variant if that language's version doesn't
// exist — see the Today dashboard decisions log entry for why (rather
// than erroring, callers render a disabled "no template" button instead).
export function templateFor(
  templates: TemplateRow[],
  stage: string,
  language: string,
): { id: string; content: string } | null {
  const exact = templates.find((t) => t.stage === stage && t.language === language);
  if (exact) return exact;
  const fallback = templates.find((t) => t.stage === stage && t.language === "en");
  return fallback ?? null;
}
