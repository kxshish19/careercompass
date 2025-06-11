
// src/app/(app)/results/page.tsx
'use client';

import { useEffect, useState, useRef } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { aiCareerSuggestions } from '@/ai/flows/ai-career-suggestions';
import { generateCareerRoadmap, type CareerRoadmapOutput, type CareerRoadmapInput } from '@/ai/flows/career-roadmap-generator';
import { careerHelpChat, type CareerHelpChatInput, type CareerHelpChatOutput } from '@/ai/flows/career-chat-flow';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Alert as UiAlert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Loader2, AlertCircle, Lightbulb, Zap, Route, ThumbsUp, Sparkles, MapPinned,
    ListChecks, Target, BookOpen, Users, Clock, ArrowRightCircle, MessageCircle, SendHorizonal, User, Bot
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface RoadmapSectionProps {
  title: string;
  icon: React.ElementType;
  items?: string[];
  text?: string;
  className?: string;
}

const RoadmapSection: React.FC<RoadmapSectionProps> = ({ title, icon: Icon, items, text, className }) => {
  if (!items && !text) return null;
  if (items && items.length === 0 && !text) return null;

  return (
    <div className={cn("py-3", className)}>
      <h4 className="text-md font-semibold flex items-center mb-2 text-primary/90">
        <Icon className="h-5 w-5 mr-2 text-primary" />
        {title}
      </h4>
      {text && <p className="text-sm text-foreground/80 whitespace-pre-line leading-relaxed">{text}</p>}
      {items && items.length > 0 && (
        <ul className="list-disc list-inside space-y-1 text-sm text-foreground/80 pl-5">
          {items.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
}


export default function ResultsPage() {
  const {
    resumeText,
    formattedQuizResults,
    careerSuggestionsData, setCareerSuggestionsData,
    careerRoadmapsData, setCareerRoadmapsData
  } = useAppContext();

  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [isLoadingRoadmaps, setIsLoadingRoadmaps] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInputValue, setChatInputValue] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatScrollAreaRef = useRef<HTMLDivElement>(null);

  const { toast } = useToast();

  useEffect(() => {
    if (resumeText && formattedQuizResults && !careerSuggestionsData && !isLoadingSuggestions && !error) {
      const fetchSuggestions = async () => {
        setIsLoadingSuggestions(true);
        setError(null);
        try {
          const suggestions = await aiCareerSuggestions({
            resumeText: resumeText,
            personalityQuizResults: formattedQuizResults,
          });
          setCareerSuggestionsData(suggestions);
          toast({ title: "Career Suggestions Loaded!", description: "AI has generated some career ideas for you." });
        } catch (e) {
          console.error('Error fetching career suggestions:', e);
          setError('Failed to load career suggestions. Please try again later.');
          toast({ variant: "destructive", title: "Error", description: "Could not load career suggestions." });
        } finally {
          setIsLoadingSuggestions(false);
        }
      };
      fetchSuggestions();
    }
  }, [resumeText, formattedQuizResults, careerSuggestionsData, setCareerSuggestionsData, isLoadingSuggestions, toast, error]);

  useEffect(() => {
    if (careerSuggestionsData && resumeText && formattedQuizResults && !careerRoadmapsData && !isLoadingRoadmaps && !error) {
      const fetchRoadmaps = async () => {
        setIsLoadingRoadmaps(true);
        try {
          const roadmaps = await generateCareerRoadmap({
            careerSuggestions: careerSuggestionsData.careerSuggestions.join(', '),
            resumeContent: resumeText,
            personalityQuizResults: formattedQuizResults,
          } as CareerRoadmapInput);
          setCareerRoadmapsData(roadmaps);
           toast({ title: "Career Roadmaps Generated!", description: "Detailed roadmaps are now available."});
        } catch (e) {
          console.error('Error fetching career roadmaps:', e);
          setError((prevError) => (prevError ? prevError + ' ' : '') + 'Failed to load career roadmaps. Please try again later.');
          toast({ variant: "destructive", title: "Error", description: "Could not load career roadmaps." });
        } finally {
          setIsLoadingRoadmaps(false);
        }
      };
      fetchRoadmaps();
    }
  }, [careerSuggestionsData, resumeText, formattedQuizResults, careerRoadmapsData, setCareerRoadmapsData, isLoadingRoadmaps, toast, error]);

  useEffect(() => {
    if (chatScrollAreaRef.current) {
      chatScrollAreaRef.current.scrollTo({ top: chatScrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [chatMessages]);

  // Add initial AI welcome message after results are loaded and chat is empty
  useEffect(() => {
    if (
      chatMessages.length === 0 &&
      (careerSuggestionsData || careerRoadmapsData) &&
      !isLoadingSuggestions &&
      !isLoadingRoadmaps &&
      !isChatLoading
    ) {
      const initialAiMessage: ChatMessage = {
        id: `ai-initial-${Date.now()}`,
        role: 'model',
        content: "Hello! I'm your AI Career Counselor. Now that your results are loaded, how can I help you further with your career planning?",
      };
      setChatMessages([initialAiMessage]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [careerSuggestionsData, careerRoadmapsData, isLoadingSuggestions, isLoadingRoadmaps, isChatLoading]);
  // Note: chatMessages is intentionally omitted from dependencies here to ensure this effect runs
  // primarily when the supporting data loads and the chat is empty, avoiding loops.

  const handleSendChatMessage = async () => {
    if (!chatInputValue.trim()) return;

    const newUserMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: chatInputValue.trim(),
    };
    setChatMessages((prev) => [...prev, newUserMessage]);
    setChatInputValue('');
    setIsChatLoading(true);

    try {
      const roadmapsSummary = careerRoadmapsData?.roadmaps.map(r => `${r.career}: ${r.details.introduction.substring(0,100)}...`).join('\n') || undefined;

      const chatInput: CareerHelpChatInput = {
        chatHistory: chatMessages.map(m => ({role: m.role, content: m.content})),
        currentMessage: newUserMessage.content,
        resumeText: resumeText || undefined,
        quizResults: formattedQuizResults || undefined,
        careerSuggestions: careerSuggestionsData?.careerSuggestions || undefined,
        careerRoadmapsSummary: roadmapsSummary,
      };

      const response: CareerHelpChatOutput = await careerHelpChat(chatInput);

      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'model',
        content: response.aiResponse,
      };
      setChatMessages((prev) => [...prev, aiMessage]);

    } catch (e) {
      console.error('Error in chat:', e);
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'model',
        content: "Sorry, I couldn't process your message right now. Please try again.",
      };
      setChatMessages((prev) => [...prev, errorMessage]);
      toast({ variant: "destructive", title: "Chat Error", description: "Could not get AI response." });
    } finally {
      setIsChatLoading(false);
    }
  };


  const MissingPrerequisites = () => (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex items-center space-x-3 mb-2">
            <AlertCircle className="h-8 w-8 text-destructive" />
            <CardTitle className="text-3xl font-headline">Missing Information</CardTitle>
        </div>
        <CardDescription className="text-base">
          To generate personalized AI results, we need a bit more information from you.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p>Please complete the following steps:</p>
        <ul className="list-disc list-inside space-y-2">
          {!resumeText && <li>Upload and analyze your resume.</li>}
          {!formattedQuizResults && <li>Take the personality quiz.</li>}
        </ul>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row gap-4">
        {!resumeText && (
          <Button asChild className="w-full sm:w-auto">
            <Link href="/upload-resume">Upload Resume</Link>
          </Button>
        )}
        {!formattedQuizResults && (
          <Button asChild className="w-full sm:w-auto">
            <Link href="/quiz">Take Quiz</Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  );

  if (!resumeText || !formattedQuizResults) {
    return <MissingPrerequisites />;
  }

  const renderLoadingState = (message: string) => (
    <Card className="shadow-md my-4">
      <CardContent className="pt-6 flex flex-col items-center justify-center space-y-3">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground">{message}</p>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8">
      <Card className="shadow-xl">
        <CardHeader>
          <div className="flex items-center space-x-3 mb-2">
            <Zap className="h-10 w-10 text-primary animate-pulse" />
            <CardTitle className="text-4xl font-headline">Your AI-Powered Career Insights</CardTitle>
          </div>
          <CardDescription className="text-lg text-foreground/80">
            Discover personalized career suggestions and detailed roadmaps based on your unique profile.
          </CardDescription>
        </CardHeader>
      </Card>

      {error && (
        <UiAlert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </UiAlert>
      )}

      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <Lightbulb className="h-7 w-7 text-primary" />
            <CardTitle className="text-2xl font-headline">AI Career Suggestions</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingSuggestions && !careerSuggestionsData && renderLoadingState("Generating career suggestions...")}
          {!isLoadingSuggestions && careerSuggestionsData && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {careerSuggestionsData.careerSuggestions.map((suggestion, index) => (
                  <Card key={index} className="bg-primary/5 hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3 pt-4">
                      <CardTitle className="text-lg text-primary flex items-start">
                        <ThumbsUp className="h-5 w-5 mr-2 mt-0.5 text-green-500 flex-shrink-0" /> {suggestion}
                      </CardTitle>
                    </CardHeader>
                     <CardContent className="pb-4">
                        <Badge variant="secondary">Suggestion {index + 1}</Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <Card className="bg-background/50 mt-6">
                <CardHeader>
                  <CardTitle className="text-xl">Reasoning Behind Suggestions</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-foreground/90 whitespace-pre-line leading-relaxed">{careerSuggestionsData.reasoning}</p>
                </CardContent>
              </Card>
            </div>
          )}
          {!isLoadingSuggestions && !careerSuggestionsData && !error && (
            <p className="text-muted-foreground">No suggestions available yet. Ensure your resume and quiz are completed and there were no errors.</p>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <Route className="h-7 w-7 text-primary" />
            <CardTitle className="text-2xl font-headline">Detailed Career Roadmaps</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingRoadmaps && !careerRoadmapsData && renderLoadingState("Generating career roadmaps...")}
          {!isLoadingRoadmaps && careerRoadmapsData && careerRoadmapsData.roadmaps && (
            <Accordion type="single" collapsible className="w-full space-y-3">
              {careerRoadmapsData.roadmaps.map((roadmapItem, index) => (
                <AccordionItem value={`item-${index}`} key={index} className="border border-input rounded-lg bg-card hover:border-primary/50 transition-colors">
                  <AccordionTrigger className="p-4 text-lg font-semibold hover:no-underline text-left">
                    <div className="flex items-center">
                        <Sparkles className="h-5 w-5 mr-3 text-yellow-500 flex-shrink-0" />
                        Roadmap for: {roadmapItem.career}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="p-4 pt-0 space-y-4 divide-y divide-border">
                    <RoadmapSection
                      title="Introduction"
                      icon={Lightbulb}
                      text={roadmapItem.details.introduction}
                      className="pt-2"
                    />
                    <RoadmapSection
                      title="Skills to Develop"
                      icon={ListChecks}
                      items={roadmapItem.details.skillsToDevelop}
                    />
                    <RoadmapSection
                      title="Key Milestones"
                      icon={Target}
                      items={roadmapItem.details.keyMilestones}
                    />
                    <RoadmapSection
                      title="Learning Resources"
                      icon={BookOpen}
                      items={roadmapItem.details.learningResources}
                    />
                    {roadmapItem.details.networkingTips && roadmapItem.details.networkingTips.length > 0 && (
                      <RoadmapSection
                        title="Networking Tips"
                        icon={Users}
                        items={roadmapItem.details.networkingTips}
                      />
                    )}
                    {roadmapItem.details.timelineEstimate && (
                       <RoadmapSection
                        title="Estimated Timeline"
                        icon={Clock}
                        text={roadmapItem.details.timelineEstimate}
                      />
                    )}
                     <RoadmapSection
                        title="Your Next Step"
                        icon={ArrowRightCircle}
                        text={roadmapItem.details.nextStep}
                        className="pb-0"
                      />
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
          {!isLoadingRoadmaps && (!careerRoadmapsData || !careerRoadmapsData.roadmaps) && !error && careerSuggestionsData && (
             <p className="text-muted-foreground">Roadmaps will appear here once generated. If suggestions are loaded, roadmaps might still be processing or encountered an issue.</p>
          )}
           {!isLoadingRoadmaps && (!careerRoadmapsData || !careerRoadmapsData.roadmaps) && !error && !careerSuggestionsData && (
             <p className="text-muted-foreground">Roadmaps will appear here once career suggestions are generated first.</p>
          )}
        </CardContent>
      </Card>

      {/* AI Chatbot Section */}
      {(careerSuggestionsData || careerRoadmapsData) && (
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <MessageCircle className="h-7 w-7 text-primary" />
              <CardTitle className="text-2xl font-headline">Career Help Chatbot</CardTitle>
            </div>
            <CardDescription>Ask follow-up questions or get more advice based on your results.</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-72 w-full rounded-md border p-4 mb-4" ref={chatScrollAreaRef}>
              {chatMessages.length === 0 && !isChatLoading && (
                <p className="text-sm text-muted-foreground text-center py-4">Ask a question to get started!</p>
              )}
              {chatMessages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "mb-3 flex items-start gap-3 p-3 rounded-lg max-w-[85%]",
                    message.role === 'user' ? 'ml-auto bg-primary/10 flex-row-reverse' : 'mr-auto bg-muted'
                  )}
                >
                  {message.role === 'model' && <Bot className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />}
                  {message.role === 'user' && <User className="h-6 w-6 text-accent flex-shrink-0 mt-0.5" />}
                  <p className="text-sm whitespace-pre-line leading-relaxed">{message.content}</p>
                </div>
              ))}
              {isChatLoading && (
                <div className="flex items-center justify-start gap-2 p-3 text-muted-foreground">
                  <Bot className="h-6 w-6 text-primary animate-pulse" />
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>AI is typing...</span>
                </div>
              )}
            </ScrollArea>
            <div className="flex items-center space-x-2">
              <Input
                type="text"
                placeholder="Ask a question about your career..."
                value={chatInputValue}
                onChange={(e) => setChatInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !isChatLoading && handleSendChatMessage()}
                disabled={isChatLoading}
                className="flex-grow"
              />
              <Button onClick={handleSendChatMessage} disabled={isChatLoading || !chatInputValue.trim()} size="icon">
                {isChatLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <SendHorizonal className="h-5 w-5" />}
                <span className="sr-only">Send</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

    </div>
  );
}

