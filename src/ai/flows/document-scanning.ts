
'use server';

/**
 * @fileOverview Dokumentenscan- und OCR-Flow zum Extrahieren von Informationen aus Belegen und Rechnungen.
 *
 * - scanDocument - Extrahiert Betrag, Händler, Datum und Kategorie aus einem gescannten Dokumentbild.
 * - ScanDocumentInput - Der Eingabetyp für die Funktion scanDocument.
 * - ScanDocumentOutput - Der Rückgabetyp für die Funktion scanDocument.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ScanDocumentInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      'Ein Foto eines Belegs oder einer Rechnung als Daten-URI, der einen MIME-Typ enthalten und Base64-Kodierung verwenden muss. Erwartetes Format: \'data:<mimetype>;base64,<encoded_data>\'.'
    ),
});
export type ScanDocumentInput = z.infer<typeof ScanDocumentInputSchema>;

const ScanDocumentOutputSchema = z.object({
  amount: z.number().describe('Der Gesamtbetrag auf dem Beleg oder der Rechnung in Euro (€).'),
  merchant: z.string().describe('Der Name des Händlers.'),
  date: z.string().describe('Das Datum auf dem Beleg oder der Rechnung (ISO-Format).'),
  category: z.string().describe('Die Ausgabenkategorie der Transaktion.'),
});
export type ScanDocumentOutput = z.infer<typeof ScanDocumentOutputSchema>;

export async function scanDocument(input: ScanDocumentInput): Promise<ScanDocumentOutput> {
  return scanDocumentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'scanDocumentPrompt',
  input: {schema: ScanDocumentInputSchema},
  output: {schema: ScanDocumentOutputSchema},
  prompt: `Sie sind ein erfahrener Finanzassistent, spezialisiert auf die Extraktion von Informationen aus Belegen und Rechnungen. Währung ist Euro (€).

Sie erhalten ein Bild eines Dokuments, und Ihre Aufgabe ist es, folgende Informationen zu extrahieren:
- Der Gesamtbetrag auf dem Beleg oder der Rechnung.
- Der Name des Händlers.
- Das Datum auf dem Beleg oder der Rechnung.
- Die am besten geeignete Ausgabenkategorie für die Transaktion (z. B. Fixkosten, Freizeit, Geschäftlich, Bildung).

Antworten Sie mit einem JSON-Objekt, das diese Informationen enthält.

Hier ist das Bild des Dokuments:
{{media url=photoDataUri}}`,
});

const scanDocumentFlow = ai.defineFlow(
  {
    name: 'scanDocumentFlow',
    inputSchema: ScanDocumentInputSchema,
    outputSchema: ScanDocumentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
