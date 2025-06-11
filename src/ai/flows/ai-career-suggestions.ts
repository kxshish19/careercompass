'use server';

/**
 * @fileOverview This file defines a Genkit flow for providing personalized career suggestions based on a user's resume and personality quiz results.
 *
 * - aiCareerSuggestions - The main function to trigger the career suggestion flow.
 * - AiCareerSuggestionsInput - The input type for the aiCareerSuggestions function.
 * - AiCareerSuggestionsOutput - The output type for the aiCareerSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiCareerSuggestionsInputSchema = z.object({
  resumeText: z
    .string()
    .describe('The extracted text content from the user resume.'),
  personalityQuizResults: z
    .string()
    .describe('The results from the personality quiz, as a string.'),
});
export type AiCareerSuggestionsInput = z.infer<typeof AiCareerSuggestionsInputSchema>;

const AiCareerSuggestionsOutputSchema = z.object({
  careerSuggestions: z
    .array(z.string())
    .describe('A list of career suggestions tailored to the user.'),
  reasoning: z
    .string()
    .describe('The AI reasoning behind the career suggestions.'),
});
export type AiCareerSuggestionsOutput = z.infer<typeof AiCareerSuggestionsOutputSchema>;

export async function aiCareerSuggestions(input: AiCareerSuggestionsInput): Promise<AiCareerSuggestionsOutput> {
  return aiCareerSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiCareerSuggestionsPrompt',
  input: {schema: AiCareerSuggestionsInputSchema},
  output: {schema: AiCareerSuggestionsOutputSchema},
  prompt: `You are a career counselor providing personalized career suggestions based on a user's resume and personality quiz results.

  Resume Text: {{{resumeText}}}
  Personality Quiz Results: {{{personalityQuizResults}}}

  Based on the resume and personality quiz results, provide a list of 3-5 career suggestions that are well-suited for the user.
  Explain your reasoning for each suggestion.
  Return the career suggestions as a list of strings and the reasoning as a string.
  `,
});

const aiCareerSuggestionsFlow = ai.defineFlow(
  {
    name: 'aiCareerSuggestionsFlow',
    inputSchema: AiCareerSuggestionsInputSchema,
    outputSchema: AiCareerSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
