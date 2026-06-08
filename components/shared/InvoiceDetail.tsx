'use client';

import { Invoice, Intervention } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { mockClients } from '@/data/mock-clients';
import { CheckCircle, Building2 } from 'lucide-react';
import { getClientDisplayName } from '@/lib/utils';

function formatTND(amount: number): string {
  return `${amount.toFixed(2)} TND`;
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr + 'T12:00:00').toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

interface Props {
  open: boolean;
  invoice: Invoice | null;
  intervention?: Intervention;
  isAdmin: boolean;
  onClose: () => void;
  onMarkPaid?: (invoiceId: string) => void;
}

export function InvoiceDetail({
  open,
  invoice,
  intervention,
  isAdmin,
  onClose,
  onMarkPaid,
}: Props) {
  if (!invoice) return null;

  const client = mockClients.find((c) => c.id === invoice.clientId);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="w-[96vw] max-w-5xl max-h-[92vh] overflow-y-auto">
        <DialogHeader className="sr-only">
          <DialogTitle>Détail facture {invoice.numero}</DialogTitle>
          <DialogDescription>Vue complète de la facture</DialogDescription>
        </DialogHeader>

        {/* Facture document */}
        <div className="space-y-6 py-2">

          {/* Header row */}
          <div className="flex items-start justify-between gap-4">
            {/* Company brand */}
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                <Building2 size={20} className="text-primary" />
              </div>
              <div>
                <p className="font-bold text-base text-foreground leading-tight">SAV Manager</p>
                <p className="text-xs text-muted-foreground">Tunisie — contact@savmanager.tn</p>
              </div>
            </div>

            {/* Invoice title + status */}
            <div className="text-right space-y-1">
              <p className="text-2xl font-extrabold tracking-tight text-foreground">FACTURE</p>
              <p className="text-sm font-mono font-semibold text-primary">{invoice.numero}</p>
              <StatusBadge status={invoice.statut} type="invoice" />
            </div>
          </div>

          <Separator />

          {/* Meta info: client + emission + intervention */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Client */}
            <div className="space-y-1.5">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Facturer à
              </p>
              {client ? (
                <>
                  <p className="font-bold text-foreground">{getClientDisplayName(client)}</p>
                  {client.contact && <p className="text-sm text-muted-foreground">{client.contact}</p>}
                  <p className="text-sm text-muted-foreground">{client.adresse}</p>
                  <p className="text-sm text-muted-foreground">
                    {client.ville}, Tunisie
                  </p>
                  <p className="text-sm text-muted-foreground">{client.email}</p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">Client non trouvé</p>
              )}
            </div>

            {/* Dates + intervention */}
            <div className="space-y-3">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Date d&apos;émission
                </p>
                <p className="font-medium text-foreground">{formatDate(invoice.dateEmission)}</p>
              </div>

              {intervention && (
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Intervention liée
                  </p>
                  <p className="font-mono text-sm font-semibold text-primary">
                    {intervention.reference}
                  </p>
                  {intervention.dateRealisation && (
                    <p className="text-sm text-muted-foreground">
                      Réalisée le {formatDate(intervention.dateRealisation)}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground leading-snug line-clamp-2">
                    {intervention.description}
                  </p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Invoice lines */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Détail des prestations
            </p>
            <div className="rounded-md border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead className="font-semibold">Description</TableHead>
                    <TableHead className="text-right font-semibold w-20">Qté</TableHead>
                    <TableHead className="text-right font-semibold w-28">P.U. (TND)</TableHead>
                    <TableHead className="text-right font-semibold w-28">Montant HT</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoice.lignes.map((ligne, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="text-sm">{ligne.description}</TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">
                        {Number.isInteger(ligne.quantite)
                          ? ligne.quantite
                          : `${ligne.quantite.toFixed(2)} h`}
                      </TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">
                        {ligne.prixUnitaire.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right text-sm font-semibold">
                        {ligne.montant.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-full sm:w-72 space-y-2 rounded-lg border border-border bg-muted/20 p-4">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Sous-total HT</span>
                <span className="font-medium text-foreground">{formatTND(invoice.montantHT)}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>TVA (19 %)</span>
                <span className="font-medium text-foreground">{formatTND(invoice.tva)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-base">
                <span>Total TTC</span>
                <span className="text-primary">{formatTND(invoice.montantTTC)}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Action buttons */}
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onClose}>
              Fermer
            </Button>
            {isAdmin && invoice.statut !== 'PAYEE' && onMarkPaid && (
              <Button
                className="gap-2 bg-green-600 hover:bg-green-700 text-white"
                onClick={() => onMarkPaid(invoice.id)}
              >
                <CheckCircle size={16} />
                Marquer payée
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
