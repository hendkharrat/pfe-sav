'use client';

import { Client } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';

interface ClientDetailProps {
  open: boolean;
  client: Client | null;
  onClose: () => void;
}

export function ClientDetail({ open, client, onClose }: ClientDetailProps) {
  if (!client) return null;

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Fiche client</DialogTitle>
          <DialogDescription>Informations détaillées du client</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Société</p>
              <p className="font-medium">{client.societe}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Contact</p>
              <p className="font-medium">{client.contact}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium text-sm">{client.email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Téléphone</p>
              <p className="font-medium">{client.telephone}</p>
            </div>
          </div>

          <div className="space-y-4 border-t border-border pt-4">
            <h3 className="font-semibold">Adresse</h3>
            <div>
              <p className="text-sm text-muted-foreground">Adresse</p>
              <p className="font-medium text-sm">{client.adresse}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Ville</p>
                <p className="font-medium">{client.ville}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Code postal</p>
                <p className="font-medium">{client.codePostal}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4 border-t border-border pt-4">
            <h3 className="font-semibold">Équipements</h3>
            <div>
              <p className="text-sm text-muted-foreground">Nombre d&apos;équipements</p>
              <p className="text-2xl font-bold">{client.nombreEquipements}</p>
            </div>
          </div>

          <div className="space-y-4 border-t border-border pt-4">
            <div>
              <p className="text-sm text-muted-foreground">Date d&apos;ajout</p>
              <p className="font-medium">{formatDate(client.dateCreation)}</p>
            </div>
          </div>
        </div>

        <DialogFooter className="border-t pt-4 mt-2">
          <Button variant="outline" onClick={onClose}>Fermer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
