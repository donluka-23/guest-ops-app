import { getRequestConfig } from "next-intl/server";
import { IntlErrorCode } from "next-intl";
import { cookies } from "next/headers";
import { DEFAULT_LOCALE, LOCALE_COOKIE_NAME, isLocale } from "./config";

// No [locale] URL segment: this is an internal staff tool, not indexed
// content, and nobody needs to share a per-language link with a colleague
// using the same account. Locale is a stored cookie preference instead —
// see CLAUDE.md for the full reasoning.
export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(LOCALE_COOKIE_NAME)?.value;
  const locale = isLocale(cookieLocale) ? cookieLocale : DEFAULT_LOCALE;

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
    // A missing translation key would otherwise render as a raw
    // "namespace.key" string in the UI with only a generic console.error
    // (next-intl's default). This makes a missing key loud and specific in
    // development, so it's caught while building a screen, not during
    // user testing — see CLAUDE.md's i18n-completeness-check rule.
    onError(error) {
      if (error.code === IntlErrorCode.MISSING_MESSAGE) {
        console.warn(`[i18n] Missing translation key: ${error.originalMessage}`);
        return;
      }
      console.error(error);
    },
    getMessageFallback({ namespace, key }) {
      const path = [namespace, key].filter(Boolean).join(".");
      return process.env.NODE_ENV === "production" ? path : `⚠️ missing: ${path}`;
    },
  };
});
