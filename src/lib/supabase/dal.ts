import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Authoritative session check for Server Components/Actions. proxy.ts
// already redirects unauthenticated requests away from protected routes,
// but that's an optimistic first pass — a matcher change or a Server
// Action reached from an unprotected path could silently skip it. This is
// the real gate: call it wherever guest/property data is actually read or
// written, not just once in a layout (layouts don't re-run on client-side
// navigation).
export const verifySession = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return user;
});
