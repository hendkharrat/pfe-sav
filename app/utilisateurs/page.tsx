'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { User, UserRole } from '@/types';
import { AppLayout } from '@/components/layout/AppLayout';
import { AdminOnly } from '@/components/shared/AdminOnly';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { UserForm } from '@/components/forms/UserForm';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { ROLE_LABELS, ROLES } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
import { RoleBadge } from '@/components/shared/RoleBadge';
import { SortableHeader } from '@/components/shared/SortableHeader';
import { TablePagination } from '@/components/shared/TablePagination';
import { type SortConfig, sortData, paginateData, toggleSort } from '@/lib/table';
import { formatDate } from '@/lib/utils';
import { Plus, Edit2, Trash2, RotateCcw, Filter } from 'lucide-react';

export default function UsersPage() {
  const { isLoading } = useAuth();
  const { showSuccess, showError } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [page, setPage] = useState(1);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | undefined>();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [userToDeactivate, setUserToDeactivate] = useState<User | null>(null);
  const [isRestoreConfirmOpen, setIsRestoreConfirmOpen] = useState(false);
  const [userToRestore, setUserToRestore] = useState<User | null>(null);

  useEffect(() => {
    fetch('/api/users')
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setUsers(data); })
      .catch(() => showError('Erreur lors du chargement des utilisateurs.'));
  }, [showError]);

  // Filter users
  useEffect(() => {
    let result = users;

    if (searchTerm) {
      result = result.filter(
        (u) =>
          `${u.prenom} ${u.nom}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (roleFilter !== 'all') {
      result = result.filter((u) => u.role === roleFilter);
    }

    if (statusFilter !== 'all') {
      result = result.filter((u) => (statusFilter === 'active' ? u.actif : !u.actif));
    }

    setFilteredUsers(result);
  }, [users, searchTerm, roleFilter, statusFilter]);

  useEffect(() => { setPage(1); }, [searchTerm, roleFilter, statusFilter]);

  const handleSort = useCallback((key: string) => {
    setSortConfig((prev) => toggleSort(prev, key));
  }, []);

  const sortedUsers = useMemo(
    () =>
      sortData(filteredUsers, sortConfig, (user, key) => {
        switch (key) {
          case 'nom': return `${user.prenom} ${user.nom}`;
          case 'email': return user.email;
          case 'role': return user.role;
          case 'statut': return user.actif ? 'actif' : 'inactif';
          case 'dateCreation': return user.dateCreation;
          default: return '';
        }
      }),
    [filteredUsers, sortConfig]
  );

  const pagedUsers = useMemo(
    () => paginateData(sortedUsers, page, 10),
    [sortedUsers, page]
  );

  const handleAddUser = useCallback(
    async (formData: Omit<User, 'id' | 'dateCreation'> & { password?: string }) => {
      setIsSubmitting(true);
      try {
        const res = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (!res.ok) {
          showError(data.error ?? "Erreur lors de la création de l'utilisateur.");
          return;
        }
        setUsers((prev) => [...prev, data]);
        setIsFormOpen(false);
        setSelectedUser(undefined);
        showSuccess('Utilisateur ajouté avec succès');
      } catch {
        showError("Erreur lors de la création de l'utilisateur.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [showSuccess, showError]
  );

  const handleUpdateUser = useCallback(
    async (formData: Omit<User, 'id' | 'dateCreation'> & { password?: string }) => {
      if (!selectedUser) return;
      setIsSubmitting(true);
      try {
        const res = await fetch(`/api/users/${selectedUser.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (!res.ok) {
          showError(data.error ?? "Erreur lors de la modification de l'utilisateur.");
          return;
        }
        setUsers((prev) => prev.map((u) => (u.id === selectedUser.id ? data : u)));
        setIsFormOpen(false);
        setSelectedUser(undefined);
        showSuccess('Utilisateur modifié avec succès');
      } catch {
        showError("Erreur lors de la modification de l'utilisateur.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [selectedUser, showSuccess, showError]
  );

  const handleDeactivateUser = useCallback(async () => {
    if (!userToDeactivate) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/users/${userToDeactivate.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actif: false }),
      });
      const data = await res.json();
      if (!res.ok) {
        showError(data.error ?? "Erreur lors de la désactivation de l'utilisateur.");
        return;
      }
      setUsers((prev) => prev.map((u) => (u.id === userToDeactivate.id ? data : u)));
      setIsConfirmOpen(false);
      setUserToDeactivate(null);
      showSuccess('Utilisateur désactivé');
    } catch {
      showError("Erreur lors de la désactivation de l'utilisateur.");
    } finally {
      setIsSubmitting(false);
    }
  }, [userToDeactivate, showSuccess, showError]);

  const handleRestoreUser = useCallback(async () => {
    if (!userToRestore) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/users/${userToRestore.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actif: true }),
      });
      const data = await res.json();
      if (!res.ok) {
        showError(data.error ?? "Erreur lors de la restauration de l'utilisateur.");
        return;
      }
      setUsers((prev) => prev.map((u) => (u.id === userToRestore.id ? data : u)));
      setIsRestoreConfirmOpen(false);
      setUserToRestore(null);
      showSuccess('Utilisateur restauré');
    } catch {
      showError("Erreur lors de la restauration de l'utilisateur.");
    } finally {
      setIsSubmitting(false);
    }
  }, [userToRestore, showSuccess, showError]);

  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setIsFormOpen(true);
  };

  const handleDeactivateClick = (user: User) => {
    setUserToDeactivate(user);
    setIsConfirmOpen(true);
  };

  const handleRestoreClick = (user: User) => {
    setUserToRestore(user);
    setIsRestoreConfirmOpen(true);
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
              <h1 className="text-3xl font-bold text-foreground">Utilisateurs</h1>
              <p className="text-muted-foreground mt-2">Gestion des utilisateurs et permissions</p>
            </div>
            <Button 
              onClick={() => {
                setSelectedUser(undefined);
                setIsFormOpen(true);
              }}
              className="gap-2 w-full sm:w-auto"
            >
              <Plus size={16} />
              Ajouter un utilisateur
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
                placeholder="Rechercher par nom ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-9"
              />
              <Select value={roleFilter} onValueChange={(value) => setRoleFilter(value as 'all' | UserRole)}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les rôles</SelectItem>
                  <SelectItem value={ROLES.ADMIN}>{ROLE_LABELS.admin}</SelectItem>
                  <SelectItem value={ROLES.TECHNICIAN}>{ROLE_LABELS.technician}</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as 'all' | 'active' | 'inactive')}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="active">Actif</SelectItem>
                  <SelectItem value="inactive">Inactif</SelectItem>
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
                  <SortableHeader label="Nom complet" sortKey="nom" sortConfig={sortConfig} onSort={handleSort} />
                  <SortableHeader label="Email" sortKey="email" sortConfig={sortConfig} onSort={handleSort} />
                  <TableHead>Téléphone</TableHead>
                  <SortableHeader label="Rôle" sortKey="role" sortConfig={sortConfig} onSort={handleSort} />
                  <SortableHeader label="Statut" sortKey="statut" sortConfig={sortConfig} onSort={handleSort} />
                  <SortableHeader label="Date création" sortKey="dateCreation" sortConfig={sortConfig} onSort={handleSort} />
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Aucun utilisateur trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  pagedUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{`${user.prenom} ${user.nom}`}</TableCell>
                      <TableCell className="text-muted-foreground">{user.email}</TableCell>
                      <TableCell className="text-muted-foreground">{user.telephone || '—'}</TableCell>
                      <TableCell>
                        <RoleBadge role={user.role} />
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.actif ? 'default' : 'secondary'}>
                          {user.actif ? 'Actif' : 'Inactif'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(user.dateCreation)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            size="sm"
                            variant="outline"
                            aria-label="Modifier l'utilisateur"
                            onClick={() => handleEditClick(user)}
                          >
                            <Edit2 size={16} />
                          </Button>
                          {user.actif ? (
                            <Button
                              size="sm"
                              variant="outline"
                              aria-label="Désactiver l'utilisateur"
                              onClick={() => handleDeactivateClick(user)}
                            >
                              <Trash2 size={16} />
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              aria-label="Restaurer l'utilisateur"
                              onClick={() => handleRestoreClick(user)}
                            >
                              <RotateCcw size={16} />
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
            totalItems={filteredUsers.length}
            onPrevious={() => setPage((p) => p - 1)}
            onNext={() => setPage((p) => p + 1)}
          />
        </div>

        {/* Modals */}
        <UserForm
          open={isFormOpen}
          user={selectedUser}
          onClose={() => {
            setIsFormOpen(false);
            setSelectedUser(undefined);
          }}
          onSubmit={selectedUser ? handleUpdateUser : handleAddUser}
          isLoading={isSubmitting}
        />

        <ConfirmDialog
          open={isConfirmOpen}
          title="Désactiver l'utilisateur"
          description={`Êtes-vous sûr de vouloir désactiver ${userToDeactivate?.prenom} ${userToDeactivate?.nom} ? Cet utilisateur ne pourra plus se connecter.`}
          actionLabel="Désactiver"
          actionVariant="destructive"
          onConfirm={handleDeactivateUser}
          onCancel={() => {
            setIsConfirmOpen(false);
            setUserToDeactivate(null);
          }}
        />

        <ConfirmDialog
          open={isRestoreConfirmOpen}
          title="Restaurer l'utilisateur"
          description={`Êtes-vous sûr de vouloir restaurer ${userToRestore?.prenom} ${userToRestore?.nom} ? Cet utilisateur pourra de nouveau se connecter.`}
          actionLabel="Restaurer"
          actionVariant="default"
          onConfirm={handleRestoreUser}
          onCancel={() => {
            setIsRestoreConfirmOpen(false);
            setUserToRestore(null);
          }}
        />
      </AppLayout>
    </AdminOnly>
  );
}
