import Link from "next/link";
import { Button } from "@/components/ui/button";
import { verifySession } from "@/lib/supabase/dal";
import { logout } from "./actions";

export default async function DashboardPage() {
  const user = await verifySession();

  return (
    <div className="flex flex-1 flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Today</h1>
          <p className="text-sm text-muted-foreground">
            Signed in as {user.email}
          </p>
        </div>
        <form action={logout}>
          <Button type="submit" variant="outline">
            Log out
          </Button>
        </form>
      </div>
      <p className="text-sm text-muted-foreground">
        Arrivals, departures, and one-click sends go here in a later step.
      </p>
      <Button
        render={<Link href="/dashboard/guests" />}
        nativeButton={false}
        className="w-fit"
      >
        Guests
      </Button>
    </div>
  );
}
