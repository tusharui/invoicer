"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, PlusCircle } from "lucide-react";
import { Show, UserButton } from "@clerk/nextjs";
import { Suspense } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/invoices", label: "Dashboard", icon: LayoutDashboard },
  { href: "/invoices/new", label: "Create invoice", icon: PlusCircle },
];

function MobileAppNavInner() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-black/10 bg-white px-4 py-2 dark:border-white/10 dark:bg-black md:hidden">
      <div className="flex items-center justify-between gap-3">
        <div className="flex gap-2 overflow-x-auto">
          {navItems.map((item) => {
            const active =
              item.href === "/invoices/new"
                ? pathname === item.href
                : pathname === "/invoices" || (pathname.startsWith("/invoices/") && pathname !== "/invoices/new") || pathname === "/dashboard";
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "inline-flex shrink-0 items-center gap-2 rounded-full px-3 py-2 text-sm font-medium",
                  active
                    ? "bg-black text-white dark:bg-white dark:text-black"
                    : "bg-zinc-100 text-zinc-700 dark:bg-white/10 dark:text-zinc-200",
                )}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <ThemeToggle />
          <Suspense>
            <Show when="signed-in">
              <UserButton />
            </Show>
          </Suspense>
        </div>
      </div>
    </nav>
  );
}

export function MobileAppNav() {
  return (
    <Suspense fallback={null}>
      <MobileAppNavInner />
    </Suspense>
  );
}
