'use client';

import { Equipment } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { mockClients } from '@/data/mock-clients';
import { EQUIPMENT_TYPE_LABELS } from '@/lib/constants';
import { formatDate } from '@/lib/utils';

interface EquipmentDetailProps {
  open: boolean;
  equipment: Equipment | null;
  onClose: () => void;
}

export function EquipmentDetail({ open, equipment, onClose }: EquipmentDetailProps) {
  if (!equipment) return null;

  const clientName = mockClients.find((c) => c.id === equipment.clientId)?.societe || 'N/A';

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Fiche équipement</DialogTitle>
          <DialogDescription>Informations détaillées de l&apos;équipement</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Référence</p>
              <p className="font-medium text-lg">{equipment.reference}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Type</p>
              <p className="font-medium">{EQUIPMENT_TYPE_LABELS[equipment.type]}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Marque / Modèle</p>
              <p className="font-medium">
                {equipment.marque} {equipment.modele}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Numéro de série</p>
              <p className="font-medium">{equipment.numeroSerie || 'N/A'}</p>
            </div>
          </div>

          <div className="space-y-4 border-t border-border pt-4">
            <div>
              <p className="text-sm text-muted-foreground">Client</p>
              <p className="font-medium">{clientName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Localisation</p>
              <p className="font-medium">{equipment.localisation}</p>
            </div>
          </div>

          <div className="space-y-4 border-t border-border pt-4">
            <div>
              <p className="text-sm text-muted-foreground">Date d&apos;installation</p>
              <p className="font-medium">{formatDate(equipment.dateInstallation)}</p>
            </div>
          </div>

          <div className="space-y-4 border-t border-border pt-4">
            <div>
              <p className="text-sm text-muted-foreground">Statut</p>
              <div className="mt-2">
                <StatusBadge status={equipment.statut} type="equipment" />
              </div>
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
