'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Eye,
  Edit2,
  Trash2,
  UserPlus,
  RefreshCw,
  Play,
  CheckCircle,
  Calendar,
  MoreHorizontal,
} from 'lucide-react';
import { SortableHeader } from '@/components/shared/SortableHeader';
import { TablePagination } from '@/components/shared/TablePagination';
import { type SortConfig, sortData, paginateData, toggleSort, PRIORITY_SORT_ORDER } from '@/lib/table';
import { Intervention, InterventionStatut, User } from '@/types';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { InterventionForm, InterventionFormData } from '@/components/forms/InterventionForm';
import { InterventionDetail } from '@/components/shared/InterventionDetail';
import { AssignTechnicianDialog } from '@/components/shared/AssignTechnicianDialog';
import { CloseInterventionDialog, CloseInterventionData } from '@/components/shared/CloseInterventionDialog';
import { ChangeStatusDialog } from '@/components/shared/ChangeStatusDialog';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { PriorityBadge } from '@/components/shared/PriorityBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { mockInterventions } from '@/data/mock-interventions';
import { mockClients } from '@/data/mock-clients';
import { mockEquipments } from '@/data/mock-equipments';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  INTERVENTION_PRIORITY_LABELS,
  INTERVENTION_STATUS_LABELS,
  INTERVENTION_TYPE_LABELS,
  ROLES,
} from '@/lib/constants';
import {
  filterInterventionsByRole,
  generateInterventionReference,
  getActiveTechnicians,
  getTechnicianName,
  isDateInRange,
  isTechnicianAvailable,
  TECHNICIAN_UNAVAILABLE_MESSAGE,
} from '@/lib/interventions';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';

export default function InterventionsPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const { showSuccess, showError } = useToast();

  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statutFilter, setStatutFilter] = useState('all');
  const [prioriteFilter, setPrioriteFilter] = useState('all');
  const [clientFilter, setClientFilter] = useState('all');
  const [technicianFilter, setTechnicianFilter] = useState('all');
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [page, setPage] = useState(1);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedIntervention, setSelectedIntervention] = useState<Intervention | undefined>();
  const [detailIntervention, setDetailIntervention] = useState<Intervention | null>(null);
  const [assignIntervention, setAssignIntervention] = useState<Intervention | null>(null);
  const [statusIntervention, setStatusIntervention] = useState<Intervention | null>(null);
  const [closeIntervention, setCloseIntervention] = useState<Intervention | null>(null);
  const [deleteIntervention, setDeleteIntervention] = useState<Intervention | null>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [isLoading, user, router]);

  useEffect(() => {
    setInterventions(mockInterventions);
  }, []);

  const roleScoped = useMemo(() => {
    if (!user) return [];
    return filterInterventionsByRole(interventions, user);
  }, [interventions, user]);

  const filteredInterventions = useMemo(() => {
    let result = roleScoped;

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter((intervention) => {
        const clientName =
          mockClients.find((c) => c.id === intervention.clientId)?.societe ?? '';
        const equipmentLabel = (() => {
          const eq = mockEquipments.find((e) => e.id === intervention.equipementId);
          return eq ? `${eq.reference} ${eq.marque} ${eq.modele}` : '';
        })();
        const techName = getTechnicianName(intervention.technicienId).toLowerCase();

        return (
          intervention.reference.toLowerCase().includes(q) ||
          clientName.toLowerCase().includes(q) ||
          equipmentLabel.toLowerCase().includes(q) ||
          techName.includes(q) ||
          intervention.description.toLowerCase().includes(q)
        );
      });
    }

    if (typeFilter !== 'all') {
      result = result.filter((i) => i.type === typeFilter);
    }
    if (statutFilter !== 'all') {
      result = result.filter((i) => i.statut === statutFilter);
    }
    if (prioriteFilter !== 'all') {
      result = result.filter((i) => i.priorite === prioriteFilter);
    }
    if (clientFilter !== 'all') {
      result = result.filter((i) => i.clientId === clientFilter);
    }
    if (technicianFilter !== 'all') {
      result = result.filter((i) => i.technicienId === technicianFilter);
    }
    if (dateStart || dateEnd) {
      result = result.filter((i) => isDateInRange(i.datePrevue, dateStart || undefined, dateEnd || undefined));
    }

    return result;
  }, [
    roleScoped,
    searchTerm,
    typeFilter,
    statutFilter,
    prioriteFilter,
    clientFilter,
    technicianFilter,
    dateStart,
    dateEnd,
  ]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { setPage(1); }, [searchTerm, typeFilter, statutFilter, prioriteFilter, clientFilter, technicianFilter, dateStart, dateEnd]);

  const handleSort = useCallback((key: string) => {
    setSortConfig((prev) => toggleSort(prev, key));
  }, []);

  const sortedInterventions = useMemo(
    () =>
      sortData(filteredInterventions, sortConfig, (i, key) => {
        switch (key) {
          case 'reference': return i.reference;
          case 'type': return i.type;
          case 'client': return mockClients.find((c) => c.id === i.clientId)?.societe ?? '';
          case 'equipment': return mockEquipments.find((e) => e.id === i.equipementId)?.reference ?? '';
          case 'technicien': return getTechnicianName(i.technicienId);
          case 'datePrevue': return i.datePrevue;
          case 'priorite': return PRIORITY_SORT_ORDER[i.priorite] ?? 0;
          case 'statut': return i.statut;
          default: return '';
        }
      }),
    [filteredInterventions, sortConfig]
  );

  const pagedInterventions = useMemo(
    () => paginateData(sortedInterventions, page, 10),
    [sortedInterventions, page]
  );

  const isAdmin = user?.role === ROLES.ADMIN;
  const isTechnician = user?.role === ROLES.TECHNICIAN;

  const getClientName = (clientId: string) =>
    mockClients.find((c) => c.id === clientId)?.societe ?? 'N/A';

  const getEquipmentLabel = (equipementId: string) => {
    const eq = mockEquipments.find((e) => e.id === equipementId);
    return eq ? `${eq.reference}` : 'N/A';
  };

  const handleAdd = useCallback(
    (formData: InterventionFormData) => {
      if (
        formData.technicienId &&
        !isTechnicianAvailable(formData.technicienId, formData.datePrevue, interventions)
      ) {
        showError(TECHNICIAN_UNAVAILABLE_MESSAGE);
        return;
      }

      const newIntervention: Intervention = {
        id: `int-${Date.now()}`,
        reference: generateInterventionReference(interventions),
        ...formData,
        statut: 'PLANIFIEE',
      };
      setInterventions((prev) => [...prev, newIntervention]);
      setIsFormOpen(false);
      setSelectedIntervention(undefined);
      showSuccess('Intervention créée avec succès');
    },
    [interventions, showSuccess, showError]
  );

  const handleUpdate = useCallback(
    (formData: InterventionFormData) => {
      if (!selectedIntervention) return;
      if (
        formData.technicienId &&
        !isTechnicianAvailable(
          formData.technicienId,
          formData.datePrevue,
          interventions,
          selectedIntervention.id
        )
      ) {
        showError(TECHNICIAN_UNAVAILABLE_MESSAGE);
        return;
      }

      setInterventions((prev) =>
        prev.map((i) =>
          i.id === selectedIntervention.id ? { ...i, ...formData } : i
        )
      );
      setIsFormOpen(false);
      setSelectedIntervention(undefined);
      showSuccess('Intervention modifiée avec succès');
    },
    [selectedIntervention, interventions, showSuccess, showError]
  );

  const handleDelete = useCallback(() => {
    if (!deleteIntervention) return;
    setInterventions((prev) => prev.filter((i) => i.id !== deleteIntervention.id));
    setDeleteIntervention(null);
    showSuccess('Intervention supprimée');
  }, [deleteIntervention, showSuccess]);

  const handleAssign = useCallback(
    (technicienId: string) => {
      if (!assignIntervention) return;
      setInterventions((prev) =>
        prev.map((i) =>
          i.id === assignIntervention.id ? { ...i, technicienId } : i
        )
      );
      setAssignIntervention(null);
      showSuccess('Technicien affecté');
    },
    [assignIntervention, showSuccess]
  );

  const handleStatusChange = useCallback(
    (statut: InterventionStatut) => {
      if (!statusIntervention) return;
      setInterventions((prev) =>
        prev.map((i) => (i.id === statusIntervention.id ? { ...i, statut } : i))
      );
      setStatusIntervention(null);
      showSuccess('Statut mis à jour');
    },
    [statusIntervention, showSuccess]
  );

  const handleStart = useCallback(
    (intervention: Intervention) => {
      setInterventions((prev) =>
        prev.map((i) =>
          i.id === intervention.id ? { ...i, statut: 'EN_COURS' as const } : i
        )
      );
      showSuccess('Intervention démarrée');
    },
    [showSuccess]
  );

  const handleClose = useCallback(
    (data: CloseInterventionData) => {
      if (!closeIntervention) return;
      setInterventions((prev) =>
        prev.map((i) =>
          i.id === closeIntervention.id
            ? {
                ...i,
                statut: data.statut,
                dateRealisation: data.dateRealisation,
                diagnostic: data.diagnostic,
                actionsRealisees: data.actionsRealisees,
                materielUtilise: data.materielUtilise || undefined,
                dureeMinutes: data.dureeMinutes,
                observations: data.observations || undefined,
              }
            : i
        )
      );
      setCloseIntervention(null);
      showSuccess('Intervention clôturée');
    },
    [closeIntervention, showSuccess]
  );

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <p className="text-muted-foreground">Chargement...</p>
      </div>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Interventions</h1>
            <p className="text-muted-foreground mt-2">
              Suivi et gestion des interventions techniques
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" asChild className="gap-2">
              <Link href="/interventions/planning">
                <Calendar size={16} />
                Planning
              </Link>
            </Button>
            {isAdmin && (
              <Button
                className="gap-2"
                onClick={() => {
                  setSelectedIntervention(undefined);
                  setIsFormOpen(true);
                }}
              >
                <Plus size={16} />
                Ajouter une intervention
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Input
            placeholder="Rechercher (réf., client, équipement...)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-9 lg:col-span-2"
          />
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les types</SelectItem>
              {Object.entries(INTERVENTION_TYPE_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statutFilter} onValueChange={setStatutFilter}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              {Object.entries(INTERVENTION_STATUS_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <Select value={prioriteFilter} onValueChange={setPrioriteFilter}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Priorité" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les priorités</SelectItem>
              {Object.entries(INTERVENTION_PRIORITY_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {(isAdmin || isTechnician) && (
            <Select value={clientFilter} onValueChange={setClientFilter}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Client" />
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
          )}
          {(isAdmin || isTechnician) && (
            <Select value={technicianFilter} onValueChange={setTechnicianFilter}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Technicien" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les techniciens</SelectItem>
                {getActiveTechnicians().map((tech) => (
                  <SelectItem key={tech.id} value={tech.id}>
                    {tech.prenom} {tech.nom}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Input
            type="date"
            value={dateStart}
            onChange={(e) => setDateStart(e.target.value)}
            className="h-9"
            placeholder="Date début"
          />
          <Input
            type="date"
            value={dateEnd}
            onChange={(e) => setDateEnd(e.target.value)}
            className="h-9"
            placeholder="Date fin"
          />
        </div>

        {filteredInterventions.length === 0 ? (
          <EmptyState
            title="Aucune intervention trouvée"
            description="Modifiez vos filtres ou créez une nouvelle intervention."
          />
        ) : (
          <>
            <div className="border border-border rounded-lg overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <SortableHeader label="Référence" sortKey="reference" sortConfig={sortConfig} onSort={handleSort} />
                    <SortableHeader label="Type" sortKey="type" sortConfig={sortConfig} onSort={handleSort} />
                    <SortableHeader label="Client" sortKey="client" sortConfig={sortConfig} onSort={handleSort} />
                    <SortableHeader label="Équipement" sortKey="equipment" sortConfig={sortConfig} onSort={handleSort} />
                    <SortableHeader label="Technicien" sortKey="technicien" sortConfig={sortConfig} onSort={handleSort} className="hidden md:table-cell" />
                    <SortableHeader label="Date prévue" sortKey="datePrevue" sortConfig={sortConfig} onSort={handleSort} />
                    <SortableHeader label="Priorité" sortKey="priorite" sortConfig={sortConfig} onSort={handleSort} className="hidden sm:table-cell" />
                    <SortableHeader label="Statut" sortKey="statut" sortConfig={sortConfig} onSort={handleSort} />
                    <TableHead className="hidden lg:table-cell">Couverture</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pagedInterventions.map((intervention) => (
                    <InterventionTableRow
                      key={intervention.id}
                      intervention={intervention}
                      user={user}
                      getClientName={getClientName}
                      getEquipmentLabel={getEquipmentLabel}
                      onView={() => setDetailIntervention(intervention)}
                      onEdit={() => {
                        setSelectedIntervention(intervention);
                        setIsFormOpen(true);
                      }}
                      onAssign={() => setAssignIntervention(intervention)}
                      onStatus={() => setStatusIntervention(intervention)}
                      onDelete={() => setDeleteIntervention(intervention)}
                      onStart={() => handleStart(intervention)}
                      onClose={() => setCloseIntervention(intervention)}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
            <TablePagination
              page={page}
              pageSize={10}
              totalItems={filteredInterventions.length}
              onPrevious={() => setPage((p) => p - 1)}
              onNext={() => setPage((p) => p + 1)}
            />
          </>
        )}
      </div>

      {isAdmin && (
        <InterventionForm
          open={isFormOpen}
          intervention={selectedIntervention}
          interventions={interventions}
          onClose={() => {
            setIsFormOpen(false);
            setSelectedIntervention(undefined);
          }}
          onSubmit={selectedIntervention ? handleUpdate : handleAdd}
        />
      )}

      <InterventionDetail
        open={!!detailIntervention}
        intervention={detailIntervention}
        onClose={() => setDetailIntervention(null)}
      />

      {isAdmin && (
        <>
          <AssignTechnicianDialog
            open={!!assignIntervention}
            intervention={assignIntervention}
            interventions={interventions}
            onClose={() => setAssignIntervention(null)}
            onAssign={handleAssign}
          />
          <ChangeStatusDialog
            open={!!statusIntervention}
            intervention={statusIntervention}
            onClose={() => setStatusIntervention(null)}
            onConfirm={handleStatusChange}
          />
          <ConfirmDialog
            open={!!deleteIntervention}
            title="Supprimer l'intervention"
            description={`Êtes-vous sûr de vouloir supprimer ${deleteIntervention?.reference} ? Cette suppression est simulée.`}
            actionLabel="Supprimer"
            actionVariant="destructive"
            onConfirm={handleDelete}
            onCancel={() => setDeleteIntervention(null)}
          />
        </>
      )}

      {isTechnician && (
        <CloseInterventionDialog
          open={!!closeIntervention}
          intervention={closeIntervention}
          onClose={() => setCloseIntervention(null)}
          onSubmit={handleClose}
        />
      )}
    </AppLayout>
  );
}

interface InterventionTableRowProps {
  intervention: Intervention;
  user: User;
  getClientName: (id: string) => string;
  getEquipmentLabel: (id: string) => string;
  onView: () => void;
  onEdit: () => void;
  onAssign: () => void;
  onStatus: () => void;
  onDelete: () => void;
  onStart: () => void;
  onClose: () => void;
}

function InterventionTableRow({
  intervention,
  user,
  getClientName,
  getEquipmentLabel,
  onView,
  onEdit,
  onAssign,
  onStatus,
  onDelete,
  onStart,
  onClose,
}: InterventionTableRowProps) {
  const isAdmin = user.role === ROLES.ADMIN;
  const isTechnician = user.role === ROLES.TECHNICIAN;

  return (
    <TableRow>
      <TableCell className="font-medium whitespace-nowrap">{intervention.reference}</TableCell>
      <TableCell>
        <Badge variant="outline" className="text-xs">
          {INTERVENTION_TYPE_LABELS[intervention.type]}
        </Badge>
      </TableCell>
      <TableCell className="max-w-[120px] truncate">{getClientName(intervention.clientId)}</TableCell>
      <TableCell>{getEquipmentLabel(intervention.equipementId)}</TableCell>
      <TableCell className="hidden md:table-cell text-sm">
        {getTechnicianName(intervention.technicienId)}
      </TableCell>
      <TableCell className="whitespace-nowrap text-sm">{formatDate(intervention.datePrevue)}</TableCell>
      <TableCell className="hidden sm:table-cell">
        <PriorityBadge priority={intervention.priorite} />
      </TableCell>
      <TableCell>
        <StatusBadge status={intervention.statut} type="intervention" />
      </TableCell>
      <TableCell className="hidden lg:table-cell">
        {intervention.couvertureContrat ? (
          <span className="text-green-700 text-sm">Oui</span>
        ) : (
          <span className="text-muted-foreground text-sm">Non</span>
        )}
      </TableCell>
      <TableCell className="text-right">
        <ActionMenu
          intervention={intervention}
          isAdmin={isAdmin}
          isTechnician={isTechnician}
          onView={onView}
          onEdit={onEdit}
          onAssign={onAssign}
          onStatus={onStatus}
          onDelete={onDelete}
          onStart={onStart}
          onClose={onClose}
        />
      </TableCell>
    </TableRow>
  );
}

function ActionMenu({
  intervention,
  isAdmin,
  isTechnician,
  onView,
  onEdit,
  onAssign,
  onStatus,
  onDelete,
  onStart,
  onClose,
}: {
  intervention: Intervention;
  isAdmin: boolean;
  isTechnician: boolean;
  onView: () => void;
  onEdit: () => void;
  onAssign: () => void;
  onStatus: () => void;
  onDelete: () => void;
  onStart: () => void;
  onClose: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" variant="outline" aria-label="Actions">
          <MoreHorizontal size={16} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onView}>
          <Eye size={14} className="mr-2" />
          Voir détail
        </DropdownMenuItem>
        {isAdmin && (
          <>
            <DropdownMenuItem onClick={onEdit}>
              <Edit2 size={14} className="mr-2" />
              Modifier
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onAssign}>
              <UserPlus size={14} className="mr-2" />
              Affecter technicien
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onStatus}>
              <RefreshCw size={14} className="mr-2" />
              Changer statut
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onDelete} className="text-destructive">
              <Trash2 size={14} className="mr-2" />
              Supprimer
            </DropdownMenuItem>
          </>
        )}
        {isTechnician && intervention.statut === 'PLANIFIEE' && (
          <DropdownMenuItem onClick={onStart}>
            <Play size={14} className="mr-2" />
            Démarrer intervention
          </DropdownMenuItem>
        )}
        {isTechnician && intervention.statut === 'EN_COURS' && (
          <DropdownMenuItem onClick={onClose}>
            <CheckCircle size={14} className="mr-2" />
            Clôturer intervention
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
