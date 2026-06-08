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
import { mockClientEquipements } from '@/data/mock-client-equipements';
import { Badge } from '@/components/ui/badge';
import { Calendar, File, FileText, ImageIcon, Paperclip, User, Wrench } from 'lucide-react';
import { getTechnicianName, getClientEquipementByEquipmentAndClient } from '@/lib/interventions';
import { formatDate, getClientDisplayName } from '@/lib/utils';
import { EquipmentThumbnail } from '@/components/shared/EquipmentThumbnail';

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

interface PanneDetailProps {
  open: boolean;
  panne: Panne | null;
  onClose: () => void;
  linkedIntervention?: Intervention | null;
}

export function PanneDetail({ open, panne, onClose, linkedIntervention }: PanneDetailProps) {
  if (!panne) return null;

  const client = mockClients.find((c) => c.id === panne.clientId);
  const equipment = mockEquipments.find((e) => e.id === panne.equipementId);

  // Resolve ClientEquipement for localisation (prefer clientEquipementId, fall back to pair lookup)
  const clientEquipement = panne.clientEquipementId
    ? mockClientEquipements.find((ce) => ce.id === panne.clientEquipementId)
    : getClientEquipementByEquipmentAndClient(
        panne.clientId,
        panne.equipementId,
        mockClientEquipements
      );

  const hasPiecesJointes = panne.piecesJointes && panne.piecesJointes.length > 0;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="w-[96vw] max-w-5xl max-h-[92vh] overflow-y-auto">
        <DialogHeader className="pb-4 border-b border-border">
          <DialogTitle className="text-xl font-bold">{panne.reference}</DialogTitle>
          <DialogDescription>Détails de la déclaration de panne</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Status + Priority */}
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
              {client ? getClientDisplayName(client) : 'N/A'}
            </p>
            {client?.typeClient === 'SOCIETE' && client.contact && (
              <p className="text-xs text-muted-foreground ml-6">
                Contact: {client.contact} — {client.telephone}
              </p>
            )}
          </DetailRow>

          <DetailRow label="Équipement concerné">
            <div className="flex items-center gap-3">
              <EquipmentThumbnail equipment={equipment} size="md" />
              <div>
                <p className="font-medium text-sm flex items-center gap-2">
                  <Wrench size={16} className="text-muted-foreground" />
                  {equipment
                    ? `${equipment.reference} — ${equipment.marque} ${equipment.modele}`
                    : 'N/A'}
                </p>
                {clientEquipement?.localisation && (
                  <p className="text-xs text-muted-foreground ml-6">
                    Localisation : {clientEquipement.localisation}
                  </p>
                )}
              </div>
            </div>
          </DetailRow>

          <DetailRow label="Description de la panne">
            <div className="p-3 bg-accent/30 rounded-lg border border-border">
              <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                {panne.description}
              </p>
            </div>
          </DetailRow>

          {/* Pièces jointes — new multi-file display */}
          {hasPiecesJointes ? (
            <DetailRow label={`Pièces jointes (${panne.piecesJointes!.length})`}>
              <div className="space-y-2">
                {panne.piecesJointes!.map((pj) => (
                  <div
                    key={pj.id}
                    className="flex items-center gap-2 p-2 rounded-lg bg-accent/40 border border-border text-sm"
                  >
                    {pj.previewUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={pj.previewUrl}
                        alt={pj.filename}
                        className="w-10 h-10 rounded object-cover border border-border shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded bg-muted border border-border flex items-center justify-center shrink-0">
                        {pj.type.startsWith('image/') ? (
                          <ImageIcon size={16} className="text-muted-foreground" />
                        ) : (
                          <File size={16} className="text-muted-foreground" />
                        )}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{pj.filename}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {formatFileSize(pj.size)} — {pj.type || 'fichier'}
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-xs font-normal shrink-0">
                      Simulé
                    </Badge>
                  </div>
                ))}
              </div>
            </DetailRow>
          ) : panne.pieceJointeNom ? (
            // Legacy single-file fallback
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
          ) : (
            <DetailRow label="Pièces jointes">
              <p className="text-sm text-muted-foreground italic">Aucune pièce jointe.</p>
            </DetailRow>
          )}

          {/* Linked Intervention */}
          {panne.statut === 'CONVERTIE' && (
            <div className="p-4 rounded-xl border border-green-200 bg-green-50/50 space-y-3 mt-4 animate-in slide-in-from-bottom duration-250">
              <h4 className="text-sm font-semibold text-green-950 flex items-center gap-2">
                <FileText size={16} className="text-green-600" />
                Intervention Curative Associée
              </h4>
              {linkedIntervention ? (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-green-900">
                      {linkedIntervention.reference}
                    </span>
                    <StatusBadge status={linkedIntervention.statut} type="intervention" />
                  </div>
                  <p className="text-xs text-green-800">
                    <span className="font-semibold">Technicien :</span>{' '}
                    {getTechnicianName(linkedIntervention.technicienId)}
                  </p>
                  <p className="text-xs text-green-800">
                    <span className="font-semibold">Planifiée le :</span>{' '}
                    {formatDate(linkedIntervention.datePrevue)}
                  </p>
                  {linkedIntervention.diagnostic && (
                    <p className="text-xs text-green-800 line-clamp-2">
                      <span className="font-semibold">Diagnostic :</span>{' '}
                      {linkedIntervention.diagnostic}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-xs text-green-800">
                  Réf. Intervention : <span className="font-semibold">{panne.interventionId}</span>
                  <br />
                  <span className="text-[11px] opacity-80">
                    (Détails sauvegardés localement dans le module)
                  </span>
                </p>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="border-t pt-4 mt-2">
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5 border-b border-border pb-4 last:border-0 last:pb-0">
      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{label}</p>
      {children}
    </div>
  );
}
