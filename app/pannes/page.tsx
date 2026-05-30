'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Panne, Equipment, Intervention, InterventionPriorite, PanneStatut } from '@/types';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { PriorityBadge } from '@/components/shared/PriorityBadge';
import { mockPannes } from '@/data/mock-pannes';
import { mockEquipments } from '@/data/mock-equipments';
import { mockClients } from '@/data/mock-clients';
import { mockInterventions } from '@/data/mock-interventions';
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
} from 'lucide-react';
import { getClientIdForUser, getContractCoverage, generateInterventionReference } from '@/lib/interventions';
import { formatDate } from '@/lib/utils';
import { PanneForm } from '@/components/forms/PanneForm';
import { PanneDetail } from '@/components/shared/PanneDetail';
import { CreateCurativeFromPanneDialog } from '@/components/shared/CreateCurativeFromPanneDialog';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';

export default function PannesPage() {
  const router = useRouter();
  const { user: currentUser, isLoading } = useAuth();
  const { showSuccess, showError } = useToast();

  // Core local states
  const [pannes, setPannes] = useState<Panne[]>([]);
  const [interventions, setInterventions] = useState<Intervention[]>([]);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [clientFilter, setClientFilter] = useState('all');

  // Detail sheet state
  const [selectedPanne, setSelectedPanne] = useState<Panne | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Conversion dialog state
  const [panneToConvert, setPanneToConvert] = useState<Panne | null>(null);
  const [isConvertOpen, setIsConvertOpen] = useState(false);

  // Cancellation confirm state
  const [panneToCancel, setPanneToCancel] = useState<Panne | null>(null);
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);

  // Initialization
  useEffect(() => {
    setPannes(mockPannes);
    setInterventions(mockInterventions);
  }, []);

  // Helpers
  const clientInfo = useMemo(() => {
    if (!currentUser || currentUser.role !== 'client') return { clientId: null, equipments: [] };
    const clientId = getClientIdForUser(currentUser);
    const clientEqs = mockEquipments.filter((e) => e.clientId === clientId);
    return { clientId, equipments: clientEqs };
  }, [currentUser]);

  const getClientName = useCallback((clientId: string): string => {
    return mockClients.find((c) => c.id === clientId)?.societe || 'N/A';
  }, []);

  const getEquipmentName = useCallback((equipementId: string): string => {
    const eq = mockEquipments.find((e) => e.id === equipementId);
    return eq ? `${eq.reference} (${eq.marque} ${eq.modele})` : 'N/A';
  }, []);

  // Filtered lists
  const filteredPannes = useMemo(() => {
    if (!currentUser) return [];

    let list = pannes;

    // 1. Role boundary filtering
    if (currentUser.role === 'client') {
      const clientId = clientInfo.clientId;
      if (!clientId) return [];
      list = list.filter((p) => p.clientId === clientId);
    }

    // 2. Search term filtering (reference, description, client societe, equipment reference/marque/modele)
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

    // 3. Status filter
    if (statusFilter !== 'all') {
      list = list.filter((p) => p.statut === statusFilter);
    }

    // 4. Priority filter
    if (priorityFilter !== 'all') {
      list = list.filter((p) => p.priorite === priorityFilter);
    }

    // 5. Client filter (Admin view only)
    if (currentUser.role === 'admin' && clientFilter !== 'all') {
      list = list.filter((p) => p.clientId === clientFilter);
    }

    // Sort by date (latest first) and status urgency
    return [...list].sort(
      (a, b) => new Date(b.dateDeclaration).getTime() - new Date(a.dateDeclaration).getTime()
    );
  }, [pannes, currentUser, clientInfo.clientId, searchTerm, statusFilter, priorityFilter, clientFilter, getClientName, getEquipmentName]);

  // Client Action: submit panne
  const handleClientSubmit = useCallback(
    (formData: {
      equipementId: string;
      description: string;
      priorite: InterventionPriorite;
      pieceJointeNom?: string;
    }) => {
      const clientId = clientInfo.clientId;
      if (!clientId) {
        showError("Impossible d'associer la panne à un client valide.");
        return;
      }

      const year = new Date().getFullYear();
      const nextNum = pannes.length + 1;
      const refStr = `PAN-${year}-${String(nextNum).padStart(3, '0')}`;

      const newPanne: Panne = {
        id: `pan-${Date.now()}`,
        reference: refStr,
        clientId,
        equipementId: formData.equipementId,
        dateDeclaration: new Date().toISOString().split('T')[0],
        description: formData.description,
        priorite: formData.priorite,
        statut: 'EN_ATTENTE',
        pieceJointeNom: formData.pieceJointeNom,
      };

      setPannes((prev) => [newPanne, ...prev]);
      showSuccess('Votre déclaration a été enregistrée.');
    },
    [clientInfo.clientId, pannes.length, showError, showSuccess]
  );

  // Admin Action: Prendre en charge
  const handlePrendreEnCharge = useCallback(
    (panneId: string) => {
      setPannes((prev) =>
        prev.map((p) => (p.id === panneId ? { ...p, statut: 'PRISE_EN_CHARGE' } : p))
      );
      showSuccess('La panne a été prise en charge avec succès.');
    },
    [showSuccess]
  );

  // Admin Action: Confirm Cancellation
  const handleCancelPanne = useCallback(() => {
    if (!panneToCancel) return;
    setPannes((prev) =>
      prev.map((p) => (p.id === panneToCancel.id ? { ...p, statut: 'ANNULEE' } : p))
    );
    setIsCancelConfirmOpen(false);
    setPanneToCancel(null);
    showSuccess('La déclaration de panne a été annulée.');
  }, [panneToCancel, showSuccess]);

  // Admin Action: Convert Panne to Curative Intervention
  const handleConvertConfirm = useCallback(
    (formData: { technicienId?: string; datePrevue: string; description: string }) => {
      if (!panneToConvert) return;

      const { couvertureContrat, contractId } = getContractCoverage(
        panneToConvert.equipementId,
        panneToConvert.clientId
      );

      const nextRef = generateInterventionReference(interventions);
      const newInterventionId = `int-${Date.now()}`;

      const newIntervention: Intervention = {
        id: newInterventionId,
        reference: nextRef,
        type: 'CURATIVE',
        clientId: panneToConvert.clientId,
        equipementId: panneToConvert.equipementId,
        technicienId: formData.technicienId,
        contractId: contractId,
        datePrevue: formData.datePrevue,
        priorite: panneToConvert.priorite,
        statut: 'PLANIFIEE',
        couvertureContrat,
        description: formData.description,
      };

      // Add intervention to local list & convert panne status
      setInterventions((prev) => [newIntervention, ...prev]);
      setPannes((prev) =>
        prev.map((p) =>
          p.id === panneToConvert.id
            ? { ...p, statut: 'CONVERTIE', interventionId: newInterventionId }
            : p
        )
      );

      setIsConvertOpen(false);
      setPanneToConvert(null);
      showSuccess(`Intervention curative ${nextRef} créée avec succès.`);
    },
    [panneToConvert, interventions, showSuccess]
  );

  const handleViewDetail = (panne: Panne) => {
    setSelectedPanne(panne);
    setIsDetailOpen(true);
  };

  const getLinkedIntervention = useCallback(
    (panne: Panne | null): Intervention | null => {
      if (!panne || !panne.interventionId) return null;
      return interventions.find((i) => i.id === panne.interventionId) || null;
    },
    [interventions]
  );

  // loading view
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

  // 1. TECHNICIAN ACCESS REDIRECT CARD
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
                Retour au dashboard
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
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            {currentUser?.role === 'client' ? 'Déclarer une panne' : 'Gestion des pannes'}
          </h1>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">
            {currentUser?.role === 'client'
              ? 'Déclarez et suivez vos pannes d&apos;équipements en temps réel.'
              : 'Gérez les signalements de pannes des clients, changez leur statut ou planifiez des interventions curatives.'}
          </p>
        </div>

        {/* CLIENT INTERFACE */}
        {currentUser?.role === 'client' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Declaration form on the left/top */}
            <div className="lg:col-span-1">
              <PanneForm
                clientId={clientInfo.clientId || ''}
                equipments={clientInfo.equipments}
                onSubmit={handleClientSubmit}
              />
            </div>

            {/* List on the right/bottom */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-4">
                <h2 className="text-lg font-bold text-foreground">Mes pannes déclarées</h2>
                {/* Micro search filter */}
                <div className="flex w-full sm:w-auto items-center gap-2">
                  <div className="relative flex-1 sm:w-60">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Réf., équipement, mot-clé..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 h-9 text-xs"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[120px] h-9 text-xs">
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

              {/* Table */}
              <div className="border border-border rounded-xl overflow-hidden shadow-sm bg-card">
                <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40">
                      <TableHead className="w-[110px] font-semibold">Référence</TableHead>
                      <TableHead className="w-[100px] font-semibold">Date</TableHead>
                      <TableHead className="font-semibold">Équipement</TableHead>
                      <TableHead className="w-[100px] font-semibold">Priorité</TableHead>
                      <TableHead className="w-[120px] font-semibold">Statut</TableHead>
                      <TableHead className="text-right font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPannes.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-12 text-muted-foreground text-sm font-medium">
                          Aucun signalement de panne trouvé
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredPannes.map((panne) => (
                        <TableRow key={panne.id} className="hover:bg-muted/30 transition-colors">
                          <TableCell className="font-bold text-xs text-primary">{panne.reference}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">{formatDate(panne.dateDeclaration)}</TableCell>
                          <TableCell className="text-xs font-semibold">
                            {getEquipmentName(panne.equipementId)}
                          </TableCell>
                          <TableCell>
                            <PriorityBadge priority={panne.priorite} />
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={panne.statut} type="panne" />
                          </TableCell>
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
              <p className="text-xs text-muted-foreground">
                Affichage de {filteredPannes.length} panne{filteredPannes.length !== 1 ? 's' : ''} déclarée{filteredPannes.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        )}

        {/* ADMIN INTERFACE */}
        {currentUser?.role === 'admin' && (
          <div className="space-y-6">
            {/* Filters bar */}
            <div className="p-4 bg-muted/30 border border-border rounded-xl space-y-4 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Filter size={16} className="text-primary" />
                Filtres & Recherche
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher réf., description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 h-9 text-xs"
                  />
                </div>

                {/* Filter Client */}
                <Select value={clientFilter} onValueChange={clientFilter => setClientFilter(clientFilter)}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Tous les clients" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les clients</SelectItem>
                    {mockClients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.societe}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Filter Statut */}
                <Select value={statusFilter} onValueChange={statusFilter => setStatusFilter(statusFilter)}>
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

                {/* Filter Priorité */}
                <Select value={priorityFilter} onValueChange={priorityFilter => setPriorityFilter(priorityFilter)}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Toutes priorités" />
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
            </div>

            {/* Admin Table */}
            <div className="border border-border rounded-xl overflow-hidden shadow-sm bg-card">
              <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead className="w-[100px] font-semibold">Référence</TableHead>
                    <TableHead className="w-[100px] font-semibold text-center">Déclaré le</TableHead>
                    <TableHead className="font-semibold">Client</TableHead>
                    <TableHead className="font-semibold">Équipement</TableHead>
                    <TableHead className="w-[100px] font-semibold text-center">Priorité</TableHead>
                    <TableHead className="w-[110px] font-semibold text-center">Statut</TableHead>
                    <TableHead className="text-right font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPannes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12 text-muted-foreground text-sm font-medium">
                        Aucun signalement de panne ne correspond aux critères de recherche.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPannes.map((panne) => (
                      <TableRow key={panne.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="font-bold text-xs text-primary">{panne.reference}</TableCell>
                        <TableCell className="text-xs text-muted-foreground text-center">{formatDate(panne.dateDeclaration)}</TableCell>
                        <TableCell className="text-xs font-semibold">{getClientName(panne.clientId)}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {getEquipmentName(panne.equipementId)}
                        </TableCell>
                        <TableCell className="text-center">
                          <PriorityBadge priority={panne.priorite} />
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

                            {/* Action: Prendre en charge */}
                            {panne.statut === 'EN_ATTENTE' && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 gap-1 border-blue-200 hover:bg-blue-50 hover:text-blue-800 text-blue-600 font-medium text-xs px-2"
                                title="Prendre en charge"
                                onClick={() => handlePrendreEnCharge(panne.id)}
                              >
                                <Check size={14} />
                                <span className="hidden sm:inline">Prendre en charge</span>
                              </Button>
                            )}

                            {/* Action: Créer intervention */}
                            {(panne.statut === 'EN_ATTENTE' || panne.statut === 'PRISE_EN_CHARGE') && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 gap-1 border-green-200 hover:bg-green-50 hover:text-green-800 text-green-600 font-medium text-xs px-2"
                                title="Créer intervention"
                                onClick={() => {
                                  setPanneToConvert(panne);
                                  setIsConvertOpen(true);
                                }}
                              >
                                <ClipboardCheck size={14} />
                                <span className="hidden sm:inline">Convertir</span>
                              </Button>
                            )}

                            {/* Action: Annuler */}
                            {(panne.statut === 'EN_ATTENTE' || panne.statut === 'PRISE_EN_CHARGE') && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 w-8 p-0 border-red-200 hover:bg-red-50 hover:text-red-800 text-red-600"
                                title="Annuler déclaration"
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
            <p className="text-sm text-muted-foreground">
              Total : {filteredPannes.length} panne{filteredPannes.length !== 1 ? 's' : ''} trouvée{filteredPannes.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </div>

      {/* Reusable Sheets / Modals */}

      {/* Panne Detail view */}
      <PanneDetail
        open={isDetailOpen}
        panne={selectedPanne}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedPanne(null);
        }}
        linkedIntervention={getLinkedIntervention(selectedPanne)}
      />

      {/* Conversion to curative intervention modal */}
      <CreateCurativeFromPanneDialog
        open={isConvertOpen}
        panne={panneToConvert}
        onClose={() => {
          setIsConvertOpen(false);
          setPanneToConvert(null);
        }}
        onConfirm={handleConvertConfirm}
      />

      {/* Cancellation confirmation dialog */}
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
