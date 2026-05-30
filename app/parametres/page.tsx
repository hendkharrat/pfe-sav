'use client';

import { AppLayout } from '@/components/layout/AppLayout';
import { AdminOnly } from '@/components/shared/AdminOnly';
import { EmptyState } from '@/components/shared/EmptyState';
import { Settings } from 'lucide-react';

export default function ParametresPage() {
  return (
    <AdminOnly>
      <AppLayout>
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Paramètres</h1>
            <p className="text-muted-foreground mt-2">
              Configuration et administration
            </p>
          </div>
          <EmptyState
            title="Bientôt disponible"
            description="Cette section sera disponible dans une prochaine version."
            icon={<Settings size={48} className="opacity-50" />}
          />
        </div>
      </AppLayout>
    </AdminOnly>
  );
}
