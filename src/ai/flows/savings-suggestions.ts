
// src/ai/flows/savings-suggestions.ts
'use server';
/**
 * @fileOverview KI-gestützte Vorschläge für Kosteneinsparungen basierend auf dem Ausgabeverhalten.
 *
 * - getSavingsSuggestions - Eine Funktion, die Vorschläge zur Kostenersparnis liefert.
 * - SavingsSuggestionsInput - Der Eingabetyp für die Funktion getSavingsSuggestions.
 * - SavingsSuggestionsOutput - Der Rückgabetyp für die Funktion getSavingsSuggestions.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SavingsSuggestionsInputSchema = z.object({
  spendingData: z.string().describe('Eine Zusammenfassung der Ausgabengewohnheiten des Benutzers, einschließlich Kategorien und Beträge in Euro (€).'),
  financialGoals: z.string().describe('Die finanziellen Ziele des Benutzers, wie z.B. Sparen für eine Anzahlung oder Schuldentilgung.'),
});
export type SavingsSuggestionsInput = z.infer<typeof SavingsSuggestionsInputSchema>;

const SavingsSuggestionsOutputSchema = z.object({
  suggestions: z.array(
    z.object({
      category: z.string().describe('Die Ausgabenkategorie, auf die sich der Vorschlag bezieht.'),
      suggestion: z.string().describe('Ein spezifischer Vorschlag zum Geldsparen in dieser Kategorie.'),
      estimatedSavings: z.string().describe('Eine Schätzung, wie viel Geld der Benutzer durch Befolgen des Vorschlags sparen könnte (in Euro €).'),
    })
  ).describe('Eine Liste von Vorschlägen zur Kostenersparnis.'),
});
export type SavingsSuggestionsOutput = z.infer<typeof SavingsSuggestionsOutputSchema>;

export async function getSavingsSuggestions(input: SavingsSuggestionsInput): Promise<SavingsSuggestionsOutput> {
  return savingsSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'savingsSuggestionsPrompt',
  input: {schema: SavingsSuggestionsInputSchema},
  output: {schema: SavingsSuggestionsOutputSchema},
  prompt: `Sie sind ein persönlicher Finanzberater. Geben Sie basierend auf den Ausgabendaten und finanziellen Zielen des Benutzers personalisierte Vorschläge zur Kostenersparnis. Die Währung ist Euro (€).

Ausgabendaten: {{{spendingData}}}
Finanzielle Ziele: {{{financialGoals}}}

Stellen Sie eine Liste von Vorschlägen mit Kategorie, Vorschlag und geschätzten Einsparungen bereit.

Formatieren Sie Ihre Antwort als JSON-Objekt, das diesem Schema entspricht: {{{outputSchema}}}`,
});

const savingsSuggestionsFlow = ai.defineFlow(
  {
    name: 'savingsSuggestionsFlow',
    inputSchema: SavingsSuggestionsInputSchema,
    outputSchema: SavingsSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
