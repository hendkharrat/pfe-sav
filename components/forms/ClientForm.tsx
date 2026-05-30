'use client';

import { useState } from 'react';
import { Client } from '@/types';
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

interface ClientFormProps {
  open: boolean;
  client?: Client;
  onClose: () => void;
  onSubmit: (data: Omit<Client, 'id' | 'dateCreation' | 'nombreEquipements' | 'userId'>) => void;
  isLoading?: boolean;
}

export function ClientForm({ open, client, onClose, onSubmit, isLoading = false }: ClientFormProps) {
  const [formData, setFormData] = useState({
    societe: client?.societe || '',
    contact: client?.contact || '',
    email: client?.email || '',
    telephone: client?.telephone || '',
    adresse: client?.adresse || '',
    ville: client?.ville || '',
    codePostal: client?.codePostal || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.societe.trim()) newErrors.societe = 'La société/nom est obligatoire';
    if (!formData.contact.trim()) newErrors.contact = 'Le contact est obligatoire';
    if (!formData.email.trim()) newErrors.email = 'L\'email est obligatoire';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email invalide';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;
    onSubmit(formData);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      onClose();
      setFormData({
        societe: '',
        contact: '',
        email: '',
        telephone: '',
        adresse: '',
        ville: '',
        codePostal: '',
      });
      setErrors({});
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{client ? 'Modifier le client' : 'Ajouter un client'}</DialogTitle>
          <DialogDescription>
            {client ? 'Modifiez les informations du client' : 'Remplissez le formulaire pour créer un nouveau client'}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="societe">Société/Nom *</Label>
            <Input
              id="societe"
              value={formData.societe}
              onChange={(e) => setFormData({ ...formData, societe: e.target.value })}
              disabled={isLoading}
              placeholder="Société Médina SARL"
            />
            {errors.societe && <p className="text-xs text-red-500">{errors.societe}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact">Contact *</Label>
            <Input
              id="contact"
              value={formData.contact}
              onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
              disabled={isLoading}
              placeholder="Ahmed Ben Salah"
            />
            {errors.contact && <p className="text-xs text-red-500">{errors.contact}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={isLoading}
                placeholder="contact@example.tn"
              />
              {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="telephone">Téléphone</Label>
              <Input
                id="telephone"
                value={formData.telephone}
                onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                disabled={isLoading}
                placeholder="+216 71 234 567"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="adresse">Adresse</Label>
            <Input
              id="adresse"
              value={formData.adresse}
              onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
              disabled={isLoading}
              placeholder="Rue du Lac Biwa, Les Berges du Lac"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ville">Ville</Label>
              <Input
                id="ville"
                value={formData.ville}
                onChange={(e) => setFormData({ ...formData, ville: e.target.value })}
                disabled={isLoading}
                placeholder="Tunis"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="codePostal">Code postal</Label>
              <Input
                id="codePostal"
                value={formData.codePostal}
                onChange={(e) => setFormData({ ...formData, codePostal: e.target.value })}
                disabled={isLoading}
                placeholder="1001"
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Traitement...' : client ? 'Modifier' : 'Ajouter'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
