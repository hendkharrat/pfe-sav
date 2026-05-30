'use client';

import { useState, useCallback, useMemo } from 'react';
import { Intervention } from '@/types';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { PriorityBadge } from '@/components/shared/PriorityBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { HistoryInterventionDetail } from '@/components/shared/HistoryInterventionDetail';
import { StatCard } from '@/components/dashboard/StatCard';
import { mockInterventions } from '@/data/mock-interventions';
import { mockClients } from '@/data/mock-clients';
import { mockEquipments } from '@/data/mock-equipments';
import { mockUsers } from '@/data/mock-users';
import { getClientIdForUser, getTechnicianName, isDateInRange } from '@/lib/interventions';
import { formatDate } from '@/lib/utils';
import {
  INTERVENTION_TYPE_LABELS,
  INTERVENTION_PRIORITY_LABELS,
  INTERVENTION_STATUS_LABELS,
} from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Search,
  Filter,
  Eye,
  Download,
  History,
  Clock,
  CheckCircle2,
  XCircle,
  Wrench,
  ShieldCheck,
} from 'lucide-react';

// ─── helpers ────────────────────────────────────────────────────────────────

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} h`;
  return `${h} h ${m} min`;
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function HistoriquePage() {
  const { user: currentUser, isLoading } = useAuth();
  const { showSuccess } = useToast();

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statutFilter, setStatutFilter] = useState('all');
  const [prioriteFilter, setPrioriteFilter] = useState('all');
  const [clientFilter, setClientFilter] = useState('all');
  const [techFilter, setTechFilter] = useState('all');
  const [equipFilter, setEquipFilter] = useState('all');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');

  // Detail sheet
  const [selectedIntervention, setSelectedIntervention] = useState<Intervention | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Client ID for the logged-in client user
  const clientId = useMemo(() => {
    if (!currentUser || currentUser.role !== 'client') return null;
    return getClientIdForUser(currentUser);
  }, [currentUser]);

  // Helper lookups (stable references — mock data never changes)
  const getClientName = useCallback(
    (id: string): string => mockClients.find((c) => c.id === id)?.societe ?? 'N/A',
    []
  );

  const getEquipmentLabel = useCallback((id: string): string => {
    const eq = mockEquipments.find((e) => e.id === id);
    return eq ? `${eq.reference} — ${eq.marque} ${eq.modele}` : 'N/A';
  }, []);

  // ─── Base historical list (role-scoped, no UI filters) ────────────────────

  const historicInterventions = useMemo<Intervention[]>(() => {
    if (!currentUser) return [];

    const all = mockInterventions.filter(
      (i) => i.statut === 'REALISEE' || i.statut === 'ANNULEE'
    );

    if (currentUser.role === 'admin') return all;
    if (currentUser.role === 'technician') {
      return all.filter((i) => i.technicienId === currentUser.id);
    }
    // client
    if (!clientId) return [];
    return all.filter((i) => i.clientId === clientId);
  }, [currentUser, clientId]);

  // ─── Stats (from base list, unaffected by UI filters) ────────────────────

  const stats = useMemo(() => {
    const realisees = historicInterventions.filter((i) => i.statut === 'REALISEE');
    const annulees = historicInterventions.filter((i) => i.statut === 'ANNULEE');
    const dureeTotale = realisees.reduce((sum, i) => sum + (i.dureeMinutes ?? 0), 0);
    return {
      total: historicInterventions.length,
      preventivesRealisees: realisees.filter((i) => i.type === 'PREVENTIVE').length,
      curativesRealisees: realisees.filter((i) => i.type === 'CURATIVE').length,
      annulees: annulees.length,
      dureeTotale,
    };
  }, [historicInterventions]);

  // ─── Dropdown option sets (derived from base list for relevance) ──────────

  const availableClients = useMemo(() => {
    const ids = new Set(historicInterventions.map((i) => i.clientId));
    return mockClients.filter((c) => ids.has(c.id));
  }, [historicInterventions]);

  const availableTechnicians = useMemo(() => {
    const ids = new Set(
      historicInterventions
        .map((i) => i.technicienId)
        .filter((id): id is string => id != null)
    );
    return mockUsers.filter((u) => u.role === 'technician' && ids.has(u.id));
  }, [historicInterventions]);

  const availableEquipments = useMemo(() => {
    const ids = new Set(historicInterventions.map((i) => i.equipementId));
    return mockEquipments.filter((e) => ids.has(e.id));
  }, [historicInterventions]);

  // ─── Filtered + sorted table rows ─────────────────────────────────────────

  const filteredInterventions = useMemo<Intervention[]>(() => {
    let list = historicInterventions;

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      list = list.filter((i) => {
        const clientName = getClientName(i.clientId).toLowerCase();
        const eqLabel = getEquipmentLabel(i.equipementId).toLowerCase();
        const techName = getTechnicianName(i.technicienId).toLowerCase();
        return (
          i.reference.toLowerCase().includes(term) ||
          clientName.includes(term) ||
          eqLabel.includes(term) ||
          techName.includes(term) ||
          i.description.toLowerCase().includes(term) ||
          (i.diagnostic?.toLowerCase().includes(term) ?? false)
        );
      });
    }

    if (typeFilter !== 'all') list = list.filter((i) => i.type === typeFilter);
    if (statutFilter !== 'all') list = list.filter((i) => i.statut === statutFilter);
    if (prioriteFilter !== 'all') list = list.filter((i) => i.priorite === prioriteFilter);
    if (clientFilter !== 'all') list = list.filter((i) => i.clientId === clientFilter);
    if (techFilter !== 'all') list = list.filter((i) => i.technicienId === techFilter);
    if (equipFilter !== 'all') list = list.filter((i) => i.equipementId === equipFilter);

    if (dateDebut || dateFin) {
      list = list.filter((i) => {
        const refDate = i.dateRealisation ?? i.datePrevue;
        return isDateInRange(refDate, dateDebut || undefined, dateFin || undefined);
      });
    }

    return [...list].sort((a, b) => {
      const dateA = a.dateRealisation ?? a.datePrevue;
      const dateB = b.dateRealisation ?? b.datePrevue;
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    });
  }, [
    historicInterventions,
    searchTerm,
    typeFilter,
    statutFilter,
    prioriteFilter,
    clientFilter,
    techFilter,
    equipFilter,
    dateDebut,
    dateFin,
    getClientName,
    getEquipmentLabel,
  ]);

  // ─── Actions ──────────────────────────────────────────────────────────────

  const handleViewDetail = useCallback((intervention: Intervention) => {
    setSelectedIntervention(intervention);
    setIsDetailOpen(true);
  }, []);

  const handleExportCSV = useCallback(() => {
    const headers = [
      'Référence',
      'Type',
      'Client',
      'Équipement',
      'Technicien',
      'Date prévue',
      'Date réalisation',
      'Priorité',
      'Statut',
      'Couverture contrat',
      'Durée (min)',
      'Description',
    ];

    const rows = filteredInterventions.map((i) => [
      i.reference,
      INTERVENTION_TYPE_LABELS[i.type] ?? i.type,
      getClientName(i.clientId),
      getEquipmentLabel(i.equipementId),
      getTechnicianName(i.technicienId),
      i.datePrevue,
      i.dateRealisation ?? '',
      INTERVENTION_PRIORITY_LABELS[i.priorite] ?? i.priorite,
      INTERVENTION_STATUS_LABELS[i.statut] ?? i.statut,
      i.couvertureContrat ? 'Oui' : 'Non',
      i.dureeMinutes != null ? String(i.dureeMinutes) : '',
      i.description,
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(','))
      .join('\n');

    showSuccess('Export CSV simulé avec succès.');
  }, [filteredInterventions, getClientName, getEquipmentLabel, showSuccess]);

  // ─── Role title ───────────────────────────────────────────────────────────

  const pageTitle = useMemo(() => {
    if (!currentUser) return 'Historique';
    if (currentUser.role === 'admin') return 'Historique des interventions';
    if (currentUser.role === 'technician') return 'Mon historique';
    return 'Historique de mes interventions';
  }, [currentUser]);

  const isAdmin = currentUser?.role === 'admin';

  // ─── Loading ──────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 mb-4">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-muted-foreground">Chargement de l&apos;historique...</p>
        </div>
      </div>
    );
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <AppLayout>
      <div className="space-y-8">

        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight flex items-center gap-2">
              <History size={28} className="text-primary" />
              {pageTitle}
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Interventions terminées (réalisées ou annulées).
            </p>
          </div>
          <Button
            variant="outline"
            className="gap-2 shrink-0"
            onClick={handleExportCSV}
            disabled={filteredInterventions.length === 0}
          >
            <Download size={16} />
            Exporter CSV
          </Button>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            title="Total historique"
            value={stats.total}
            description="Interventions terminées"
            icon={<History size={20} />}
          />
          <StatCard
            title="Préventives réalisées"
            value={stats.preventivesRealisees}
            description="Interventions préventives"
            icon={<ShieldCheck size={20} />}
          />
          <StatCard
            title="Curatives réalisées"
            value={stats.curativesRealisees}
            description="Interventions curatives"
            icon={<Wrench size={20} />}
          />
          <StatCard
            title="Annulées"
            value={stats.annulees}
            description="Interventions annulées"
            icon={<XCircle size={20} />}
          />
          <StatCard
            title="Durée totale"
            value={stats.dureeTotale > 0 ? formatDuration(stats.dureeTotale) : '—'}
            description="Temps cumulé (réalisées)"
            icon={<Clock size={20} />}
          />
        </div>

        {/* Filter bar */}
        <div className="p-4 bg-muted/30 border border-border rounded-xl space-y-4 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Filter size={16} className="text-primary" />
            Filtres &amp; Recherche
          </div>

          {/* Row 1: search + type + statut + priorité */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div className="relative md:col-span-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Référence, client, équipement, technicien..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="PREVENTIVE">Préventive</SelectItem>
                <SelectItem value="CURATIVE">Curative</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statutFilter} onValueChange={setStatutFilter}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="REALISEE">Réalisée</SelectItem>
                <SelectItem value="ANNULEE">Annulée</SelectItem>
              </SelectContent>
            </Select>

            <Select value={prioriteFilter} onValueChange={setPrioriteFilter}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="Priorité" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes priorités</SelectItem>
                <SelectItem value="FAIBLE">Faible</SelectItem>
                <SelectItem value="MOYENNE">Moyenne</SelectItem>
                <SelectItem value="ELEVEE">Élevée</SelectItem>
                <SelectItem value="URGENTE">Urgente</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Row 2: admin filters + equipment + dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
            {isAdmin && (
              <Select value={clientFilter} onValueChange={setClientFilter}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Tous les clients" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les clients</SelectItem>
                  {availableClients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.societe}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {isAdmin && (
              <Select value={techFilter} onValueChange={setTechFilter}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Tous les techniciens" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les techniciens</SelectItem>
                  {availableTechnicians.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.prenom} {u.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <Select value={equipFilter} onValueChange={setEquipFilter}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="Tous les équipements" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les équipements</SelectItem>
                {availableEquipments.map((e) => (
                  <SelectItem key={e.id} value={e.id}>
                    {e.reference} — {e.marque} {e.modele}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
              <Input
                type="date"
                value={dateDebut}
                onChange={(e) => setDateDebut(e.target.value)}
                className="h-9 text-xs"
                title="Date début"
              />
            </div>

            <div className="flex items-center gap-2">
              <Input
                type="date"
                value={dateFin}
                onChange={(e) => setDateFin(e.target.value)}
                className="h-9 text-xs"
                title="Date fin"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        {filteredInterventions.length === 0 ? (
          <EmptyState
            title="Aucune intervention historique trouvée."
            description="Modifiez vos critères de recherche ou de filtre pour afficher des résultats."
            icon={<History size={48} className="opacity-40" />}
          />
        ) : (
          <div className="border border-border rounded-xl overflow-hidden shadow-sm bg-card">
            <div className="overflow-x-auto">
              <Table className="min-w-[1100px]">
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead className="font-semibold w-[120px]">Référence</TableHead>
                    <TableHead className="font-semibold w-[100px]">Type</TableHead>
                    {isAdmin && (
                      <TableHead className="font-semibold min-w-[140px]">Client</TableHead>
                    )}
                    <TableHead className="font-semibold min-w-[140px]">Équipement</TableHead>
                    <TableHead className="font-semibold min-w-[130px]">Technicien</TableHead>
                    <TableHead className="font-semibold w-[100px]">Date prévue</TableHead>
                    <TableHead className="font-semibold w-[110px]">Date réalisation</TableHead>
                    <TableHead className="font-semibold w-[90px] text-center">Priorité</TableHead>
                    <TableHead className="font-semibold w-[100px] text-center">Statut</TableHead>
                    <TableHead className="font-semibold w-[100px] text-center">Couverture</TableHead>
                    <TableHead className="font-semibold text-right w-[80px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInterventions.map((intervention) => (
                    <TableRow
                      key={intervention.id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <TableCell className="font-mono font-bold text-xs text-primary">
                        {intervention.reference}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs whitespace-nowrap">
                          {INTERVENTION_TYPE_LABELS[intervention.type] ?? intervention.type}
                        </Badge>
                      </TableCell>
                      {isAdmin && (
                        <TableCell className="text-xs font-semibold">
                          {getClientName(intervention.clientId)}
                        </TableCell>
                      )}
                      <TableCell className="text-xs text-muted-foreground">
                        {getEquipmentLabel(intervention.equipementId)}
                      </TableCell>
                      <TableCell className="text-xs">
                        {getTechnicianName(intervention.technicienId)}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {formatDate(intervention.datePrevue)}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {intervention.dateRealisation ? formatDate(intervention.dateRealisation) : '—'}
                      </TableCell>
                      <TableCell className="text-center">
                        <PriorityBadge priority={intervention.priorite} />
                      </TableCell>
                      <TableCell className="text-center">
                        <StatusBadge status={intervention.statut} type="intervention" />
                      </TableCell>
                      <TableCell className="text-center">
                        {intervention.couvertureContrat ? (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                            <CheckCircle2 size={11} />
                            Contrat
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
                            Hors contrat
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          title="Voir détail"
                          onClick={() => handleViewDetail(intervention)}
                        >
                          <Eye size={14} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {filteredInterventions.length > 0 && (
          <p className="text-sm text-muted-foreground">
            Affichage de {filteredInterventions.length} intervention
            {filteredInterventions.length !== 1 ? 's' : ''} sur {historicInterventions.length} au total.
          </p>
        )}
      </div>

      {/* Detail sheet */}
      <HistoryInterventionDetail
        open={isDetailOpen}
        intervention={selectedIntervention}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedIntervention(null);
        }}
      />
    </AppLayout>
  );
}
