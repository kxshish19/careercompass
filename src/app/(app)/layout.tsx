// src/app/(app)/layout.tsx
'use client';
import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Corrected import
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/core/Header';
import { Spinner } from '@/components/core/Spinner';

export default function AppLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <Spinner size="xl" />
        <p className="mt-4 text-lg text-foreground">Loading your experience...</p>
      </div>
    );
  }

  if (!user) {
    // This state should ideally be brief as the useEffect will redirect.
    // Or, you could return null or a specific "Redirecting..." component.
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background">
            <Spinner size="lg" />
            <p className="mt-2 text-foreground">Redirecting to login...</p>
        </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>
      <footer className="py-6 text-center text-sm text-foreground/70">
        <p>&copy; {new Date().getFullYear()} Career Compass. All rights reserved.</p>
      </footer>
    </div>
  );
}
