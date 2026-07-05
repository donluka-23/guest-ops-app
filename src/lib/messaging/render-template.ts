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
