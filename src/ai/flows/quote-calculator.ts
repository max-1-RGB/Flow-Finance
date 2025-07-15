// src/ai/flows/quote-calculator.ts
'use server';

/**
 * @fileOverview Erstellt einen Kostenvoranschlag für Content-Creator-Projekte.
 *
 * - generateQuote - Eine Funktion, die einen detaillierten Kostenvoranschlag generiert.
 * - GenerateQuoteInput - Der Eingabetyp für die Funktion generateQuote.
 * - GenerateQuoteOutput - Der Rückgabetyp für die Funktion generateQuote.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CostItemInputSchema = z.object({
  name: z.string().describe("Der Name der Kostenstelle, z.B. 'Tagessatz'."),
  value: z.number().describe("Der Wert oder Satz für diese Kostenstelle, z.B. 800 für einen Tagessatz von 800€.")
});

const GenerateQuoteInputSchema = z.object({
  projectDescription: z.string().describe('Eine detaillierte Beschreibung des Projekts.'),
  location: z.string().describe('Der Ort des Projekts, einschließlich möglicher Reiseanforderungen.'),
  days: z.number().describe('Die geschätzte Anzahl der Arbeitstage vor Ort.'),
  accommodationProvided: z.boolean().describe('Gibt an, ob die Unterkunft vom Kunden gestellt wird.'),
  workType: z.string().describe('Die Art der zu erbringenden Leistung (z.B. Fotografie, Videografie, Drohnenaufnahmen).'),
  deliverables: z.string().describe('Die erwarteten finalen Ergebnisse (z.B. Anzahl der Fotos, Videolänge).'),
  costItems: z.array(CostItemInputSchema).optional().describe('Eine Liste der vom Benutzer definierten Kostenstellen, die für die Berechnung verwendet werden sollen.'),
});
export type GenerateQuoteInput = z.infer<typeof GenerateQuoteInputSchema>;

const QuoteItemSchema = z.object({
    item: z.string().describe("Beschreibung des Postens, z.B. 'Tagessatz' oder 'Reisekosten'."),
    details: z.string().describe("Weitere Details zum Posten, z.B. '4 Tage à 800€'."),
    amount: z.number().describe("Der Betrag für diesen Posten in Euro (€).")
});

const GenerateQuoteOutputSchema = z.object({
    quoteTitle: z.string().describe("Ein passender Titel für den Kostenvoranschlag, z.B. 'Kostenvoranschlag für Produktfotoshooting'."),
    lineItems: z.array(QuoteItemSchema).describe('Eine Liste der einzelnen Posten des Kostenvoranschlags.'),
    totalAmount: z.number().describe('Der Gesamtbetrag des Kostenvoranschlags in Euro (€).'),
    notes: z.string().describe("Zusätzliche Anmerkungen, z.B. zu Zahlungsbedingungen oder Gültigkeit.")
});
export type GenerateQuoteOutput = z.infer<typeof GenerateQuoteOutputSchema>;


export async function generateQuote(input: GenerateQuoteInput): Promise<GenerateQuoteOutput> {
  return generateQuoteFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateQuotePrompt',
  input: {schema: GenerateQuoteInputSchema},
  output: {schema: GenerateQuoteOutputSchema},
  prompt: `Du bist ein erfahrener Producer für Content Creation und deine Aufgabe ist es, einen professionellen Kostenvoranschlag zu erstellen.
Die Währung ist Euro (€). Berücksichtige alle Aspekte des Projekts.

Hier sind die Projektdetails:
- Projektbeschreibung: {{{projectDescription}}}
- Ort: {{{location}}}
- Arbeitstage: {{{days}}}
- Art der Arbeit: {{{workType}}}
- Ergebnisse: {{{deliverables}}}
- Unterkunft wird gestellt: {{{accommodationProvided}}}

{{#if costItems}}
Verwende bei der Kalkulation vorrangig die folgenden vom Benutzer definierten Kostenstellen:
{{#each costItems}}
- {{this.name}}: {{this.value}}€
{{/each}}
Falls eine relevante Kostenstelle nicht vom Benutzer definiert wurde, nutze deine Standardannahmen.
{{else}}
Deine Standard-Kalkulationsgrundlagen sind:
- Tagessatz als Content Creator: 800€.
- Reisekosten: 0,50€ pro Kilometer, wenn die Anreise über 50km beträgt. Schätze die Entfernung basierend auf dem Ort.
- Unterkunftspauschale: 150€ pro Nacht (Anzahl der Tage - 1), falls keine Unterkunft gestellt wird.
- Nachbearbeitung (Schnitt, Color Grading, etc.): pauschal mit 25% des Gesamttagessatzes.
{{/if}}

Erstelle eine Liste von Posten (lineItems), einen Gesamttitel, den Gesamtbetrag (totalAmount) und füge hilfreiche Anmerkungen (notes) hinzu, z.B. "Gültig für 14 Tage. 50% Anzahlung bei Auftragserteilung."
`,
});

const generateQuoteFlow = ai.defineFlow(
  {
    name: 'generateQuoteFlow',
    inputSchema: GenerateQuoteInputSchema,
    outputSchema: GenerateQuoteOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
