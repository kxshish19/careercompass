// src/components/core/Header.tsx
'use client';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Compass, LogOut } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function Header() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/upload-resume', label: 'Resume' },
    { href: '/quiz', label: 'Quiz' },
    { href: '/results', label: 'Results' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <Compass className="h-8 w-8 text-primary" />
          <span className="font-headline text-2xl font-bold text-primary">Career Compass</span>
        </Link>
        
        <nav className="hidden md:flex items-center space-x-2">
          {navLinks.map((link) => (
            <Button
              key={link.href}
              variant={pathname === link.href ? "secondary" : "ghost"}
              asChild
              className={pathname === link.href ? "font-semibold" : ""}
            >
              <Link href={link.href}>{link.label}</Link>
            </Button>
          ))}
        </nav>

        <div className="flex items-center space-x-4">
          {user && (
            <span className="text-sm text-muted-foreground hidden sm:inline">
              Welcome, {user.name}
            </span>
          )}
          <Button variant="outline" size="sm" onClick={logout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}