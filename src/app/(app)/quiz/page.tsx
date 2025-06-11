// src/app/(app)/quiz/page.tsx
'use client';

import { useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { quizQuestions, type QuizQuestion } from './quiz-questions';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb, Send, CheckCircle, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

export default function QuizPage() {
  const { 
    setQuizAnswers, 
    setFormattedQuizResults,
    quizAnswers: initialQuizAnswers 
  } = useAppContext();
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>(initialQuizAnswers || {});
  const [isQuizCompleted, setIsQuizCompleted] = useState(!!initialQuizAnswers && Object.keys(initialQuizAnswers).length === quizQuestions.length);

  const { toast } = useToast();

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const currentQuestion: QuizQuestion = quizQuestions[currentQuestionIndex];
  const progressPercentage = ((currentQuestionIndex + 1) / quizQuestions.length) * 100;

  const goToNextQuestion = () => {
    if (!answers[currentQuestion.id]) {
      toast({
        variant: 'destructive',
        title: 'No Answer Selected',
        description: 'Please select an answer before proceeding.',
      });
      return;
    }
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };
  
  const handleSubmitQuiz = () => {
    if (Object.keys(answers).length !== quizQuestions.length) {
       toast({
        variant: 'destructive',
        title: 'Incomplete Quiz',
        description: 'Please answer all questions before submitting.',
        action: <AlertCircle className="text-red-500"/>,
      });
      return;
    }

    // Format results for AI (simple string concatenation for this example)
    const formattedResults = quizQuestions
      .map(q => `Q: ${q.text} A: ${q.options.find(opt => opt.value === answers[q.id])?.label || 'N/A'}`)
      .join('\n');
    
    setQuizAnswers(answers);
    setFormattedQuizResults(formattedResults);
    setIsQuizCompleted(true);

    toast({
      title: 'Quiz Submitted!',
      description: 'Your personality insights are saved. You can now view your AI-powered results.',
      action: <CheckCircle className="text-green-500"/>,
    });
  };

  if (isQuizCompleted) {
    return (
      <Card className="shadow-lg text-center">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-800 dark:text-green-300">
            <CheckCircle size={36} />
          </div>
          <CardTitle className="text-3xl font-headline">Quiz Completed!</CardTitle>
          <CardDescription className="text-base">
            You've successfully completed the personality quiz. Your insights have been saved.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>You can now view your personalized career suggestions and roadmaps based on your quiz results and resume analysis.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/results">
                <Lightbulb className="mr-2 h-5 w-5" /> View My Results
              </Link>
            </Button>
            <Button variant="outline" size="lg" onClick={() => {
              setIsQuizCompleted(false);
              setCurrentQuestionIndex(0);
              // Optionally clear answers: setAnswers({}); setQuizAnswers(null); setFormattedQuizResults(null);
            }}>
              Retake Quiz
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
           <div className="flex items-center space-x-3 mb-2">
            <Lightbulb className="h-8 w-8 text-primary" />
            <CardTitle className="text-3xl font-headline">Personality Quiz</CardTitle>
          </div>
          <CardDescription className="text-base">
            Answer these questions to help us understand your preferences and suggest suitable career paths.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-1">
            <Label className="text-sm text-muted-foreground">Question {currentQuestionIndex + 1} of {quizQuestions.length}</Label>
            <Progress value={progressPercentage} className="w-full h-2.5" />
          </div>
          
          <Card className="border-primary/50">
            <CardHeader>
              <CardTitle className="text-xl">{currentQuestion.text}</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={answers[currentQuestion.id] || ''}
                onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
                className="space-y-3"
              >
                {currentQuestion.options.map((option) => (
                  <div key={option.value} className="flex items-center space-x-3 p-3 rounded-md border border-input hover:border-primary transition-colors cursor-pointer has-[[data-state=checked]]:bg-primary/10 has-[[data-state=checked]]:border-primary">
                    <RadioGroupItem value={option.value} id={`${currentQuestion.id}-${option.value}`} />
                    <Label htmlFor={`${currentQuestion.id}-${option.value}`} className="flex-1 text-base cursor-pointer">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>

          <div className="flex justify-between items-center pt-4">
            <Button 
              variant="outline" 
              onClick={goToPreviousQuestion} 
              disabled={currentQuestionIndex === 0}
            >
              <ChevronLeft className="mr-2 h-5 w-5" /> Previous
            </Button>
            {currentQuestionIndex < quizQuestions.length - 1 ? (
              <Button onClick={goToNextQuestion} disabled={!answers[currentQuestion.id]}>
                Next <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            ) : (
              <Button onClick={handleSubmitQuiz} disabled={!answers[currentQuestion.id]} className="bg-green-600 hover:bg-green-700 text-white">
                <Send className="mr-2 h-5 w-5" /> Submit Quiz
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
