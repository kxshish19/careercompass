'use server';

/**
 * @fileOverview Resume Grader AI agent.
 *
 * - resumeGrader - A function that grades the resume and provides feedback.
 * - ResumeGraderInput - The input type for the resumeGrader function.
 * - ResumeGraderOutput - The return type for the resumeGrader function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ResumeGraderInputSchema = z.object({
  resumeText: z.string().describe('The extracted text content of the resume.'),
});

export type ResumeGraderInput = z.infer<typeof ResumeGraderInputSchema>;

const ResumeGraderOutputSchema = z.object({
  score: z.number().describe('The overall score of the resume (0-100).'),
  feedback: z.string().describe('Feedback on how to improve the resume.'),
});

export type ResumeGraderOutput = z.infer<typeof ResumeGraderOutputSchema>;

export async function resumeGrader(input: ResumeGraderInput): Promise<ResumeGraderOutput> {
  return resumeGraderFlow(input);
}

const resumeGraderPrompt = ai.definePrompt({
  name: 'resumeGraderPrompt',
  input: {schema: ResumeGraderInputSchema},
  output: {schema: ResumeGraderOutputSchema},
  prompt: `You are an expert resume grader providing score and feedback for the provided resume.

  Please provide a score between 0 and 100, and feedback on how to improve the resume.

  Resume Text: {{{resumeText}}}`,
});

const resumeGraderFlow = ai.defineFlow(
  {
    name: 'resumeGraderFlow',
    inputSchema: ResumeGraderInputSchema,
    outputSchema: ResumeGraderOutputSchema,
  },
  async input => {
    const {output} = await resumeGraderPrompt(input);
    return output!;
  }
);
