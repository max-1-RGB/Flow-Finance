
// src/ai/flows/cash-flow-forecasting.ts
'use server';

/**
 * @fileOverview Prognostiziert die bevorstehende finanzielle Gesundheit mithilfe von KI-gestützten Trends, die auf historischen Ausgaben und wiederkehrenden Mustern basieren.
 *
 * - forecastCashFlow - Eine Funktion, die den Cashflow prognostiziert.
 * - ForecastCashFlowInput - Der Eingabetyp für die Funktion forecastCashFlow.
 * - ForecastCashFlowOutput - Der Rückgabetyp für die Funktion forecastCashFlow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ForecastCashFlowInputSchema = z.object({
  historicalTransactions: z.string().describe('Eine Liste historischer Transaktionen im JSON-Format.'),
  recurringTransactions: z.string().describe('Eine Liste wiederkehrender Transaktionen im JSON-Format.'),
  currentBalance: z.number().describe('Der aktuelle Kontostand des Benutzers in Euro (€).'),
});

export type ForecastCashFlowInput = z.infer<typeof ForecastCashFlowInputSchema>;

const ForecastCashFlowOutputSchema = z.object({
  projectedBalance: z.number().describe('Der prognostizierte Kontostand nach einem Monat in Euro (€).'),
  potentialRisks: z.string().describe('Alle identifizierten potenziellen finanziellen Risiken.'),
  suggestions: z.string().describe('Vorschläge zur Verbesserung der finanziellen Gesundheit.'),
});

export type ForecastCashFlowOutput = z.infer<typeof ForecastCashFlowOutputSchema>;

export async function forecastCashFlow(input: ForecastCashFlowInput): Promise<ForecastCashFlowOutput> {
  return forecastCashFlowFlow(input);
}

const prompt = ai.definePrompt({
  name: 'forecastCashFlowPrompt',
  input: {
    schema: ForecastCashFlowInputSchema,
  },
  output: {
    schema: ForecastCashFlowOutputSchema,
  },
  prompt: `Sie sind ein persönlicher Finanzberater. Analysieren Sie die Finanzdaten des Benutzers und erstellen Sie eine Prognose seines Cashflows für den nächsten Monat. Die Währung ist Euro (€).

Historische Transaktionen: {{{historicalTransactions}}}
Wiederkehrende Transaktionen: {{{recurringTransactions}}}
Aktueller Kontostand: {{{currentBalance}}}

Berechnen Sie auf Basis dieser Informationen den prognostizierten Kontostand nach einem Monat. Identifizieren Sie mögliche finanzielle Risiken und geben Sie Vorschläge zur Verbesserung der finanziellen Gesundheit.

Stellen Sie sicher, dass der projectedBalance die Währung der Transaktionen (Euro) widerspiegelt.
`,
});

const forecastCashFlowFlow = ai.defineFlow(
  {
    name: 'forecastCashFlowFlow',
    inputSchema: ForecastCashFlowInputSchema,
    outputSchema: ForecastCashFlowOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
