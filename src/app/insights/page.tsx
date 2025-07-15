
"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart3, PieChart as PieChartIcon } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Pie, PieChart as RechartsPieChart, Cell, ResponsiveContainer } from "recharts"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { startOfWeek, endOfWeek, subWeeks, startOfMonth, endOfMonth, subMonths, format, isWithinInterval } from 'date-fns';
import { de } from 'date-fns/locale';

const allTransactions = [
  { id: "t1", date: new Date(new Date().setMonth(new Date().getMonth() - 0, 15)).toISOString(), merchant: "Rewe", category: "Lebensmittel", amount: -55.20, paymentMethod: "Kreditkarte" },
  { id: "t2", date: new Date(new Date().setMonth(new Date().getMonth() - 0, 18)).toISOString(), merchant: "Netflix", category: "Unterhaltung", amount: -15.99, paymentMethod: "PayPal" },
  { id: "t3", date: new Date(new Date().setMonth(new Date().getMonth() - 0, 22)).toISOString(), merchant: "Starbucks", category: "Freizeit", amount: -8.50, paymentMethod: "Kreditkarte" },
  { id: "t4", date: new Date(new Date().setMonth(new Date().getMonth() - 0, 1)).toISOString(), merchant: "Miete", category: "Wohnen", amount: -850.00, paymentMethod: "Bankkonto" },
  { id: "t15", date: new Date().toISOString(), merchant: "Apotheke", category: "Gesundheit", amount: -22.75, paymentMethod: "EC-Karte" },
  { id: "t16", date: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(), merchant: "Spotify", category: "Unterhaltung", amount: -10.99, paymentMethod: "PayPal" },
  { id: "t5", date: new Date(new Date().setMonth(new Date().getMonth() - 1, 12)).toISOString(), merchant: "Amazon", category: "Shopping", amount: -120.50, paymentMethod: "Kreditkarte" },
  { id: "t6", date: new Date(new Date().setMonth(new Date().getMonth() - 1, 20)).toISOString(), merchant: "Rewe", category: "Lebensmittel", amount: -89.30, paymentMethod: "Kreditkarte" },
  { id: "t7", date: new Date(new Date().setMonth(new Date().getMonth() - 1, 25)).toISOString(), merchant: "Kino", category: "Unterhaltung", amount: -25.00, paymentMethod: "Kreditkarte" },
  { id: "t8", date: new Date(new Date().setMonth(new Date().getMonth() - 2, 10)).toISOString(), merchant: "Shell", category: "Transport", amount: -60.00, paymentMethod: "Kreditkarte" },
  { id: "t9", date: new Date(new Date().setMonth(new Date().getMonth() - 2, 18)).toISOString(), merchant: "Lidl", category: "Lebensmittel", amount: -75.80, paymentMethod: "EC-Karte" },
  { id: "t10", date: new Date(new Date().setMonth(new Date().getMonth() - 3, 20)).toISOString(), merchant: "H&M", category: "Shopping", amount: -49.99, paymentMethod: "Kreditkarte" },
  { id: "t11", date: new Date(new Date().setMonth(new Date().getMonth() - 4, 5)).toISOString(), merchant: "Deutsche Bahn", category: "Transport", amount: -88.40, paymentMethod: "PayPal" },
  { id: "t12", date: new Date(new Date().setMonth(new Date().getMonth() - 5, 28)).toISOString(), merchant: "IKEA", category: "Wohnen", amount: -230.00, paymentMethod: "Kreditkarte" },
  { id: "t13", date: new Date(new Date().setMonth(new Date().getMonth() - 5, 15)).toISOString(), merchant: "Aldi", category: "Lebensmittel", amount: -95.10, paymentMethod: "EC-Karte" },
  { id: "t14", date: new Date(new Date().setMonth(new Date().getMonth() - 5, 19)).toISOString(), merchant: "Restaurant", category: "Freizeit", amount: -65.50, paymentMethod: "Kreditkarte" },
];

const currencyFormatter = (value: number) => {
  return value.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
};

const dateFormatter = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE');
};

const PIE_CHART_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "#a3e635",
  "#fbbf24",
];


export default function InsightsPage() {
  const [timeFilter, setTimeFilter] = useState("this_month");
  const [merchantFilter, setMerchantFilter] = useState("all");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("all");

  const merchants = useMemo(() => ['all', ...Array.from(new Set(allTransactions.map(t => t.merchant)))], []);
  const paymentMethods = useMemo(() => ['all', ...Array.from(new Set(allTransactions.map(t => t.paymentMethod)))], []);

  const timeFilteredTransactions = useMemo(() => {
    const now = new Date();
    let interval;

    switch (timeFilter) {
      case 'this_week':
        interval = { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }) };
        break;
      case 'last_week':
        const lastWeekStart = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
        interval = { start: lastWeekStart, end: endOfWeek(lastWeekStart, { weekStartsOn: 1 }) };
        break;
      case 'last_month':
        const lastMonthStart = startOfMonth(subMonths(now, 1));
        interval = { start: lastMonthStart, end: endOfMonth(lastMonthStart) };
        break;
      case 'this_month':
      default:
        interval = { start: startOfMonth(now), end: endOfMonth(now) };
        break;
    }
    
    return allTransactions.filter(transaction => {
      const txDate = new Date(transaction.date);
      return isWithinInterval(txDate, interval);
    });

  }, [timeFilter]);

  const finalFilteredTransactions = useMemo(() => {
    return timeFilteredTransactions.filter(transaction => {
      const merchantMatch = merchantFilter === 'all' || transaction.merchant === merchantFilter;
      const paymentMethodMatch = paymentMethodFilter === 'all' || transaction.paymentMethod === paymentMethodFilter;
      return merchantMatch && paymentMethodMatch;
    });
  }, [timeFilteredTransactions, merchantFilter, paymentMethodFilter]);

  const monthlyTrendData = useMemo(() => {
    const sixMonthsAgo = startOfMonth(subMonths(new Date(), 5));
    const monthlySpending: Record<string, number> = {};

    allTransactions.forEach(tx => {
        if(tx.amount < 0 && new Date(tx.date) >= sixMonthsAgo) {
            const monthKey = format(new Date(tx.date), 'yyyy-MM');
            monthlySpending[monthKey] = (monthlySpending[monthKey] || 0) - tx.amount;
        }
    });
    
    return Array.from({ length: 6 }, (_, i) => {
      const d = subMonths(new Date(), 5 - i);
      const key = format(d, 'yyyy-MM');
      return {
        month: format(d, 'MMM', { locale: de }),
        total: monthlySpending[key] || 0,
      };
    });
  }, []);

  const categoryChartData = useMemo(() => {
    const spendingByCategory = timeFilteredTransactions.reduce((acc, transaction) => {
      if (transaction.amount < 0) {
        const amount = -transaction.amount;
        acc[transaction.category] = (acc[transaction.category] || 0) + amount;
      }
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(spendingByCategory)
      .map(([category, value], index) => ({
        category,
        value: parseFloat(value.toFixed(2)),
        fill: PIE_CHART_COLORS[index % PIE_CHART_COLORS.length],
      }))
      .sort((a, b) => b.value - a.value);
  }, [timeFilteredTransactions]);

  const chartConfigMonthly = {
    total: {
      label: "Gesamtausgaben",
      color: "hsl(var(--chart-1))",
    },
  };
  
  const chartConfigCategory = useMemo(() => {
    const config: any = { value: { label: "Ausgaben" } };
    categoryChartData.forEach(item => {
        config[item.category] = {
            label: item.category,
            color: item.fill,
        };
    });
    return config;
  }, [categoryChartData]);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="font-headline text-3xl font-semibold tracking-tight">
          Ausgabeneinblicke
        </h1>
        <Select value={timeFilter} onValueChange={setTimeFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Zeitraum auswählen" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="this_week">Diese Woche</SelectItem>
            <SelectItem value="last_week">Letzte Woche</SelectItem>
            <SelectItem value="this_month">Dieser Monat</SelectItem>
            <SelectItem value="last_month">Letzter Monat</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center">
              <BarChart3 className="mr-2 h-5 w-5 text-primary" /> Monatlicher Ausgabentrend
            </CardTitle>
            <CardDescription>Ihre Gesamtausgaben der letzten 6 Monate.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfigMonthly} className="h-[300px] w-full">
              <BarChart accessibilityLayer data={monthlyTrendData}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                />
                <YAxis tickFormatter={currencyFormatter} />
                <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" formatter={(value: any) => currencyFormatter(value)} />} />
                <Bar dataKey="total" fill="var(--color-total)" radius={8} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center">
              <PieChartIcon className="mr-2 h-5 w-5 text-primary" /> Ausgaben nach Kategorie
            </CardTitle>
            <CardDescription>Aufschlüsselung Ihrer Ausgaben für den gewählten Zeitraum.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
             {categoryChartData.length > 0 ? (
                <ChartContainer config={chartConfigCategory} className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height={300}>
                        <RechartsPieChart>
                            <ChartTooltip content={<ChartTooltipContent nameKey="category" formatter={(value) => currencyFormatter(value as number)} />} />
                            <Pie data={categoryChartData} dataKey="value" nameKey="category" cx="50%" cy="50%" outerRadius={90} labelLine={false} label={({ percent, name }) => `${name.length > 10 ? name.slice(0,8)+'...' : name}: ${(percent * 100).toFixed(0)}%`}>
                                {categoryChartData.map((entry) => (
                                    <Cell key={`cell-${entry.category}`} fill={entry.fill} />
                                ))}
                            </Pie>
                            <ChartLegend content={<ChartLegendContent nameKey="category" />} />
                        </RechartsPieChart>
                    </ResponsiveContainer>
                </ChartContainer>
             ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    Keine Ausgabendaten für diesen Zeitraum.
                </div>
             )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
            <CardTitle className="font-headline">Detaillierte Aufschlüsselung</CardTitle>
            <CardDescription>Filtern Sie Ihre Ausgaben im gewählten Zeitraum detaillierter.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select value={merchantFilter} onValueChange={setMerchantFilter}>
                    <SelectTrigger><SelectValue placeholder="Nach Händler filtern" /></SelectTrigger>
                    <SelectContent>
                        {merchants.map(merchant => (
                            <SelectItem key={merchant} value={merchant}>{merchant === 'all' ? 'Alle Händler' : merchant}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select value={paymentMethodFilter} onValueChange={setPaymentMethodFilter}>
                    <SelectTrigger><SelectValue placeholder="Nach Zahlungsmethode filtern" /></SelectTrigger>
                    <SelectContent>
                        {paymentMethods.map(method => (
                           <SelectItem key={method} value={method}>{method === 'all' ? 'Alle Zahlungsmethoden' : method}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Datum</TableHead>
                    <TableHead>Händler</TableHead>
                    <TableHead>Kategorie</TableHead>
                    <TableHead className="text-right">Betrag</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {finalFilteredTransactions.length > 0 ? (
                    finalFilteredTransactions.map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell>{dateFormatter(tx.date)}</TableCell>
                        <TableCell className="font-medium">{tx.merchant}</TableCell>
                        <TableCell>{tx.category}</TableCell>
                        <TableCell className="text-right text-destructive">{currencyFormatter(tx.amount)}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center">
                        Keine Transaktionen für die ausgewählten Filter gefunden.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
