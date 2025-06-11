
// src/app/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Spinner } from '@/components/core/Spinner';
import { Button } from '@/components/ui/button';
import { Compass, LogIn, Briefcase, Brain, Route, Zap, Info } from 'lucide-react'; // Info icon for Demo link
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ThemeToggleButton } from '@/components/core/ThemeToggleButton';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [currentYear, setCurrentYear] = useState<string | null>(null);

  // Effect for setting the current year (client-side only)
  useEffect(() => {
    setCurrentYear(new Date().getFullYear().toString());
  }, []); // Empty dependency array: runs once on mount client-side

  // Effect for redirecting authenticated users
  useEffect(() => {
    if (!loading && user) {
      router.replace('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <Spinner size="xl" />
        <p className="mt-4 text-lg text-foreground">Loading Career Compass...</p>
      </div>
    );
  }

  // If user is loaded and IS NOT authenticated, show the landing page.
  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-stretch bg-gradient-to-br from-background to-secondary">
        <header className="container mx-auto py-6 px-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Compass className="h-10 w-10 text-primary" />
            <span className="font-headline text-3xl font-bold text-primary">Career Compass</span>
          </div>
          <div className="flex items-center space-x-2">
            <ThemeToggleButton />
            <Button asChild variant="outline">
              <Link href="/login">
                <LogIn className="mr-2 h-5 w-5" /> Login / Sign Up
              </Link>
            </Button>
          </div>
        </header>

        <main className="container mx-auto flex flex-grow flex-col items-center justify-center px-4 py-12 text-center">
          <h1 className="font-headline text-4xl font-bold text-primary sm:text-5xl md:text-6xl">
            Chart Your Course to a Fulfilling Career
          </h1>
          <p className="mt-6 max-w-2xl text-base text-foreground/80 sm:text-lg md:text-xl">
            Career Compass is your AI-powered guide to navigating the complexities of the modern job market. We help you understand your strengths, explore potential career paths, and create actionable roadmaps to achieve your professional goals.
          </p>

          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 max-w-5xl">
            <Card className="text-left shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <Briefcase className="h-8 w-8 text-accent" />
                  <CardTitle className="text-xl">Smart Resume Analysis</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground/70">
                  Upload your resume and let our AI provide detailed feedback and scoring, highlighting areas for improvement to make your application stand out.
                </p>
              </CardContent>
            </Card>

            <Card className="text-left shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <Brain className="h-8 w-8 text-accent" />
                  <CardTitle className="text-xl">Insightful Personality Quiz</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground/70">
                  Take our specially designed personality quiz to uncover your unique traits, work style preferences, and potential career alignments.
                </p>
              </CardContent>
            </Card>

            <Card className="text-left shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <Zap className="h-8 w-8 text-accent" />
                  <CardTitle className="text-xl">AI Career Suggestions</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground/70">
                  Based on your resume and quiz results, receive personalized career suggestions powered by advanced AI, tailored to your skills and aspirations.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-left shadow-lg hover:shadow-xl transition-shadow duration-300 md:col-span-2 lg:col-span-1 xl:col-span-1">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <Route className="h-8 w-8 text-accent" />
                  <CardTitle className="text-xl">Personalized Roadmaps</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground/70">
                  Get detailed, step-by-step career roadmaps for your chosen paths, including skills to acquire, milestones to reach, and resources to utilize.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="px-10 py-4 text-xl font-semibold">
              <Link href="/login">
                <LogIn className="mr-3 h-6 w-6" /> Get Started on Your Journey
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="px-10 py-4 text-xl font-semibold">
              <Link href="/demo-walkthrough">
                <Info className="mr-3 h-6 w-6" /> How It Works
              </Link>
            </Button>
          </div>
           <p className="mt-4 text-sm text-muted-foreground">
              Sign up today and take the first step towards a brighter professional future.
            </p>
        </main>

        <footer className="w-full py-8 text-center text-sm text-foreground/70">
          <p>
            &copy; {currentYear ? currentYear : '...'} Career Compass. All rights reserved.
          </p>
        </footer>
      </div>
    );
  }

  // Fallback: User is logged in, but redirection hasn't happened yet.
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <Spinner size="xl" />
      <p className="mt-4 text-lg text-foreground">Preparing your journey...</p>
    </div>
  );
}
