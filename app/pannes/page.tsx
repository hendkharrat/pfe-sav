'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Client,
  ClientEquipement,
  Contract,
  Equipment,
  Intervention,
  Panne,
  PieceJointe,
  PanneStatut,
  User,
} from '@/types';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
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
  Check,
  XCircle,
  AlertTriangle,
  ArrowRight,
  ClipboardCheck,
  Plus,
  Wrench,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  getClientIdForUser,
} from '@/lib/interventions';
import { formatDate, getClientDisplayName } from '@/lib/utils';
import { PanneForm } from '@/components/forms/PanneForm';
import { PanneDetail } from '@/components/shared/PanneDetail';
import { CreateCurativeFromPanneDialog } from '@/components/shared/CreateCurativeFromPanneDialog';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { SortableHeader } from '@/components/shared/SortableHeader';
import { TablePagination } from '@/components/shared/TablePagination';
import { type SortConfig, sortData, paginateData, toggleSort } from '@/lib/table';

export default function PannesPage() {
  const router = useRouter();
  const { user: currentUser, isLoading } = useAuth();
  const { showSuccess, showError } = useToast();

  const [pannes, setPannes] = useState<Panne[]>([]);
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [clientEquipements, setClientEquipements] = useState<ClientEquipement[]>([]);
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [clientFilter, setClientFilter] = useState<number | 'all'>('all');

  const [selectedPanne, setSelectedPanne] = useState<Panne | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const [panneToConvert, setPanneToConvert] = useState<Panne | null>(null);
  const [isConvertOpen, setIsConvertOpen] = useState(false);

  const [panneToCancel, setPanneToCancel] = useState<Panne | null>(null);
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);

  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    Promise.all([
      fetch('/api/pannes').then((r) => r.json()),
      fetch('/api/interventions').then((r) => r.json()),
      fetch('/api/clients').then((r) => r.json()),
      fetch('/api/client-equipements').then((r) => r.json()),
      fetch('/api/equipements').then((r) => r.json()),
      fetch('/api/contracts').then((r) => r.json()),
      fetch('/api/users').then((r) => r.json()),
    ])
      .then(([pns, ivs, cls, ces, eqs, cts, us]) => {
        if (Array.isArray(pns)) setPannes(pns);
        if (Array.isArray(ivs)) setInterventions(ivs);
        if (Array.isArray(cls)) setClients(cls);
        if (Array.isArray(ces)) setClientEquipements(ces);
        if (Array.isArray(eqs)) setEquipments(eqs);
        if (Array.isArray(cts)) setContracts(cts);
        if (Array.isArray(us)) setUsers(us);
      })
      .catch(() => showError('Erreur lors du chargement des données.'));
  }, [showError]);

  // Client context: resolve clientId + their CE records
  const clientInfo = useMemo((): { clientId: number | null; clientEquipements: ClientEquipement[] } => {
    if (!currentUser || currentUser.role !== 'client') {
      return { clientId: null, clientEquipements: [] };
    }
    const clientId = getClientIdForUser(currentUser);
    const clientCEs = clientEquipements.filter((ce) => ce.clientId === clientId);
    return { clientId, clientEquipements: clientCEs };
  }, [currentUser, clientEquipements]);

  const clientHasPannes = useMemo(() => {
    if (!currentUser || currentUser.role !== 'client') return true;
    const cid = clientInfo.clientId;
    if (!cid) return false;
    return pannes.some((p) => p.clientId === cid);
  }, [pannes, currentUser, clientInfo.clientId]);

  const getClientName = useCallback(
    (clientId: number): string => {
      const c = clients.find((cl) => cl.id === clientId);
      return c ? getClientDisplayName(c) : 'N/A';
    },
    [clients]
  );

  const getEquipmentName = useCallback((equipementId: number): string => {
    if (!equipementId) return 'N/A';
    const eq = equipments.find((e) => e.id === equipementId);
    return eq ? `${eq.reference} (${eq.marque} ${eq.modele})` : 'N/A';
  }, [equipments]);

  const filteredPannes = useMemo(() => {
    if (!currentUser) return [];
    let list = pannes;

    if (currentUser.role === 'client') {
      const clientId = clientInfo.clientId;
      if (!clientId) return [];
      list = list.filter((p) => p.clientId === clientId);
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      list = list.filter((p) => {
        const clientName = getClientName(p.clientId).toLowerCase();
        const eqName = getEquipmentName(p.equipementId).toLowerCase();
        return (
          p.reference.toLowerCase().includes(term) ||
          p.description.toLowerCase().includes(term) ||
          clientName.includes(term) ||
          eqName.includes(term)
        );
      });
    }

    if (statusFilter !== 'all') list = list.filter((p) => p.statut === statusFilter);
    if (currentUser.role === 'admin' && clientFilter !== 'all') {
      list = list.filter((p) => p.clientId === clientFilter);
    }

    return [...list].sort((a, b) => b.id - a.id);
  }, [pannes, currentUser, clientInfo.clientId, searchTerm, statusFilter, clientFilter, getClientName, getEquipmentName]);

  useEffect(() => { setPage(1); }, [searchTerm, statusFilter, clientFilter]);

  const handleSort = useCallback((key: string) => {
    setSortConfig((prev) => toggleSort(prev, key));
  }, []);

  const sortedPannes = useMemo(() => {
    if (!sortConfig) return filteredPannes;
    return sortData(filteredPannes, sortConfig, (panne, key) => {
      switch (key) {
        case 'reference': return panne.reference;
        case 'date': return panne.dateDeclaration;
        case 'client': { const cl = clients.find((c) => c.id === panne.clientId); return cl ? getClientDisplayName(cl) : ''; }
        case 'equipment': return equipments.find((e) => e.id === panne.equipementId)?.reference ?? '';
        case 'statut': return panne.statut;
        default: return '';
      }
    });
  }, [filteredPannes, sortConfig, clients, equipments]);

  const pagedPannes = useMemo(
    () => paginateData(sortedPannes, page, 10),
    [sortedPannes, page]
  );

  // Client: submit new panne declaration
  const handleClientSubmit = useCallback(
    async (formData: {
      clientEquipementId: string;
      equipementId: string;
      description: string;
      piecesJointes: PieceJointe[];
    }) => {
      const clientId = clientInfo.clientId;
      if (!clientId) {
        showError("Impossible d'associer la panne à un client valide.");
        return;
      }
      setIsSubmitting(true);
      try {
        const res = await fetch('/api/pannes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clientId,
            clientEquipementId: formData.clientEquipementId,
            description: formData.description,
            piecesJointes: formData.piecesJointes.map((pj) => ({
              filename: pj.filename,
              url: pj.previewUrl ?? '',
              size: pj.size,
              mimeType: pj.type,
            })),
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          showError(data.error ?? 'Erreur lors de la déclaration de la panne.');
          return;
        }
        setPannes((prev) => [data, ...prev]);
        setIsCreateOpen(false);
        showSuccess('Votre déclaration a été enregistrée.');
      } catch {
        showError('Erreur lors de la déclaration de la panne.');
      } finally {
        setIsSubmitting(false);
      }
    },
    [clientInfo.clientId, showError, showSuccess]
  );

  // Admin: mark panne as "prise en charge"
  const handlePrendreEnCharge = useCallback(
    async (panneId: number) => {
      setIsSubmitting(true);
      try {
        const res = await fetch(`/api/pannes/${panneId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ statut: 'PRISE_EN_CHARGE' }),
        });
        const data = await res.json();
        if (!res.ok) {
          showError(data.error ?? 'Erreur lors de la mise en charge de la panne.');
          return;
        }
        setPannes((prev) => prev.map((p) => (p.id === panneId ? data : p)));
        showSuccess('La panne a été prise en charge avec succès.');
      } catch {
        showError('Erreur lors de la mise en charge de la panne.');
      } finally {
        setIsSubmitting(false);
      }
    },
    [showSuccess, showError]
  );

  // Admin: confirm cancellation
  const handleCancelPanne = useCallback(async () => {
    if (!panneToCancel) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/pannes/${panneToCancel.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ statut: 'ANNULEE' }),
      });
      const data = await res.json();
      if (!res.ok) {
        showError(data.error ?? "Erreur lors de l'annulation de la panne.");
        return;
      }
      setPannes((prev) => prev.map((p) => (p.id === panneToCancel.id ? data : p)));
      setIsCancelConfirmOpen(false);
      setPanneToCancel(null);
      showSuccess('La déclaration de panne a été annulée.');
    } catch {
      showError("Erreur lors de l'annulation de la panne.");
    } finally {
      setIsSubmitting(false);
    }
  }, [panneToCancel, showSuccess, showError]);

  // Admin: convert panne to curative intervention
  const handleConvertConfirm = useCallback(
    async (formData: { technicienId?: string; datePrevue: string; description: string }) => {
      if (!panneToConvert) return;
      setIsSubmitting(true);
      try {
        const res = await fetch(`/api/pannes/${panneToConvert.id}/convert`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            datePrevue: formData.datePrevue,
            technicienId: formData.technicienId,
            description: formData.description,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          showError(data.error ?? "Erreur lors de la conversion de la panne.");
          return;
        }
        setPannes((prev) =>
          prev.map((p) => (p.id === panneToConvert.id ? data.panne : p))
        );
        setInterventions((prev) => [data.intervention, ...prev]);
        setIsConvertOpen(false);
        setPanneToConvert(null);
        showSuccess(`Intervention curative ${data.intervention.reference} créée avec succès.`);
      } catch {
        showError("Erreur lors de la conversion de la panne.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [panneToConvert, showSuccess, showError]
  );

  const handleViewDetail = (panne: Panne) => {
    setSelectedPanne(panne);
    setIsDetailOpen(true);
  };

  const getLinkedIntervention = useCallback(
    (panne: Panne | null): Intervention | null => {
      if (!panne?.interventionId) return null;
      return interventions.find((i) => i.id === panne.interventionId) ?? null;
    },
    [interventions]
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 mb-4">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-muted-foreground">Chargement des pannes...</p>
        </div>
      </div>
    );
  }

  if (currentUser && currentUser.role === 'technician') {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[70vh] px-4">
          <Card className="max-w-md w-full border-red-150 bg-red-50/20 shadow-md">
            <CardContent className="pt-6 text-center space-y-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 text-red-600 mb-2">
                <AlertTriangle size={24} />
              </div>
              <h2 className="text-xl font-bold text-red-950">Accès non autorisé</h2>
              <p className="text-sm text-red-800">
                Les techniciens n&apos;ont pas accès à la gestion des pannes.
              </p>
              <Button
                onClick={() => router.push('/dashboard')}
                className="w-full mt-2 gap-2 font-medium"
              >
                Retour au tableau de bord
                <ArrowRight size={16} />
              </Button>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">
              {currentUser?.role === 'client' ? 'Mes pannes' : 'Gestion des pannes'}
            </h1>
            <p className="text-muted-foreground mt-2 text-sm sm:text-base">
              {currentUser?.role === 'client'
                ? 'Déclarez et suivez les pannes de vos équipements.'
                : 'Gérez les signalements de pannes des clients, changez leur statut ou planifiez des interventions curatives.'}
            </p>
          </div>
          {currentUser?.role === 'client' && (
            <Button onClick={() => setIsCreateOpen(true)} className="gap-2 shrink-0">
              <Plus size={16} />
              Déclarer une panne
            </Button>
          )}
        </div>

        {/* CLIENT INTERFACE */}
        {currentUser?.role === 'client' && (
          <div className="space-y-6">
            <div className="p-4 bg-muted/30 border border-border rounded-xl shadow-sm">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className="relative flex-1 w-full sm:max-w-72">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Réf., équipement, mot-clé..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 h-9 text-xs"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[160px] h-9 text-xs">
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous statuts</SelectItem>
                    <SelectItem value="EN_ATTENTE">En attente</SelectItem>
                    <SelectItem value="PRISE_EN_CHARGE">Prise en charge</SelectItem>
                    <SelectItem value="CONVERTIE">Convertie</SelectItem>
                    <SelectItem value="ANNULEE">Annulée</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {!clientHasPannes ? (
              <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-border rounded-xl bg-muted/10">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                  <Wrench size={28} className="text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-1">Aucune panne déclarée</h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                  Vous pouvez déclarer une panne pour l&apos;un de vos équipements.
                </p>
                <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
                  <Plus size={16} />
                  Déclarer une panne
                </Button>
              </div>
            ) : (
              <>
                <div className="border border-border rounded-xl overflow-hidden shadow-sm bg-card">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/40">
                          <SortableHeader label="Référence" sortKey="reference" sortConfig={sortConfig} onSort={handleSort} className="w-[110px]" />
                          <SortableHeader label="Date" sortKey="date" sortConfig={sortConfig} onSort={handleSort} className="w-[100px]" />
                          <SortableHeader label="Équipement" sortKey="equipment" sortConfig={sortConfig} onSort={handleSort} />
                          <SortableHeader label="Statut" sortKey="statut" sortConfig={sortConfig} onSort={handleSort} className="w-[120px]" />
                          <TableHead className="text-right font-semibold">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredPannes.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-12 text-muted-foreground text-sm font-medium">
                              Aucun signalement ne correspond aux critères de recherche.
                            </TableCell>
                          </TableRow>
                        ) : (
                          pagedPannes.map((panne) => (
                            <TableRow key={panne.id} className="hover:bg-muted/30 transition-colors">
                              <TableCell className="font-bold text-xs text-primary">{panne.reference}</TableCell>
                              <TableCell className="text-xs text-muted-foreground">{formatDate(panne.dateDeclaration)}</TableCell>
                              <TableCell className="text-xs font-semibold">
                                {getEquipmentName(panne.equipementId)}
                              </TableCell>
                              <TableCell><StatusBadge status={panne.statut} type="panne" /></TableCell>
                              <TableCell className="text-right">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                                  onClick={() => handleViewDetail(panne)}
                                >
                                  <Eye size={14} />
                                  Détail
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
                <TablePagination
                  page={page}
                  pageSize={10}
                  totalItems={filteredPannes.length}
                  onPrevious={() => setPage((p) => p - 1)}
                  onNext={() => setPage((p) => p + 1)}
                />
              </>
            )}
          </div>
        )}

        {/* ADMIN INTERFACE */}
        {currentUser?.role === 'admin' && (
          <div className="space-y-6">
            <div className="p-4 bg-muted/30 border border-border rounded-xl space-y-4 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Filter size={16} className="text-primary" />
                Filtres & Recherche
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher réf., description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 h-9 text-xs"
                  />
                </div>
                <Select value={clientFilter === 'all' ? 'all' : String(clientFilter)} onValueChange={(v) => setClientFilter(v === 'all' ? 'all' : Number(v))}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Tous les clients" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les clients</SelectItem>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={String(client.id)}>
                        {getClientDisplayName(client)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Tous les statuts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="EN_ATTENTE">En attente</SelectItem>
                    <SelectItem value="PRISE_EN_CHARGE">Prise en charge</SelectItem>
                    <SelectItem value="CONVERTIE">Convertie</SelectItem>
                    <SelectItem value="ANNULEE">Annulée</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="border border-border rounded-xl overflow-hidden shadow-sm bg-card">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40">
                      <SortableHeader label="Référence" sortKey="reference" sortConfig={sortConfig} onSort={handleSort} className="w-[100px]" />
                      <SortableHeader label="Déclaré le" sortKey="date" sortConfig={sortConfig} onSort={handleSort} className="w-[100px]" />
                      <SortableHeader label="Client" sortKey="client" sortConfig={sortConfig} onSort={handleSort} />
                      <SortableHeader label="Équipement" sortKey="equipment" sortConfig={sortConfig} onSort={handleSort} />
                      <SortableHeader label="Statut" sortKey="statut" sortConfig={sortConfig} onSort={handleSort} className="w-[110px]" />
                      <TableHead className="text-right font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPannes.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-12 text-muted-foreground text-sm font-medium">
                          Aucun signalement ne correspond aux critères de recherche.
                        </TableCell>
                      </TableRow>
                    ) : (
                      pagedPannes.map((panne) => (
                        <TableRow key={panne.id} className="hover:bg-muted/30 transition-colors">
                          <TableCell className="font-bold text-xs text-primary">{panne.reference}</TableCell>
                          <TableCell className="text-xs text-muted-foreground text-center">{formatDate(panne.dateDeclaration)}</TableCell>
                          <TableCell className="text-xs font-semibold">{getClientName(panne.clientId)}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {getEquipmentName(panne.equipementId)}
                          </TableCell>
                          <TableCell className="text-center">
                            <StatusBadge status={panne.statut} type="panne" />
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-1 justify-end items-center">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 w-8 p-0"
                                title="Voir détail"
                                onClick={() => handleViewDetail(panne)}
                              >
                                <Eye size={14} />
                              </Button>
                              {panne.statut === 'EN_ATTENTE' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 gap-1 border-blue-200 hover:bg-blue-50 hover:text-blue-800 text-blue-600 font-medium text-xs px-2"
                                  disabled={isSubmitting}
                                  onClick={() => handlePrendreEnCharge(panne.id)}
                                >
                                  <Check size={14} />
                                  <span className="hidden sm:inline">Prendre en charge</span>
                                </Button>
                              )}
                              {(panne.statut === 'EN_ATTENTE' || panne.statut === 'PRISE_EN_CHARGE') && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 gap-1 border-green-200 hover:bg-green-50 hover:text-green-800 text-green-600 font-medium text-xs px-2"
                                  onClick={() => {
                                    setPanneToConvert(panne);
                                    setIsConvertOpen(true);
                                  }}
                                >
                                  <ClipboardCheck size={14} />
                                  <span className="hidden sm:inline">Convertir</span>
                                </Button>
                              )}
                              {(panne.statut === 'EN_ATTENTE' || panne.statut === 'PRISE_EN_CHARGE') && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 w-8 p-0 border-red-200 hover:bg-red-50 hover:text-red-800 text-red-600"
                                  onClick={() => {
                                    setPanneToCancel(panne);
                                    setIsCancelConfirmOpen(true);
                                  }}
                                >
                                  <XCircle size={14} />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
            <TablePagination
              page={page}
              pageSize={10}
              totalItems={filteredPannes.length}
              onPrevious={() => setPage((p) => p - 1)}
              onNext={() => setPage((p) => p + 1)}
            />
          </div>
        )}
      </div>

      {/* Client: Declaration Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="w-[95vw] max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Déclarer une panne</DialogTitle>
            <DialogDescription>
              Signalez un dysfonctionnement sur l&apos;un de vos équipements.
            </DialogDescription>
          </DialogHeader>
          <PanneForm
            clientId={clientInfo.clientId != null ? String(clientInfo.clientId) : ''}
            clientEquipements={clientInfo.clientEquipements}
            equipments={equipments}
            onSubmit={handleClientSubmit}
            isLoading={isSubmitting}
            noCard
          />
        </DialogContent>
      </Dialog>

      <PanneDetail
        open={isDetailOpen}
        panne={selectedPanne}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedPanne(null);
        }}
        linkedIntervention={getLinkedIntervention(selectedPanne)}
      />

      <CreateCurativeFromPanneDialog
        open={isConvertOpen}
        panne={panneToConvert}
        onClose={() => {
          setIsConvertOpen(false);
          setPanneToConvert(null);
        }}
        onConfirm={handleConvertConfirm}
        clients={clients}
        equipments={equipments}
        interventions={interventions}
        users={users}
        contracts={contracts}
      />

      <ConfirmDialog
        open={isCancelConfirmOpen}
        title="Annuler la déclaration de panne"
        description={`Êtes-vous sûr de vouloir annuler la déclaration de panne ${panneToCancel?.reference}? Cette action changera le statut en ANNULÉE.`}
        actionLabel="Annuler la panne"
        actionVariant="destructive"
        onConfirm={handleCancelPanne}
        onCancel={() => {
          setIsCancelConfirmOpen(false);
          setPanneToCancel(null);
        }}
      />
    </AppLayout>
  );
}
