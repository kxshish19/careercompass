
// src/app/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Spinner } from '@/components/core/Spinner';
import { Button } from '@/components/ui/button';
import { Compass, LogIn } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Card } from '@/components/ui/card';

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
        <main className="container mx-auto flex flex-grow flex-col items-center justify-center px-4 py-12 text-center">
          <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-primary text-primary-foreground sm:h-24 sm:w-24">
            <Compass size={50} className="sm:size-14" />
          </div>
          <h1 className="font-headline text-4xl font-bold text-primary sm:text-5xl md:text-6xl">
            Welcome to Career Compass
          </h1>
          <p className="mt-6 max-w-xl text-base text-foreground/80 sm:text-lg md:text-xl">
            Navigate your career path with AI-powered insights. Upload your resume, take our personality quiz, and discover personalized career suggestions and roadmaps.
          </p>
          <div className="mt-10">
            <Button asChild size="lg" className="px-8 py-3 text-lg font-semibold">
              <Link href="/login">
                <LogIn className="mr-2 h-5 w-5" /> Get Started
              </Link>
            </Button>
          </div>
          <div className="mt-12 w-full max-w-2xl lg:max-w-3xl">
            <Card className="overflow-hidden rounded-lg shadow-xl">
              <Image
                src="https://placehold.co/800x450.png"
                alt="Career Compass dashboard preview"
                data-ai-hint="career guidance future"
                width={800}
                height={450}
                className="h-auto w-full object-cover"
                priority
              />
            </Card>
            <p className="mt-3 text-xs text-muted-foreground">
              Illustrative dashboard preview. Your journey starts here.
            </p>
          </div>
        </main>
        <footer className="w-full py-6 text-center text-sm text-foreground/70">
          <p>
            &copy; {currentYear || '...'} Career Compass. All rights reserved.
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
