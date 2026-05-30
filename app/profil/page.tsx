'use client';

import { User, Mail, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/hooks/useAuth';
import { RoleBadge } from '@/components/shared/RoleBadge';

export default function ProfilePage() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Mon profil
          </h1>
          <p className="text-muted-foreground mt-2">
            Informations personnelles et rôle
          </p>
        </div>

        {/* Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle>Profil utilisateur</CardTitle>
            <CardDescription>
              Vos informations de compte
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar & Name */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-primary">
                  {user.prenom[0]}{user.nom[0]}
                </span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">
                  {user.prenom} {user.nom}
                </h2>
                <div className="mt-2">
                  <RoleBadge role={user.role} />
                </div>
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-border">
              {/* Email */}
              <div className="flex items-start gap-3">
                <Mail size={20} className="text-primary mt-1 flex-shrink-0" />
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Adresse e-mail
                  </label>
                  <p className="text-foreground mt-1">{user.email}</p>
                </div>
              </div>

              {/* Role */}
              <div className="flex items-start gap-3">
                <User size={20} className="text-primary mt-1 flex-shrink-0" />
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Rôle
                  </label>
                  <p className="text-foreground mt-1 capitalize">
                    {user.role === 'admin'
                      ? 'Administrateur'
                      : user.role === 'technician'
                        ? 'Technicien'
                        : 'Client'}
                  </p>
                </div>
              </div>

              {/* Creation Date */}
              <div className="flex items-start gap-3">
                <Calendar size={20} className="text-primary mt-1 flex-shrink-0" />
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Membre depuis
                  </label>
                  <p className="text-foreground mt-1">
                    {new Date(user.dateCreation).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Role Description */}
        <Card>
          <CardHeader>
            <CardTitle>À propos de votre rôle</CardTitle>
          </CardHeader>
          <CardContent>
            {user.role === 'admin' && (
              <div className="space-y-3">
                <p className="text-foreground">
                  En tant qu&apos;administrateur, vous avez accès à :
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex gap-2">
                    <span className="text-primary">•</span>
                    <span>Gestion complète des clients et équipements</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary">•</span>
                    <span>Suivi des interventions et contrats</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary">•</span>
                    <span>Gestion des factures et états financiers</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary">•</span>
                    <span>Accès aux paramètres système</span>
                  </li>
                </ul>
              </div>
            )}
            {user.role === 'technician' && (
              <div className="space-y-3">
                <p className="text-foreground">
                  En tant que technicien, vous pouvez :
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex gap-2">
                    <span className="text-primary">•</span>
                    <span>Consulter vos interventions assignées</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary">•</span>
                    <span>Voir les détails des clients</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary">•</span>
                    <span>Accéder aux équipements à maintenir</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary">•</span>
                    <span>Mettre à jour le statut des interventions</span>
                  </li>
                </ul>
              </div>
            )}
            {user.role === 'client' && (
              <div className="space-y-3">
                <p className="text-foreground">
                  En tant que client, vous pouvez :
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex gap-2">
                    <span className="text-primary">•</span>
                    <span>Consulter vos contrats actifs</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary">•</span>
                    <span>Voir l&apos;historique de vos interventions</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary">•</span>
                    <span>Accéder à vos équipements enregistrés</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary">•</span>
                    <span>Télécharger vos factures</span>
                  </li>
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
