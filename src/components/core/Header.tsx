
// src/components/core/Header.tsx
'use client';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Compass, LogOut, Trash2, Menu, Info } from 'lucide-react'; // Added Menu, Info icons
import { usePathname } from 'next/navigation';
import { ThemeToggleButton } from './ThemeToggleButton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { useState } from 'react';

export default function Header() {
  const { user, logout } = useAuth();
  const { clearUserCacheAndResetState } = useAppContext();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: Compass }, // Example, adjust as needed
    { href: '/upload-resume', label: 'Resume', icon: Compass },
    { href: '/quiz', label: 'Quiz', icon: Compass },
    { href: '/results', label: 'Results', icon: Compass },
    { href: '/demo-walkthrough', label: 'Demo', icon: Info },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 max-w-screen-2xl items-center justify-between">
        <Link href="/dashboard" className="flex items-center space-x-2 ml-4">
          <Compass className="h-8 w-8 text-primary" />
          <span className="font-headline text-2xl font-bold text-primary">Career Compass</span>
        </Link>
        
        <nav className="hidden md:flex items-center space-x-3">
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

        <div className="flex items-center space-x-3">
          {user && (
            <span className="text-sm text-muted-foreground hidden sm:inline">
              Welcome, {user.name}
            </span>
          )}
          <ThemeToggleButton />
          {user && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Trash2 className="mr-0 sm:mr-2 h-4 w-4" /> 
                  <span className="hidden sm:inline">Reset Data</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action will permanently delete all your cached application data (resume, quiz answers, AI results) for the account '{user?.email || 'current user'}' from this browser. This cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={clearUserCacheAndResetState}>
                    Yes, Reset My Data
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          <Button variant="outline" size="sm" onClick={logout}>
            <LogOut className="mr-0 sm:mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] sm:w-[320px]">
                <div className="p-4">
                  <Link href="/dashboard" className="flex items-center space-x-2 mb-6" onClick={() => setIsMobileMenuOpen(false)}>
                    <Compass className="h-8 w-8 text-primary" />
                    <span className="font-headline text-xl font-bold text-primary">Career Compass</span>
                  </Link>
                  <nav className="flex flex-col space-y-2">
                    {navLinks.map((link) => (
                       <SheetClose asChild key={link.href}>
                        <Link
                          href={link.href}
                          className={`flex items-center space-x-3 rounded-md px-3 py-2 text-base font-medium
                            ${pathname === link.href ? 'bg-secondary text-secondary-foreground' : 'hover:bg-muted'}`}
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <link.icon className={`h-5 w-5 ${pathname === link.href ? 'text-secondary-foreground' : 'text-primary/70'}`} />
                          <span>{link.label}</span>
                        </Link>
                      </SheetClose>
                    ))}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
