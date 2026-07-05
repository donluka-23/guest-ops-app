"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { LOCALE_COOKIE_NAME, isLocale } from "./config";

export async function setLocale(locale: string) {
  if (!isLocale(locale)) return;

  const cookieStore = await cookies();
  cookieStore.set(LOCALE_COOKIE_NAME, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });

  // "layout" busts the Router Cache for every route nested under the root
  // layout (i.e. the whole app), not just the literal "/" segment. Locale
  // is read in the root layout and provided via context to everything, so
  // a plain revalidatePath("/") left already-visited routes (e.g. a
  // Settings tab opened before switching locale) serving their stale
  // cached RSC output in the old language after the switch.
  revalidatePath("/", "layout");
}
