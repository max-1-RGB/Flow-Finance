
"use client";

import * as React from "react";
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
  SidebarRail,
  SidebarContent,
} from "@/components/ui/sidebar";
import Header from "@/components/layout/Header";
import { SidebarItems } from "@/components/layout/SidebarItems";

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  // Retrieve sidebar state from cookie or default to open
  const [defaultOpen, setDefaultOpen] = React.useState(true);

  React.useEffect(() => {
    const cookieValue = document.cookie
      .split('; ')
      .find(row => row.startsWith('sidebar_state='))
      ?.split('=')[1];
    if (cookieValue) {
      setDefaultOpen(cookieValue === 'true');
    }
  }, []);


  return (
    <SidebarProvider defaultOpen={defaultOpen} collapsible="icon">
      <Sidebar variant="sidebar" side="left" className="border-r">
        <SidebarContent>
          <SidebarItems />
        </SidebarContent>
        <SidebarRail />
      </Sidebar>
      <SidebarInset className="flex flex-col">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
