"use client";

import { PaintBucket, ActivityIcon, SettingsIcon, Home, LogOut, Mail, User } from "lucide-react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import Image from "next/image";
import { redirect, usePathname } from "next/navigation";
import { Button } from "../ui/button";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

const navigation = [
  { name: "Home", href: "/home", icon: Home },
  { name: "Buckets", href: "/buckets", icon: PaintBucket },
  { name: "Settings", href: "/settings", icon: SettingsIcon },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;

  const handleSignOut = async () => {
    await authClient.signOut();
    toast.success("Successfully signed out");
    redirect("/");
  };

  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const UserProfileSkeleton = () => (
    <div className="p-4 bg-gradient-card rounded-lg shadow-soft">
      <div className="flex items-center gap-3 mb-4">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1 min-w-0">
          <Skeleton className="h-4 w-24 mb-2" />
          <div className="flex items-center gap-1">
            <Skeleton className="h-3 w-3 rounded" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
      </div>
      <Skeleton className="h-8 w-full rounded-md" />
    </div>
  );

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

        {/* User Profile */}
        <div className="mt-auto pt-6 border-t border-sidebar-border">
          {isPending || !user ? (
            <UserProfileSkeleton />
          ) : (
            <div className="p-4 bg-gradient-card rounded-lg shadow-soft">
              <div className="flex items-center gap-3 mb-4">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user?.image || ""} alt={user?.name || ""} />
                  <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                    {user?.name ? getUserInitials(user.name) : <User className="h-5 w-5" />}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate font-jakarta">
                    {user?.name || "Anonymous User"}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Mail className="h-3 w-3" />
                    <span className="truncate">{user?.email || "No email"}</span>
                  </div>
                </div>
              </div>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSignOut}
                className="w-full font-jakarta"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          )}
        </div>
      </SidebarContent>
    </Sidebar>
  );
}