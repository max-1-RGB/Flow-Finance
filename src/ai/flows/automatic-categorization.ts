
'use server';

/**
 * @fileOverview Ein Flow zur automatischen Kategorisierung von Ausgaben basierend auf Transaktionsdetails.
 *
 * - automaticCategorization - Eine Funktion, die den Prozess der Ausgabenkategorisierung übernimmt.
 * - AutomaticCategorizationInput - Der Eingabetyp für die Funktion automaticCategorization.
 * - AutomaticCategorizationOutput - Der Rückgabetyp für die Funktion automaticCategorization.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AutomaticCategorizationInputSchema = z.object({
  text: z.string().describe('Die Textbeschreibung der Transaktion.'),
  merchant: z.string().optional().describe('Der Name des an der Transaktion beteiligten Händlers.'),
  amount: z.number().optional().describe('Der Betrag der Transaktion.'),
  time: z.string().optional().describe('Der Zeitpunkt der Transaktion im ISO-Format.'),
  userCategories: z.array(z.string()).optional().describe('Die vom Benutzer zuvor verwendeten Kategorien.'),
});
export type AutomaticCategorizationInput = z.infer<typeof AutomaticCategorizationInputSchema>;

const AutomaticCategorizationOutputSchema = z.object({
  category: z.string().describe('Die vorhergesagte Kategorie für die Ausgabe.'),
  confidence: z.number().describe('Ein Konfidenzwert (0-1) für die Kategorisierung.'),
});
export type AutomaticCategorizationOutput = z.infer<typeof AutomaticCategorizationOutputSchema>;

export async function automaticCategorization(
  input: AutomaticCategorizationInput
): Promise<AutomaticCategorizationOutput> {
  return automaticCategorizationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'automaticCategorizationPrompt',
  input: {schema: AutomaticCategorizationInputSchema},
  output: {schema: AutomaticCategorizationOutputSchema},
  prompt: `Sie sind ein Experte für persönliche Finanzen. Ihre Aufgabe ist es, eine Transaktion basierend auf der Beschreibung zu kategorisieren.
Die Währung ist Euro (€).

Transaktionsbeschreibung: {{{text}}}

{{#if userCategories}}
Hier sind die Kategorien, die der Benutzer bereits verwendet. Versuchen Sie, eine dieser Kategorien zuzuordnen, wenn sie passt: 
{{#each userCategories}}
- {{this}}
{{/each}}
{{else}}
Hier sind einige Beispielkategorien, die Sie verwenden können: Lebensmittel, Transport, Wohnen, Unterhaltung, Gesundheit, Einkommen, Shopping, Sonstiges.
{{/if}}

Analysieren Sie die Beschreibung und geben Sie die am besten passende Kategorie zurück. Wenn keine der vorhandenen Kategorien gut passt, können Sie eine neue, sinnvolle Kategorie vorschlagen.
Antworten Sie ausschließlich mit einem JSON-Objekt, das die vorhergesagte Kategorie und einen Konfidenzwert (0-1) enthält.
`,
});

const automaticCategorizationFlow = ai.defineFlow(
  {
    name: 'automaticCategorizationFlow',
    inputSchema: AutomaticCategorizationInputSchema,
    outputSchema: AutomaticCategorizationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
