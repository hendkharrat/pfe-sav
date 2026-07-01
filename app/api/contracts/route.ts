import { NextRequest, NextResponse } from 'next/server'
import { ContractStatus, InterventionStatus, InterventionType, Periodicite, UserRole } from '@prisma/client'
import { prisma } from '@/lib/prisma'

function err(msg: string, status: number) {
  return NextResponse.json({ error: msg }, { status })
}

function toDateKey(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const PERIODICITE_MONTHS: Record<Periodicite, number> = {
  MENSUELLE: 1,
  TRIMESTRIELLE: 3,
  SEMESTRIELLE: 6,
  ANNUELLE: 12,
}

function computeContractStatut(dateFin: Date): ContractStatus {
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const fin = new Date(dateFin); fin.setHours(0, 0, 0, 0)
  const soon = new Date(today); soon.setDate(soon.getDate() + 30)
  if (fin < today) return ContractStatus.EXPIRE
  if (fin < soon) return ContractStatus.BIENTOT_EXPIRE
  return ContractStatus.ACTIF
}

function mapContract(c: {
  id: number; reference: string; clientId: number;
  dateDebut: Date; dateFin: Date; periodicite: Periodicite;
  description: string | null;
  equipements: { clientEquipementId: number }[];
  _count?: { interventions: number };
  client?: { id: number; societe: string | null; prenom: string | null; nom: string | null; typeClient: string } | null;
}) {
  return {
    id: c.id,
    reference: c.reference,
    clientId: c.clientId,
    dateDebut: c.dateDebut.toISOString().split('T')[0],
    dateFin: c.dateFin.toISOString().split('T')[0],
    periodicite: c.periodicite,
    statut: computeContractStatut(c.dateFin),
    description: c.description ?? undefined,
    clientEquipementIds: c.equipements.map((e) => e.clientEquipementId),
    client: c.client ?? undefined,
    interventionsCount: c._count?.interventions,
  }
}

export async function GET() {
  try {
    const contracts = await prisma.contract.findMany({
      orderBy: { dateDebut: 'desc' },
      include: {
        client: { select: { id: true, societe: true, prenom: true, nom: true, typeClient: true } },
        equipements: { select: { clientEquipementId: true } },
        _count: { select: { interventions: true } },
      },
    })
    return NextResponse.json(contracts.map(mapContract))
  } catch (e) {
    console.error('[GET /api/contracts]', e)
    return NextResponse.json({ error: 'Erreur interne du serveur.' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null)
    if (!body) return err('Corps de la requête invalide.', 400)

    const { reference, dateDebut, dateFin, periodicite, description, clientEquipementIds, preventiveInterventions } =
      body as Record<string, unknown>

    const clientId = Number((body as Record<string, unknown>).clientId)
    if (!Number.isInteger(clientId) || clientId <= 0) return err('Le client est requis.', 400)

    if (typeof dateDebut !== 'string' || typeof dateFin !== 'string')
      return err('Les dates de début et de fin sont requises.', 400)
    if (typeof periodicite !== 'string') return err('La périodicité est requise.', 400)
    if (!Array.isArray(clientEquipementIds) || clientEquipementIds.length === 0)
      return err('Au moins un équipement client doit être sélectionné.', 400)

    const validPeriodicites = ['MENSUELLE', 'TRIMESTRIELLE', 'SEMESTRIELLE', 'ANNUELLE']
    if (!validPeriodicites.includes(periodicite)) return err('Périodicité invalide.', 400)

    const start = new Date(dateDebut + 'T12:00:00')
    const end = new Date(dateFin + 'T12:00:00')
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return err('Dates invalides.', 400)
    if (end <= start) return err('La date de fin doit être postérieure à la date de début.', 400)
    const today = new Date(); today.setHours(0, 0, 0, 0)
    const startDay = new Date(start); startDay.setHours(0, 0, 0, 0)
    if (startDay < today) return err('La date de début doit être aujourd\'hui ou une date future.', 400)

    const client = await prisma.client.findUnique({ where: { id: clientId }, select: { id: true } })
    if (!client) return err('Client introuvable.', 404)

    const ceIds = (clientEquipementIds as unknown[])
      .map((v) => Number(v))
      .filter((n): n is number => Number.isInteger(n) && n > 0)
    if (ceIds.length !== clientEquipementIds.length)
      return err("Identifiants d'équipements invalides.", 400)

    const ceRecords = await prisma.clientEquipement.findMany({
      where: { id: { in: ceIds }, clientId },
      select: { id: true, equipementId: true },
    })
    if (ceRecords.length !== ceIds.length)
      return err("Un ou plusieurs équipements ne sont pas associés à ce client.", 422)

    let contractRef = typeof reference === 'string' ? reference.trim() : ''
    if (!contractRef) {
      const latestContract = await prisma.contract.findFirst({
        where: { reference: { startsWith: 'CTR-' } },
        orderBy: { reference: 'desc' },
        select: { reference: true },
      })
      let seq = 1
      if (latestContract) {
        const n = parseInt(latestContract.reference.slice('CTR-'.length), 10)
        if (!isNaN(n)) seq = n + 1
      }
      contractRef = `CTR-${String(seq).padStart(3, '0')}`
    }
    const existingRef = await prisma.contract.findUnique({ where: { reference: contractRef } })
    if (existingRef) return err(`La référence "${contractRef}" existe déjà.`, 409)

    const per = periodicite as Periodicite
    const intervalMonths = PERIODICITE_MONTHS[per]
    const rowDesc =
      typeof description === 'string' && description.trim()
        ? description.trim()
        : 'Maintenance préventive planifiée dans le cadre du contrat'

    const intRows: { ceId: number; datePrevue: Date }[] = []
    for (const ce of ceRecords) {
      let cur = new Date(start)
      while (cur <= end) {
        intRows.push({ ceId: ce.id, datePrevue: new Date(cur) })
        const next = new Date(cur)
        next.setMonth(next.getMonth() + intervalMonths)
        cur = next
      }
    }

    // Match client-echoed preview rows (with optional technicienId) back onto the
    // server-generated rows by clientEquipementId + calendar date.
    const technicienByRow = new Map<string, number>()
    if (Array.isArray(preventiveInterventions)) {
      for (const raw of preventiveInterventions as unknown[]) {
        if (!raw || typeof raw !== 'object') continue
        const r = raw as Record<string, unknown>
        const ceId = Number(r.clientEquipementId)
        const techId = Number(r.technicienId)
        const dateStr = typeof r.datePrevue === 'string' ? r.datePrevue : ''
        if (!Number.isInteger(ceId) || ceId <= 0) continue
        if (!dateStr) continue
        if (!Number.isInteger(techId) || techId <= 0) continue
        const d = new Date(dateStr + 'T12:00:00')
        if (isNaN(d.getTime())) continue
        technicienByRow.set(`${ceId}|${toDateKey(d)}`, techId)
      }
    }

    const rowsWithTech = intRows.map((row) => ({
      ...row,
      technicienId: technicienByRow.get(`${row.ceId}|${toDateKey(row.datePrevue)}`),
    }))

    const technicienIds = Array.from(new Set(rowsWithTech.map((r) => r.technicienId).filter((id): id is number => !!id)))
    if (technicienIds.length > 0) {
      const techUsers = await prisma.user.findMany({
        where: { id: { in: technicienIds }, role: UserRole.TECHNICIAN },
        select: { id: true },
      })
      if (techUsers.length !== technicienIds.length)
        return err('Un ou plusieurs techniciens sélectionnés sont introuvables.', 404)
    }

    const seenTechDate = new Set<string>()
    for (const row of rowsWithTech) {
      if (!row.technicienId) continue
      const dateKey = toDateKey(row.datePrevue)
      const pairKey = `${row.technicienId}|${dateKey}`
      if (seenTechDate.has(pairKey))
        return err(
          `Le technicien sélectionné est déjà affecté à une autre intervention prévue le ${dateKey}.`,
          409
        )
      seenTechDate.add(pairKey)
    }

    for (const pairKey of seenTechDate) {
      const [techIdStr, dateKey] = pairKey.split('|')
      const conflict = await prisma.intervention.findFirst({
        where: {
          technicienId: Number(techIdStr),
          statut: { not: InterventionStatus.ANNULEE },
          datePrevue: { gte: new Date(`${dateKey}T00:00:00`), lte: new Date(`${dateKey}T23:59:59`) },
        },
        select: { id: true },
      })
      if (conflict)
        return err(
          `Un technicien sélectionné est déjà affecté à une intervention existante le ${dateKey}.`,
          409
        )
    }

    const year = new Date().getFullYear()
    const prefix = `INT-${year}-`
    const latestRef = await prisma.intervention.findFirst({
      where: { reference: { startsWith: prefix } },
      orderBy: { reference: 'desc' },
      select: { reference: true },
    })
    let nextSeq = 1
    if (latestRef) {
      const n = parseInt(latestRef.reference.slice(prefix.length), 10)
      if (!isNaN(n)) nextSeq = n + 1
    }

    const statut = computeContractStatut(end)

    const contract = await prisma.$transaction(async (tx) => {
      const created = await tx.contract.create({
        data: {
          reference: contractRef,
          clientId,
          dateDebut: start,
          dateFin: end,
          periodicite: per,
          statut,
          description: typeof description === 'string' ? description.trim() || null : null,
          equipements: {
            create: ceIds.map((ceId) => ({ clientEquipementId: ceId })),
          },
        },
        include: { equipements: { select: { clientEquipementId: true } } },
      })

      if (rowsWithTech.length > 0) {
        await tx.intervention.createMany({
          data: rowsWithTech.map((row, i) => ({
            reference: `${prefix}${String(nextSeq + i).padStart(3, '0')}`,
            type: InterventionType.PREVENTIVE,
            clientId,
            clientEquipementId: row.ceId,
            technicienId: row.technicienId ?? null,
            contractId: created.id,
            datePrevue: row.datePrevue,
            statut: InterventionStatus.PLANIFIEE,
            couvertureContrat: true,
            description: rowDesc,
          })),
        })
      }

      return created
    })

    return NextResponse.json(
      { ...mapContract(contract), interventionsCreated: intRows.length },
      { status: 201 }
    )
  } catch (e) {
    console.error('[POST /api/contracts]', e)
    return NextResponse.json({ error: 'Erreur interne du serveur.' }, { status: 500 })
  }
}
