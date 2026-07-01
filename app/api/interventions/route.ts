import { NextRequest, NextResponse } from 'next/server'
import { InterventionStatus, InterventionType } from '@prisma/client'
import { prisma } from '@/lib/prisma'

function err(msg: string, status: number) {
  return NextResponse.json({ error: msg }, { status })
}

function dayBounds(date: Date) {
  const ds = date.toISOString().split('T')[0]
  return { gte: new Date(ds + 'T00:00:00'), lte: new Date(ds + 'T23:59:59') }
}

function mapIntervention(i: {
  id: number; reference: string; type: InterventionType; statut: InterventionStatus;
  clientId: number; clientEquipementId: number | null; technicienId: number | null;
  contractId: number | null; datePrevue: Date; dateRealisation: Date | null;
  couvertureContrat: boolean; description: string; diagnostic: string | null;
  actionsRealisees: string | null; materielUtilise: string | null; dureeMinutes: number | null;
  observations: string | null;
  clientEquipement?: { equipementId: number } | null;
}) {
  return {
    id: i.id,
    reference: i.reference,
    type: i.type,
    statut: i.statut,
    clientId: i.clientId,
    equipementId: i.clientEquipement?.equipementId ?? 0,
    clientEquipementId: i.clientEquipementId ?? undefined,
    technicienId: i.technicienId ?? undefined,
    contractId: i.contractId ?? undefined,
    datePrevue: i.datePrevue.toISOString().split('T')[0],
    dateRealisation: i.dateRealisation ? i.dateRealisation.toISOString().split('T')[0] : undefined,
    couvertureContrat: i.couvertureContrat,
    description: i.description,
    diagnostic: i.diagnostic ?? undefined,
    actionsRealisees: i.actionsRealisees ?? undefined,
    materielUtilise: i.materielUtilise ?? undefined,
    dureeMinutes: i.dureeMinutes ?? undefined,
    observations: i.observations ?? undefined,
  }
}

async function computeCoverage(
  clientId: number,
  clientEquipementId: number,
  datePrevue: Date
): Promise<{ couvertureContrat: boolean; contractId?: number }> {
  const ds = datePrevue.toISOString().split('T')[0]
  const contract = await prisma.contract.findFirst({
    where: {
      clientId,
      dateDebut: { lte: new Date(ds + 'T23:59:59') },
      dateFin: { gte: new Date(ds + 'T00:00:00') },
      equipements: { some: { clientEquipementId } },
    },
    select: { id: true },
  })
  return contract
    ? { couvertureContrat: true, contractId: contract.id }
    : { couvertureContrat: false }
}

async function isTechnicianFree(technicienId: number, datePrevue: Date, excludeId?: number) {
  const conflict = await prisma.intervention.findFirst({
    where: {
      technicienId,
      datePrevue: dayBounds(datePrevue),
      statut: { not: InterventionStatus.ANNULEE },
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
    select: { id: true },
  })
  return conflict === null
}

async function nextIntRef(): Promise<string> {
  const year = new Date().getFullYear()
  const prefix = `INT-${year}-`
  const latest = await prisma.intervention.findFirst({
    where: { reference: { startsWith: prefix } },
    orderBy: { reference: 'desc' },
    select: { reference: true },
  })
  let seq = 1
  if (latest) {
    const n = parseInt(latest.reference.slice(prefix.length), 10)
    if (!isNaN(n)) seq = n + 1
  }
  return `${prefix}${String(seq).padStart(3, '0')}`
}

const INT_INCLUDE = {
  clientEquipement: { select: { equipementId: true } },
} as const

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const where: Record<string, unknown> = {}
    const type = searchParams.get('type')
    const statut = searchParams.get('statut')
    const technicienIdRaw = searchParams.get('technicienId')
    const clientIdRaw = searchParams.get('clientId')

    const validTypes = ['PREVENTIVE', 'CURATIVE']
    const validStatuts = ['PLANIFIEE', 'EN_COURS', 'REALISEE', 'ANNULEE']

    if (type && validTypes.includes(type)) where.type = type as InterventionType
    if (statut && validStatuts.includes(statut)) where.statut = statut as InterventionStatus
    if (technicienIdRaw) {
      const techId = Number(technicienIdRaw)
      if (Number.isInteger(techId) && techId > 0) where.technicienId = techId
    }
    if (clientIdRaw) {
      const clientId = Number(clientIdRaw)
      if (Number.isInteger(clientId) && clientId > 0) where.clientId = clientId
    }

    const items = await prisma.intervention.findMany({
      where,
      orderBy: { id: 'desc' },
      include: INT_INCLUDE,
    })
    return NextResponse.json(items.map(mapIntervention))
  } catch (e) {
    console.error('[GET /api/interventions]', e)
    return NextResponse.json({ error: 'Erreur interne du serveur.' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null)
    if (!body) return err('Corps de la requête invalide.', 400)

    const { type, datePrevue, description } = body as Record<string, unknown>

    if (!type) return err('Le type est requis.', 400)
    const validTypes = ['PREVENTIVE', 'CURATIVE']
    if (!validTypes.includes(type as string)) return err('Type invalide.', 400)

    const clientId = Number((body as Record<string, unknown>).clientId)
    if (!Number.isInteger(clientId) || clientId <= 0) return err('Le client est requis.', 400)

    if (typeof datePrevue !== 'string' || !datePrevue) return err('La date prévue est requise.', 400)
    if (typeof description !== 'string' || !description.trim())
      return err('La description est requise.', 400)

    const date = new Date(datePrevue + 'T12:00:00')
    if (isNaN(date.getTime())) return err('Date prévue invalide.', 400)

    const client = await prisma.client.findUnique({ where: { id: clientId }, select: { id: true } })
    if (!client) return err('Client introuvable.', 404)

    let ceId: number | undefined
    const rawCeId = (body as Record<string, unknown>).clientEquipementId
    if (rawCeId !== undefined && rawCeId !== null && rawCeId !== '') {
      const ceIdNum = Number(rawCeId)
      if (!Number.isInteger(ceIdNum) || ceIdNum <= 0) return err('Identifiant équipement client invalide.', 400)
      const ce = await prisma.clientEquipement.findUnique({
        where: { id: ceIdNum },
        select: { id: true, clientId: true },
      })
      if (!ce) return err('Équipement client introuvable.', 404)
      if (ce.clientId !== clientId) return err("Cet équipement n'appartient pas à ce client.", 422)
      ceId = ceIdNum
    }

    let techId: number | undefined
    const rawTechId = (body as Record<string, unknown>).technicienId
    if (rawTechId !== undefined && rawTechId !== null && rawTechId !== '') {
      const techIdNum = Number(rawTechId)
      if (!Number.isInteger(techIdNum) || techIdNum <= 0) return err('Identifiant technicien invalide.', 400)
      const tech = await prisma.user.findUnique({ where: { id: techIdNum } })
      if (!tech) return err('Technicien introuvable.', 404)
      if (tech.role !== 'TECHNICIAN') return err("Cet utilisateur n'est pas technicien.", 422)
      if (!tech.actif) return err('Ce technicien est désactivé.', 422)
      const free = await isTechnicianFree(techIdNum, date)
      if (!free) return err('Ce technicien est déjà affecté à une intervention à cette date.', 409)
      techId = techIdNum
    }

    let couvertureContrat = false
    let resolvedContractId: number | undefined
    const rawContractId = (body as Record<string, unknown>).contractId
    if (rawContractId !== undefined && rawContractId !== null && rawContractId !== '') {
      const ctrIdNum = Number(rawContractId)
      if (Number.isInteger(ctrIdNum) && ctrIdNum > 0) resolvedContractId = ctrIdNum
    }

    if (type === 'CURATIVE' && ceId) {
      const cov = await computeCoverage(clientId, ceId, date)
      couvertureContrat = cov.couvertureContrat
      if (!resolvedContractId && cov.contractId) resolvedContractId = cov.contractId
    } else if (type === 'PREVENTIVE') {
      couvertureContrat = !!resolvedContractId
    }

    const reference = await nextIntRef()

    const created = await prisma.intervention.create({
      data: {
        reference,
        type: type as InterventionType,
        clientId,
        clientEquipementId: ceId ?? null,
        technicienId: techId ?? null,
        contractId: resolvedContractId ?? null,
        datePrevue: date,
        statut: InterventionStatus.PLANIFIEE,
        couvertureContrat,
        description: description.trim(),
      },
      include: INT_INCLUDE,
    })

    return NextResponse.json(mapIntervention(created), { status: 201 })
  } catch (e) {
    console.error('[POST /api/interventions]', e)
    return NextResponse.json({ error: 'Erreur interne du serveur.' }, { status: 500 })
  }
}
