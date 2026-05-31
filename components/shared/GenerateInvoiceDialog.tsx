'use client';

import { useState, useMemo } from 'react';
import { Invoice, LigneFacture, Intervention } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
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
import { Separator } from '@/components/ui/separator';
import { mockClients } from '@/data/mock-clients';
import { FileText, AlertCircle } from 'lucide-react';
import { formatDate } from '@/lib/utils';

const TAUX_HORAIRE_TND = 50;
const PRIX_MATERIEL_DEFAUT_TND = 150;
const TVA_RATE = 0.19;

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function formatTND(amount: number): string {
  return `${amount.toFixed(2)} TND`;
}

function generateNumero(existingInvoices: Invoice[]): string {
  const year = new Date().getFullYear();
  const numbers = existingInvoices
    .map((inv) => {
      const match = inv.numero.match(/^FAC-(\d{4})-(\d+)$/);
      return match && parseInt(match[1], 10) === year ? parseInt(match[2], 10) : 0;
    })
    .filter((n) => n > 0);
  const next = numbers.length > 0 ? Math.max(...numbers) + 1 : 1;
  return `FAC-${year}-${String(next).padStart(4, '0')}`;
}

function computeLines(intervention: Intervention): LigneFacture[] {
  const lines: LigneFacture[] = [];

  const dureeH = round2((intervention.dureeMinutes ?? 60) / 60);
  lines.push({
    description: "Intervention curative - Main d'œuvre",
    quantite: dureeH,
    prixUnitaire: TAUX_HORAIRE_TND,
    montant: round2(dureeH * TAUX_HORAIRE_TND),
  });

  if (intervention.materielUtilise) {
    lines.push({
      description: `Matériel utilisé : ${intervention.materielUtilise}`,
      quantite: 1,
      prixUnitaire: PRIX_MATERIEL_DEFAUT_TND,
      montant: PRIX_MATERIEL_DEFAUT_TND,
    });
  }

  return lines;
}

interface Props {
  open: boolean;
  onClose: () => void;
  interventions: Intervention[];
  existingInvoices: Invoice[];
  onGenerate: (invoice: Invoice) => void;
}

export function GenerateInvoiceDialog({
  open,
  onClose,
  interventions,
  existingInvoices,
  onGenerate,
}: Props) {
  const [selectedId, setSelectedId] = useState<string>('');

  const invoicedIds = useMemo(
    () =>
      new Set(
        existingInvoices
          .filter((inv) => inv.interventionId != null)
          .map((inv) => inv.interventionId as string)
      ),
    [existingInvoices]
  );

  const eligibleInterventions = useMemo(
    () =>
      interventions.filter(
        (int) =>
          int.type === 'CURATIVE' &&
          int.statut === 'REALISEE' &&
          !int.couvertureContrat &&
          !invoicedIds.has(int.id)
      ),
    [interventions, invoicedIds]
  );

  const selectedIntervention = useMemo(
    () => eligibleInterventions.find((i) => i.id === selectedId) ?? null,
    [eligibleInterventions, selectedId]
  );

  const previewLines = useMemo(
    () => (selectedIntervention ? computeLines(selectedIntervention) : []),
    [selectedIntervention]
  );

  const montantHT = useMemo(
    () => round2(previewLines.reduce((s, l) => s + l.montant, 0)),
    [previewLines]
  );
  const tva = useMemo(() => round2(montantHT * TVA_RATE), [montantHT]);
  const montantTTC = useMemo(() => round2(montantHT + tva), [montantHT, tva]);

  function handleOpenChange(isOpen: boolean) {
    if (!isOpen) {
      setSelectedId('');
      onClose();
    }
  }

  function handleConfirm() {
    if (!selectedIntervention) return;
    const invoice: Invoice = {
      id: `inv-${Date.now()}`,
      numero: generateNumero(existingInvoices),
      clientId: selectedIntervention.clientId,
      interventionId: selectedIntervention.id,
      dateEmission: new Date().toISOString().split('T')[0],
      montantHT,
      tva,
      montantTTC,
      statut: 'EN_ATTENTE',
      lignes: previewLines,
    };
    onGenerate(invoice);
    setSelectedId('');
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText size={18} />
            Générer une facture
          </DialogTitle>
          <DialogDescription>
            Sélectionnez une intervention curative réalisée hors contrat pour générer la facture correspondante.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {eligibleInterventions.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-8 text-center text-muted-foreground">
              <AlertCircle size={32} className="text-amber-500" />
              <p className="text-sm font-medium">
                Aucune intervention éligible à la facturation.
              </p>
              <p className="text-xs">
                Conditions : type Curative, statut Réalisée, hors couverture contrat, sans facture existante.
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Intervention à facturer
                </label>
                <Select value={selectedId} onValueChange={setSelectedId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une intervention..." />
                  </SelectTrigger>
                  <SelectContent>
                    {eligibleInterventions.map((int) => {
                      const client = mockClients.find((c) => c.id === int.clientId);
                      return (
                        <SelectItem key={int.id} value={int.id}>
                          <span className="font-mono text-xs">{int.reference}</span>
                          <span className="mx-2 text-muted-foreground">—</span>
                          <span>{client?.societe ?? 'Client inconnu'}</span>
                          <span className="mx-2 text-muted-foreground">—</span>
                          <span className="text-muted-foreground">{formatDate(int.dateRealisation ?? int.datePrevue)}</span>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              {selectedIntervention && (
                <div className="space-y-4 rounded-lg border border-border bg-muted/20 p-4">
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-1">Aperçu de la facture</h4>
                    <p className="text-xs text-muted-foreground">
                      Client : <span className="font-medium text-foreground">
                        {mockClients.find((c) => c.id === selectedIntervention.clientId)?.societe}
                      </span>
                    </p>
                  </div>

                  <div className="rounded-md border border-border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/40">
                          <TableHead className="font-semibold">Description</TableHead>
                          <TableHead className="text-right font-semibold w-20">Qté</TableHead>
                          <TableHead className="text-right font-semibold w-28">P.U. (TND)</TableHead>
                          <TableHead className="text-right font-semibold w-28">Montant (TND)</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {previewLines.map((ligne, idx) => (
                          <TableRow key={idx}>
                            <TableCell className="text-sm">{ligne.description}</TableCell>
                            <TableCell className="text-right text-sm">
                              {ligne.quantite === 1
                                ? '1'
                                : `${ligne.quantite.toFixed(2)} h`}
                            </TableCell>
                            <TableCell className="text-right text-sm">
                              {ligne.prixUnitaire.toFixed(2)}
                            </TableCell>
                            <TableCell className="text-right text-sm font-medium">
                              {ligne.montant.toFixed(2)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  <Separator />

                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Sous-total HT</span>
                      <span className="font-medium text-foreground">{formatTND(montantHT)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>TVA (19 %)</span>
                      <span className="font-medium text-foreground">{formatTND(tva)}</span>
                    </div>
                    <Separator className="my-1" />
                    <div className="flex justify-between font-bold text-base">
                      <span>Total TTC</span>
                      <span className="text-primary">{formatTND(montantTTC)}</span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex gap-3 justify-end pt-2 border-t border-border">
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedIntervention || eligibleInterventions.length === 0}
          >
            Confirmer et générer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
