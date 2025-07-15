
'use server';

/**
 * @fileOverview Ein KI-Agent, der Fragen zu den Finanzen eines Benutzers beantwortet.
 *
 * - askFinBot - Eine Funktion, die Finanzfragen beantwortet.
 * - AskFinBotInput - Der Eingabetyp für die Funktion askFinBot.
 * - AskFinBotOutput - Der Rückgabetyp für die Funktion askFinBot.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AskFinBotInputSchema = z.object({
  question: z.string().describe('Die zu beantwortende Finanzfrage.'),
  financialData: z.string().describe('Die Finanzdaten des Benutzers, einschließlich Einnahmen und Ausgaben, als JSON-String. Währung ist Euro (€).'),
});
export type AskFinBotInput = z.infer<typeof AskFinBotInputSchema>;

const AskFinBotOutputSchema = z.object({
  answer: z.string().describe('Die Antwort auf die Finanzfrage.'),
});
export type AskFinBotOutput = z.infer<typeof AskFinBotOutputSchema>;

export async function askFinBot(input: AskFinBotInput): Promise<AskFinBotOutput> {
  return askFinBotFlow(input);
}

const prompt = ai.definePrompt({
  name: 'askFinBotPrompt',
  input: {schema: AskFinBotInputSchema},
  output: {schema: AskFinBotOutputSchema},
  prompt: `Sie sind ein Finanzassistent-Bot. Verwenden Sie die Finanzdaten des Benutzers, um seine Frage zu beantworten. Die Währung ist Euro (€).

Frage: {{{question}}}

Finanzdaten: {{{financialData}}}

Antwort:`,
});

const askFinBotFlow = ai.defineFlow(
  {
    name: 'askFinBotFlow',
    inputSchema: AskFinBotInputSchema,
    outputSchema: AskFinBotOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
