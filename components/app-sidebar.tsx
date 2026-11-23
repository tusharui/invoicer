"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, PlusCircle, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Show, UserButton } from "@clerk/nextjs";
import { Suspense, useState } from "react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/invoices/new", label: "Create invoice", icon: PlusCircle },
];

function AppSidebarInner() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "hidden shrink-0 border-r border-black/10 bg-white py-4 transition-all duration-200 dark:border-white/10 dark:bg-black md:flex md:flex-col",
        collapsed ? "w-[72px] px-2" : "w-60 px-3",
      )}
    >
      <div className={cn("mb-6 flex items-center", collapsed ? "justify-center px-0" : "justify-between px-2")}>
        {!collapsed && (
          <Link href="/invoices" className="text-xl font-semibold tracking-tight text-black dark:text-white">
            Invoicer
          </Link>
        )}
        <button
          type="button"
          onClick={() => setCollapsed((v) => !v)}
          className="inline-flex size-9 items-center justify-center rounded-lg text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-black dark:text-zinc-300 dark:hover:bg-white/10 dark:hover:text-white"
          aria-label={collapsed ? "Open sidebar" : "Close sidebar"}
          title={collapsed ? "Open sidebar" : "Close sidebar"}
        >
          {collapsed ? <PanelLeftOpen className="size-5" /> : <PanelLeftClose className="size-5" />}
        </button>
      </div>

      <nav className="space-y-1">
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
              title={item.label}
              className={cn(
                "flex items-center rounded-xl py-2.5 text-sm font-medium transition-colors",
                collapsed ? "justify-center px-0" : "gap-3 px-3",
                active
                  ? "bg-black text-white dark:bg-white dark:text-black"
                  : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-white/10",
              )}
            >
              <Icon className="size-4 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className={cn("mt-auto border-t border-black/10 pt-4 dark:border-white/10", collapsed ? "px-0" : "px-2")}>
        <div className={cn("flex items-center", collapsed ? "flex-col gap-3" : "justify-end")}>
          <Suspense>
            <Show when="signed-in">
              <UserButton />
            </Show>
          </Suspense>
        </div>
      </div>
    </aside>
  );
}

export function AppSidebar() {
  return (
    <Suspense fallback={<aside className="hidden w-60 shrink-0 border-r border-black/10 bg-white dark:border-white/10 dark:bg-black md:block" />}>
      <AppSidebarInner />
    </Suspense>
  );
}
