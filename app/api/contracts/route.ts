import { NextRequest, NextResponse } from 'next/server'
import { ContractStatus, InterventionStatus, InterventionType, Periodicite } from '@prisma/client'
import { prisma } from '@/lib/prisma'

function err(msg: string, status: number) {
  return NextResponse.json({ error: msg }, { status })
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

    const { reference, dateDebut, dateFin, periodicite, description, clientEquipementIds } =
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
      const year = new Date().getFullYear()
      const count = await prisma.contract.count()
      contractRef = `CTR-${year}-${String(count + 1).padStart(3, '0')}`
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

      if (intRows.length > 0) {
        await tx.intervention.createMany({
          data: intRows.map((row, i) => ({
            reference: `${prefix}${String(nextSeq + i).padStart(3, '0')}`,
            type: InterventionType.PREVENTIVE,
            clientId,
            clientEquipementId: row.ceId,
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
