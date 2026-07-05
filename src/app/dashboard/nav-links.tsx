"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/dashboard", key: "today" },
  { href: "/dashboard/guests", key: "guests" },
  { href: "/dashboard/settings", key: "settings" },
] as const;

export function NavLinks({ labels }: { labels: Record<(typeof LINKS)[number]["key"], string> }) {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-1">
      {LINKS.map(({ href, key }) => {
        const isActive = href === "/dashboard" ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`relative px-3 py-2 text-sm font-medium transition-colors after:absolute after:inset-x-3 after:-bottom-[13px] after:h-0.5 after:rounded-full after:transition-colors ${
              isActive
                ? "text-foreground after:bg-primary"
                : "text-muted-foreground after:bg-transparent hover:text-foreground"
            }`}
          >
            {labels[key]}
          </Link>
        );
      })}
    </nav>
  );
}
