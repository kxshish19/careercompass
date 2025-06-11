// src/app/(app)/results/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { aiCareerSuggestions, type AiCareerSuggestionsOutput } from '@/ai/flows/ai-career-suggestions';
import { generateCareerRoadmap, type CareerRoadmapOutput } from '@/ai/flows/career-roadmap-generator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, Lightbulb, Zap, Route, ThumbsUp, Sparkles, MapPinned } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

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

  const { toast } = useToast();

  useEffect(() => {
    // Fetch suggestions if data is available and not already fetched
    if (resumeText && formattedQuizResults && !careerSuggestionsData && !isLoadingSuggestions) {
      const fetchSuggestions = async () => {
        setIsLoadingSuggestions(true);
        setError(null);
        try {
          const suggestions = await aiCareerSuggestions({
            resumeText: resumeText,
            personalityQuizResults: formattedQuizResults,
          });
          setCareerSuggestionsData(suggestions);
          toast({ title: "Career Suggestions Loaded!", description: "AI has generated some career ideas for you.", icon: <Sparkles className="text-yellow-500" /> });
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
  }, [resumeText, formattedQuizResults, careerSuggestionsData, setCareerSuggestionsData, isLoadingSuggestions, toast]);

  useEffect(() => {
    // Fetch roadmaps if suggestions are available and roadmaps not already fetched
    if (careerSuggestionsData && resumeText && formattedQuizResults && !careerRoadmapsData && !isLoadingRoadmaps) {
      const fetchRoadmaps = async () => {
        setIsLoadingRoadmaps(true);
        setError(null);
        try {
          const roadmaps = await generateCareerRoadmap({
            careerSuggestions: careerSuggestionsData.careerSuggestions.join(', '),
            resumeContent: resumeText,
            personalityQuizResults: formattedQuizResults,
          });
          setCareerRoadmapsData(roadmaps);
           toast({ title: "Career Roadmaps Generated!", description: "Detailed roadmaps are now available.", icon: <MapPinned className="text-blue-500" />});
        } catch (e) {
          console.error('Error fetching career roadmaps:', e);
          setError((prevError) => prevError ? prevError + ' Failed to load career roadmaps.' : 'Failed to load career roadmaps. Please try again later.');
          toast({ variant: "destructive", title: "Error", description: "Could not load career roadmaps." });
        } finally {
          setIsLoadingRoadmaps(false);
        }
      };
      fetchRoadmaps();
    }
  }, [careerSuggestionsData, resumeText, formattedQuizResults, careerRoadmapsData, setCareerRoadmapsData, isLoadingRoadmaps, toast]);

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
    <Card className="shadow-md">
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
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <Lightbulb className="h-7 w-7 text-primary" />
            <CardTitle className="text-2xl font-headline">AI Career Suggestions</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingSuggestions && renderLoadingState("Generating career suggestions...")}
          {!isLoadingSuggestions && careerSuggestionsData && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {careerSuggestionsData.careerSuggestions.map((suggestion, index) => (
                  <Card key={index} className="bg-primary/5 hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg text-primary flex items-center">
                        <ThumbsUp className="h-5 w-5 mr-2 text-green-500" /> {suggestion}
                      </CardTitle>
                    </CardHeader>
                     <CardContent>
                        <Badge variant="secondary">Suggestion {index + 1}</Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <Card className="bg-background/50">
                <CardHeader>
                  <CardTitle className="text-xl">Reasoning Behind Suggestions</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-foreground/90 whitespace-pre-line">{careerSuggestionsData.reasoning}</p>
                </CardContent>
              </Card>
            </div>
          )}
          {!isLoadingSuggestions && !careerSuggestionsData && !error && (
            <p className="text-muted-foreground">No suggestions available yet. Ensure your resume and quiz are completed.</p>
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
          {isLoadingRoadmaps && renderLoadingState("Generating career roadmaps...")}
          {!isLoadingRoadmaps && careerRoadmapsData && (
            <Accordion type="single" collapsible className="w-full space-y-3">
              {careerRoadmapsData.roadmaps.map((roadmapItem, index) => (
                <AccordionItem value={`item-${index}`} key={index} className="border border-input rounded-lg bg-card hover:border-primary/50 transition-colors">
                  <AccordionTrigger className="p-4 text-lg font-semibold hover:no-underline">
                    <div className="flex items-center">
                        <Sparkles className="h-5 w-5 mr-3 text-yellow-500" />
                        Roadmap for: {roadmapItem.career}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="p-4 pt-0">
                    <div className="whitespace-pre-line text-sm text-foreground/90 leading-relaxed">{roadmapItem.roadmap}</div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
          {!isLoadingRoadmaps && !careerRoadmapsData && !error && (
             <p className="text-muted-foreground">Roadmaps will appear here once career suggestions are generated.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
