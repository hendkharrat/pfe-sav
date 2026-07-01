'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { Contract, Intervention, Client, ClientEquipement, Equipment } from '@/types';
import { AppLayout } from '@/components/layout/AppLayout';
import { AdminOnly } from '@/components/shared/AdminOnly';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { ContractForm, type ContractFormSubmitPayload } from '@/components/forms/ContractForm';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { ContractDetail } from '@/components/shared/ContractDetail';
import { SortableHeader } from '@/components/shared/SortableHeader';
import { TablePagination } from '@/components/shared/TablePagination';
import { type SortConfig, sortData, paginateData, toggleSort } from '@/lib/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, Edit2, Trash2, Eye, Filter, MoreHorizontal } from 'lucide-react';
import { CONTRACT_FREQUENCY_LABELS } from '@/lib/constants';
import { formatDate, getClientDisplayName } from '@/lib/utils';

export default function ContratsPage() {
  const { isLoading } = useAuth();
  const { showSuccess, showError } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [contracts, setContracts] = useState<Contract[]>([]);
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [clientEquipements, setClientEquipements] = useState<ClientEquipement[]>([]);
  const [equipments, setEquipments] = useState<Equipment[]>([]);

  const [filteredContracts, setFilteredContracts] = useState<Contract[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [clientFilter, setClientFilter] = useState<number | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [frequencyFilter, setFrequencyFilter] = useState('all');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | undefined>();
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailContract, setDetailContract] = useState<Contract | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [contractToDelete, setContractToDelete] = useState<Contract | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    Promise.all([
      fetch('/api/contracts').then((r) => r.json()),
      fetch('/api/interventions').then((r) => r.json()),
      fetch('/api/clients').then((r) => r.json()),
      fetch('/api/client-equipements').then((r) => r.json()),
      fetch('/api/equipements').then((r) => r.json()),
    ])
      .then(([cs, ivs, cls, ces, eqs]) => {
        if (Array.isArray(cs)) setContracts(cs);
        if (Array.isArray(ivs)) setInterventions(ivs);
        if (Array.isArray(cls)) setClients(cls);
        if (Array.isArray(ces)) setClientEquipements(ces);
        if (Array.isArray(eqs)) setEquipments(eqs);
      })
      .catch(() => showError('Erreur lors du chargement des données.'));
  }, [showError]);

  const calculateStatus = (contract: Contract): 'ACTIF' | 'EXPIRE' | 'BIENTOT_EXPIRE' => {
    const today = new Date();
    const dateFin = new Date(contract.dateFin);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    if (dateFin < today) return 'EXPIRE';
    if (dateFin < thirtyDaysFromNow) return 'BIENTOT_EXPIRE';
    return 'ACTIF';
  };

  useEffect(() => {
    let result = contracts.map((c) => ({
      ...c,
      statut: calculateStatus(c),
    }));

    if (searchTerm) {
      result = result.filter(
        (c) =>
          c.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (() => {
            const cl = clients.find((client) => client.id === c.clientId);
            return cl ? getClientDisplayName(cl).toLowerCase().includes(searchTerm.toLowerCase()) : false;
          })()
      );
    }

    if (clientFilter !== 'all') {
      result = result.filter((c) => c.clientId === clientFilter);
    }

    if (statusFilter !== 'all') {
      result = result.filter((c) => c.statut === statusFilter);
    }

    if (frequencyFilter !== 'all') {
      result = result.filter((c) => c.periodicite === frequencyFilter);
    }

    setFilteredContracts(result);
  }, [contracts, searchTerm, clientFilter, statusFilter, frequencyFilter, clients]);

  useEffect(() => { setPage(1); }, [searchTerm, clientFilter, statusFilter, frequencyFilter]);

  const handleSort = useCallback((key: string) => {
    setSortConfig((prev) => toggleSort(prev, key));
  }, []);

  const sortedContracts = useMemo(
    () =>
      sortData(filteredContracts, sortConfig, (contract, key) => {
        switch (key) {
          case 'reference': return contract.reference;
          case 'client': {
            const cl = clients.find((c) => c.id === contract.clientId);
            return cl ? getClientDisplayName(cl) : '';
          }
          case 'dateDebut': return contract.dateDebut;
          case 'dateFin': return contract.dateFin;
          case 'periodicite': return contract.periodicite;
          case 'equipements': return contract.clientEquipementIds.length;
          case 'statut': return contract.statut;
          default: return '';
        }
      }),
    [filteredContracts, sortConfig, clients]
  );

  const pagedContracts = useMemo(
    () => paginateData(sortedContracts, page, 10),
    [sortedContracts, page]
  );

  const handleAddContract = useCallback(
    async ({ contract: contractData, preventiveInterventions }: ContractFormSubmitPayload) => {
      setIsSubmitting(true);
      try {
        const res = await fetch('/api/contracts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            reference: contractData.reference,
            clientId: contractData.clientId,
            dateDebut: contractData.dateDebut,
            dateFin: contractData.dateFin,
            periodicite: contractData.periodicite,
            description: contractData.description,
            clientEquipementIds: contractData.clientEquipementIds,
            preventiveInterventions: preventiveInterventions.map((p) => ({
              clientEquipementId: p.clientEquipementId,
              datePrevue: p.datePrevue,
              technicienId: p.technicienId,
            })),
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          showError(data.error ?? 'Erreur lors de la création du contrat.');
          return;
        }
        setContracts((prev) => [...prev, data]);
        // Refresh interventions to pick up generated preventive ones
        fetch('/api/interventions')
          .then((r) => r.json())
          .then((ivs) => { if (Array.isArray(ivs)) setInterventions(ivs); })
          .catch(() => {});
        setIsFormOpen(false);
        setSelectedContract(undefined);
        const count: number = data.interventionsCreated ?? 0;
        showSuccess(
          count > 0
            ? `Contrat créé avec ${count} intervention${count > 1 ? 's' : ''} préventive${count > 1 ? 's' : ''} planifiée${count > 1 ? 's' : ''}`
            : 'Contrat créé avec succès'
        );
      } catch {
        showError('Erreur lors de la création du contrat.');
      } finally {
        setIsSubmitting(false);
      }
    },
    [showSuccess, showError]
  );

  const handleUpdateContract = useCallback(
    async ({ contract: contractData }: ContractFormSubmitPayload) => {
      if (!selectedContract) return;
      setIsSubmitting(true);
      try {
        const res = await fetch(`/api/contracts/${selectedContract.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            reference: contractData.reference,
            dateDebut: contractData.dateDebut,
            dateFin: contractData.dateFin,
            periodicite: contractData.periodicite,
            description: contractData.description,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          showError(data.error ?? 'Erreur lors de la modification du contrat.');
          return;
        }
        setContracts((prev) => prev.map((c) => (c.id === selectedContract.id ? data : c)));
        setIsFormOpen(false);
        setSelectedContract(undefined);
        showSuccess('Contrat modifié avec succès');
      } catch {
        showError('Erreur lors de la modification du contrat.');
      } finally {
        setIsSubmitting(false);
      }
    },
    [selectedContract, showSuccess, showError]
  );

  const handleDeleteContract = useCallback(async () => {
    if (!contractToDelete) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/contracts/${contractToDelete.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        showError((data as { error?: string }).error ?? 'Erreur lors de la suppression du contrat.');
        return;
      }
      setContracts((prev) => prev.filter((c) => c.id !== contractToDelete.id));
      setIsConfirmOpen(false);
      setContractToDelete(null);
      showSuccess('Contrat supprimé');
    } catch {
      showError('Erreur lors de la suppression du contrat.');
    } finally {
      setIsSubmitting(false);
    }
  }, [contractToDelete, showSuccess, showError]);

  const handleEditClick = (contract: Contract) => {
    setSelectedContract(contract);
    setIsFormOpen(true);
  };

  const handleViewClick = (contract: Contract) => {
    setDetailContract(contract);
    setIsDetailOpen(true);
  };

  const handleDeleteClick = (contract: Contract) => {
    setContractToDelete(contract);
    setIsConfirmOpen(true);
  };

  const getClientName = useCallback(
    (clientId: number): string => {
      const c = clients.find((cl) => cl.id === clientId);
      return c ? getClientDisplayName(c) : 'N/A';
    },
    [clients]
  );

  const getEquipmentCount = (ids: number[]): number => ids.length;

  const getContractStatus = (contract: Contract) => calculateStatus(contract);

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

  return (
    <AdminOnly>
      <AppLayout>
        <div className="space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Contrats</h1>
              <p className="text-muted-foreground mt-2">Gestion des contrats de maintenance</p>
            </div>
            <Button
              onClick={() => {
                setSelectedContract(undefined);
                setIsFormOpen(true);
              }}
              className="gap-2 w-full sm:w-auto"
            >
              <Plus size={16} />
              Créer un contrat
            </Button>
          </div>

          {/* Filters */}
          <div className="rounded-xl border bg-card shadow-sm p-4 space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Filter size={16} />
              <span>Filtres et recherche</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                placeholder="Rechercher par référence ou client..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-9 sm:col-span-2"
              />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="ACTIF">Actif</SelectItem>
                  <SelectItem value="BIENTOT_EXPIRE">Bientôt expiré</SelectItem>
                  <SelectItem value="EXPIRE">Expiré</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select value={clientFilter === 'all' ? 'all' : String(clientFilter)} onValueChange={(v) => setClientFilter(v === 'all' ? 'all' : Number(v))}>
                <SelectTrigger className="h-9">
                  <SelectValue />
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
              <Select value={frequencyFilter} onValueChange={setFrequencyFilter}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les périodicités</SelectItem>
                  <SelectItem value="MENSUELLE">{CONTRACT_FREQUENCY_LABELS['MENSUELLE']}</SelectItem>
                  <SelectItem value="TRIMESTRIELLE">{CONTRACT_FREQUENCY_LABELS['TRIMESTRIELLE']}</SelectItem>
                  <SelectItem value="SEMESTRIELLE">
                    {CONTRACT_FREQUENCY_LABELS['SEMESTRIELLE']}
                  </SelectItem>
                  <SelectItem value="ANNUELLE">{CONTRACT_FREQUENCY_LABELS['ANNUELLE']}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Table */}
          <div className="border border-border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <SortableHeader label="Référence" sortKey="reference" sortConfig={sortConfig} onSort={handleSort} />
                  <SortableHeader label="Client" sortKey="client" sortConfig={sortConfig} onSort={handleSort} />
                  <SortableHeader label="Date début" sortKey="dateDebut" sortConfig={sortConfig} onSort={handleSort} />
                  <SortableHeader label="Date fin" sortKey="dateFin" sortConfig={sortConfig} onSort={handleSort} />
                  <SortableHeader label="Périodicité" sortKey="periodicite" sortConfig={sortConfig} onSort={handleSort} />
                  <SortableHeader label="Installations" sortKey="equipements" sortConfig={sortConfig} onSort={handleSort} />
                  <SortableHeader label="Statut" sortKey="statut" sortConfig={sortConfig} onSort={handleSort} />
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContracts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Aucun contrat trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  pagedContracts.map((contract) => (
                    <TableRow key={contract.id}>
                      <TableCell className="font-medium">{contract.reference}</TableCell>
                      <TableCell>{getClientName(contract.clientId)}</TableCell>
                      <TableCell className="text-sm">{formatDate(contract.dateDebut)}</TableCell>
                      <TableCell className="text-sm">{formatDate(contract.dateFin)}</TableCell>
                      <TableCell className="text-sm">
                        {CONTRACT_FREQUENCY_LABELS[contract.periodicite]}
                      </TableCell>
                      <TableCell className="text-sm">
                        {getEquipmentCount(contract.clientEquipementIds)}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={getContractStatus(contract)} type="contract" />
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="outline" aria-label="Actions">
                              <MoreHorizontal size={16} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewClick(contract)}>
                              <Eye size={14} className="mr-2" />
                              Voir
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditClick(contract)}>
                              <Edit2 size={14} className="mr-2" />
                              Modifier
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeleteClick(contract)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 size={14} className="mr-2" />
                              Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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
            totalItems={filteredContracts.length}
            onPrevious={() => setPage((p) => p - 1)}
            onNext={() => setPage((p) => p + 1)}
          />
        </div>

        {/* Contract Form */}
        <ContractForm
          open={isFormOpen}
          contract={selectedContract}
          onClose={() => {
            setIsFormOpen(false);
            setSelectedContract(undefined);
          }}
          onSubmit={selectedContract ? handleUpdateContract : handleAddContract}
          isLoading={isSubmitting}
          clients={clients}
          clientEquipements={clientEquipements}
          interventions={interventions}
        />

        <ContractDetail
          open={isDetailOpen}
          contract={detailContract}
          onClose={() => setIsDetailOpen(false)}
          interventions={interventions}
          clients={clients}
          clientEquipements={clientEquipements}
          equipments={equipments}
        />

        {/* Delete Confirmation */}
        <ConfirmDialog
          open={isConfirmOpen}
          title="Supprimer le contrat"
          description={`Êtes-vous sûr de vouloir supprimer le contrat ${contractToDelete?.reference} ? Cette action est irréversible.`}
          actionLabel="Supprimer"
          actionVariant="destructive"
          onConfirm={handleDeleteContract}
          onCancel={() => {
            setIsConfirmOpen(false);
            setContractToDelete(null);
          }}
        />
      </AppLayout>
    </AdminOnly>
  );
}
