// Plain wa.me deep link — no WhatsApp Business API, no bot, no per-message
// billing, per the project's explicit scope decision. wa.me requires the
// full international number as digits only (no "+", spaces, or dashes).
// Staff are expected to enter phone numbers with a country code; a number
// entered without one will produce a wrong link (known limitation, not
// validated at entry time).
export function buildWhatsAppLink(phone: string, message: string): string {
  const digitsOnly = phone.replace(/\D/g, "");
  return `https://wa.me/${digitsOnly}?text=${encodeURIComponent(message)}`;
}
