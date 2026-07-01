'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { setAuthSession } from '@/lib/auth'
import type { AuthSession } from '@/types';

const TEST_ACCOUNTS = [
  { label: 'Administrateur', identifier: 'admin@sav.com', phone: '71100200', password: 'admin123' },
  { label: 'Technicien', identifier: 'tech@sav.com', phone: '98200300', password: 'tech123' },
  { label: 'Client (société)', identifier: 'contact@edi-demo.tn', phone: '71345678', password: 'demo123' },
  { label: 'Client (particulier)', identifier: 'sara.mejri@demo.tn', phone: '55667788', password: 'demo123' },
] as const;

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });

      if (res.ok) {
        const session = (await res.json()) as AuthSession;
        setAuthSession(session);
        router.push('/dashboard');
      } else {
        const body = await res.json().catch(() => ({})) as { error?: string };
        setError(body.error ?? 'Identifiant ou mot de passe incorrect.');
      }
    } catch {
      setError('Impossible de contacter le serveur. Vérifiez votre connexion.');
    } finally {
      setIsLoading(false);
    }
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
            <CardDescription>Connectez-vous avec votre email ou téléphone et mot de passe</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="identifier">Email ou téléphone</Label>
                <Input
                  id="identifier"
                  type="text"
                  autoComplete="username"
                  placeholder="email@exemple.com ou 71100200"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
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
              <div className="mt-3 space-y-2">
                <p className="text-xs text-muted-foreground mb-2">
                  Connexion par email ou téléphone possible.
                </p>
                {TEST_ACCOUNTS.map((account) => (
                  <div key={account.identifier} className="text-xs border-b border-border/50 pb-2 last:border-0 last:pb-0">
                    <span className="font-medium text-foreground">{account.label}</span>
                    <div className="text-muted-foreground mt-0.5 space-y-0.5">
                      <div>{account.identifier}</div>
                      <div>{account.phone}</div>
                      <div>Mot de passe : <span className="font-mono">{account.password}</span></div>
                    </div>
                  </div>
                ))}
              </div>
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
