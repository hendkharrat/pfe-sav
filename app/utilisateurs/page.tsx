'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { User, UserRole } from '@/types';
import { AppLayout } from '@/components/layout/AppLayout';
import { AdminOnly } from '@/components/shared/AdminOnly';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { UserForm } from '@/components/forms/UserForm';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { mockUsers } from '@/data/mock-users';
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
import { Plus, Edit2, Trash2, Filter } from 'lucide-react';

export default function UsersPage() {
  const router = useRouter();
  const { user: currentUser, isLoading } = useAuth();
  const { showSuccess, showError } = useToast();

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

  // Initialize users from mock data
  useEffect(() => {
    setUsers(mockUsers);
  }, []);

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
    (formData: Omit<User, 'id' | 'dateCreation'> & { password?: string }) => {
      const newUser: User = {
        ...formData,
        id: `user-${Date.now()}`,
        dateCreation: new Date().toISOString().split('T')[0],
      };
      setUsers([...users, newUser]);
      setIsFormOpen(false);
      setSelectedUser(undefined);
      showSuccess('Utilisateur ajouté avec succès');
    },
    [users, showSuccess]
  );

  const handleUpdateUser = useCallback(
    (formData: Omit<User, 'id' | 'dateCreation'> & { password?: string }) => {
      if (!selectedUser) return;
      const updated = users.map((u) =>
        u.id === selectedUser.id ? { ...u, ...formData } : u
      );
      setUsers(updated);
      setIsFormOpen(false);
      setSelectedUser(undefined);
      showSuccess('Utilisateur modifié avec succès');
    },
    [users, selectedUser, showSuccess]
  );

  const handleDeactivateUser = useCallback(() => {
    if (!userToDeactivate) return;
    const updated = users.map((u) =>
      u.id === userToDeactivate.id ? { ...u, actif: false } : u
    );
    setUsers(updated);
    setIsConfirmOpen(false);
    setUserToDeactivate(null);
    showSuccess('Utilisateur désactivé');
  }, [users, userToDeactivate, showSuccess]);

  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setIsFormOpen(true);
  };

  const handleDeactivateClick = (user: User) => {
    if (!user.actif) {
      showError('Cet utilisateur est déjà désactivé');
      return;
    }
    setUserToDeactivate(user);
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
                  <SelectItem value={ROLES.CLIENT}>{ROLE_LABELS.client}</SelectItem>
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
                  <SortableHeader label="Rôle" sortKey="role" sortConfig={sortConfig} onSort={handleSort} />
                  <SortableHeader label="Statut" sortKey="statut" sortConfig={sortConfig} onSort={handleSort} />
                  <SortableHeader label="Date création" sortKey="dateCreation" sortConfig={sortConfig} onSort={handleSort} />
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Aucun utilisateur trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  pagedUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{`${user.prenom} ${user.nom}`}</TableCell>
                      <TableCell className="text-muted-foreground">{user.email}</TableCell>
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
                          <Button
                            size="sm"
                            variant="outline"
                            aria-label="Désactiver l'utilisateur"
                            onClick={() => handleDeactivateClick(user)}
                            disabled={!user.actif}
                          >
                            <Trash2 size={16} />
                          </Button>
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
        />

        <ConfirmDialog
          open={isConfirmOpen}
          title="Désactiver l'utilisateur"
          description={`Êtes-vous sûr de vouloir désactiver ${userToDeactivate?.prenom} ${userToDeactivate?.nom}? Cet utilisateur ne pourra plus se connecter.`}
          actionLabel="Désactiver"
          actionVariant="destructive"
          onConfirm={handleDeactivateUser}
          onCancel={() => {
            setIsConfirmOpen(false);
            setUserToDeactivate(null);
          }}
        />
      </AppLayout>
    </AdminOnly>
  );
}
