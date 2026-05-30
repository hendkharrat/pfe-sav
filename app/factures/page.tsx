'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Invoice, Intervention } from '@/types';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { InvoiceDetail } from '@/components/shared/InvoiceDetail';
import { GenerateInvoiceDialog } from '@/components/shared/GenerateInvoiceDialog';
import { mockInvoices } from '@/data/mock-invoices';
import { mockInterventions } from '@/data/mock-interventions';
import { mockClients } from '@/data/mock-clients';
import { getClientIdForUser } from '@/lib/interventions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
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
import {
  Search,
  Filter,
  Eye,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  FilePlus,
  Receipt,
} from 'lucide-react';

import { formatDate } from '@/lib/utils';

function formatTND(amount: number): string {
  return `${amount.toFixed(2)} TND`;
}

export default function FacturesPage() {
  const router = useRouter();
  const { user: currentUser, isLoading } = useAuth();
  const { showSuccess } = useToast();

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [interventions, setInterventions] = useState<Intervention[]>([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [clientFilter, setClientFilter] = useState('all');

  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);

  useEffect(() => {
    setInvoices(mockInvoices);
    setInterventions(mockInterventions);
  }, []);

  const clientId = useMemo(() => {
    if (!currentUser || currentUser.role !== 'client') return null;
    return getClientIdForUser(currentUser);
  }, [currentUser]);

  const getClientName = useCallback((id: string): string => {
    return mockClients.find((c) => c.id === id)?.societe ?? 'N/A';
  }, []);

  const getInterventionRef = useCallback(
    (interventionId?: string): string => {
      if (!interventionId) return '—';
      return interventions.find((i) => i.id === interventionId)?.reference ?? '—';
    },
    [interventions]
  );

  const linkedIntervention = useMemo(() => {
    if (!selectedInvoice?.interventionId) return undefined;
    return interventions.find((i) => i.id === selectedInvoice.interventionId);
  }, [selectedInvoice, interventions]);

  const filteredInvoices = useMemo(() => {
    if (!currentUser) return [];

    let list = invoices;

    if (currentUser.role === 'client') {
      if (!clientId) return [];
      list = list.filter((inv) => inv.clientId === clientId);
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      list = list.filter((inv) => {
        const client = mockClients.find((c) => c.id === inv.clientId);
        const intRef = getInterventionRef(inv.interventionId).toLowerCase();
        return (
          inv.numero.toLowerCase().includes(term) ||
          (client?.societe.toLowerCase().includes(term) ?? false) ||
          intRef.includes(term)
        );
      });
    }

    if (statusFilter !== 'all') {
      list = list.filter((inv) => inv.statut === statusFilter);
    }

    if (currentUser.role === 'admin' && clientFilter !== 'all') {
      list = list.filter((inv) => inv.clientId === clientFilter);
    }

    return [...list].sort(
      (a, b) => new Date(b.dateEmission).getTime() - new Date(a.dateEmission).getTime()
    );
  }, [invoices, interventions, currentUser, clientId, searchTerm, statusFilter, clientFilter, getInterventionRef]);

  const handleMarkPaid = useCallback(
    (invoiceId: string) => {
      setInvoices((prev) =>
        prev.map((inv) => (inv.id === invoiceId ? { ...inv, statut: 'PAYEE' } : inv))
      );
      setSelectedInvoice((prev) =>
        prev?.id === invoiceId ? { ...prev, statut: 'PAYEE' } : prev
      );
      showSuccess('Facture marquée comme payée.');
    },
    [showSuccess]
  );

  const handleGenerate = useCallback(
    (invoice: Invoice) => {
      setInvoices((prev) => [invoice, ...prev]);
      showSuccess('Facture générée avec succès.');
      setIsGenerateOpen(false);
    },
    [showSuccess]
  );

  const handleViewDetail = useCallback((invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsDetailOpen(true);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 mb-4">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-muted-foreground">Chargement des factures...</p>
        </div>
      </div>
    );
  }

  if (currentUser?.role === 'technician') {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[70vh] px-4">
          <Card className="max-w-md w-full border-red-150 bg-red-50/20 shadow-md">
            <CardContent className="pt-6 text-center space-y-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 text-red-600 mb-2">
                <AlertTriangle size={24} />
              </div>
              <h2 className="text-xl font-bold text-red-950">Accès non autorisé</h2>
              <p className="text-sm text-red-800">
                En tant que technicien, vous n&apos;êtes pas autorisé à accéder à la gestion des factures.
                Veuillez consulter vos interventions depuis le tableau de bord.
              </p>
              <Button
                onClick={() => router.push('/dashboard')}
                className="w-full mt-2 gap-2 font-medium"
              >
                Retour au dashboard
                <ArrowRight size={16} />
              </Button>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  const isAdmin = currentUser?.role === 'admin';

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight flex items-center gap-2">
              <Receipt size={28} className="text-primary" />
              {isAdmin ? 'Gestion des factures' : 'Mes factures'}
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              {isAdmin
                ? 'Consultez, générez et gérez les factures clients.'
                : 'Consultez vos factures et leur statut de paiement.'}
            </p>
          </div>
          {isAdmin && (
            <Button
              className="gap-2 shrink-0"
              onClick={() => setIsGenerateOpen(true)}
            >
              <FilePlus size={16} />
              Générer une facture
            </Button>
          )}
        </div>

        {/* Filters bar */}
        <div className="p-4 bg-muted/30 border border-border rounded-xl space-y-4 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Filter size={16} className="text-primary" />
            Filtres &amp; Recherche
          </div>
          <div className={`grid gap-3 ${isAdmin ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2'}`}>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="N° facture, client, référence intervention..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="Tous les statuts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="EN_ATTENTE">En attente</SelectItem>
                <SelectItem value="PAYEE">Payée</SelectItem>
                <SelectItem value="IMPAYEE">Impayée</SelectItem>
              </SelectContent>
            </Select>

            {isAdmin && (
              <Select value={clientFilter} onValueChange={setClientFilter}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Tous les clients" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les clients</SelectItem>
                  {mockClients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.societe}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        {/* Invoice table */}
        <div className="border border-border rounded-xl overflow-hidden shadow-sm bg-card">
          <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead className="font-semibold">Numéro</TableHead>
                {isAdmin && <TableHead className="font-semibold">Client</TableHead>}
                {isAdmin && <TableHead className="font-semibold">Intervention</TableHead>}
                <TableHead className="text-right font-semibold">Montant HT</TableHead>
                <TableHead className="text-right font-semibold">TVA</TableHead>
                <TableHead className="text-right font-semibold">Montant TTC</TableHead>
                <TableHead className="text-center font-semibold">Date émission</TableHead>
                <TableHead className="text-center font-semibold">Statut</TableHead>
                <TableHead className="text-right font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={isAdmin ? 9 : 7}
                    className="text-center py-16 text-muted-foreground text-sm font-medium"
                  >
                    Aucune facture ne correspond aux critères de recherche.
                  </TableCell>
                </TableRow>
              ) : (
                filteredInvoices.map((invoice) => (
                  <TableRow key={invoice.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-mono font-bold text-xs text-primary">
                      {invoice.numero}
                    </TableCell>
                    {isAdmin && (
                      <TableCell className="text-xs font-semibold">
                        {getClientName(invoice.clientId)}
                      </TableCell>
                    )}
                    {isAdmin && (
                      <TableCell className="text-xs text-muted-foreground font-mono">
                        {getInterventionRef(invoice.interventionId)}
                      </TableCell>
                    )}
                    <TableCell className="text-right text-xs font-medium">
                      {formatTND(invoice.montantHT)}
                    </TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground">
                      {formatTND(invoice.tva)}
                    </TableCell>
                    <TableCell className="text-right text-xs font-bold text-foreground">
                      {formatTND(invoice.montantTTC)}
                    </TableCell>
                    <TableCell className="text-center text-xs text-muted-foreground">
                      {formatDate(invoice.dateEmission)}
                    </TableCell>
                    <TableCell className="text-center">
                      <StatusBadge status={invoice.statut} type="invoice" />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-1 justify-end items-center">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0"
                          title="Voir détail"
                          onClick={() => handleViewDetail(invoice)}
                        >
                          <Eye size={14} />
                        </Button>
                        {isAdmin && invoice.statut !== 'PAYEE' && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 gap-1 border-green-200 hover:bg-green-50 hover:text-green-800 text-green-600 font-medium text-xs px-2"
                            title="Marquer payée"
                            onClick={() => handleMarkPaid(invoice.id)}
                          >
                            <CheckCircle size={14} />
                            <span className="hidden sm:inline">Marquer payée</span>
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          Total : {filteredInvoices.length} facture{filteredInvoices.length !== 1 ? 's' : ''} trouvée{filteredInvoices.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Invoice detail dialog */}
      <InvoiceDetail
        open={isDetailOpen}
        invoice={selectedInvoice}
        intervention={linkedIntervention}
        isAdmin={isAdmin}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedInvoice(null);
        }}
        onMarkPaid={handleMarkPaid}
      />

      {/* Generate invoice dialog */}
      {isAdmin && (
        <GenerateInvoiceDialog
          open={isGenerateOpen}
          onClose={() => setIsGenerateOpen(false)}
          interventions={interventions}
          existingInvoices={invoices}
          onGenerate={handleGenerate}
        />
      )}
    </AppLayout>
  );
}
