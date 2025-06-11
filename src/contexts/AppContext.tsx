// src/contexts/AppContext.tsx
'use client';
import type { ReactNode } from 'react';
import { createContext, useContext, useState } from 'react';
import type { ResumeGraderOutput } from '@/ai/flows/resume-grader';
import type { AiCareerSuggestionsOutput } from '@/ai/flows/ai-career-suggestions';
import type { CareerRoadmapOutput } from '@/ai/flows/career-roadmap-generator';

interface AppContextType {
  appName: string;
  setAppName: (name: string) => void;
  
  resumeText: string | null;
  setResumeText: (text: string | null) => void;
  
  resumeAnalysis: ResumeGraderOutput | null;
  setResumeAnalysis: (analysis: ResumeGraderOutput | null) => void;
  
  quizAnswers: Record<string, string> | null; // e.g., { "q1": "optionA", "q2": "optionC" }
  setQuizAnswers: (answers: Record<string, string> | null) => void;
  
  formattedQuizResults: string | null; // Stringified version for AI
  setFormattedQuizResults: (results: string | null) => void;

  careerSuggestionsData: AiCareerSuggestionsOutput | null;
  setCareerSuggestionsData: (data: AiCareerSuggestionsOutput | null) => void;

  careerRoadmapsData: CareerRoadmapOutput | null;
  setCareerRoadmapsData: (data: CareerRoadmapOutput | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [appName, setAppName] = useState('Career Compass');
  const [resumeText, setResumeText] = useState<string | null>(null);
  const [resumeAnalysis, setResumeAnalysis] = useState<ResumeGraderOutput | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string> | null>(null);
  const [formattedQuizResults, setFormattedQuizResults] = useState<string | null>(null);
  const [careerSuggestionsData, setCareerSuggestionsData] = useState<AiCareerSuggestionsOutput | null>(null);
  const [careerRoadmapsData, setCareerRoadmapsData] = useState<CareerRoadmapOutput | null>(null);

  return (
    <AppContext.Provider value={{ 
      appName, setAppName,
      resumeText, setResumeText,
      resumeAnalysis, setResumeAnalysis,
      quizAnswers, setQuizAnswers,
      formattedQuizResults, setFormattedQuizResults,
      careerSuggestionsData, setCareerSuggestionsData,
      careerRoadmapsData, setCareerRoadmapsData
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
