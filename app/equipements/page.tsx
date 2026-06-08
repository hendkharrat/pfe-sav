'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Equipment } from '@/types';
import { AppLayout } from '@/components/layout/AppLayout';
import { AdminOnly } from '@/components/shared/AdminOnly';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { EquipmentForm } from '@/components/forms/EquipmentForm';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { mockEquipments } from '@/data/mock-equipments';
import { mockClientEquipements } from '@/data/mock-client-equipements';
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
import { EQUIPMENT_TYPE_LABELS } from '@/lib/constants';
import { EquipmentThumbnail } from '@/components/shared/EquipmentThumbnail';

export default function EquipmentsPage() {
  const router = useRouter();
  const { user: currentUser, isLoading } = useAuth();
  const { showSuccess } = useToast();

  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [filteredEquipments, setFilteredEquipments] = useState<Equipment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | undefined>();
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailEquipment, setDetailEquipment] = useState<Equipment | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [equipmentToDelete, setEquipmentToDelete] = useState<Equipment | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setEquipments(mockEquipments);
  }, []);

  useEffect(() => {
    let result = equipments;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (e) =>
          e.reference.toLowerCase().includes(term) ||
          e.marque.toLowerCase().includes(term) ||
          e.modele.toLowerCase().includes(term) ||
          (e.numeroSerie && e.numeroSerie.toLowerCase().includes(term))
      );
    }

    if (typeFilter !== 'all') {
      result = result.filter((e) => e.type === typeFilter);
    }

    setFilteredEquipments(result);
  }, [equipments, searchTerm, typeFilter]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, typeFilter]);

  const getUsageCount = useCallback(
    (equipmentId: string) =>
      mockClientEquipements.filter((ce) => ce.equipementId === equipmentId).length,
    []
  );

  const handleSort = useCallback((key: string) => {
    setSortConfig((prev) => toggleSort(prev, key));
  }, []);

  const sortedEquipments = useMemo(
    () =>
      sortData(filteredEquipments, sortConfig, (eq, key) => {
        switch (key) {
          case 'reference': return eq.reference;
          case 'type': return eq.type;
          case 'marque': return eq.marque;
          case 'modele': return eq.modele;
          case 'utilise': return String(getUsageCount(eq.id));
          default: return '';
        }
      }),
    [filteredEquipments, sortConfig, getUsageCount]
  );

  const pagedEquipments = useMemo(
    () => paginateData(sortedEquipments, page, 10),
    [sortedEquipments, page]
  );

  const handleAddEquipment = useCallback(
    (formData: Omit<Equipment, 'id'>) => {
      const newEquipment: Equipment = {
        ...formData,
        id: `eq-${Date.now()}`,
        images: formData.images ?? [],
      };
      setEquipments((prev) => [...prev, newEquipment]);
      setIsFormOpen(false);
      setSelectedEquipment(undefined);
      showSuccess('Équipement ajouté avec succès');
    },
    [showSuccess]
  );

  const handleUpdateEquipment = useCallback(
    (formData: Omit<Equipment, 'id'>) => {
      if (!selectedEquipment) return;
      setEquipments((prev) =>
        prev.map((e) => (e.id === selectedEquipment.id ? { ...e, ...formData } : e))
      );
      setIsFormOpen(false);
      setSelectedEquipment(undefined);
      showSuccess('Équipement modifié avec succès');
    },
    [selectedEquipment, showSuccess]
  );

  const handleDeleteEquipment = useCallback(() => {
    if (!equipmentToDelete) return;
    setEquipments((prev) => prev.filter((e) => e.id !== equipmentToDelete.id));
    setIsConfirmOpen(false);
    setEquipmentToDelete(null);
    showSuccess('Équipement supprimé');
  }, [equipmentToDelete, showSuccess]);

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
              <p className="text-muted-foreground mt-2">
                Catalogue des équipements — indépendant des affectations clients
              </p>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                placeholder="Référence, marque, modèle, n° de série..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-9"
              />
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  <SelectItem value="CLIMATISEUR">
                    {EQUIPMENT_TYPE_LABELS['CLIMATISEUR']}
                  </SelectItem>
                  <SelectItem value="SYSTEME_SURPRESSION">
                    {EQUIPMENT_TYPE_LABELS['SYSTEME_SURPRESSION']}
                  </SelectItem>
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
                    <TableHead className="w-12" />
                    <SortableHeader
                      label="Référence"
                      sortKey="reference"
                      sortConfig={sortConfig}
                      onSort={handleSort}
                    />
                    <SortableHeader
                      label="Type"
                      sortKey="type"
                      sortConfig={sortConfig}
                      onSort={handleSort}
                    />
                    <SortableHeader
                      label="Marque"
                      sortKey="marque"
                      sortConfig={sortConfig}
                      onSort={handleSort}
                    />
                    <SortableHeader
                      label="Modèle"
                      sortKey="modele"
                      sortConfig={sortConfig}
                      onSort={handleSort}
                    />
                    <SortableHeader
                      label="Utilisé par"
                      sortKey="utilise"
                      sortConfig={sortConfig}
                      onSort={handleSort}
                    />
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEquipments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        Aucun équipement trouvé
                      </TableCell>
                    </TableRow>
                  ) : (
                    pagedEquipments.map((equipment) => {
                      const usageCount = getUsageCount(equipment.id);
                      return (
                        <TableRow key={equipment.id}>
                          {/* Thumbnail */}
                          <TableCell className="p-2">
                            <EquipmentThumbnail equipment={equipment} size="sm" />
                          </TableCell>
                          <TableCell className="font-medium">{equipment.reference}</TableCell>
                          <TableCell>{EQUIPMENT_TYPE_LABELS[equipment.type]}</TableCell>
                          <TableCell>{equipment.marque}</TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {equipment.modele}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {usageCount === 0
                              ? 'Non affecté'
                              : `${usageCount} client${usageCount > 1 ? 's' : ''}`}
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
            totalItems={filteredEquipments.length}
            onPrevious={() => setPage((p) => p - 1)}
            onNext={() => setPage((p) => p + 1)}
          />
        </div>

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

        <ConfirmDialog
          open={isConfirmOpen}
          title="Supprimer l'équipement"
          description={`Êtes-vous sûr de vouloir supprimer ${equipmentToDelete?.reference} ? Cette suppression est simulée et concerne uniquement l'interface.`}
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
