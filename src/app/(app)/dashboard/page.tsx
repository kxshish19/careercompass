
// src/app/(app)/dashboard/page.tsx
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, FileText, Lightbulb, Zap, Route, Briefcase } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
  cta: string;
}

function FeatureCard({ title, description, icon: Icon, href, cta }: FeatureCardProps) {
  return (
    <Card className="flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="flex-row items-center space-x-4 pb-4">
        <div className="bg-primary/10 p-3 rounded-full">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground mb-4">{description}</p>
      </CardContent>
      <CardContent className="pt-0">
        <Button asChild className="w-full">
          <Link href={href}>{cta}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      <Card className="shadow-xl overflow-hidden">
        <div className="grid md:grid-cols-2 items-center">
          <div className="p-8 space-y-4">
            <CardTitle className="text-3xl font-headline md:text-4xl">
              Welcome, {user?.name || 'Explorer'}!
            </CardTitle>
            <CardDescription className="text-base md:text-lg text-foreground/80">
              You're on your way to charting a brilliant career path. Use the tools below to gain insights and plan your next steps.
            </CardDescription>
            <div className="flex space-x-2 pt-2">
                <Button asChild size="lg">
                    <Link href="/upload-resume">Upload Your Resume</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                    <Link href="/quiz">Take Personality Quiz</Link>
                </Button>
            </div>
          </div>
          <div className="hidden md:block relative h-64 md:h-full">
            <Image 
              src="https://placehold.co/600x400.png" 
              alt="Career illustration" 
              layout="fill" 
              objectFit="cover"
              data-ai-hint="abstract career path"
            />
          </div>
        </div>
      </Card>

      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-primary">Your Career Toolkit</h2>
        <p className="text-muted-foreground">Explore these features to get the most out of Career Compass.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <FeatureCard
          title="Resume Analysis"
          description="Upload your resume to get AI-powered feedback and a detailed score. Identify areas for improvement and make your resume stand out."
          icon={FileText}
          href="/upload-resume"
          cta="Analyze Resume"
        />
        <FeatureCard
          title="Personality Quiz"
          description="Discover your work style, strengths, and preferences. Our quiz helps align your personality with potential career paths."
          icon={Lightbulb}
          href="/quiz"
          cta="Take the Quiz"
        />
        <FeatureCard
          title="AI-Powered Results"
          description="Combine your resume insights and quiz results to receive personalized career suggestions and actionable roadmaps."
          icon={Zap}
          href="/results"
          cta="View Your Results"
        />
        <FeatureCard
          title="Career Roadmaps"
          description="Get step-by-step guidance for your chosen career paths, including skills to develop, milestones to achieve, and resources."
          icon={Route}
          href="/results" 
          cta="Explore Roadmaps"
        />
         <FeatureCard
          title="AI Suggestions"
          description="Leverage AI to uncover career paths you might not have considered, based on your unique profile."
          icon={Brain}
          href="/results"
          cta="Get Suggestions"
        />
         <FeatureCard
          title="General Career Tools"
          description="Access a suite of tools and resources designed to support your professional journey and development."
          icon={Briefcase}
          href="/results" 
          cta="Discover Tools"
        />
      </div>
    </div>
  );
}

// Placeholder icons if not already defined:
// const Brain = ({ className }: { className?: string }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.871 7.702c0-1.29.932-2.404 2.221-2.632.96-.17 1.905.016 2.716.518M4.871 7.702V10.5m0-2.798S3 7.21 3 9.362c0 2.152 1.871 4.436 1.871 4.436m0-6.636V4.5m0 6.136c0 1.29-.932 2.404-2.221 2.632-.96.17-1.905-.016-2.716-.518m16.258-4.436c0-1.29-.932-2.404-2.221-2.632-.96-.17-1.905.016-2.716.518m2.221 2.014V10.5m0-2.798s1.871-.492 1.871 1.66c0 2.152-1.871 4.436-1.871 4.436m0-6.636V4.5m0 6.136c0 1.29.932 2.404 2.221 2.632.96.17 1.905-.016 2.716-.518M9 12a3 3 0 11-6 0 3 3 0 016 0zm12 0a3 3 0 11-6 0 3 3 0 016 0zM9 12V9m6 3V9m-3 6.965A2.992 2.992 0 0112 15a2.992 2.992 0 01-3 .965m0 0V12m3 3.965V12m0 0a2.001 2.001 0 00-1.414-1.932C10.02 9.778 9.075 9.592 8.114 9.422 6.512 9.14 5 9.776 5 11.298c0 .285.223.518.5.518h13c.277 0 .5-.233.5-.518 0-1.522-1.512-2.158-3.114-2.436-.96-.17-1.905.016-2.716.518A2.001 2.001 0 0012 12z" /></svg>;

```