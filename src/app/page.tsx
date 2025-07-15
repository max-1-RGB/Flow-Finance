
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, ListChecks, PlusCircle, Lightbulb, Video, Wrench, FileText, Bot, PieChart, Target, CalendarDays } from "lucide-react";
import Link from "next/link";
import { useProfile } from "@/context/ProfileContext";

export default function DashboardPage() {
  const { activeProfile } = useProfile();
  
  const formatCurrency = (value: number) => {
    return value.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
  };

  const balance = activeProfile === 'Privat' ? 12345.67 : 89012.34;
  const upcomingDeadlines = activeProfile === 'Privat' ? 3 : 8;
  const openInvoices = activeProfile === 'Privat' ? 2 : 5;
  const newIdeas = 12;
  const savingsGoals = 2;
  const activeBudgets = 3;

  const recentTransactions = activeProfile === 'Privat' ? 
    [
      { description: "Starbucks", amount: -5.75 },
      { description: "Gehaltseingang", amount: 2500.00 },
      { description: "Netflix Abonnement", amount: -15.99 },
    ] :
    [
      { description: "AWS Rechnung", amount: -250.50 },
      { description: "Kundenzahlung", amount: 7500.00 },
      { description: "Büromaterial", amount: -89.90 },
    ];
  
  const privateQuickActions = [
    {href: "/budgets", icon: PieChart, label: "Neues Budget"},
    {href: "/savings", icon: Target, label: "Neues Sparziel"},
    {href: "/finbot", icon: Bot, label: "FinBot fragen"},
    {href: "/ai-scan", icon: FileText, label: "Beleg scannen"},
  ];
  
  const businessQuickActions = [
      {href: "/content-plan", icon: Video, label: "Neuen Plan erstellen"},
      {href: "/idea-dump", icon: Lightbulb, label: "Idee festhalten"},
      {href: "/invoices", icon: FileText, label: "Rechnung erstellen"},
      {href: "/equipment", icon: Wrench, label: "Inventar prüfen"},
  ];

  const quickActions = activeProfile === 'Privat' ? privateQuickActions : businessQuickActions;
  
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="font-headline text-3xl font-semibold tracking-tight">
          Übersicht: {activeProfile}
        </h1>
        <Link href="/transactions?action=add">
            <Button>
                <PlusCircle className="mr-2 h-4 w-4" /> Einnahme/Ausgabe buchen
            </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Aktueller Saldo
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(balance)}</div>
            <p className="text-xs text-muted-foreground">
              {activeProfile === 'Privat' ? 'Private Konten' : 'Geschäftskonten'}
            </p>
          </CardContent>
        </Card>
        {activeProfile === 'Privat' ? (
           <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aktive Sparziele</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{savingsGoals}</div>
              <p className="text-xs text-muted-foreground">
                Sie sparen aktiv für Ihre Ziele
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Offene Rechnungen
              </CardTitle>
              <ListChecks className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{openInvoices}</div>
              <p className="text-xs text-muted-foreground">
                Rechnungen warten auf Zahlung
              </p>
            </CardContent>
          </Card>
        )}
        {activeProfile === 'Privat' ? (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Laufende Budgets</CardTitle>
              <PieChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeBudgets}</div>
              <p className="text-xs text-muted-foreground">
                Ausgaben im Blick behalten
              </p>
            </CardContent>
          </Card>
        ) : (
            <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Anstehende Deadlines</CardTitle>
              <Video className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{upcomingDeadlines}</div>
              <p className="text-xs text-muted-foreground">
                 in den nächsten 7 Tagen
              </p>
            </CardContent>
          </Card>
        )}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wichtige Termine</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingDeadlines}</div>
            <p className="text-xs text-muted-foreground">
              in den nächsten 7 Tagen
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Letzte Transaktionen</CardTitle>
            <CardDescription>Ihre neuesten finanziellen Aktivitäten.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {recentTransactions.map((tx, index) => (
                <li key={index} className="flex justify-between">
                  <span>{tx.description}</span>
                  <span className={tx.amount > 0 ? 'text-primary' : 'text-destructive'}>
                    {tx.amount > 0 ? '+' : ''}{formatCurrency(tx.amount)}
                  </span>
                </li>
              ))}
            </ul>
            <Link href="/transactions">
              <Button variant="outline" className="mt-4 w-full">Alle Transaktionen anzeigen</Button>
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Schnellaktionen</CardTitle>
            <CardDescription>Greifen Sie schnell auf häufige Aufgaben zu.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
             {quickActions.map(action => {
                const Icon = action.icon;
                return (
                     <Link href={action.href} key={action.href}>
                        <Button variant="outline" className="w-full justify-start">
                            <Icon className="mr-2 h-4 w-4" />{action.label}
                        </Button>
                     </Link>
                )
             })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
