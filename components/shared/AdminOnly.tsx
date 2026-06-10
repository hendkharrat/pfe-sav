'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { ROLES } from '@/lib/constants';

interface AdminOnlyProps {
  children: React.ReactNode;
}

export function AdminOnly({ children }: AdminOnlyProps) {
  const router = useRouter();
  const { role, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 mb-4">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  if (role !== ROLES.ADMIN) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background gap-6">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-destructive/10 mb-4">
            <span className="text-2xl">🔒</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Accès non autorisé</h1>
          <p className="text-muted-foreground max-w-md">
            Cette page est réservée aux administrateurs. Vous n&apos;avez pas les permissions nécessaires pour accéder à cette section.
          </p>
        </div>
        <Button onClick={() => router.push('/dashboard')}>Retour au tableau de bord</Button>
      </div>
    );
  }

  return <>{children}</>;
}
