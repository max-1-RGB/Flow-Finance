
'use server';

/**
 * @fileOverview Erstellt einen Vertragsentwurf basierend auf Personaldaten und Vertragsdetails.
 *
 * - generateContract - Eine Funktion, die einen detaillierten Vertragsentwurf generiert.
 * - GenerateContractInput - Der Eingabetyp für die Funktion generateContract.
 * - GenerateContractOutput - Der Rückgabetyp für die Funktion generateContract.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateContractInputSchema = z.object({
  personnelName: z.string().describe("Der vollständige Name des Mitarbeiters/Freelancers."),
  personnelAddress: z.string().describe("Die vollständige Adresse des Mitarbeiters/Freelancers."),
  companyName: z.string().describe("Der Name des Unternehmens (Arbeitgeber)."),
  companyAddress: z.string().describe("Die Adresse des Unternehmens."),
  position: z.string().describe("Die Berufsbezeichnung oder Position."),
  employmentType: z.enum(["Festanstellung", "Teilzeit", "Freelancer", "Praktikant"]).describe("Die Art der Anstellung."),
  startDate: z.string().describe("Das Startdatum des Vertrags im Format YYYY-MM-DD."),
  endDate: z.string().optional().describe("Das Enddatum des Vertrags (falls befristet)."),
  salary: z.number().describe("Das Gehalt oder der Stundensatz."),
  salaryType: z.enum(["Monatlich", "Stündlich"]).describe("Die Art der Gehaltsabrechnung."),
  weeklyHours: z.number().optional().describe("Die wöchentlichen Arbeitsstunden (falls zutreffend)."),
  vacationDays: z.number().optional().describe("Die Anzahl der jährlichen Urlaubstage."),
  probationPeriodMonths: z.number().optional().describe("Die Dauer der Probezeit in Monaten."),
  customClauses: z.string().optional().describe("Zusätzliche, benutzerdefinierte Klauseln oder Anmerkungen."),
});
export type GenerateContractInput = z.infer<typeof GenerateContractInputSchema>;

const GenerateContractOutputSchema = z.object({
    contractMarkdown: z.string().describe('Der generierte Vertragsentwurf im Markdown-Format.'),
});
export type GenerateContractOutput = z.infer<typeof GenerateContractOutputSchema>;


export async function generateContract(input: GenerateContractInput): Promise<GenerateContractOutput> {
  return generateContractFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateContractPrompt',
  input: {schema: GenerateContractInputSchema},
  output: {schema: GenerateContractOutputSchema},
  prompt: `Du bist ein Experte für deutsches Arbeitsrecht und deine Aufgabe ist es, einen professionellen Vertragsentwurf zu erstellen.
Die Währung ist Euro (€). Der Vertrag sollte klar strukturiert und formell sein.

Basierend auf den folgenden Informationen, erstelle einen umfassenden Vertragsentwurf im Markdown-Format.

**Parteien:**
- Arbeitnehmer/Freelancer: {{personnelName}}, wohnhaft {{personnelAddress}}
- Arbeitgeber: {{companyName}}, ansässig in {{companyAddress}}

**Vertragsdetails:**
- Position: {{position}}
- Anstellungsart: {{employmentType}}
- Beginn des Vertrags: {{startDate}}
{{#if endDate}}- Befristet bis: {{endDate}}{{/if}}
- Gehalt: {{salary}}€ ({{salaryType}})
{{#if weeklyHours}}- Wöchentliche Arbeitszeit: {{weeklyHours}} Stunden{{/if}}
{{#if vacationDays}}- Urlaubsanspruch: {{vacationDays}} Tage pro Jahr{{/if}}
{{#if probationPeriodMonths}}- Probezeit: {{probationPeriodMonths}} Monate{{/if}}

**Zusätzliche Klauseln:**
{{#if customClauses}}
- {{{customClauses}}}
{{else}}
- Keine spezifischen Zusatzklauseln angegeben.
{{/if}}

Erstelle einen vollständigen Vertragsentwurf, der Standardklauseln wie Tätigkeit, Arbeitszeit, Vergütung, Urlaub, Kündigungsfristen, Verschwiegenheitspflicht und Schlussbestimmungen enthält. Passe die Klauseln an die angegebene Anstellungsart (z.B. Freelancer vs. Festanstellung) an.
`,
});

const generateContractFlow = ai.defineFlow(
  {
    name: 'generateContractFlow',
    inputSchema: GenerateContractInputSchema,
    outputSchema: GenerateContractOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
