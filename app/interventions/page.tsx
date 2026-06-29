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
import { type SortConfig, sortData, paginateData, toggleSort } from '@/lib/table';
import { Client, ClientEquipement, Equipment, Intervention, InterventionStatut, User } from '@/types';
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
import { EmptyState } from '@/components/shared/EmptyState';
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
  INTERVENTION_STATUS_LABELS,
  INTERVENTION_TYPE_LABELS,
  ROLES,
} from '@/lib/constants';
import {
  filterInterventionsByRole,
  getTechnicianName,
  isDateInRange,
} from '@/lib/interventions';
import { Badge } from '@/components/ui/badge';
import { formatDate, getClientDisplayName } from '@/lib/utils';

export default function InterventionsPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const { showSuccess, showError } = useToast();

  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [clientEquipements, setClientEquipements] = useState<ClientEquipement[]>([]);
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statutFilter, setStatutFilter] = useState('all');
  const [clientFilter, setClientFilter] = useState<number | 'all'>('all');
  const [technicianFilter, setTechnicianFilter] = useState<number | 'all'>('all');
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
    Promise.all([
      fetch('/api/interventions').then((r) => r.json()),
      fetch('/api/clients').then((r) => r.json()),
      fetch('/api/client-equipements').then((r) => r.json()),
      fetch('/api/equipements').then((r) => r.json()),
      fetch('/api/users').then((r) => r.json()),
    ])
      .then(([ivs, cls, ces, eqs, us]) => {
        if (Array.isArray(ivs)) setInterventions(ivs);
        if (Array.isArray(cls)) setClients(cls);
        if (Array.isArray(ces)) setClientEquipements(ces);
        if (Array.isArray(eqs)) setEquipments(eqs);
        if (Array.isArray(us)) setUsers(us);
      })
      .catch(() => showError('Erreur lors du chargement des données.'));
  }, [showError]);

  const roleScoped = useMemo(() => {
    if (!user) return [];
    return filterInterventionsByRole(interventions, user);
  }, [interventions, user]);

  const filteredInterventions = useMemo(() => {
    let result = roleScoped;

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter((intervention) => {
        const cl = clients.find((c) => c.id === intervention.clientId);
        const clientName = cl ? getClientDisplayName(cl) : '';
        const eq = equipments.find((e) => e.id === intervention.equipementId);
        const equipmentLabel = eq ? `${eq.reference} ${eq.marque} ${eq.modele}` : '';
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
    clientFilter,
    technicianFilter,
    dateStart,
    dateEnd,
    clients,
    equipments,
  ]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { setPage(1); }, [searchTerm, typeFilter, statutFilter, clientFilter, technicianFilter, dateStart, dateEnd]);

  const handleSort = useCallback((key: string) => {
    setSortConfig((prev) => toggleSort(prev, key));
  }, []);

  const sortedInterventions = useMemo(
    () =>
      sortData(filteredInterventions, sortConfig, (i, key) => {
        switch (key) {
          case 'reference': return i.reference;
          case 'type': return i.type;
          case 'client': { const cl = clients.find((c) => c.id === i.clientId); return cl ? getClientDisplayName(cl) : ''; }
          case 'equipment': return equipments.find((e) => e.id === i.equipementId)?.reference ?? '';
          case 'technicien': return getTechnicianName(i.technicienId);
          case 'datePrevue': return i.datePrevue;
          case 'statut': return i.statut;
          default: return '';
        }
      }),
    [filteredInterventions, sortConfig, clients, equipments]
  );

  const pagedInterventions = useMemo(
    () => paginateData(sortedInterventions, page, 10),
    [sortedInterventions, page]
  );

  const isAdmin = user?.role === ROLES.ADMIN;
  const isTechnician = user?.role === ROLES.TECHNICIAN;
  const isClient = user?.role === ROLES.CLIENT;

  const activeTechnicians = useMemo(
    () => users.filter((u) => u.role === 'technician' && u.actif),
    [users]
  );

  const getClientName = useCallback((clientId: number) => {
    const c = clients.find((cl) => cl.id === clientId);
    return c ? getClientDisplayName(c) : 'N/A';
  }, [clients]);

  const getEquipmentLabel = useCallback((equipementId: number) => {
    if (!equipementId) return 'N/A';
    const eq = equipments.find((e) => e.id === equipementId);
    return eq ? `${eq.reference}` : 'N/A';
  }, [equipments]);

  const handleAdd = useCallback(
    async (formData: InterventionFormData) => {
      setIsSubmitting(true);
      try {
        const res = await fetch('/api/interventions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: formData.type,
            clientId: formData.clientId,
            clientEquipementId: formData.clientEquipementId,
            technicienId: formData.technicienId,
            contractId: formData.contractId,
            datePrevue: formData.datePrevue,
            description: formData.description,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          showError(data.error ?? "Erreur lors de la création de l'intervention.");
          return;
        }
        setInterventions((prev) => [...prev, data]);
        setIsFormOpen(false);
        setSelectedIntervention(undefined);
        showSuccess('Intervention créée avec succès');
      } catch {
        showError("Erreur lors de la création de l'intervention.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [showSuccess, showError]
  );

  const handleUpdate = useCallback(
    async (formData: InterventionFormData) => {
      if (!selectedIntervention) return;
      setIsSubmitting(true);
      try {
        const res = await fetch(`/api/interventions/${selectedIntervention.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            description: formData.description,
            datePrevue: formData.datePrevue,
            technicienId: formData.technicienId,
            contractId: formData.contractId,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          showError(data.error ?? "Erreur lors de la modification de l'intervention.");
          return;
        }
        setInterventions((prev) =>
          prev.map((i) => (i.id === selectedIntervention.id ? data : i))
        );
        setIsFormOpen(false);
        setSelectedIntervention(undefined);
        showSuccess('Intervention modifiée avec succès');
      } catch {
        showError("Erreur lors de la modification de l'intervention.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [selectedIntervention, showSuccess, showError]
  );

  const handleDelete = useCallback(async () => {
    if (!deleteIntervention) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/interventions/${deleteIntervention.id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        showError((data as { error?: string }).error ?? "Erreur lors de la suppression de l'intervention.");
        return;
      }
      setInterventions((prev) => prev.filter((i) => i.id !== deleteIntervention.id));
      setDeleteIntervention(null);
      showSuccess('Intervention supprimée');
    } catch {
      showError("Erreur lors de la suppression de l'intervention.");
    } finally {
      setIsSubmitting(false);
    }
  }, [deleteIntervention, showSuccess, showError]);

  const handleAssign = useCallback(
    async (technicienId: string) => {
      if (!assignIntervention) return;
      setIsSubmitting(true);
      try {
        const res = await fetch(`/api/interventions/${assignIntervention.id}/assign`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ technicienId }),
        });
        const data = await res.json();
        if (!res.ok) {
          showError(data.error ?? "Erreur lors de l'affectation du technicien.");
          return;
        }
        setInterventions((prev) =>
          prev.map((i) =>
            i.id === assignIntervention.id ? { ...i, technicienId: data.technicienId } : i
          )
        );
        setAssignIntervention(null);
        showSuccess('Technicien affecté');
      } catch {
        showError("Erreur lors de l'affectation du technicien.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [assignIntervention, showSuccess, showError]
  );

  const handleStatusChange = useCallback(
    async (statut: InterventionStatut) => {
      if (!statusIntervention) return;
      setIsSubmitting(true);
      try {
        const res = await fetch(`/api/interventions/${statusIntervention.id}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ statut }),
        });
        const data = await res.json();
        if (!res.ok) {
          showError(data.error ?? 'Erreur lors du changement de statut.');
          return;
        }
        setInterventions((prev) =>
          prev.map((i) =>
            i.id === statusIntervention.id
              ? { ...i, statut: data.statut, dateRealisation: data.dateRealisation }
              : i
          )
        );
        setStatusIntervention(null);
        showSuccess('Statut mis à jour');
      } catch {
        showError('Erreur lors du changement de statut.');
      } finally {
        setIsSubmitting(false);
      }
    },
    [statusIntervention, showSuccess, showError]
  );

  const handleStart = useCallback(
    async (intervention: Intervention) => {
      setIsSubmitting(true);
      try {
        const res = await fetch(`/api/interventions/${intervention.id}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ statut: 'EN_COURS' }),
        });
        const data = await res.json();
        if (!res.ok) {
          showError(data.error ?? "Erreur lors du démarrage de l'intervention.");
          return;
        }
        setInterventions((prev) =>
          prev.map((i) => (i.id === intervention.id ? { ...i, statut: data.statut } : i))
        );
        showSuccess('Intervention démarrée');
      } catch {
        showError("Erreur lors du démarrage de l'intervention.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [showSuccess, showError]
  );

  const handleClose = useCallback(
    async (data: CloseInterventionData) => {
      if (!closeIntervention) return;
      setIsSubmitting(true);
      try {
        let res: Response;
        if (data.statut === 'ANNULEE') {
          res = await fetch(`/api/interventions/${closeIntervention.id}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ statut: 'ANNULEE' }),
          });
        } else {
          res = await fetch(`/api/interventions/${closeIntervention.id}/close`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              diagnostic: data.diagnostic,
              actionsRealisees: data.actionsRealisees,
              materielUtilise: data.materielUtilise,
              dureeMinutes: data.dureeMinutes,
              observations: data.observations,
            }),
          });
        }
        const json = await res.json();
        if (!res.ok) {
          showError(json.error ?? "Erreur lors de la clôture de l'intervention.");
          return;
        }
        setInterventions((prev) =>
          prev.map((i) => {
            if (i.id !== closeIntervention.id) return i;
            if (data.statut === 'ANNULEE') return { ...i, statut: 'ANNULEE' as InterventionStatut };
            return json as Intervention;
          })
        );
        setCloseIntervention(null);
        showSuccess('Intervention clôturée');
      } catch {
        showError("Erreur lors de la clôture de l'intervention.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [closeIntervention, showSuccess, showError]
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {(isAdmin || isTechnician) && (
            <Select value={clientFilter === 'all' ? 'all' : String(clientFilter)} onValueChange={(v) => setClientFilter(v === 'all' ? 'all' : Number(v))}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Client" />
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
          )}
          {isAdmin && (
            <Select value={technicianFilter === 'all' ? 'all' : String(technicianFilter)} onValueChange={(v) => setTechnicianFilter(v === 'all' ? 'all' : Number(v))}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Technicien" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les techniciens</SelectItem>
                {activeTechnicians.map((tech) => (
                  <SelectItem key={tech.id} value={String(tech.id)}>
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
                    {!isClient && <SortableHeader label="Client" sortKey="client" sortConfig={sortConfig} onSort={handleSort} />}
                    <SortableHeader label="Équipement" sortKey="equipment" sortConfig={sortConfig} onSort={handleSort} />
                    {isAdmin && <SortableHeader label="Technicien" sortKey="technicien" sortConfig={sortConfig} onSort={handleSort} />}
                    <SortableHeader label="Date prévue" sortKey="datePrevue" sortConfig={sortConfig} onSort={handleSort} />
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
          isLoading={isSubmitting}
          clients={clients}
          clientEquipements={clientEquipements}
          equipments={equipments}
          users={users}
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
            users={users}
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
            description={`Êtes-vous sûr de vouloir supprimer ${deleteIntervention?.reference} ? Cette action est irréversible.`}
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
  getClientName: (id: number) => string;
  getEquipmentLabel: (id: number) => string;
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
  const isClient = user.role === ROLES.CLIENT;

  return (
    <TableRow>
      <TableCell className="font-medium whitespace-nowrap">{intervention.reference}</TableCell>
      <TableCell>
        <Badge variant="outline" className="text-xs">
          {INTERVENTION_TYPE_LABELS[intervention.type]}
        </Badge>
      </TableCell>
      {!isClient && (
        <TableCell className="max-w-[120px] truncate">{getClientName(intervention.clientId)}</TableCell>
      )}
      <TableCell>{getEquipmentLabel(intervention.equipementId)}</TableCell>
      {isAdmin && (
        <TableCell className="text-sm">
          {getTechnicianName(intervention.technicienId)}
        </TableCell>
      )}
      <TableCell className="whitespace-nowrap text-sm">{formatDate(intervention.datePrevue)}</TableCell>
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
