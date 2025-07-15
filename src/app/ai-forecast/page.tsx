
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, TrendingUp, AlertTriangle, ThumbsUp } from "lucide-react";
import { forecastCashFlow, ForecastCashFlowInput, ForecastCashFlowOutput } from '@/ai/flows/cash-flow-forecasting'; 
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { useToast } from '@/hooks/use-toast';

interface ForecastData {
  projectedBalance: number;
  potentialRisks: string;
  suggestions: string;
  chartData: { month: string; balance: number }[];
}

// Beispieldaten für das Diagramm, kann später dynamisch generiert werden
const generateMockChartData = (currentBalance: number, projectedBalance: number): { month: string; balance: number }[] => {
  return [
    { month: "Aktuell", balance: currentBalance },
    { month: "Nächster Monat", balance: projectedBalance },
    { month: "In 2 Monaten", balance: projectedBalance * 1.05 }, // Annahme: 5% Wachstum
    { month: "In 3 Monaten", balance: projectedBalance * 1.10 }, // Annahme: 10% Wachstum
  ];
};

const chartConfig = {
  balance: {
    label: "Saldo",
    color: "hsl(var(--chart-1))",
  },
};

export default function AIForecastPage() {
  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const currentBalanceExample = 12345.67; // Beispielhafter aktueller Kontostand

  useEffect(() => {
    const fetchForecast = async () => {
      setIsLoading(true);
      const input: ForecastCashFlowInput = { 
        // In einer echten App würden hier echte Daten übergeben
        historicalTransactions: JSON.stringify([ 
          { date: "2024-06-15", description: "Gehalt", amount: 3000 },
          { date: "2024-06-20", description: "Miete", amount: -1000 },
          { date: "2024-06-25", description: "Einkauf", amount: -150 }
        ]), 
        recurringTransactions: JSON.stringify([
          { description: "Netflix", amount: -15.99, frequency: "monthly" },
          { description: "Miete", amount: -1000, frequency: "monthly" }
        ]), 
        currentBalance: currentBalanceExample 
      };
      try {
        const result: ForecastCashFlowOutput = await forecastCashFlow(input);
        setForecast({ 
          ...result, 
          chartData: generateMockChartData(currentBalanceExample, result.projectedBalance) 
        });
      } catch (error) {
        console.error("Fehler beim Abrufen der KI-Prognose:", error);
        setForecast(null);
        toast({
          variant: "destructive",
          title: "Prognose Fehler",
          description: "Cashflow-Prognose konnte nicht geladen werden.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchForecast();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatCurrency = (value: number) => {
    return value.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
  };
  
  const yAxisFormatter = (value: number) => {
    return value.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' €';
  };


  if (isLoading) {
    return (
      <div className="flex flex-col gap-8 animate-pulse">
        <div className="h-8 bg-muted rounded w-1/2"></div>
        <Card><CardHeader><div className="h-6 bg-muted rounded w-1/3"></div></CardHeader><CardContent><div className="h-60 bg-muted rounded"></div></CardContent></Card>
        <div className="grid md:grid-cols-2 gap-6">
          <Card><CardHeader><div className="h-5 bg-muted rounded w-1/4"></div></CardHeader><CardContent><div className="h-16 bg-muted rounded"></div></CardContent></Card>
          <Card><CardHeader><div className="h-5 bg-muted rounded w-1/4"></div></CardHeader><CardContent><div className="h-16 bg-muted rounded"></div></CardContent></Card>
        </div>
      </div>
    );
  }

  if (!forecast) {
    return (
      <div className="flex flex-col gap-8">
        <h1 className="font-headline text-3xl font-semibold tracking-tight">KI-Cashflow-Prognose</h1>
        <Card>
          <CardContent className="p-8 text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
            <p className="text-muted-foreground">Cashflow-Prognose konnte nicht geladen werden. Bitte versuchen Sie es später erneut.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-headline text-3xl font-semibold tracking-tight">
        KI-Cashflow-Prognose
      </h1>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline flex items-center">
            <BarChart3 className="mr-2 h-5 w-5 text-primary" /> Prognostizierter Saldotrend
          </CardTitle>
          <CardDescription>Ihr geschätzter Kontostand für die kommenden Monate.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[350px] w-full">
            <BarChart accessibilityLayer data={forecast.chartData}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
              />
              <YAxis tickFormatter={yAxisFormatter} />
              <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" formatter={(value: any, name: any, props: any) => [formatCurrency(props.payload.balance), chartConfig.balance.label]} />} />
              <Bar dataKey="balance" fill="var(--color-balance)" radius={8} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
      
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center">
              <TrendingUp className="mr-2 h-5 w-5 text-primary" /> Ausblick nächster Monat
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">{formatCurrency(forecast.projectedBalance)}</p>
            <p className="text-sm text-muted-foreground">Prognostizierter Saldo am Ende des nächsten Monats.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5 text-orange-500" /> Mögliche Risiken
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{forecast.potentialRisks}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline flex items-center">
            <ThumbsUp className="mr-2 h-5 w-5 text-primary" /> Verbesserungsvorschläge
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm">{forecast.suggestions}</p>
        </CardContent>
      </Card>
    </div>
  );
}
