import { AppSidebar } from "@/components/sidebar/sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

interface Props {
  children: React.ReactNode;
}

const Layout = async ({ children }: Props) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen max-h-screen bg-accent w-full">
        <div className="fixed top-4 right-0 z-50 md:hidden">
          <SidebarTrigger />
        </div>
        <AppSidebar />
        <div className="flex flex-col px-4 overflow-y-auto bg-accent w-full h-full">
          {children}
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Layout;
