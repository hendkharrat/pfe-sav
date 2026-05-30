'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Equipment } from '@/types';
import { AppLayout } from '@/components/layout/AppLayout';
import { AdminOnly } from '@/components/shared/AdminOnly';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { EquipmentForm } from '@/components/forms/EquipmentForm';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { mockEquipments } from '@/data/mock-equipments';
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
import { EquipmentDetail } from '@/components/shared/EquipmentDetail';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, Edit2, Trash2, Eye, Filter, MoreHorizontal } from 'lucide-react';
import { EQUIPMENT_TYPE_LABELS, EQUIPMENT_STATUS_LABELS } from '@/lib/constants';

export default function EquipmentsPage() {
  const router = useRouter();
  const { user: currentUser, isLoading } = useAuth();
  const { showSuccess, showError } = useToast();

  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [filteredEquipments, setFilteredEquipments] = useState<Equipment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [clientFilter, setClientFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | undefined>();
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailEquipment, setDetailEquipment] = useState<Equipment | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [equipmentToDelete, setEquipmentToDelete] = useState<Equipment | null>(null);

  useEffect(() => {
    setEquipments(mockEquipments);
  }, []);

  useEffect(() => {
    let result = equipments;

    if (searchTerm) {
      result = result.filter(
        (e) =>
          e.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
          e.marque.toLowerCase().includes(searchTerm.toLowerCase()) ||
          e.modele.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (e.numeroSerie && e.numeroSerie.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (typeFilter !== 'all') {
      result = result.filter((e) => e.type === typeFilter);
    }

    if (clientFilter !== 'all') {
      result = result.filter((e) => e.clientId === clientFilter);
    }

    if (statusFilter !== 'all') {
      result = result.filter((e) => e.statut === statusFilter);
    }

    setFilteredEquipments(result);
  }, [equipments, searchTerm, typeFilter, clientFilter, statusFilter]);

  const handleAddEquipment = useCallback(
    (formData: Omit<Equipment, 'id'>) => {
      const newEquipment: Equipment = {
        ...formData,
        id: `eq-${Date.now()}`,
      };
      setEquipments([...equipments, newEquipment]);
      setIsFormOpen(false);
      setSelectedEquipment(undefined);
      showSuccess('Équipement ajouté avec succès');
    },
    [equipments, showSuccess]
  );

  const handleUpdateEquipment = useCallback(
    (formData: Omit<Equipment, 'id'>) => {
      if (!selectedEquipment) return;
      const updated = equipments.map((e) =>
        e.id === selectedEquipment.id ? { ...e, ...formData } : e
      );
      setEquipments(updated);
      setIsFormOpen(false);
      setSelectedEquipment(undefined);
      showSuccess('Équipement modifié avec succès');
    },
    [equipments, selectedEquipment, showSuccess]
  );

  const handleDeleteEquipment = useCallback(() => {
    if (!equipmentToDelete) return;
    const updated = equipments.filter((e) => e.id !== equipmentToDelete.id);
    setEquipments(updated);
    setIsConfirmOpen(false);
    setEquipmentToDelete(null);
    showSuccess('Équipement supprimé');
  }, [equipments, equipmentToDelete, showSuccess]);

  const handleEditClick = (equipment: Equipment) => {
    setSelectedEquipment(equipment);
    setIsFormOpen(true);
  };

  const handleViewClick = (equipment: Equipment) => {
    setDetailEquipment(equipment);
    setIsDetailOpen(true);
  };

  const handleDeleteClick = (equipment: Equipment) => {
    setEquipmentToDelete(equipment);
    setIsConfirmOpen(true);
  };

  const getClientName = (clientId: string): string => {
    return mockClients.find((c) => c.id === clientId)?.societe || 'N/A';
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
              <h1 className="text-3xl font-bold text-foreground">Équipements</h1>
              <p className="text-muted-foreground mt-2">Gestion des équipements en service</p>
            </div>
            <Button
              onClick={() => {
                setSelectedEquipment(undefined);
                setIsFormOpen(true);
              }}
              className="gap-2 w-full sm:w-auto"
            >
              <Plus size={16} />
              Ajouter un équipement
            </Button>
          </div>

          {/* Filters */}
          <div className="rounded-xl border bg-card shadow-sm p-4 space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Filter size={16} />
              <span>Filtres et recherche</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <Input
                placeholder="Rechercher par référence, marque, modèle..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-9 sm:col-span-2"
              />
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  <SelectItem value="CLIMATISEUR">{EQUIPMENT_TYPE_LABELS['CLIMATISEUR']}</SelectItem>
                  <SelectItem value="SYSTEME_SURPRESSION">{EQUIPMENT_TYPE_LABELS['SYSTEME_SURPRESSION']}</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="EN_SERVICE">{EQUIPMENT_STATUS_LABELS['EN_SERVICE']}</SelectItem>
                  <SelectItem value="EN_PANNE">{EQUIPMENT_STATUS_LABELS['EN_PANNE']}</SelectItem>
                  <SelectItem value="HORS_SERVICE">{EQUIPMENT_STATUS_LABELS['HORS_SERVICE']}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Select value={clientFilter} onValueChange={setClientFilter}>
              <SelectTrigger className="w-full sm:w-64 h-9">
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
          </div>

          {/* Table */}
          <div className="border border-border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Référence</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Marque</TableHead>
                  <TableHead>Modèle</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Localisation</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEquipments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Aucun équipement trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEquipments.map((equipment) => (
                    <TableRow key={equipment.id}>
                      <TableCell className="font-medium">{equipment.reference}</TableCell>
                      <TableCell>{EQUIPMENT_TYPE_LABELS[equipment.type]}</TableCell>
                      <TableCell>{equipment.marque}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {equipment.modele}
                      </TableCell>
                      <TableCell className="text-sm">{getClientName(equipment.clientId)}</TableCell>
                      <TableCell className="text-sm">{equipment.localisation}</TableCell>
                      <TableCell>
                        <StatusBadge status={equipment.statut} type="equipment" />
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="outline" aria-label="Actions">
                              <MoreHorizontal size={16} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewClick(equipment)}>
                              <Eye size={14} className="mr-2" />
                              Voir
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditClick(equipment)}>
                              <Edit2 size={14} className="mr-2" />
                              Modifier
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeleteClick(equipment)}
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
            {filteredEquipments.length} équipement{filteredEquipments.length !== 1 ? 's' : ''} trouvé{filteredEquipments.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Equipment Form */}
        <EquipmentForm
          open={isFormOpen}
          equipment={selectedEquipment}
          onClose={() => {
            setIsFormOpen(false);
            setSelectedEquipment(undefined);
          }}
          onSubmit={selectedEquipment ? handleUpdateEquipment : handleAddEquipment}
        />

        <EquipmentDetail
          open={isDetailOpen}
          equipment={detailEquipment}
          onClose={() => setIsDetailOpen(false)}
        />

        {/* Delete Confirmation */}
        <ConfirmDialog
          open={isConfirmOpen}
          title="Supprimer l'équipement"
          description={`Êtes-vous sûr de vouloir supprimer ${equipmentToDelete?.reference}? Cette suppression est simulée et concerne uniquement l'interface.`}
          actionLabel="Supprimer"
          actionVariant="destructive"
          onConfirm={handleDeleteEquipment}
          onCancel={() => {
            setIsConfirmOpen(false);
            setEquipmentToDelete(null);
          }}
        />
      </AppLayout>
    </AdminOnly>
  );
}
