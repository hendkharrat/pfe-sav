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
import { Separator } from '@/components/ui/separator';
import { mockClients } from '@/data/mock-clients';
import { mockEquipments } from '@/data/mock-equipments';
import { mockContracts } from '@/data/mock-contracts';
import { mockInvoices } from '@/data/mock-invoices';
import { mockClientEquipements } from '@/data/mock-client-equipements';
import { getTechnicianName, getClientEquipementByEquipmentAndClient } from '@/lib/interventions';
import { INTERVENTION_TYPE_LABELS } from '@/lib/constants';
import { formatDate } from '@/lib/utils';
import { FileText } from 'lucide-react';

interface Props {
  open: boolean;
  intervention: Intervention | null;
  onClose: () => void;
}

export function HistoryInterventionDetail({ open, intervention, onClose }: Props) {
  if (!intervention) return null;

  const client = mockClients.find((c) => c.id === intervention.clientId);
  const equipment = mockEquipments.find((e) => e.id === intervention.equipementId);
  const contract = intervention.contractId
    ? mockContracts.find((c) => c.id === intervention.contractId)
    : undefined;
  const invoice = mockInvoices.find((inv) => inv.interventionId === intervention.id);

  const clientEquipement = intervention.clientEquipementId
    ? mockClientEquipements.find((ce) => ce.id === intervention.clientEquipementId)
    : getClientEquipementByEquipmentAndClient(intervention.clientId, intervention.equipementId);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-mono">{intervention.reference}</DialogTitle>
          <DialogDescription>Historique — fiche détaillée de l&apos;intervention</DialogDescription>
        </DialogHeader>

        <div className="space-y-5 mt-6">
          {/* Status trio */}
          <div className="flex gap-3 flex-wrap">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Type</p>
              <Badge variant="outline">
                {INTERVENTION_TYPE_LABELS[intervention.type] ?? intervention.type}
              </Badge>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Statut</p>
              <StatusBadge status={intervention.statut} type="intervention" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Priorité</p>
              <PriorityBadge priority={intervention.priorite} />
            </div>
          </div>

          <Separator />

          {/* Parties */}
          <DetailRow label="Client">
            <p className="font-medium">{client?.societe ?? 'N/A'}</p>
            {client?.contact && (
              <p className="text-sm text-muted-foreground">{client.contact}</p>
            )}
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

          <Separator />

          {/* Dates */}
          <DetailRow label="Date prévue">
            <p className="font-medium">{formatDate(intervention.datePrevue)}</p>
          </DetailRow>

          {intervention.dateRealisation && (
            <DetailRow label="Date de réalisation">
              <p className="font-medium">{formatDate(intervention.dateRealisation)}</p>
            </DetailRow>
          )}

          {intervention.dureeMinutes != null && (
            <DetailRow label="Durée">
              <p className="font-medium">
                {intervention.dureeMinutes} min
                <span className="text-muted-foreground text-sm ml-1.5">
                  ({(intervention.dureeMinutes / 60).toFixed(1)} h)
                </span>
              </p>
            </DetailRow>
          )}

          <DetailRow label="Couverture contrat">
            <p className="font-medium">{intervention.couvertureContrat ? 'Oui' : 'Non'}</p>
          </DetailRow>

          <Separator />

          {/* Technical details */}
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

          {intervention.observations && (
            <DetailRow label="Observations">
              <p className="text-sm">{intervention.observations}</p>
            </DetailRow>
          )}

          {/* Linked contract */}
          {contract && (
            <>
              <Separator />
              <DetailRow label="Contrat lié">
                <p className="font-mono font-semibold text-primary">{contract.reference}</p>
                {contract.description && (
                  <p className="text-sm text-muted-foreground">{contract.description}</p>
                )}
              </DetailRow>
            </>
          )}

          {/* Linked invoice */}
          {invoice && (
            <>
              {!contract && <Separator />}
              <DetailRow label="Facture liée">
                <div className="flex items-center gap-2">
                  <FileText size={14} className="text-primary shrink-0" />
                  <p className="font-mono font-semibold text-primary">{invoice.numero}</p>
                  <StatusBadge status={invoice.statut} type="invoice" />
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {invoice.montantTTC.toFixed(2)} TND TTC — émise le {formatDate(invoice.dateEmission)}
                </p>
              </DetailRow>
            </>
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
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
      {children}
    </div>
  );
}
