// src/app/(app)/upload-resume/page.tsx
'use client';

import { useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { resumeGrader, type ResumeGraderOutput } from '@/ai/flows/resume-grader';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { FileText, Send, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function UploadResumePage() {
  const { resumeText, setResumeText, setResumeAnalysis } = useAppContext();
  const [currentResumeText, setCurrentResumeText] = useState(resumeText || '');
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<ResumeGraderOutput | null>(null);
  const { toast } = useToast();

  const handleAnalyzeResume = async () => {
    if (!currentResumeText.trim()) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please paste your resume text before analyzing.',
      });
      return;
    }

    setIsLoading(true);
    setAnalysisResult(null); 
    try {
      const result = await resumeGrader({ resumeText: currentResumeText });
      setAnalysisResult(result);
      setResumeText(currentResumeText); // Save to context on successful analysis
      setResumeAnalysis(result); // Save analysis to context
      toast({
        title: 'Resume Analyzed!',
        description: 'Check out your score and feedback below.',
        action: <CheckCircle className="text-green-500" />,
      });
    } catch (error) {
      console.error('Error analyzing resume:', error);
      toast({
        variant: 'destructive',
        title: 'Analysis Failed',
        description: 'Could not analyze the resume. Please try again.',
        action: <AlertCircle className="text-red-500" />,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center space-x-3 mb-2">
            <FileText className="h-8 w-8 text-primary" />
            <CardTitle className="text-3xl font-headline">Resume Analyzer</CardTitle>
          </div>
          <CardDescription className="text-base">
            Paste your resume text below to get an AI-powered analysis, including a score and actionable feedback.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Textarea
            placeholder="Paste your full resume text here..."
            value={currentResumeText}
            onChange={(e) => setCurrentResumeText(e.target.value)}
            rows={15}
            className="text-sm border-input focus:ring-primary"
            disabled={isLoading}
          />
          <Button onClick={handleAnalyzeResume} disabled={isLoading || !currentResumeText.trim()} className="w-full sm:w-auto">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Send className="mr-2 h-5 w-5" />
                Analyze Resume
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {isLoading && (
        <Card>
          <CardContent className="pt-6 text-center">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
            <p className="mt-2 text-muted-foreground">Analyzing your resume, please wait...</p>
          </CardContent>
        </Card>
      )}

      {analysisResult && !isLoading && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-headline text-primary">Analysis Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-lg font-semibold">Overall Score: {analysisResult.score}/100</Label>
              <Progress value={analysisResult.score} className="mt-2 h-4 rounded-full" />
               <p className="text-xs text-muted-foreground mt-1">
                {analysisResult.score < 50 ? "Needs significant improvement." : analysisResult.score < 75 ? "Good start, but room to grow." : "Strong resume!"}
              </p>
            </div>
            <Alert variant={analysisResult.score < 50 ? "destructive" : analysisResult.score < 75 ? "default": "default"} className={analysisResult.score >= 75 ? "border-green-500" : ""}>
              {analysisResult.score >= 75 && <CheckCircle className="h-5 w-5 text-green-500" />}
              <AlertTitle className="text-lg font-semibold">Feedback & Suggestions</AlertTitle>
              <AlertDescription className="whitespace-pre-line text-sm leading-relaxed">
                {analysisResult.feedback}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Minimal Label component if not already globally available or for simplicity
const Label = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <label className={`block text-sm font-medium text-foreground ${className}`}>
    {children}
  </label>
);
