"use client";

import {
  PaintBucket,
  ActivityIcon,
  SettingsIcon,
  Home,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const navigation = [
  { name: "Home", href: "/home", icon: Home },
  { name: "Buckets", href: "/buckets", icon: PaintBucket },
  // { name: "Files", href: "/buckets", icon: FilesIcon },
  { name: "Activity", href: "/activity", icon: ActivityIcon },
  { name: "Settings", href: "/settings", icon: SettingsIcon },
];

export function AppSidebar() {
  const pathname = usePathname();
  return (
    <Sidebar className="border-r border-border bg-sidebar">
      <SidebarContent className="p-4">
        <div className="flex justify-between items-center mb-6 md:hidden">
          <SidebarTrigger className="md:hidden" />
        </div>

        <div className="flex items-center gap-2 mb-8">
          <div className="absolute top-6 left-6 z-10">
            <Image
              src="/logo.svg"
              alt="Limitless"
              width={120}
              height={40}
              className="dark:hidden"
            />
            <Image
              src="/logo-light.svg"
              alt="Limitless"
              width={120}
              height={40}
              className="hidden dark:block"
            />
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.name === "Files" && pathname.startsWith("/buckets/"));
                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton asChild>
                      <Link
                        href={item.href}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                          isActive
                            ? "border bg-sidebar-accent text-sidebar-primary font-medium shadow-2xl"
                            : "text-sidebar-foreground hover:bg-sidebar-accent"
                        }`}
                      >
                        <item.icon className="w-4 h-4" />
                        <span className="font-jakarta">{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Storage Usage */}
        <div className="mt-auto pt-6 border-t border-sidebar-border">
          <div className="p-3 bg-gradient-card rounded-lg shadow-soft">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-sidebar-foreground">
                Storage
              </span>
              <span className="text-xs text-sidebar-foreground/70">
                2.1GB / 5GB
              </span>
            </div>
            <Progress value={42} className="h-2 mb-1" />
            <p className="text-xs text-sidebar-foreground/60">42% used</p>
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}