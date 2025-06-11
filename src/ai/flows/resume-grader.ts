
'use server';

/**
 * @fileOverview Resume Grader AI agent.
 *
 * - resumeGrader - A function that grades the resume and provides detailed, structured feedback.
 * - ResumeGraderInput - The input type for the resumeGrader function.
 * - ResumeGraderOutput - The return type for the resumeGrader function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ResumeGraderInputSchema = z.object({
  resumeText: z.string().describe('The extracted text content of the resume.'),
});

export type ResumeGraderInput = z.infer<typeof ResumeGraderInputSchema>;

const ResumeSectionAnalysisSchema = z.object({
  score: z.number().min(0).max(100).optional().describe('Score for this section (0-100), if applicable.'),
  feedback: z.string().describe('Detailed feedback for this specific section.'),
  suggestions: z.array(z.string()).optional().describe('Specific, actionable suggestions for this section, if any.')
});

const ResumeGraderOutputSchema = z.object({
  overallScore: z.number().min(0).max(100).describe('The overall score of the resume (0-100).'),
  summary: z.string().describe('A brief overall summary of the resume analysis.'),
  positivePoints: z.array(z.string()).optional().describe('List of key strengths of the resume.'),
  areasForImprovement: z.array(z.string()).optional().describe('List of main areas needing improvement.'),
  analysisCategories: z.object({
    clarityAndConciseness: ResumeSectionAnalysisSchema.describe('Analysis of the resume clarity and conciseness.'),
    impactAndAchievements: ResumeSectionAnalysisSchema.describe('Analysis of how well impact and achievements are presented.'),
    formatAndStructure: ResumeSectionAnalysisSchema.describe('Analysis of the resume format, layout, and structure.'),
    atsFriendliness: ResumeSectionAnalysisSchema.extend({
        // No need to extend further if ResumeSectionAnalysisSchema already covers suggestions
    }).describe('Analysis of Applicant Tracking System (ATS) compatibility, including keyword optimization and formatting for parsers.'),
  }),
  detailedFeedback: z.string().describe('Comprehensive feedback covering various aspects not fitting into specific categories or elaborating further.'),
});

export type ResumeGraderOutput = z.infer<typeof ResumeGraderOutputSchema>;

export async function resumeGrader(input: ResumeGraderInput): Promise<ResumeGraderOutput> {
  return resumeGraderFlow(input);
}

const resumeGraderPrompt = ai.definePrompt({
  name: 'resumeGraderPrompt',
  input: {schema: ResumeGraderInputSchema},
  output: {schema: ResumeGraderOutputSchema},
  prompt: `You are an expert resume reviewer and career coach. Your task is to provide a comprehensive, structured analysis of the provided resume text.
Analyze the resume based on the categories defined in the output schema.

Resume Text:
{{{resumeText}}}

**Analysis Guidelines:**

1.  **Overall Score**: Assign an overall score from 0 to 100.
2.  **Summary**: Provide a brief (2-3 sentences) overall summary of the resume.
3.  **Positive Points**: List 2-4 key strengths or positive aspects of the resume as an array of strings.
4.  **Areas for Improvement**: List 2-4 main areas that could be improved as an array of strings.
5.  **Analysis Categories**: For each category below, provide a score (0-100, optional, but try to provide if estimable) and detailed feedback. For ATS Friendliness, also provide an array of specific, actionable suggestions.
    *   **Clarity and Conciseness**: Evaluate the language, readability, and brevity. Is it easy to understand? Is there jargon?
    *   **Impact and Achievements**: Assess how well accomplishments are quantified and their impact is demonstrated. Are there strong action verbs?
    *   **Format and Structure**: Review the layout, use of white space, font choices, consistency, and overall visual appeal. Is it easy to scan?
    *   **ATS Friendliness**: Evaluate compatibility with Applicant Tracking Systems. Consider keyword optimization (relevant to common job roles), standard formatting, and section clarity for parsers. Provide specific suggestions to improve ATS compatibility (e.g., "Use standard fonts like Arial or Calibri.", "Ensure section headings like 'Experience', 'Education' are clear.", "Incorporate relevant keywords from job descriptions you are targeting.").
6.  **Detailed Feedback**: Offer more in-depth feedback that elaborates on the points above or covers aspects not fitting neatly into the categories. This section should be a single string, using newlines for paragraph separation.

**Output Formatting Instructions:**
*   Strictly adhere to the JSON output schema.
*   All textual feedback (feedback, suggestions, summary, points, etc.) should be plain text.
*   Use newlines within longer feedback strings for paragraph separation.
*   For arrays of strings (like 'positivePoints', 'areasForImprovement', 'atsFriendliness.suggestions'), each distinct point or suggestion should be a separate string element in the array.
*   DO NOT use Markdown formatting (like '*', '**', '#', etc.) in your text outputs.
*   Be constructive and professional in your tone.
`,
});

const resumeGraderFlow = ai.defineFlow(
  {
    name: 'resumeGraderFlow',
    inputSchema: ResumeGraderInputSchema,
    outputSchema: ResumeGraderOutputSchema,
  },
  async input => {
    const {output} = await resumeGraderPrompt(input);
    // Basic validation, in a real app you might do more extensive checks or transformations
    if (!output) {
        throw new Error("AI did not return an output.");
    }
    // Ensure scores are within bounds if AI doesn't respect it (though Zod should handle this)
    if (output.overallScore < 0) output.overallScore = 0;
    if (output.overallScore > 100) output.overallScore = 100;
    
    // You could add more post-processing here if needed
    
    return output;
  }
);
