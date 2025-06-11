
'use server';
/**
 * @fileOverview A Genkit flow for an AI career help chatbot.
 *
 * - careerHelpChat - A function that handles the chatbot conversation.
 * - CareerHelpChatInput - The input type for the careerHelpChat function.
 * - CareerHelpChatOutput - The return type for the careerHelpChat function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ChatMessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});

const CareerHelpChatInputSchema = z.object({
  chatHistory: z.array(ChatMessageSchema).describe('The history of the conversation so far.'),
  currentMessage: z.string().describe('The latest message from the user.'),
  resumeText: z.string().optional().describe('The content of the user resume.'),
  quizResults: z.string().optional().describe('The results from the personality quiz.'),
  careerSuggestions: z.array(z.string()).optional().describe('AI-generated career suggestions for the user.'),
  // Simplifying roadmaps to a string for chat context, as detailed structure might be too verbose for chat prompt
  careerRoadmapsSummary: z.string().optional().describe('A summary of AI-generated career roadmaps.'),
});
export type CareerHelpChatInput = z.infer<typeof CareerHelpChatInputSchema>;

const CareerHelpChatOutputSchema = z.object({
  aiResponse: z.string().describe('The chatbot AI response to the user message.'),
});
export type CareerHelpChatOutput = z.infer<typeof CareerHelpChatOutputSchema>;

export async function careerHelpChat(input: CareerHelpChatInput): Promise<CareerHelpChatOutput> {
  return careerHelpChatFlow(input);
}

const careerHelpChatPrompt = ai.definePrompt({
  name: 'careerHelpChatPrompt',
  input: {schema: CareerHelpChatInputSchema},
  output: {schema: CareerHelpChatOutputSchema},
  prompt: `You are a friendly and helpful AI Career Counselor.
Your goal is to assist the user with their career-related questions, building upon the information they have already provided and received.

Here is the context about the user:
{{#if resumeText}}
User's Resume Summary:
{{{resumeText}}}
{{/if}}

{{#if quizResults}}
User's Personality Quiz Insights:
{{{quizResults}}}
{{/if}}

{{#if careerSuggestions}}
Previously Suggested Careers for the User:
{{#each careerSuggestions}}
- {{{this}}}
{{/each}}
{{/if}}

{{#if careerRoadmapsSummary}}
Summary of Career Roadmaps Provided:
{{{careerRoadmapsSummary}}}
{{/if}}

Conversation History:
{{#each chatHistory}}
{{#if (eq role "user")}}User: {{{content}}}{{/if}}
{{#if (eq role "model")}}AI: {{{content}}}{{/if}}
{{/each}}

Current User Message:
User: {{{currentMessage}}}

Based on all the above information and the conversation history, provide a concise, helpful, and supportive response to the user's current message.
If the user's question is vague, ask for clarification.
If the question is outside the scope of career counseling based on the provided context, politely state that you can only help with topics related to their career path, resume, quiz results, and the suggestions/roadmaps.
Keep your responses to a few sentences unless the user asks for detailed information.

AI Response:
`,
});

const careerHelpChatFlow = ai.defineFlow(
  {
    name: 'careerHelpChatFlow',
    inputSchema: CareerHelpChatInputSchema,
    outputSchema: CareerHelpChatOutputSchema,
  },
  async (input) => {
    // Construct a simpler prompt context for the LLM
    const promptInput = {
        ...input,
        // The prompt template will handle the actual templating of chatHistory
    };
    const {output} = await careerHelpChatPrompt(promptInput);
    if (!output || !output.aiResponse) {
      return { aiResponse: "I'm sorry, I encountered an issue and can't respond right now." };
    }
    return output;
  }
);
