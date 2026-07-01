'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Client, ClientEquipement, Contract, Equipment } from '@/types';
import { AppLayout } from '@/components/layout/AppLayout';
import { AdminOnly } from '@/components/shared/AdminOnly';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { ClientForm, type ClientFormPayload } from '@/components/forms/ClientForm';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
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
import { ClientDetail } from '@/components/shared/ClientDetail';
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
import { getClientDisplayName } from '@/lib/utils';
import { TUNISIAN_CITIES } from '@/lib/constants';

export default function ClientsPage() {
  const router = useRouter();
  const { user: currentUser, isLoading } = useAuth();
  const { showSuccess, showError } = useToast();

  const [clients, setClients] = useState<Client[]>([]);
  const [clientEquipements, setClientEquipements] = useState<ClientEquipement[]>([]);
  const [equipements, setEquipements] = useState<Equipment[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [cityFilter, setCityFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [page, setPage] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | undefined>();
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailClient, setDetailClient] = useState<Client | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);

  // Load all data from API on mount
  useEffect(() => {
    async function load() {
      try {
        const [clientsRes, ceRes, eqRes, contractsRes] = await Promise.all([
          fetch('/api/clients'),
          fetch('/api/client-equipements'),
          fetch('/api/equipements'),
          fetch('/api/contracts'),
        ]);
        if (clientsRes.ok) setClients(await clientsRes.json());
        if (ceRes.ok) setClientEquipements(await ceRes.json());
        if (eqRes.ok) setEquipements(await eqRes.json());
        if (contractsRes.ok) setContracts(await contractsRes.json());
      } catch {
        showError('Erreur lors du chargement des données.');
      }
    }
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let result = clients;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (c) =>
          (c.societe?.toLowerCase().includes(term) ?? false) ||
          (c.contact?.toLowerCase().includes(term) ?? false) ||
          (c.prenom?.toLowerCase().includes(term) ?? false) ||
          (c.nom?.toLowerCase().includes(term) ?? false) ||
          c.email.toLowerCase().includes(term)
      );
    }
    if (cityFilter !== 'all') {
      result = result.filter((c) => c.ville === cityFilter);
    }
    setFilteredClients(result);
  }, [clients, searchTerm, cityFilter]);

  useEffect(() => { setPage(1); }, [searchTerm, cityFilter]);

  const getEquipementCount = useCallback(
    (clientId: number) => clientEquipements.filter((ce) => ce.clientId === clientId).length,
    [clientEquipements]
  );

  const handleSort = useCallback((key: string) => {
    setSortConfig((prev) => toggleSort(prev, key));
  }, []);

  const sortedClients = useMemo(
    () =>
      sortData(filteredClients, sortConfig, (client, key) => {
        switch (key) {
          case 'societe': return getClientDisplayName(client);
          case 'contact': return client.contact;
          case 'email': return client.email;
          case 'ville': return client.ville;
          case 'nombreEquipements': return getEquipementCount(client.id);
          default: return '';
        }
      }),
    [filteredClients, sortConfig, getEquipementCount]
  );

  const pagedClients = useMemo(
    () => paginateData(sortedClients, page, 10),
    [sortedClients, page]
  );

  const handleAddClient = useCallback(
    async ({ clientData, assignments }: ClientFormPayload) => {
      setIsSubmitting(true);
      try {
        const res = await fetch('/api/clients', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(clientData),
        });
        const body = await res.json();
        if (!res.ok) { showError(body.error ?? 'Erreur lors de la création du client.'); return; }

        const newClient: Client = body;
        const newClientId = newClient.id;

        // Create CE assignments
        const createdCEs: ClientEquipement[] = [];
        for (const ce of assignments) {
          const ceRes = await fetch('/api/client-equipements', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              clientId: newClientId,
              equipementId: ce.equipementId,
              dateInstallation: ce.dateInstallation,
              dateAchat: ce.dateAchat,
              localisation: ce.localisation,
              notes: ce.notes,
            }),
          });
          if (ceRes.ok) createdCEs.push(await ceRes.json());
        }

        setClients((prev) => [...prev, { ...newClient, nombreEquipements: createdCEs.length }]);
        setClientEquipements((prev) => [...prev, ...createdCEs]);
        setIsFormOpen(false);
        setSelectedClient(undefined);
        showSuccess('Client ajouté avec succès');
      } catch {
        showError('Impossible de contacter le serveur.');
      } finally {
        setIsSubmitting(false);
      }
    },
    [showSuccess, showError]
  );

  const handleUpdateClient = useCallback(
    async ({ clientData, assignments }: ClientFormPayload) => {
      if (!selectedClient) return;
      const clientId = selectedClient.id;
      setIsSubmitting(true);
      try {
        // 1. PATCH client fields
        const res = await fetch(`/api/clients/${clientId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(clientData),
        });
        const body = await res.json();
        if (!res.ok) { showError(body.error ?? 'Erreur lors de la modification du client.'); return; }

        // 2. Diff assignments
        const originalCEs = clientEquipements.filter((ce) => ce.clientId === clientId);
        const originalIds = new Set(originalCEs.map((ce) => ce.id));
        const newIds = new Set(assignments.map((ce) => ce.id));

        // Delete removed CEs
        for (const ce of originalCEs.filter((ce) => !newIds.has(ce.id))) {
          const dr = await fetch(`/api/client-equipements/${ce.id}`, { method: 'DELETE' });
          if (!dr.ok) {
            const eb = await dr.json().catch(() => ({})) as { error?: string };
            showError(eb.error ?? `Impossible de retirer l'équipement.`);
          }
        }

        // Create new CEs (IDs not in original set)
        const createdCEs: ClientEquipement[] = [];
        for (const ce of assignments.filter((ce) => !originalIds.has(ce.id))) {
          const cr = await fetch('/api/client-equipements', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              clientId,
              equipementId: ce.equipementId,
              dateInstallation: ce.dateInstallation,
              dateAchat: ce.dateAchat,
              localisation: ce.localisation,
              notes: ce.notes,
            }),
          });
          if (cr.ok) createdCEs.push(await cr.json());
        }

        // Update existing CEs
        const updatedCEs: ClientEquipement[] = [];
        for (const ce of assignments.filter((ce) => originalIds.has(ce.id))) {
          const ur = await fetch(`/api/client-equipements/${ce.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              localisation: ce.localisation,
              dateAchat: ce.dateAchat,
              dateInstallation: ce.dateInstallation,
              notes: ce.notes,
            }),
          });
          updatedCEs.push(ur.ok ? (await ur.json() as ClientEquipement) : ce);
        }

        // 3. Update state
        const finalCECount = updatedCEs.length + createdCEs.length;
        setClients((prev) =>
          prev.map((c) => c.id === clientId ? { ...body, nombreEquipements: finalCECount } : c)
        );
        setClientEquipements((prev) => [
          ...prev.filter((ce) => ce.clientId !== clientId),
          ...updatedCEs,
          ...createdCEs,
        ]);
        setIsFormOpen(false);
        setSelectedClient(undefined);
        showSuccess('Client modifié avec succès');
      } catch {
        showError('Impossible de contacter le serveur.');
      } finally {
        setIsSubmitting(false);
      }
    },
    [selectedClient, clientEquipements, showSuccess, showError]
  );

  const handleDeleteClient = useCallback(async () => {
    if (!clientToDelete) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/clients/${clientToDelete.id}`, { method: 'DELETE' });
      if (!res.ok) {
        const body = await res.json().catch(() => ({})) as { error?: string };
        showError(body.error ?? 'Impossible de supprimer ce client.');
        setIsConfirmOpen(false);
        setClientToDelete(null);
        return;
      }
      setClients((prev) => prev.filter((c) => c.id !== clientToDelete.id));
      setClientEquipements((prev) => prev.filter((ce) => ce.clientId !== clientToDelete.id));
      setIsConfirmOpen(false);
      setClientToDelete(null);
      showSuccess('Client supprimé');
    } catch {
      showError('Impossible de contacter le serveur.');
    } finally {
      setIsSubmitting(false);
    }
  }, [clientToDelete, showSuccess, showError]);

  const handleEditClick = (client: Client) => {
    setSelectedClient(client);
    setIsFormOpen(true);
  };

  const handleViewClick = (client: Client) => {
    setDetailClient(client);
    setIsDetailOpen(true);
  };

  const handleDeleteClick = (client: Client) => {
    setClientToDelete(client);
    setIsConfirmOpen(true);
  };

  const handleDetailEdit = useCallback(() => {
    if (detailClient) {
      setIsDetailOpen(false);
      setSelectedClient(detailClient);
      setIsFormOpen(true);
    }
  }, [detailClient]);

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
              <h1 className="text-3xl font-bold text-foreground">Clients</h1>
              <p className="text-muted-foreground mt-2">Gestion des clients et contacts</p>
            </div>
            <Button 
              onClick={() => {
                setSelectedClient(undefined);
                setIsFormOpen(true);
              }}
              className="gap-2 w-full sm:w-auto"
            >
              <Plus size={16} />
              Ajouter un client
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
                placeholder="Rechercher par société, contact ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-9 sm:col-span-2"
              />
              <Select value={cityFilter} onValueChange={setCityFilter}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les villes</SelectItem>
                  {TUNISIAN_CITIES.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
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
                    <SortableHeader label="Client" sortKey="societe" sortConfig={sortConfig} onSort={handleSort} />
                    <SortableHeader label="Contact" sortKey="contact" sortConfig={sortConfig} onSort={handleSort} />
                    <SortableHeader label="Email" sortKey="email" sortConfig={sortConfig} onSort={handleSort} />
                    <TableHead>Téléphone</TableHead>
                    <SortableHeader label="Ville" sortKey="ville" sortConfig={sortConfig} onSort={handleSort} />
                    <SortableHeader label="Équipements" sortKey="nombreEquipements" sortConfig={sortConfig} onSort={handleSort} />
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClients.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        Aucun client trouvé
                      </TableCell>
                    </TableRow>
                  ) : (
                    pagedClients.map((client) => {
                      const eqCount = getEquipementCount(client.id);
                      return (
                        <TableRow key={client.id}>
                          <TableCell className="font-medium">{getClientDisplayName(client)}</TableCell>
                          <TableCell>{client.contact}</TableCell>
                          <TableCell className="text-muted-foreground text-sm">{client.email}</TableCell>
                          <TableCell className="text-muted-foreground text-sm">{client.telephone}</TableCell>
                          <TableCell>{client.ville}</TableCell>
                          <TableCell className="text-center">
                            <span className="text-sm font-medium">{eqCount}</span>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button size="sm" variant="outline" aria-label="Actions">
                                  <MoreHorizontal size={16} />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleViewClick(client)}>
                                  <Eye size={14} className="mr-2" />
                                  Voir
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEditClick(client)}>
                                  <Edit2 size={14} className="mr-2" />
                                  Modifier
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleDeleteClick(client)}
                                  className="text-destructive focus:text-destructive"
                                >
                                  <Trash2 size={14} className="mr-2" />
                                  Supprimer
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          <TablePagination
            page={page}
            pageSize={10}
            totalItems={filteredClients.length}
            onPrevious={() => setPage((p) => p - 1)}
            onNext={() => setPage((p) => p + 1)}
          />
        </div>

        <ClientForm
          open={isFormOpen}
          client={selectedClient}
          clientEquipements={clientEquipements}
          equipments={equipements}
          contracts={contracts}
          isLoading={isSubmitting}
          onClose={() => {
            setIsFormOpen(false);
            setSelectedClient(undefined);
          }}
          onSubmit={selectedClient ? handleUpdateClient : handleAddClient}
        />

        <ClientDetail
          open={isDetailOpen}
          client={detailClient}
          clientEquipements={clientEquipements}
          equipments={equipements}
          contracts={contracts}
          onClose={() => setIsDetailOpen(false)}
          onEdit={handleDetailEdit}
        />

        <ConfirmDialog
          open={isConfirmOpen}
          title="Supprimer le client"
          description={`Êtes-vous sûr de vouloir supprimer ${clientToDelete ? getClientDisplayName(clientToDelete) : ''} ? Cette action est irréversible.`}
          actionLabel="Supprimer"
          actionVariant="destructive"
          onConfirm={handleDeleteClient}
          onCancel={() => {
            setIsConfirmOpen(false);
            setClientToDelete(null);
          }}
        />
      </AppLayout>
    </AdminOnly>
  );
}
