
'use server';

/**
 * @fileOverview Generates a structured career roadmap based on AI-suggested career paths, resume, and quiz results.
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

const RoadmapDetailSchema = z.object({
  introduction: z.string().describe("A brief (1-3 sentences) introduction to this career path and its relevance to the user, based on their resume and quiz insights if possible."),
  skillsToDevelop: z.array(z.string()).describe("A list of 3-5 crucial technical and soft skills to acquire for this career. Each skill should be a concise, actionable phrase (e.g., 'Master Python for data analysis', 'Develop strong presentation skills')."),
  keyMilestones: z.array(z.string()).describe("A list of 3-5 important, actionable milestones to achieve (e.g., 'Complete Google Data Analytics Professional Certificate', 'Build 3 portfolio projects showcasing X skill', 'Contribute to an open-source project'). Each milestone should be a concise phrase."),
  learningResources: z.array(z.string()).describe("A list of 2-4 types of learning resources or specific platforms (e.g., 'Online courses on Coursera/edX focused on [specific topic]', 'Interactive coding platforms like LeetCode/HackerRank', 'Industry blogs and publications such as [Example Blog]'). Each resource type should be a concise phrase."),
  networkingTips: z.array(z.string()).optional().describe("A list of 1-3 actionable networking tips specific to this field (e.g., 'Attend local tech meetups', 'Engage with professionals on LinkedIn in [industry]'). Each tip should be a concise phrase."),
  timelineEstimate: z.string().optional().describe("A very brief, general estimate of the time it might take to become entry-level ready, considering the user might have some existing skills from their resume (e.g., '6-12 months with dedicated part-time study', '3-6 months intensive learning')."),
  nextStep: z.string().describe("A single, clear, immediate next actionable step the user can take to start on this roadmap (e.g., 'Research beginner-friendly Python tutorials', 'Identify one online course for [specific skill]').")
});

const CareerRoadmapOutputSchema = z.object({
  roadmaps: z.array(
    z.object({
      career: z.string().describe('The suggested career path.'),
      details: RoadmapDetailSchema.describe('A detailed, structured roadmap for the career path.'),
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
  prompt: `You are an expert career advisor. Your task is to create detailed, structured career roadmaps for each of the suggested career paths, tailored to the user based on their resume content and personality quiz results.

User's Resume Content:
{{{resumeContent}}}

User's Personality Quiz Results:
{{{personalityQuizResults}}}

Career Suggestions to create roadmaps for: {{{careerSuggestions}}}

For EACH career suggestion, provide a roadmap with the following structured details:
- introduction: A brief (1-3 sentences) introduction to this career path and its relevance to the user.
- skillsToDevelop: A list of 3-5 crucial technical and soft skills.
- keyMilestones: A list of 3-5 important, actionable milestones.
- learningResources: A list of 2-4 types of learning resources or specific platforms.
- networkingTips: (Optional) A list of 1-3 actionable networking tips.
- timelineEstimate: (Optional) A brief, general time estimate to become entry-level ready.
- nextStep: A single, clear, immediate next actionable step.

**Important Formatting Instructions:**
- Adhere strictly to the JSON output schema.
- All text content within the schema fields (introduction, skills, milestones, etc.) must be PLAIN TEXT.
- DO NOT use any Markdown formatting (like '*', '**', '#', '-', etc.) within the string values.
- For lists (skillsToDevelop, keyMilestones, etc.), each item in the array should be a separate, concise string.
- Ensure the advice is practical, actionable, and encouraging.
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
    if (!output || !output.roadmaps) {
        throw new Error("AI did not return valid roadmap data.");
    }
    return output;
  }
);
