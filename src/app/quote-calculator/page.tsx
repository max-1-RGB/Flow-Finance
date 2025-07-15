
"use client";

import React, { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Calculator, FileText, Loader2, Sparkles } from "lucide-react";
import { generateQuote, GenerateQuoteOutput } from '@/ai/flows/quote-calculator';

// This would typically be fetched from a user's settings/database
const getStoredCostItems = () => {
    if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('costItems');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed)) {
                    return parsed;
                }
            } catch (e) {
                console.error("Failed to parse cost items from localStorage", e);
                // Fallback to default if parsing fails
            }
        }
    }
    // Default values if nothing is stored
    return [
        { name: "Tagessatz", value: 800 },
        { name: "Reisekosten pro km", value: 0.50 },
        { name: "Unterkunftspauschale pro Nacht", value: 150 },
        { name: "Nachbearbeitung Pauschale in %", value: 25 },
    ];
};

const formSchema = z.object({
  projectDescription: z.string().min(10, { message: "Bitte beschreiben Sie das Projekt etwas genauer." }),
  location: z.string().min(2, { message: "Bitte geben Sie einen Ort an." }),
  days: z.coerce.number().min(1, { message: "Die Anzahl der Tage muss mindestens 1 sein." }),
  accommodationProvided: z.boolean().default(false),
  workType: z.string().min(3, { message: "Bitte geben Sie die Art der Arbeit an." }),
  deliverables: z.string().min(5, { message: "Bitte beschreiben Sie die erwarteten Ergebnisse." }),
});

type FormValues = z.infer<typeof formSchema>;

export default function QuoteCalculatorPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [quoteResult, setQuoteResult] = useState<GenerateQuoteOutput | null>(null);
  const [costItems, setCostItems] = useState([]);
  const { toast } = useToast();

  useEffect(() => {
    setCostItems(getStoredCostItems());
  }, []);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      projectDescription: "",
      location: "",
      days: 1,
      accommodationProvided: false,
      workType: "Fotografie & Videografie",
      deliverables: "ca. 20 bearbeitete Fotos, 1-2 minütiges Video",
    },
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsLoading(true);
    setQuoteResult(null);
    try {
      const currentCostItems = getStoredCostItems();
      const result = await generateQuote({ ...data, costItems: currentCostItems });
      setQuoteResult(result);
    } catch (error) {
      console.error("Fehler beim Erstellen des Kostenvoranschlags:", error);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Der Kostenvoranschlag konnte nicht erstellt werden.",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const formatCurrency = (value: number) => {
    return value.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
  };

  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-headline text-3xl font-semibold tracking-tight">
        Kostenvoranschlagsrechner
      </h1>

      <div className="grid md:grid-cols-2 gap-8 items-start">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5 text-primary"/> Projektdetails eingeben</CardTitle>
            <CardDescription>Füllen Sie die Felder aus, um einen KI-basierten Kostenvoranschlag zu erhalten.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="projectDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Projektbeschreibung</FormLabel>
                      <FormControl>
                        <Textarea placeholder="z.B. Produktfotoshooting für eine neue Modelinie..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ort</FormLabel>
                      <FormControl>
                        <Input placeholder="z.B. Hamburg, Deutschland" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="days"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Anzahl der Tage vor Ort</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="workType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Art der Arbeit</FormLabel>
                      <FormControl>
                        <Input placeholder="Fotografie, Videografie, Drohne..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="deliverables"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Erwartete Ergebnisse</FormLabel>
                      <FormControl>
                        <Input placeholder="z.B. 50 Fotos, 1x 90s Video" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="accommodationProvided"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Unterkunft wird gestellt</FormLabel>
                        <FormDescription>
                          Aktivieren, wenn der Kunde die Unterkunft stellt.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Berechne...</>
                  ) : (
                    <><Sparkles className="mr-2 h-4 w-4" /> Kostenvoranschlag erstellen</>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card className="sticky top-24">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-primary"/> Ihr Kostenvoranschlag</CardTitle>
            <CardDescription>Das Ergebnis Ihrer Anfrage wird hier angezeigt.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="space-y-4 animate-pulse">
                <div className="h-6 w-3/4 rounded bg-muted"></div>
                <div className="space-y-2 pt-4">
                  <div className="h-4 w-full rounded bg-muted"></div>
                  <div className="h-4 w-5/6 rounded bg-muted"></div>
                  <div className="h-4 w-full rounded bg-muted"></div>
                </div>
                <div className="h-8 w-1/2 rounded bg-muted ml-auto mt-4"></div>
              </div>
            )}
            {!isLoading && quoteResult && (
              <div className="space-y-4">
                <h3 className="font-bold text-lg">{quoteResult.quoteTitle}</h3>
                <div className="border-t pt-4">
                  <ul className="space-y-2">
                    {quoteResult.lineItems.map((item, index) => (
                      <li key={index} className="flex justify-between items-start text-sm">
                        <div>
                            <p className="font-medium">{item.item}</p>
                            <p className="text-xs text-muted-foreground">{item.details}</p>
                        </div>
                        <span>{formatCurrency(item.amount)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="border-t pt-4 flex justify-between items-center font-bold">
                    <span>Gesamtsumme (Netto)</span>
                    <span className="text-xl text-primary">{formatCurrency(quoteResult.totalAmount)}</span>
                </div>
                 <div className="border-t pt-4 text-xs text-muted-foreground">
                    <p className="font-bold mb-1">Anmerkungen:</p>
                    <p>{quoteResult.notes}</p>
                </div>
                <Button className="w-full" onClick={() => toast({ title: "Noch nicht implementiert" })}>
                    Als PDF exportieren
                </Button>
              </div>
            )}
             {!isLoading && !quoteResult && (
                <div className="text-center text-muted-foreground py-12">
                    <p>Ihr generierter Kostenvoranschlag erscheint hier.</p>
                </div>
             )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
