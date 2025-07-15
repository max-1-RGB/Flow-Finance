
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lightbulb, TrendingDown, CheckCircle2 } from "lucide-react";
import { getSavingsSuggestions, SavingsSuggestionsInput, SavingsSuggestionsOutput } from '@/ai/flows/savings-suggestions'; 
import { useToast } from '@/hooks/use-toast';

interface Suggestion {
  category: string;
  suggestion: string;
  estimatedSavings: string;
}

export default function AISuggestionsPage() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchSuggestions = async () => {
    setIsLoading(true);
    // In einer echten App würden hier tatsächliche Benutzerdaten übergeben.
    const input: SavingsSuggestionsInput = { 
      spendingData: JSON.stringify({
        "Lebensmittel": 350,
        "Abonnements": 50,
        "Auswärts Essen": 200,
        "Nebenkosten": 150
      }), 
      financialGoals: "Für einen Urlaub sparen und Kreditkartenschulden reduzieren." 
    };
    try {
      const result: SavingsSuggestionsOutput = await getSavingsSuggestions(input);
      setSuggestions(result.suggestions);
    } catch (error) {
      console.error("Fehler beim Abrufen der KI-Vorschläge:", error);
      setSuggestions([]); 
      toast({
        variant: "destructive",
        title: "Fehler bei Sparvorschlägen",
        description: "Die Sparvorschläge konnten nicht geladen werden.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRefresh = () => {
    fetchSuggestions();
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="font-headline text-3xl font-semibold tracking-tight">
          KI-Sparvorschläge
        </h1>
        <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
          <Lightbulb className="mr-2 h-4 w-4" /> {isLoading ? "Aktualisiere..." : "Vorschläge aktualisieren"}
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2 mt-1"></div>
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-muted rounded w-full mb-2"></div>
                <div className="h-4 bg-muted rounded w-5/6 mb-4"></div>
                <div className="h-8 bg-muted rounded w-1/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : suggestions.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {suggestions.map((suggestion, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="font-headline flex items-center">
                  <TrendingDown className="mr-2 h-5 w-5 text-primary" /> {suggestion.category}
                </CardTitle>
                <CardDescription>Geschätzte Ersparnis: <span className="font-semibold text-foreground">{suggestion.estimatedSavings}</span></CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-4">{suggestion.suggestion}</p>
                <Button variant="default" size="sm">
                  <CheckCircle2 className="mr-2 h-4 w-4" /> Als hilfreich markieren
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <Lightbulb className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Momentan keine Sparvorschläge verfügbar oder es gab ein Problem beim Laden. Versuchen Sie es später erneut!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
