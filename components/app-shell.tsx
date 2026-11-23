import { AppSidebar } from "@/components/app-sidebar";
import { MobileAppNav } from "@/components/mobile-app-nav";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full">
      <MobileAppNav />
      <div className="flex min-h-[calc(100vh-4rem)] w-full">
        <AppSidebar />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
