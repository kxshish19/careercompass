'use server';

/**
 * @fileOverview Generates a career roadmap based on AI-suggested career paths.
 *
 * - generateCareerRoadmap - A function that generates a career roadmap.
 * - CareerRoadmapInput - The input type for the generateCareerRoadmap function.
 * - CareerRoadmapOutput - The return type for the generateCareerRoadmap function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CareerRoadmapInputSchema = z.object({
  careerSuggestions: z
    .string()
    .describe('A comma separated list of AI career suggestions.'),
  resumeContent: z.string().describe('The OCR-extracted content of the resume.'),
  personalityQuizResults: z
    .string()
    .describe('The results of the personality quiz.'),
});
export type CareerRoadmapInput = z.infer<typeof CareerRoadmapInputSchema>;

const CareerRoadmapOutputSchema = z.object({
  roadmaps: z.array(
    z.object({
      career: z.string().describe('The suggested career path.'),
      roadmap: z.string().describe('A detailed roadmap for the career path.'),
    })
  ),
});
export type CareerRoadmapOutput = z.infer<typeof CareerRoadmapOutputSchema>;

export async function generateCareerRoadmap(input: CareerRoadmapInput): Promise<CareerRoadmapOutput> {
  return careerRoadmapFlow(input);
}

const prompt = ai.definePrompt({
  name: 'careerRoadmapPrompt',
  input: {schema: CareerRoadmapInputSchema},
  output: {schema: CareerRoadmapOutputSchema},
  prompt: `You are a career advisor who provides detailed career roadmaps based on career suggestions, resume content, and personality quiz results.

  Create a detailed career roadmap for each career suggestion provided, outlining the steps and skills needed to achieve the user's goals.

  Career Suggestions: {{{careerSuggestions}}}
  Resume Content: {{{resumeContent}}}
  Personality Quiz Results: {{{personalityQuizResults}}}

  Each roadmap should contain suggested skills, milestones, and resources for the user to become proficient in their desired field.
  `,
});

const careerRoadmapFlow = ai.defineFlow(
  {
    name: 'careerRoadmapFlow',
    inputSchema: CareerRoadmapInputSchema,
    outputSchema: CareerRoadmapOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
