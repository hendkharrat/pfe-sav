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

async function nextFactureNum(): Promise<string> {
  const year = new Date().getFullYear()
  const prefix = `FAC-${year}-`
  const latest = await prisma.facture.findFirst({
    where: { numero: { startsWith: prefix } },
    orderBy: { numero: 'desc' },
    select: { numero: true },
  })
  let seq = 1
  if (latest) {
    const n = parseInt(latest.numero.slice(prefix.length), 10)
    if (!isNaN(n)) seq = n + 1
  }
  return `${prefix}${String(seq).padStart(3, '0')}`
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const where: Record<string, unknown> = {}

    const statut = searchParams.get('statut')
    const clientIdRaw = searchParams.get('clientId')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')

    const validStatuts = ['PAYEE', 'IMPAYEE', 'EN_ATTENTE']
    if (statut && validStatuts.includes(statut)) where.statut = statut as FactureStatus
    if (clientIdRaw) {
      const clientId = Number(clientIdRaw)
      if (Number.isInteger(clientId) && clientId > 0) where.clientId = clientId
    }
    if (dateFrom || dateTo) {
      const dateEmission: Record<string, Date> = {}
      if (dateFrom) dateEmission.gte = new Date(dateFrom + 'T00:00:00')
      if (dateTo) dateEmission.lte = new Date(dateTo + 'T23:59:59')
      where.dateEmission = dateEmission
    }

    const factures = await prisma.facture.findMany({
      where,
      orderBy: { dateEmission: 'desc' },
      include: FACTURE_INCLUDE,
    })
    return NextResponse.json(factures.map((f) => mapFacture(f)))
  } catch (e) {
    console.error('[GET /api/factures]', e)
    return NextResponse.json({ error: 'Erreur interne du serveur.' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null)
    if (!body) return err('Corps de la requête invalide.', 400)

    const { lignes } = body as Record<string, unknown>

    const interventionId = Number((body as Record<string, unknown>).interventionId)
    if (!Number.isInteger(interventionId) || interventionId <= 0)
      return err("L'intervention est requise.", 400)

    if (!Array.isArray(lignes) || lignes.length === 0)
      return err('Au moins une ligne de facturation est requise.', 400)

    for (const l of lignes as unknown[]) {
      const ligne = l as Record<string, unknown>
      if (typeof ligne.description !== 'string' || !ligne.description.trim())
        return err('Chaque ligne doit avoir une description.', 400)
      if (typeof ligne.quantite !== 'number' || ligne.quantite <= 0)
        return err('La quantité doit être supérieure à 0.', 400)
      if (typeof ligne.prixUnitaire !== 'number' || ligne.prixUnitaire < 0)
        return err('Le prix unitaire ne peut pas être négatif.', 400)
    }

    const intervention = await prisma.intervention.findUnique({
      where: { id: interventionId },
      include: { facture: { select: { id: true } } },
    })
    if (!intervention) return err('Intervention introuvable.', 404)
    if (intervention.type !== InterventionType.CURATIVE)
      return err('Seules les interventions curatives peuvent être facturées.', 422)
    if (intervention.statut !== InterventionStatus.REALISEE)
      return err("L'intervention doit être réalisée avant de pouvoir être facturée.", 422)
    if (intervention.couvertureContrat)
      return err("Cette intervention est couverte par contrat et ne génère pas de facture.", 422)
    if (intervention.facture)
      return err('Une facture existe déjà pour cette intervention.', 409)

    const lignesData = (lignes as { description: string; quantite: number; prixUnitaire: number }[]).map(
      (l) => ({
        description: l.description.trim(),
        quantite: l.quantite,
        prixUnitaire: l.prixUnitaire,
        montant: Math.round(l.quantite * l.prixUnitaire * 100) / 100,
      })
    )
    const montantHT = Math.round(lignesData.reduce((s, l) => s + l.montant, 0) * 100) / 100
    const tva = Math.round(montantHT * 0.19 * 100) / 100
    const montantTTC = Math.round(montantHT * 1.19 * 100) / 100

    const numero = await nextFactureNum()

    const created = await prisma.facture.create({
      data: {
        numero,
        clientId: intervention.clientId,
        interventionId,
        montantHT,
        tva,
        montantTTC,
        statut: FactureStatus.EN_ATTENTE,
        lignes: { create: lignesData },
      },
      include: FACTURE_INCLUDE,
    })

    return NextResponse.json(mapFacture(created), { status: 201 })
  } catch (e) {
    console.error('[POST /api/factures]', e)
    return NextResponse.json({ error: 'Erreur interne du serveur.' }, { status: 500 })
  }
}
