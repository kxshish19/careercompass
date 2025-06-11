
// src/contexts/AppContext.tsx
'use client';
import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect } from 'react';
import type { ResumeGraderOutput } from '@/ai/flows/resume-grader';
import type { AiCareerSuggestionsOutput } from '@/ai/flows/ai-career-suggestions';
import type { CareerRoadmapOutput } from '@/ai/flows/career-roadmap-generator';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const LOCAL_STORAGE_KEY = 'careerCompassUserData';

interface UserAppData {
  resumeText: string | null;
  resumeAnalysis: ResumeGraderOutput | null;
  quizAnswers: Record<string, string> | null;
  formattedQuizResults: string | null;
  careerSuggestionsData: AiCareerSuggestionsOutput | null;
  careerRoadmapsData: CareerRoadmapOutput | null;
}

const initialUserAppData: UserAppData = {
  resumeText: null,
  resumeAnalysis: null,
  quizAnswers: null,
  formattedQuizResults: null,
  careerSuggestionsData: null,
  careerRoadmapsData: null,
};

interface AppContextType {
  appName: string;
  setAppName: (name: string) => void;
  
  resumeText: string | null;
  setResumeText: (text: string | null) => void;
  
  resumeAnalysis: ResumeGraderOutput | null;
  setResumeAnalysis: (analysis: ResumeGraderOutput | null) => void;
  
  quizAnswers: Record<string, string> | null; 
  setQuizAnswers: (answers: Record<string, string> | null) => void;
  
  formattedQuizResults: string | null; 
  setFormattedQuizResults: (results: string | null) => void;

  careerSuggestionsData: AiCareerSuggestionsOutput | null;
  setCareerSuggestionsData: (data: AiCareerSuggestionsOutput | null) => void;

  careerRoadmapsData: CareerRoadmapOutput | null;
  setCareerRoadmapsData: (data: CareerRoadmapOutput | null) => void;

  clearUserCacheAndResetState: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [appName, setAppName] = useState('Career Compass');
  const [currentUserAppData, _setCurrentUserAppData] = useState<UserAppData>(initialUserAppData);
  const auth = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (typeof window !== 'undefined' && auth.user?.email) {
      const allUserDataString = localStorage.getItem(LOCAL_STORAGE_KEY);
      const allUserData = allUserDataString ? JSON.parse(allUserDataString) : {};
      const userDataFromStorage = allUserData[auth.user.email];
      _setCurrentUserAppData(userDataFromStorage || initialUserAppData);
    } else {
      _setCurrentUserAppData(initialUserAppData); // Reset if no user or on SSR initialization
    }
  }, [auth.user]);

  const updateAndSaveUserData = (updates: Partial<UserAppData>) => {
    if (typeof window !== 'undefined' && auth.user?.email) {
      const updatedData = { ...currentUserAppData, ...updates };
      _setCurrentUserAppData(updatedData);

      const allUserDataString = localStorage.getItem(LOCAL_STORAGE_KEY);
      const allUserData = allUserDataString ? JSON.parse(allUserDataString) : {};
      allUserData[auth.user.email] = updatedData;
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(allUserData));
    } else {
       // If no user, just update local state without saving to localStorage
       _setCurrentUserAppData(prev => ({ ...prev, ...updates }));
    }
  };

  const setResumeText = (text: string | null) => updateAndSaveUserData({ resumeText: text });
  const setResumeAnalysis = (analysis: ResumeGraderOutput | null) => updateAndSaveUserData({ resumeAnalysis: analysis });
  const setQuizAnswers = (answers: Record<string, string> | null) => updateAndSaveUserData({ quizAnswers: answers });
  const setFormattedQuizResults = (results: string | null) => updateAndSaveUserData({ formattedQuizResults: results });
  const setCareerSuggestionsData = (data: AiCareerSuggestionsOutput | null) => updateAndSaveUserData({ careerSuggestionsData: data });
  const setCareerRoadmapsData = (data: CareerRoadmapOutput | null) => updateAndSaveUserData({ careerRoadmapsData: data });

  const clearUserCacheAndResetState = () => {
    if (typeof window !== 'undefined' && auth.user?.email) {
      const allUserDataString = localStorage.getItem(LOCAL_STORAGE_KEY);
      const allUserData = allUserDataString ? JSON.parse(allUserDataString) : {};
      delete allUserData[auth.user.email];
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(allUserData));
    }
    _setCurrentUserAppData(initialUserAppData);
    toast({
      title: "Data Cleared Successfully",
      description: "Your cached application data for this account has been reset in this browser.",
    });
  };

  return (
    <AppContext.Provider value={{ 
      appName, setAppName,
      resumeText: currentUserAppData.resumeText,
      setResumeText,
      resumeAnalysis: currentUserAppData.resumeAnalysis,
      setResumeAnalysis,
      quizAnswers: currentUserAppData.quizAnswers,
      setQuizAnswers,
      formattedQuizResults: currentUserAppData.formattedQuizResults,
      setFormattedQuizResults,
      careerSuggestionsData: currentUserAppData.careerSuggestionsData,
      setCareerSuggestionsData,
      careerRoadmapsData: currentUserAppData.careerRoadmapsData,
      setCareerRoadmapsData,
      clearUserCacheAndResetState
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
