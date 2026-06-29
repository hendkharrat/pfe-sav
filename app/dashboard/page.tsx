'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { AlertCircle, TrendingUp, Users, Wrench, CheckCircle, Clock } from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { ROLES } from '@/lib/constants';
import { getClientIdForUser } from '@/lib/interventions';
import { formatDate, getClientDisplayName } from '@/lib/utils';
import type { Client, Contract, Intervention } from '@/types';

type DashboardStats = {
  totalInterventions: number;
  pendingInterventions: number;
  completedInterventions: number;
  urgentInterventions: number;
  activeContracts: number;
  expiredContracts: number;
  totalClients: number;
  totalEquipment: number;
  monthlyRevenue: number;
  overdueInvoices: number;
};

const ZERO_STATS: DashboardStats = {
  totalInterventions: 0,
  pendingInterventions: 0,
  completedInterventions: 0,
  urgentInterventions: 0,
  activeContracts: 0,
  expiredContracts: 0,
  totalClients: 0,
  totalEquipment: 0,
  monthlyRevenue: 0,
  overdueInvoices: 0,
};

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { showError } = useToast();

  const [stats, setStats] = useState<DashboardStats>(ZERO_STATS);
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [isDashboardLoading, setIsDashboardLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    setIsDashboardLoading(true);

    const load = async () => {
      try {
        if (user.role === 'admin') {
          const [statsData, ivs, cts, cls] = await Promise.all([
            fetch('/api/dashboard?role=admin').then((r) => r.json()),
            fetch('/api/interventions').then((r) => r.json()),
            fetch('/api/contracts').then((r) => r.json()),
            fetch('/api/clients').then((r) => r.json()),
          ]);
          if (statsData && !statsData.error) setStats(statsData);
          if (Array.isArray(ivs)) setInterventions(ivs);
          if (Array.isArray(cts)) setContracts(cts);
          if (Array.isArray(cls)) setClients(cls);
        } else if (user.role === 'technician') {
          const [statsData, ivs, cls] = await Promise.all([
            fetch(`/api/dashboard?role=technician&userId=${user.id}`).then((r) => r.json()),
            fetch('/api/interventions').then((r) => r.json()),
            fetch('/api/clients').then((r) => r.json()),
          ]);
          if (statsData && !statsData.error) setStats(statsData);
          if (Array.isArray(ivs)) setInterventions(ivs);
          if (Array.isArray(cls)) setClients(cls);
        } else {
          const clientId = getClientIdForUser(user);
          const [statsData, ivs, cts] = await Promise.all([
            fetch(`/api/dashboard?role=client&clientId=${clientId}`).then((r) => r.json()),
            fetch('/api/interventions').then((r) => r.json()),
            fetch('/api/contracts').then((r) => r.json()),
          ]);
          if (statsData && !statsData.error) setStats(statsData);
          if (Array.isArray(ivs)) setInterventions(ivs);
          if (Array.isArray(cts)) setContracts(cts);
        }
      } catch {
        showError('Erreur lors du chargement du tableau de bord.');
      } finally {
        setIsDashboardLoading(false);
      }
    };

    load();
  }, [user?.role, user?.id, showError]);

  const getClientName = useCallback(
    (clientId: number): string => {
      const c = clients.find((cl) => cl.id === clientId);
      return c ? getClientDisplayName(c) : String(clientId);
    },
    [clients]
  );

  const today = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Admin: interventions that are active or overdue
  const activeOverdueList = useMemo(
    () =>
      interventions
        .filter(
          (i) =>
            i.statut === 'EN_COURS' ||
            (i.statut === 'PLANIFIEE' && i.datePrevue < today)
        )
        .slice(0, 3),
    [interventions, today]
  );

  // Technician: own recent interventions
  const techInterventions = useMemo(
    () =>
      user?.role === 'technician'
        ? interventions.filter((i) => i.technicienId === user.id).slice(0, 3)
        : [],
    [user?.role, user?.id, interventions]
  );

  // Client: own data
  const myClientId = useMemo(
    () => (user?.role === 'client' ? getClientIdForUser(user) : null),
    [user]
  );

  const myContracts = useMemo(
    () =>
      myClientId
        ? contracts
            .filter((c) => c.clientId === myClientId && c.statut === 'ACTIF')
            .slice(0, 2)
        : [],
    [myClientId, contracts]
  );

  const myInterventions = useMemo(
    () =>
      myClientId
        ? interventions.filter((i) => i.clientId === myClientId).slice(0, 2)
        : [],
    [myClientId, interventions]
  );

  if (authLoading || !user) {
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

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {user.role === 'client' ? 'Mon espace' : 'Tableau de bord'}
          </h1>
          <p className="text-muted-foreground mt-2">
            Bienvenue, {user.prenom}&nbsp;!
          </p>
        </div>

        {isDashboardLoading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Admin Dashboard */}
            {user.role === ROLES.ADMIN && (
              <div className="space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard
                    title="Interventions totales"
                    value={stats.totalInterventions}
                    icon={<CheckCircle size={20} />}
                    description="ce mois"
                  />
                  <StatCard
                    title="Interventions en attente"
                    value={stats.pendingInterventions}
                    icon={<Clock size={20} />}
                    description="à planifier"
                  />
                  <StatCard
                    title="Clients actifs"
                    value={stats.totalClients}
                    icon={<Users size={20} />}
                    description="dans la base"
                  />
                  <StatCard
                    title="Équipements"
                    value={stats.totalEquipment}
                    icon={<Wrench size={20} />}
                    description="en gestion"
                  />
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <AlertCircle size={20} className="text-amber-500" />
                        Interventions en cours / en retard
                      </CardTitle>
                      <CardDescription>
                        En cours ou planifiées et dépassées
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {activeOverdueList.length > 0 ? (
                        <div className="space-y-2">
                          {activeOverdueList.map((intervention) => (
                            <div key={intervention.id} className="flex items-center justify-between p-2 bg-amber-50 rounded-lg">
                              <div>
                                <p className="font-medium text-sm">{intervention.reference}</p>
                                <p className="text-xs text-muted-foreground">
                                  {getClientName(intervention.clientId)}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {formatDate(intervention.datePrevue)}
                                </p>
                              </div>
                              <StatusBadge status={intervention.statut} type="intervention" />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <EmptyState title="Aucune intervention en retard" />
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp size={20} className="text-blue-500" />
                        Contrats expirés
                      </CardTitle>
                      <CardDescription>
                        {stats.expiredContracts} contrats à renouveler
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {stats.expiredContracts > 0 ? (
                        <div className="space-y-2">
                          {contracts
                            .filter((c) => c.statut === 'EXPIRE')
                            .slice(0, 3)
                            .map((contract) => (
                              <div key={contract.id} className="flex items-center justify-between p-2 bg-orange-50 rounded-lg">
                                <div>
                                  <p className="font-medium text-sm">{contract.reference}</p>
                                  <p className="text-xs text-muted-foreground">Fin : {formatDate(contract.dateFin)}</p>
                                </div>
                                <StatusBadge status={contract.statut} type="contract" />
                              </div>
                            ))}
                        </div>
                      ) : (
                        <EmptyState title="Tous les contrats sont à jour" />
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Additional Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Chiffre d&apos;affaires</CardTitle>
                      <CardDescription>Revenus du mois en cours</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-primary">
                        {stats.monthlyRevenue.toLocaleString('fr-FR')} TND
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Factures impayées</CardTitle>
                      <CardDescription>En attente de paiement</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-red-600">
                        {stats.overdueInvoices}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Technician Dashboard */}
            {user.role === ROLES.TECHNICIAN && (
              <div className="space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <StatCard
                    title="Interventions assignées"
                    value={stats.totalInterventions}
                    icon={<CheckCircle size={20} />}
                  />
                  <StatCard
                    title="En cours aujourd&apos;hui"
                    value={stats.pendingInterventions}
                    icon={<Clock size={20} />}
                  />
                  <StatCard
                    title="Complétées ce mois"
                    value={stats.completedInterventions}
                    icon={<TrendingUp size={20} />}
                  />
                </div>

                {/* My Interventions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Mes interventions récentes</CardTitle>
                    <CardDescription>Vos tâches planifiées et en cours</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {techInterventions.length > 0 ? (
                      <div className="space-y-3">
                        {techInterventions.map((intervention) => (
                          <div
                            key={intervention.id}
                            className="flex items-start justify-between p-3 border border-border rounded-lg"
                          >
                            <div>
                              <p className="font-medium text-sm">{intervention.reference}</p>
                              <p className="text-sm text-muted-foreground mt-0.5">{intervention.description}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {getClientName(intervention.clientId)} — {formatDate(intervention.datePrevue)}
                              </p>
                            </div>
                            <div className="flex flex-col gap-1.5 items-end shrink-0">
                              <StatusBadge status={intervention.statut} type="intervention" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <EmptyState
                        title="Aucune intervention assignée"
                        description="Aucune intervention ne vous est actuellement assignée."
                      />
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Client Dashboard */}
            {user.role === ROLES.CLIENT && (
              <div className="space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <StatCard
                    title="Contrats actifs"
                    value={stats.activeContracts}
                    icon={<CheckCircle size={20} />}
                  />
                  <StatCard
                    title="Interventions en attente"
                    value={stats.pendingInterventions}
                    icon={<Clock size={20} />}
                  />
                </div>

                {/* My Services */}
                <Card>
                  <CardHeader>
                    <CardTitle>Mes services</CardTitle>
                    <CardDescription>Contrats actifs et dernières interventions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-medium text-sm mb-3 text-muted-foreground uppercase tracking-wide">
                          Contrats en cours
                        </h4>
                        {myContracts.length > 0 ? (
                          <div className="space-y-2">
                            {myContracts.map((contract) => (
                              <div
                                key={contract.id}
                                className="flex items-center justify-between p-3 border border-border rounded-lg"
                              >
                                <div>
                                  <p className="text-sm font-medium">{contract.reference}</p>
                                  <p className="text-xs text-muted-foreground">
                                    Valide jusqu&apos;au {formatDate(contract.dateFin)}
                                  </p>
                                </div>
                                <StatusBadge status={contract.statut} type="contract" />
                              </div>
                            ))}
                          </div>
                        ) : (
                          <EmptyState title="Aucun contrat actif" />
                        )}
                      </div>

                      <div>
                        <h4 className="font-medium text-sm mb-3 text-muted-foreground uppercase tracking-wide">
                          Dernières interventions
                        </h4>
                        {myInterventions.length > 0 ? (
                          <div className="space-y-2">
                            {myInterventions.map((intervention) => (
                              <div
                                key={intervention.id}
                                className="flex items-center justify-between p-3 border border-border rounded-lg"
                              >
                                <div>
                                  <p className="text-sm font-medium">{intervention.reference}</p>
                                  <p className="text-xs text-muted-foreground">{formatDate(intervention.datePrevue)}</p>
                                </div>
                                <StatusBadge status={intervention.statut} type="intervention" />
                              </div>
                            ))}
                          </div>
                        ) : (
                          <EmptyState title="Aucune intervention trouvée" />
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}
