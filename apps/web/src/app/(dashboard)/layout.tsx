import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

const DEMO_USER = {
  name: "Demo User",
  email: "demo@postador.dev",
  image: null,
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Topbar user={DEMO_USER} />
        <main className="flex-1 overflow-y-auto scrollbar-thin px-4 pb-6 pt-2">
          {children}
        </main>
      </div>
    </div>
  );
}
