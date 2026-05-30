'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authenticate } from '@/lib/auth';

const TEST_ACCOUNTS = [
  { label: 'Administrateur', email: 'admin@sav.com', password: 'admin123' },
  { label: 'Technicien', email: 'tech@sav.com', password: 'tech123' },
  { label: 'Client', email: 'client@sav.com', password: 'client123' },
] as const;

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const session = authenticate(email, password);
    if (session) {
      router.push('/dashboard');
    } else {
      setError('Email ou mot de passe incorrect.');
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-primary rounded-lg mb-4">
            <span className="text-primary-foreground font-bold text-lg">S</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">SAV Manager</h1>
          <p className="text-muted-foreground">Gestion du service après-vente</p>
        </div>

        <Card className="border border-border">
          <CardHeader className="pb-4">
            <CardTitle>Connexion</CardTitle>
            <CardDescription>Connectez-vous avec votre email et mot de passe</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="vous@exemple.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              {error && (
                <p className="text-sm text-destructive" role="alert">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {isLoading ? 'Connexion...' : 'Se connecter'}
              </Button>
            </form>

            <details className="rounded-lg border border-border bg-muted/40 p-4">
              <summary className="text-sm font-medium text-foreground cursor-pointer select-none">
                Comptes de démonstration
              </summary>
              <ul className="space-y-2 text-sm text-muted-foreground mt-3">
                {TEST_ACCOUNTS.map((account) => (
                  <li key={account.email}>
                    <span className="text-foreground font-medium">{account.label} :</span>{' '}
                    {account.email} / {account.password}
                  </li>
                ))}
              </ul>
            </details>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Application SAV Manager &copy; 2026
        </p>
      </div>
    </div>
  );
}
