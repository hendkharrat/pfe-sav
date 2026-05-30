'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Client } from '@/types';
import { AppLayout } from '@/components/layout/AppLayout';
import { AdminOnly } from '@/components/shared/AdminOnly';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { ClientForm } from '@/components/forms/ClientForm';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
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
import { ClientDetail } from '@/components/shared/ClientDetail';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, Edit2, Trash2, Eye, Filter, MoreHorizontal } from 'lucide-react';
import { EmptyState } from '@/components/shared/EmptyState';

export default function ClientsPage() {
  const router = useRouter();
  const { user: currentUser, isLoading } = useAuth();
  const { showSuccess, showError } = useToast();

  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [cityFilter, setCityFilter] = useState('all');
  const [cities, setCities] = useState<string[]>([]);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | undefined>();
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailClient, setDetailClient] = useState<Client | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);

  // Initialize clients from mock data
  useEffect(() => {
    setClients(mockClients);
    const uniqueCities = Array.from(new Set(mockClients.map((c) => c.ville))).sort();
    setCities(uniqueCities);
  }, []);

  // Filter clients
  useEffect(() => {
    let result = clients;

    if (searchTerm) {
      result = result.filter(
        (c) =>
          c.societe.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.contact.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (cityFilter !== 'all') {
      result = result.filter((c) => c.ville === cityFilter);
    }

    setFilteredClients(result);
  }, [clients, searchTerm, cityFilter]);

  const handleAddClient = useCallback(
    (formData: Omit<Client, 'id' | 'dateCreation' | 'nombreEquipements' | 'userId'>) => {
      const newClient: Client = {
        ...formData,
        id: `client-${Date.now()}`,
        dateCreation: new Date().toISOString().split('T')[0],
        nombreEquipements: 0,
        userId: currentUser?.id ?? 'user-admin-1',
      };
      setClients([...clients, newClient]);
      setIsFormOpen(false);
      setSelectedClient(undefined);
      showSuccess('Client ajouté avec succès');
    },
    [clients, currentUser, showSuccess]
  );

  const handleUpdateClient = useCallback(
    (formData: Omit<Client, 'id' | 'dateCreation' | 'nombreEquipements' | 'userId'>) => {
      if (!selectedClient) return;
      const updated = clients.map((c) =>
        c.id === selectedClient.id ? { ...c, ...formData } : c
      );
      setClients(updated);
      setIsFormOpen(false);
      setSelectedClient(undefined);
      showSuccess('Client modifié avec succès');
    },
    [clients, selectedClient, showSuccess]
  );

  const handleDeleteClient = useCallback(() => {
    if (!clientToDelete) return;
    const updated = clients.filter((c) => c.id !== clientToDelete.id);
    setClients(updated);
    setIsConfirmOpen(false);
    setClientToDelete(null);
    showSuccess('Client supprimé');
  }, [clients, clientToDelete, showSuccess]);

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
                  {cities.map((city) => (
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
                  <TableHead>Société</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Téléphone</TableHead>
                  <TableHead>Ville</TableHead>
                  <TableHead className="text-center">Équipements</TableHead>
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
                  filteredClients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell className="font-medium">{client.societe}</TableCell>
                      <TableCell>{client.contact}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{client.email}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{client.telephone}</TableCell>
                      <TableCell>{client.ville}</TableCell>
                      <TableCell className="text-center">
                        <span className="text-sm font-medium">{client.nombreEquipements}</span>
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
                  ))
                )}
              </TableBody>
            </Table>
            </div>
          </div>

          {/* Results count */}
          <p className="text-sm text-muted-foreground">
            {filteredClients.length} client{filteredClients.length !== 1 ? 's' : ''} trouvé{filteredClients.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Modals */}
        <ClientForm
          open={isFormOpen}
          client={selectedClient}
          onClose={() => {
            setIsFormOpen(false);
            setSelectedClient(undefined);
          }}
          onSubmit={selectedClient ? handleUpdateClient : handleAddClient}
        />

        <ClientDetail
          open={isDetailOpen}
          client={detailClient}
          onClose={() => setIsDetailOpen(false)}
        />

        {/* Delete Confirmation */}
        <ConfirmDialog
          open={isConfirmOpen}
          title="Supprimer le client"
          description={`Êtes-vous sûr de vouloir supprimer ${clientToDelete?.societe}? Cette suppression est simulée et concerne uniquement l'interface.`}
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
