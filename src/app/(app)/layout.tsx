import { getAppContext } from "@/server/auth/organization-context";
import { AppHeader } from "./_components/app-header";
import { SidebarContent } from "./_components/sidebar";

/** Authenticated application shell: sidebar navigation + header + content. */
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const context = await getAppContext();

  return (
    <div className="flex min-h-dvh flex-1 bg-canvas font-sans text-ink">
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 border-r border-line bg-surface lg:block">
        <SidebarContent {...context} />
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader
          user={context.user}
          organization={context.organization}
          mobileNav={<SidebarContent {...context} />}
        />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
