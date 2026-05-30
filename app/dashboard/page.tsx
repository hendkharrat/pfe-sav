'use client';

import { AlertCircle, TrendingUp, Users, Wrench, CheckCircle, Clock } from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/hooks/useAuth';
import { mockAdminStats, mockTechnicianStats, mockClientStats } from '@/data/mock-stats';
import { mockInterventions } from '@/data/mock-interventions';
import { mockContracts } from '@/data/mock-contracts';
import { mockClients } from '@/data/mock-clients';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { PriorityBadge } from '@/components/shared/PriorityBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { ROLES } from '@/lib/constants';
import { getClientIdForUser } from '@/lib/interventions';
import { formatDate } from '@/lib/utils';

export default function DashboardPage() {
  const { user } = useAuth();

  if (!user) return null;

  const stats = {
    admin: mockAdminStats,
    technician: mockTechnicianStats,
    client: mockClientStats,
  }[user.role];

  // Helpers
  const getClientName = (clientId: string): string =>
    mockClients.find((c) => c.id === clientId)?.societe ?? clientId;

  // Technician: only own interventions
  const techInterventions = user.role === 'technician'
    ? mockInterventions.filter((i) => i.technicienId === user.id).slice(0, 3)
    : [];

  // Client: only own data
  const myClientId = user.role === 'client' ? getClientIdForUser(user) : null;
  const myContracts = myClientId
    ? mockContracts.filter((c) => c.clientId === myClientId && c.statut === 'ACTIF').slice(0, 2)
    : [];
  const myInterventions = myClientId
    ? mockInterventions.filter((i) => i.clientId === myClientId).slice(0, 2)
    : [];

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
                    <AlertCircle size={20} className="text-red-500" />
                    Interventions urgentes
                  </CardTitle>
                  <CardDescription>
                    {stats.urgentInterventions} à traiter en priorité
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {stats.urgentInterventions > 0 ? (
                    <div className="space-y-2">
                      {mockInterventions
                        .filter((i) => i.priorite === 'URGENTE' && i.statut !== 'REALISEE' && i.statut !== 'ANNULEE')
                        .slice(0, 3)
                        .map((intervention) => (
                          <div key={intervention.id} className="flex items-center justify-between p-2 bg-red-50 rounded-lg">
                            <div>
                              <p className="font-medium text-sm">{intervention.reference}</p>
                              <p className="text-xs text-muted-foreground">
                                {getClientName(intervention.clientId)}
                              </p>
                            </div>
                            <PriorityBadge priority={intervention.priorite} />
                          </div>
                        ))}
                    </div>
                  ) : (
                    <EmptyState title="Aucune intervention urgente" />
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
                      {mockContracts
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
                          <PriorityBadge priority={intervention.priorite} />
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
      </div>
    </AppLayout>
  );
}
