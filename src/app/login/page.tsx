// src/app/login/page.tsx
'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Compass } from 'lucide-react'; // Icon for branding

export default function LoginPage() {
  const [email, setEmail] = useState('');
  // const [password, setPassword] = useState(''); // Password not used for fake auth
  const { login } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) { // Basic validation
      login(email);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-background to-secondary p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Compass size={36} />
          </div>
          <CardTitle className="font-headline text-3xl">Welcome to Career Compass</CardTitle>
          <CardDescription>Sign in to chart your course to success.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="text-base"
              />
            </div>
            {/* Password field can be added if needed for UI, but logic ignores it for fake auth
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div> */}
            <Button type="submit" className="w-full text-lg" size="lg">
              Sign In
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              (This is a demo. Any email will work.)
            </p>
          </form>
        </CardContent>
      </Card>
      <footer className="mt-8 text-center text-sm text-foreground/70">
        <p>&copy; {new Date().getFullYear()} Career Compass. All rights reserved.</p>
      </footer>
    </div>
  );
}