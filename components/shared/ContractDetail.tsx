'use client';

import { Contract } from '@/types';
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
import { mockEquipments } from '@/data/mock-equipments';
import { CONTRACT_FREQUENCY_LABELS } from '@/lib/constants';
import { formatDate } from '@/lib/utils';

interface ContractDetailProps {
  open: boolean;
  contract: Contract | null;
  onClose: () => void;
}

function calculateStatus(contract: Contract): 'ACTIF' | 'EXPIRE' | 'BIENTOT_EXPIRE' {
  const today = new Date();
  const dateFin = new Date(contract.dateFin);
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

  if (dateFin < today) return 'EXPIRE';
  if (dateFin < thirtyDaysFromNow) return 'BIENTOT_EXPIRE';
  return 'ACTIF';
}

export function ContractDetail({ open, contract, onClose }: ContractDetailProps) {
  if (!contract) return null;

  const clientName = mockClients.find((c) => c.id === contract.clientId)?.societe || 'N/A';

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Fiche contrat</DialogTitle>
          <DialogDescription>Informations détaillées du contrat</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Référence</p>
              <p className="font-medium text-lg">{contract.reference}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Client</p>
              <p className="font-medium">{clientName}</p>
            </div>
          </div>

          <div className="space-y-4 border-t border-border pt-4">
            <div>
              <p className="text-sm text-muted-foreground">Statut</p>
              <div className="mt-2">
                <StatusBadge status={calculateStatus(contract)} type="contract" />
              </div>
            </div>
          </div>

          <div className="space-y-4 border-t border-border pt-4">
            <div>
              <p className="text-sm text-muted-foreground">Date de début</p>
              <p className="font-medium">{formatDate(contract.dateDebut)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Date de fin</p>
              <p className="font-medium">{formatDate(contract.dateFin)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Périodicité</p>
              <p className="font-medium">{CONTRACT_FREQUENCY_LABELS[contract.periodicite]}</p>
            </div>
          </div>

          {contract.description && (
            <div className="space-y-4 border-t border-border pt-4">
              <div>
                <p className="text-sm text-muted-foreground">Description</p>
                <p className="font-medium text-sm">{contract.description}</p>
              </div>
            </div>
          )}

          <div className="space-y-4 border-t border-border pt-4">
            <p className="text-sm text-muted-foreground font-semibold">Équipements couverts</p>
            {contract.equipementIds.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">Aucun équipement</p>
            ) : (
              <div className="space-y-2">
                {contract.equipementIds.map((equipmentId) => {
                  const equipment = mockEquipments.find((e) => e.id === equipmentId);
                  return (
                    <div key={equipmentId} className="text-sm bg-muted/50 rounded p-2">
                      <p className="font-medium">
                        {equipment?.reference || 'N/A'} - {equipment?.marque} {equipment?.modele}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {equipment?.localisation || 'N/A'}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="border-t pt-4 mt-2">
          <Button variant="outline" onClick={onClose}>Fermer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
