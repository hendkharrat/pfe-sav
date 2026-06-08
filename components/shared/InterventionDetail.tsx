'use client';

import { Intervention } from '@/types';
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
import { PriorityBadge } from '@/components/shared/PriorityBadge';
import { Badge } from '@/components/ui/badge';
import { mockClients } from '@/data/mock-clients';
import { mockEquipments } from '@/data/mock-equipments';
import { mockContracts } from '@/data/mock-contracts';
import { mockClientEquipements } from '@/data/mock-client-equipements';
import { INTERVENTION_TYPE_LABELS } from '@/lib/constants';
import { getTechnicianName, getClientEquipementByEquipmentAndClient } from '@/lib/interventions';
import { formatDate } from '@/lib/utils';

interface InterventionDetailProps {
  open: boolean;
  intervention: Intervention | null;
  onClose: () => void;
  readOnly?: boolean;
}

export function InterventionDetail({
  open,
  intervention,
  onClose,
}: InterventionDetailProps) {
  if (!intervention) return null;

  const client = mockClients.find((c) => c.id === intervention.clientId);
  const equipment = mockEquipments.find((e) => e.id === intervention.equipementId);
  const contract = intervention.contractId
    ? mockContracts.find((c) => c.id === intervention.contractId)
    : undefined;

  const clientEquipement = intervention.clientEquipementId
    ? mockClientEquipements.find((ce) => ce.id === intervention.clientEquipementId)
    : getClientEquipementByEquipmentAndClient(intervention.clientId, intervention.equipementId);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{intervention.reference}</DialogTitle>
          <DialogDescription>Fiche détaillée de l&apos;intervention</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          <DetailRow label="Type">
            <Badge variant="outline">
              {INTERVENTION_TYPE_LABELS[intervention.type] ?? intervention.type}
            </Badge>
          </DetailRow>

          <DetailRow label="Statut">
            <StatusBadge status={intervention.statut} type="intervention" />
          </DetailRow>

          <DetailRow label="Priorité">
            <PriorityBadge priority={intervention.priorite} />
          </DetailRow>

          <DetailRow label="Client">
            <p className="font-medium">{client?.societe ?? 'N/A'}</p>
          </DetailRow>

          <DetailRow label="Équipement">
            <p className="font-medium">
              {equipment
                ? `${equipment.reference} — ${equipment.marque} ${equipment.modele}`
                : 'N/A'}
            </p>
            <p className="text-sm text-muted-foreground">
              {clientEquipement?.localisation ?? 'Localisation non renseignée'}
            </p>
          </DetailRow>

          <DetailRow label="Technicien">
            <p className="font-medium">{getTechnicianName(intervention.technicienId)}</p>
          </DetailRow>

          <DetailRow label="Date prévue">
            <p className="font-medium">{formatDate(intervention.datePrevue)}</p>
          </DetailRow>

          {intervention.dateRealisation && (
            <DetailRow label="Date de réalisation">
              <p className="font-medium">{formatDate(intervention.dateRealisation)}</p>
            </DetailRow>
          )}

          <DetailRow label="Couverture contrat">
            <p className="font-medium">
              {intervention.couvertureContrat ? 'Oui' : 'Non'}
              {contract && (
                <span className="text-sm text-muted-foreground block">
                  Contrat : {contract.reference}
                </span>
              )}
            </p>
          </DetailRow>

          <DetailRow label="Description">
            <p className="text-sm">{intervention.description}</p>
          </DetailRow>

          {intervention.diagnostic && (
            <DetailRow label="Diagnostic">
              <p className="text-sm">{intervention.diagnostic}</p>
            </DetailRow>
          )}

          {intervention.actionsRealisees && (
            <DetailRow label="Actions réalisées">
              <p className="text-sm">{intervention.actionsRealisees}</p>
            </DetailRow>
          )}

          {intervention.materielUtilise && (
            <DetailRow label="Matériel utilisé">
              <p className="text-sm">{intervention.materielUtilise}</p>
            </DetailRow>
          )}

          {intervention.dureeMinutes != null && (
            <DetailRow label="Durée">
              <p className="font-medium">{intervention.dureeMinutes} minutes</p>
            </DetailRow>
          )}

          {intervention.observations && (
            <DetailRow label="Observations">
              <p className="text-sm">{intervention.observations}</p>
            </DetailRow>
          )}
        </div>

        <DialogFooter className="border-t pt-4 mt-2">
          <Button variant="outline" onClick={onClose}>Fermer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DetailRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1 border-b border-border pb-4 last:border-0">
      <p className="text-sm text-muted-foreground">{label}</p>
      {children}
    </div>
  );
}
