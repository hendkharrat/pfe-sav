'use client';

import { Panne, Intervention } from '@/types';
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
import { mockClients } from '@/data/mock-clients';
import { mockEquipments } from '@/data/mock-equipments';
import { Badge } from '@/components/ui/badge';
import { Paperclip, Calendar, Wrench, User, FileText } from 'lucide-react';
import { getTechnicianName } from '@/lib/interventions';
import { formatDate } from '@/lib/utils';

interface PanneDetailProps {
  open: boolean;
  panne: Panne | null;
  onClose: () => void;
  linkedIntervention?: Intervention | null;
}

export function PanneDetail({
  open,
  panne,
  onClose,
  linkedIntervention,
}: PanneDetailProps) {
  if (!panne) return null;

  const client = mockClients.find((c) => c.id === panne.clientId);
  const equipment = mockEquipments.find((e) => e.id === panne.equipementId);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4 border-b border-border">
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <span>{panne.reference}</span>
          </DialogTitle>
          <DialogDescription>Détails de la déclaration de panne</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Status and Priority */}
          <div className="grid grid-cols-2 gap-4">
            <DetailRow label="Statut">
              <div className="pt-1">
                <StatusBadge status={panne.statut} type="panne" />
              </div>
            </DetailRow>
            <DetailRow label="Priorité">
              <div className="pt-1">
                <PriorityBadge priority={panne.priorite} />
              </div>
            </DetailRow>
          </div>

          <DetailRow label="Date de déclaration">
            <p className="font-medium flex items-center gap-2 text-sm text-foreground">
              <Calendar size={16} className="text-muted-foreground" />
              {formatDate(panne.dateDeclaration)}
            </p>
          </DetailRow>

          <DetailRow label="Client">
            <p className="font-medium text-sm flex items-center gap-2">
              <User size={16} className="text-muted-foreground" />
              {client?.societe ?? 'N/A'}
            </p>
            {client?.contact && (
              <p className="text-xs text-muted-foreground ml-6">Contact: {client.contact} — {client.telephone}</p>
            )}
          </DetailRow>

          <DetailRow label="Équipement concerné">
            <p className="font-medium text-sm flex items-center gap-2">
              <Wrench size={16} className="text-muted-foreground" />
              {equipment
                ? `${equipment.reference} — ${equipment.marque} ${equipment.modele}`
                : 'N/A'}
            </p>
            {equipment?.localisation && (
              <p className="text-xs text-muted-foreground ml-6">
                Localisation: {equipment.localisation}
              </p>
            )}
          </DetailRow>

          <DetailRow label="Description de la panne">
            <div className="p-3 bg-accent/30 rounded-lg border border-border">
              <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                {panne.description}
              </p>
            </div>
          </DetailRow>

          {panne.pieceJointeNom && (
            <DetailRow label="Pièce jointe">
              <div className="flex items-center gap-2 p-2 rounded-lg bg-accent/40 border border-border text-sm">
                <Paperclip size={16} className="text-primary flex-shrink-0" />
                <span className="text-foreground truncate font-medium flex-1">
                  {panne.pieceJointeNom}
                </span>
                <Badge variant="secondary" className="text-xs font-normal">
                  Fichier simulé
                </Badge>
              </div>
            </DetailRow>
          )}

          {/* Linked Intervention Info */}
          {panne.statut === 'CONVERTIE' && (
            <div className="p-4 rounded-xl border border-green-200 bg-green-50/50 space-y-3 mt-4 animate-in slide-in-from-bottom duration-250">
              <h4 className="text-sm font-semibold text-green-950 flex items-center gap-2">
                <FileText size={16} className="text-green-600" />
                Intervention Curative Associée
              </h4>
              {linkedIntervention ? (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-green-900">{linkedIntervention.reference}</span>
                    <StatusBadge status={linkedIntervention.statut} type="intervention" />
                  </div>
                  <p className="text-xs text-green-800">
                    <span className="font-semibold">Technicien:</span>{' '}
                    {getTechnicianName(linkedIntervention.technicienId)}
                  </p>
                  <p className="text-xs text-green-800">
                    <span className="font-semibold">Planifiée le:</span>{' '}
                    {formatDate(linkedIntervention.datePrevue)}
                  </p>
                  {linkedIntervention.diagnostic && (
                    <p className="text-xs text-green-800 line-clamp-2">
                      <span className="font-semibold">Diagnostic:</span>{' '}
                      {linkedIntervention.diagnostic}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-xs text-green-800">
                  Réf. Intervention : <span className="font-semibold">{panne.interventionId}</span>
                  <br />
                  <span className="text-[11px] opacity-80">(Détails sauvegardés localement dans le module)</span>
                </p>
              )}
            </div>
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
    <div className="space-y-1.5 border-b border-border pb-4 last:border-0 last:pb-0">
      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{label}</p>
      {children}
    </div>
  );
}
