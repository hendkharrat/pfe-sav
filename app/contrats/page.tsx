'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Contract, Intervention } from '@/types';
import { AppLayout } from '@/components/layout/AppLayout';
import { AdminOnly } from '@/components/shared/AdminOnly';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { ContractForm, type ContractFormSubmitPayload } from '@/components/forms/ContractForm';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { mockContracts } from '@/data/mock-contracts';
import { mockInterventions } from '@/data/mock-interventions';
import { mockClients } from '@/data/mock-clients';
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
import { formatDate } from '@/lib/utils';
import { preventivePreviewToIntervention } from '@/lib/interventions';

export default function ContratsPage() {
  const router = useRouter();
  const { user: currentUser, isLoading } = useAuth();
  const { showSuccess, showError } = useToast();

  const [contracts, setContracts] = useState<Contract[]>([]);
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [filteredContracts, setFilteredContracts] = useState<Contract[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [clientFilter, setClientFilter] = useState('all');
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
    setContracts(mockContracts);
    setInterventions(mockInterventions);
  }, []);

  // Calculate contract status based on dates
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
          mockClients.find((client) => client.id === c.clientId)?.societe
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
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
  }, [contracts, searchTerm, clientFilter, statusFilter, frequencyFilter]);

  useEffect(() => { setPage(1); }, [searchTerm, clientFilter, statusFilter, frequencyFilter]);

  const handleSort = useCallback((key: string) => {
    setSortConfig((prev) => toggleSort(prev, key));
  }, []);

  const sortedContracts = useMemo(
    () =>
      sortData(filteredContracts, sortConfig, (contract, key) => {
        switch (key) {
          case 'reference': return contract.reference;
          case 'client': return mockClients.find((c) => c.id === contract.clientId)?.societe ?? '';
          case 'dateDebut': return contract.dateDebut;
          case 'dateFin': return contract.dateFin;
          case 'periodicite': return contract.periodicite;
          case 'equipements': return contract.clientEquipementIds.length;
          case 'statut': return contract.statut;
          default: return '';
        }
      }),
    [filteredContracts, sortConfig]
  );

  const pagedContracts = useMemo(
    () => paginateData(sortedContracts, page, 10),
    [sortedContracts, page]
  );

  const handleAddContract = useCallback(
    ({ contract: contractData, preventiveInterventions }: ContractFormSubmitPayload) => {
      const contractId = `contract-${Date.now()}`;
      const newContract: Contract = { ...contractData, id: contractId };
      const newInterventions = preventiveInterventions.map((preview, index) =>
        preventivePreviewToIntervention(preview, { contractId, index })
      );
      setContracts((prev) => [...prev, newContract]);
      if (newInterventions.length > 0) {
        setInterventions((prev) => [...prev, ...newInterventions]);
      }
      setIsFormOpen(false);
      setSelectedContract(undefined);
      const count = newInterventions.length;
      showSuccess(
        count > 0
          ? `Contrat créé avec ${count} intervention${count > 1 ? 's' : ''} préventive${count > 1 ? 's' : ''} planifiée${count > 1 ? 's' : ''}`
          : 'Contrat créé avec succès'
      );
    },
    [showSuccess]
  );

  const handleUpdateContract = useCallback(
    ({ contract: contractData }: ContractFormSubmitPayload) => {
      if (!selectedContract) return;
      setContracts((prev) =>
        prev.map((c) =>
          c.id === selectedContract.id ? { ...c, ...contractData } : c
        )
      );
      setIsFormOpen(false);
      setSelectedContract(undefined);
      showSuccess('Contrat modifié avec succès');
    },
    [selectedContract, showSuccess]
  );

  const handleDeleteContract = useCallback(() => {
    if (!contractToDelete) return;
    setContracts((prev) => prev.filter((c) => c.id !== contractToDelete.id));
    setIsConfirmOpen(false);
    setContractToDelete(null);
    showSuccess('Contrat supprimé');
  }, [contractToDelete, showSuccess]);

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

  const getClientName = (clientId: string): string => {
    return mockClients.find((c) => c.id === clientId)?.societe || 'N/A';
  };

  const getEquipmentCount = (ids: string[]): number => ids.length;

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
              <Select value={clientFilter} onValueChange={setClientFilter}>
                <SelectTrigger className="h-9">
                  <SelectValue />
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
          interventions={interventions}
        />

        <ContractDetail
          open={isDetailOpen}
          contract={detailContract}
          onClose={() => setIsDetailOpen(false)}
          interventions={interventions}
        />

        {/* Delete Confirmation */}
        <ConfirmDialog
          open={isConfirmOpen}
          title="Supprimer le contrat"
          description={`Êtes-vous sûr de vouloir supprimer ${contractToDelete?.reference}? Cette suppression est simulée et concerne uniquement l'interface.`}
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
