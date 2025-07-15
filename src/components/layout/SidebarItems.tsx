
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Settings,
  FileText,
  CalendarDays,
  User,
  Briefcase,
  Check,
  Video,
  Lightbulb,
  Wrench,
  Bot,
  PieChart,
  Repeat,
  Wallet,
  Target,
  BarChart,
  TrendingUp,
  Calculator,
  Contact,
  FileArchive,
  Receipt,
  ArrowRightLeft,
  Users,
  UserSearch,
  History,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";
import Logo from "@/components/icons/Logo";
import { Button } from "@/components/ui/button";
import { useProfile } from "@/context/ProfileContext";

const navItemsPrivate = [
  { href: "/", label: "Übersicht", icon: LayoutDashboard },
  {
    label: "Finanzen",
    icon: Wallet,
    subItems: [
      { href: "/transactions", label: "Transaktionen", icon: ArrowRightLeft },
      { href: "/recurring", label: "Daueraufträge", icon: Repeat },
      { href: "/receipts", label: "Belege", icon: Receipt },
    ],
  },
  { href: "/budgets", label: "Budgets", icon: PieChart },
  { href: "/savings", label: "Sparziele", icon: Target },
  { href: "/calendar", label: "Kalender", icon: CalendarDays },
  {
    label: "KI-Tools",
    icon: Bot,
    subItems: [
      { href: "/insights", label: "Einblicke", icon: BarChart },
      { href: "/ai-forecast", label: "Prognose", icon: TrendingUp },
      { href: "/ai-suggestions", label: "Vorschläge", icon: Lightbulb },
      { href: "/ai-scan", label: "Dokumentenscan", icon: FileText },
      { href: "/finbot", label: "FinBot", icon: Bot },
    ],
  },
  {
    label: "Einstellungen",
    icon: Settings,
    groupBottom: true,
    subItems: [
      { href: "/settings", label: "Allgemein", icon: Settings },
      { href: "/audit", label: "Audit-Protokoll", icon: History },
    ],
  },
];

const navItemsBusiness = [
  { href: "/", label: "Übersicht", icon: LayoutDashboard },
  {
    label: "Content",
    icon: Video,
    subItems: [
      { href: "/content-plan", label: "Inhaltsplan", icon: CalendarDays },
      { href: "/idea-dump", label: "Ideensammlung", icon: Lightbulb },
    ],
  },
  {
    label: "Finanzen",
    icon: Wallet,
    subItems: [
      { href: "/transactions", label: "Transaktionen", icon: ArrowRightLeft },
      { href: "/recurring", label: "Daueraufträge", icon: Repeat },
      { href: "/invoices", label: "Rechnungen", icon: FileText },
      { href: "/receipts", label: "Belege", icon: Receipt },
      { href: "/budgets", label: "Budgets", icon: PieChart },
      { href: "/savings", label: "Sparziele", icon: Target },
      { href: "/quote-calculator", label: "Kostenvoranschlag", icon: Calculator },
    ],
  },
  {
    label: "Organisation",
    icon: Briefcase,
    subItems: [
      { href: "/customers", label: "Kunden", icon: User },
      { href: "/equipment", label: "Inventar", icon: Wrench },
      { href: "/documents", label: "Dokumente", icon: FileArchive },
      { href: "/team-calendar", label: "Team-Kalender", icon: CalendarDays },
      { href: "/vcard", label: "Visitenkarte", icon: Contact },
    ],
  },
  {
    label: "Personal",
    icon: Users,
    subItems: [
        { href: "/personnel", label: "Mitarbeiter", icon: Users },
        { href: "/recruiting", label: "Recruiting", icon: UserSearch },
    ],
  },
  {
    label: "Einstellungen",
    icon: Settings,
    groupBottom: true,
    subItems: [
      { href: "/settings", label: "Allgemein", icon: Settings },
      { href: "/audit", label: "Audit-Protokoll", icon: History },
    ],
  },
];


export function SidebarItems() {
  const pathname = usePathname();
  const { isMobile, setOpenMobile } = useSidebar();
  const { activeProfile, setActiveProfile } = useProfile();

  const navItems = activeProfile === 'Privat' ? navItemsPrivate : navItemsBusiness;

  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <>
      <SidebarHeader className="border-b">
         <Link href="/" className="flex items-center gap-2 py-1" onClick={handleLinkClick}>
            <Logo className="h-7 w-7" />
            <span className="font-headline text-xl font-semibold text-sidebar-foreground group-data-[collapsible=icon]:hidden">
              Flow Finance
            </span>
          </Link>
      </SidebarHeader>

      <SidebarMenu className="flex-1 overflow-y-auto p-2">
        {navItems.map((item) =>
          item.subItems ? (
            <SidebarMenuItem key={item.label} className={item.groupBottom ? "mt-auto" : ""}>
              <SidebarMenuButton
                variant="default"
                className="w-full justify-start"
                isActive={item.subItems.some(sub => pathname.startsWith(sub.href))}
                aria-expanded={item.subItems.some(sub => pathname.startsWith(sub.href))}
                tooltip={item.label}
              >
                <item.icon className="h-5 w-5" />
                <span className="truncate group-data-[collapsible=icon]:hidden">{item.label}</span>
              </SidebarMenuButton>
              <ul className="mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l border-sidebar-border px-2.5 py-0.5 group-data-[collapsible=icon]:hidden">
                {item.subItems.map((subItem) => (
                   <SidebarMenuItem key={subItem.href}>
                     <Link href={subItem.href} onClick={handleLinkClick}>
                      <SidebarMenuSubButton
                        isActive={pathname === subItem.href}
                        className="gap-2"
                      >
                         {subItem.icon && <subItem.icon className="h-4 w-4 shrink-0 opacity-70" />}
                         <span className="truncate">{subItem.label}</span>
                      </SidebarMenuSubButton>
                    </Link>
                   </SidebarMenuItem>
                ))}
              </ul>
            </SidebarMenuItem>
          ) : (
            <SidebarMenuItem key={item.href} className={item.groupBottom ? "mt-auto" : ""}>
              <Link href={item.href} onClick={handleLinkClick}>
                <SidebarMenuButton
                  variant="default"
                  className="w-full justify-start"
                  isActive={pathname === item.href}
                  tooltip={item.label}
                  aria-current={pathname === item.href ? "page" : undefined}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="truncate group-data-[collapsible=icon]:hidden">{item.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          )
        )}
      </SidebarMenu>
      
      <SidebarFooter className="border-t p-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="w-full justify-start gap-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-2"
              aria-label={`Aktuelles Profil: ${activeProfile}. Profil wechseln.`}
            >
              {activeProfile === "Privat" ? <User className="h-5 w-5" /> : <Briefcase className="h-5 w-5" />}
              <span className="group-data-[collapsible=icon]:hidden">{activeProfile}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" className="w-[var(--sidebar-width-icon-adjusted,14rem)] group-data-[collapsible=icon]:w-auto mb-1">
            <DropdownMenuItem onClick={() => setActiveProfile("Privat")}>
              <User className="mr-2 h-4 w-4" />
              <span>Privat</span>
              {activeProfile === "Privat" && <Check className="ml-auto h-4 w-4" />}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setActiveProfile("Geschäftlich")}>
              <Briefcase className="mr-2 h-4 w-4" />
              <span>Geschäftlich</span>
              {activeProfile === "Geschäftlich" && <Check className="ml-auto h-4 w-4" />}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </>
  );
}
