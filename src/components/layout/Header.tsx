
"use client";

import Link from "next/link";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import Logo from "@/components/icons/Logo";

export default function Header() {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 sm:px-6">
      <div className="md:hidden">
        <SidebarTrigger />
      </div>
      <Link href="/" className="flex items-center gap-2">
        <Logo className="h-6 w-6" />
        <span className="font-headline text-lg font-semibold text-foreground">
          Flow Finance
        </span>
      </Link>
      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle />
        {/* Placeholder for User Avatar/Menu */}
        {/* <UserNav /> */}
      </div>
    </header>
  );
}
