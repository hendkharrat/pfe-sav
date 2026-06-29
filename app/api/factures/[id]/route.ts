import { NextRequest, NextResponse } from 'next/server'
import { ClientType, FactureStatus, InterventionStatus, InterventionType } from '@prisma/client'
import { prisma } from '@/lib/prisma'

function err(msg: string, status: number) {
  return NextResponse.json({ error: msg }, { status })
}

const FACTURE_INCLUDE = {
  client: {
    select: {
      id: true, typeClient: true, societe: true, contact: true,
      prenom: true, nom: true, email: true,
    },
  },
  intervention: {
    select: {
      id: true, reference: true, type: true, statut: true,
      datePrevue: true, description: true,
    },
  },
  lignes: true,
} as const

function mapFacture(f: {
  id: number; numero: string; clientId: number; interventionId: number | null;
  dateEmission: Date; montantHT: number; tva: number; montantTTC: number; statut: FactureStatus;
  client: {
    id: number; typeClient: ClientType; societe: string | null; contact: string | null;
    prenom: string | null; nom: string | null; email: string;
  };
  intervention: {
    id: number; reference: string; type: InterventionType; statut: InterventionStatus;
    datePrevue: Date; description: string;
  } | null;
  lignes: {
    id: number; factureId: number; description: string;
    quantite: number; prixUnitaire: number; montant: number;
  }[];
}) {
  return {
    id: f.id,
    numero: f.numero,
    clientId: f.clientId,
    interventionId: f.interventionId ?? undefined,
    dateEmission: f.dateEmission.toISOString().split('T')[0],
    montantHT: f.montantHT,
    tva: f.tva,
    montantTTC: f.montantTTC,
    statut: f.statut,
    lignes: f.lignes.map((l) => ({
      id: l.id,
      description: l.description,
      quantite: l.quantite,
      prixUnitaire: l.prixUnitaire,
      montant: l.montant,
    })),
    client: f.client,
    intervention: f.intervention
      ? { ...f.intervention, datePrevue: f.intervention.datePrevue.toISOString().split('T')[0] }
      : undefined,
  }
}

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id: rawId } = await params
    const id = Number(rawId)
    if (!Number.isInteger(id) || id <= 0) return err('Identifiant invalide.', 400)
    const facture = await prisma.facture.findUnique({ where: { id }, include: FACTURE_INCLUDE })
    if (!facture) return err('Facture introuvable.', 404)
    return NextResponse.json(mapFacture(facture))
  } catch (e) {
    console.error('[GET /api/factures/[id]]', e)
    return NextResponse.json({ error: 'Erreur interne du serveur.' }, { status: 500 })
  }
}
