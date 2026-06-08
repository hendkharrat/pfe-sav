'use client';

import { useState } from 'react';
import { User, UserRole } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ROLE_LABELS, ROLES } from '@/lib/constants';

interface UserFormProps {
  open: boolean;
  user?: User;
  onClose: () => void;
  onSubmit: (data: Omit<User, 'id' | 'dateCreation'> & { password?: string }) => void;
  isLoading?: boolean;
}

export function UserForm({ open, user, onClose, onSubmit, isLoading = false }: UserFormProps) {
  const isEditing = !!user;

  const [formData, setFormData] = useState({
    prenom: user?.prenom || '',
    nom: user?.nom || '',
    email: user?.email || '',
    role: user?.role || ('technician' as UserRole),
    actif: user?.actif ?? true,
    password: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.prenom.trim()) newErrors.prenom = 'Le prénom est obligatoire';
    if (!formData.nom.trim()) newErrors.nom = 'Le nom est obligatoire';
    if (!formData.email.trim()) newErrors.email = 'L\'email est obligatoire';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email invalide';
    }
    if (!user && !formData.password.trim()) {
      newErrors.password = 'Le mot de passe est obligatoire pour un nouvel utilisateur';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;
    const { password, ...userData } = formData;
    onSubmit(user ? userData : { ...userData, password });
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      onClose();
      setFormData({
        prenom: '',
        nom: '',
        email: '',
        role: 'technician',
        actif: true,
        password: '',
      });
      setErrors({});
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="w-[95vw] max-w-xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{user ? 'Modifier l\'utilisateur' : 'Ajouter un utilisateur'}</DialogTitle>
          <DialogDescription>
            {user ? 'Modifiez les informations de l\'utilisateur' : 'Remplissez le formulaire pour créer un nouvel utilisateur'}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="prenom">Prénom *</Label>
              <Input
                id="prenom"
                value={formData.prenom}
                onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                disabled={isLoading}
                placeholder="Ahmed"
              />
              {errors.prenom && <p className="text-xs text-red-500">{errors.prenom}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="nom">Nom *</Label>
              <Input
                id="nom"
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                disabled={isLoading}
                placeholder="Ben Salah"
              />
              {errors.nom && <p className="text-xs text-red-500">{errors.nom}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              disabled={isLoading}
              placeholder="ahmed.bensalah@sav.tn"
            />
            {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="role">Rôle *</Label>
              <Select
                value={formData.role}
                onValueChange={(role) => setFormData({ ...formData, role: role as UserRole })}
              >
                <SelectTrigger id="role" disabled={isLoading}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ROLES.ADMIN}>{ROLE_LABELS.admin}</SelectItem>
                  <SelectItem value={ROLES.TECHNICIAN}>{ROLE_LABELS.technician}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {isEditing && (
              <div className="flex items-center gap-3 pt-8">
                <Switch
                  id="actif"
                  checked={formData.actif}
                  onCheckedChange={(actif) => setFormData({ ...formData, actif })}
                  disabled={isLoading}
                />
                <Label htmlFor="actif">Compte actif</Label>
              </div>
            )}
          </div>

          {!user && (
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe *</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                disabled={isLoading}
                placeholder="••••••••"
              />
              {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
            </div>
          )}

          <div className="flex gap-3 justify-end pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Traitement...' : user ? 'Modifier' : 'Ajouter'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
