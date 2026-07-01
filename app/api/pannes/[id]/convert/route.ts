import { NextRequest, NextResponse } from 'next/server'
import { InterventionStatus, InterventionType, PanneStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'

function err(msg: string, status: number) {
  return NextResponse.json({ error: msg }, { status })
}

function dayBounds(date: Date) {
  const ds = date.toISOString().split('T')[0]
  return { gte: new Date(ds + 'T00:00:00'), lte: new Date(ds + 'T23:59:59') }
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

type Params = { params: Promise<{ id: string }> }

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { id: rawId } = await params
    const id = Number(rawId)
    if (!Number.isInteger(id) || id <= 0) return err('Identifiant invalide.', 400)

    const body = await req.json().catch(() => ({})) as Record<string, unknown>

    const panne = await prisma.panne.findUnique({
      where: { id },
      include: { clientEquipement: { select: { equipementId: true } } },
    })
    if (!panne) return err('Panne introuvable.', 404)

    if (panne.statut === PanneStatus.CONVERTIE)
      return err('Cette panne a déjà été convertie en intervention.', 409)
    if (panne.statut === PanneStatus.ANNULEE)
      return err('Une panne annulée ne peut pas être convertie.', 422)

    if (!panne.clientEquipementId)
      return err("La panne ne dispose pas d'équipement client associé.", 422)

    if (typeof body.datePrevue !== 'string' || !body.datePrevue)
      return err('La date prévue est requise.', 400)

    const date = new Date(body.datePrevue + 'T12:00:00')
    if (isNaN(date.getTime())) return err('Date prévue invalide.', 400)
    const today = new Date(); today.setHours(0, 0, 0, 0)
    const dateDay = new Date(date); dateDay.setHours(0, 0, 0, 0)
    if (dateDay < today) return err('La date prévue doit être aujourd\'hui ou une date future.', 400)

    let techId: number | undefined
    const rawTechId = body.technicienId
    if (rawTechId !== undefined && rawTechId !== null && rawTechId !== '') {
      const numTechId = Number(rawTechId)
      if (!Number.isInteger(numTechId) || numTechId <= 0)
        return err('Identifiant technicien invalide.', 400)
      const tech = await prisma.user.findUnique({ where: { id: numTechId } })
      if (!tech) return err('Technicien introuvable.', 404)
      if (tech.role !== 'TECHNICIAN') return err("Cet utilisateur n'est pas technicien.", 422)
      if (!tech.actif) return err('Ce technicien est désactivé.', 422)

      const conflict = await prisma.intervention.findFirst({
        where: {
          technicienId: numTechId,
          datePrevue: dayBounds(date),
          statut: { not: InterventionStatus.ANNULEE },
        },
        select: { id: true },
      })
      if (conflict) return err('Ce technicien est déjà affecté à une intervention à cette date.', 409)
      techId = numTechId
    }

    const ds = date.toISOString().split('T')[0]
    const coveringContract = await prisma.contract.findFirst({
      where: {
        clientId: panne.clientId,
        dateDebut: { lte: new Date(ds + 'T23:59:59') },
        dateFin: { gte: new Date(ds + 'T00:00:00') },
        equipements: { some: { clientEquipementId: panne.clientEquipementId } },
      },
      select: { id: true },
    })
    const couvertureContrat = coveringContract !== null

    const description =
      typeof body.description === 'string' && body.description.trim()
        ? body.description.trim()
        : panne.description

    const reference = await nextIntRef()

    const result = await prisma.$transaction(async (tx) => {
      const intervention = await tx.intervention.create({
        data: {
          reference,
          type: InterventionType.CURATIVE,
          clientId: panne.clientId,
          clientEquipementId: panne.clientEquipementId,
          technicienId: techId ?? null,
          contractId: coveringContract?.id ?? null,
          datePrevue: date,
          statut: InterventionStatus.PLANIFIEE,
          couvertureContrat,
          description,
        },
        include: { clientEquipement: { select: { equipementId: true } } },
      })

      const updatedPanne = await tx.panne.update({
        where: { id },
        data: { statut: PanneStatus.CONVERTIE, interventionId: intervention.id },
        include: { clientEquipement: { select: { equipementId: true } }, piecesJointes: true },
      })

      return { intervention, panne: updatedPanne }
    })

    return NextResponse.json({
      intervention: {
        id: result.intervention.id,
        reference: result.intervention.reference,
        type: result.intervention.type,
        statut: result.intervention.statut,
        clientId: result.intervention.clientId,
        equipementId: result.intervention.clientEquipement?.equipementId ?? 0,
        clientEquipementId: result.intervention.clientEquipementId ?? undefined,
        technicienId: result.intervention.technicienId ?? undefined,
        contractId: result.intervention.contractId ?? undefined,
        datePrevue: result.intervention.datePrevue.toISOString().split('T')[0],
        couvertureContrat: result.intervention.couvertureContrat,
        description: result.intervention.description,
      },
      panne: {
        id: result.panne.id,
        reference: result.panne.reference,
        statut: result.panne.statut,
        interventionId: result.panne.interventionId ?? undefined,
        equipementId: result.panne.clientEquipement?.equipementId ?? 0,
        clientEquipementId: result.panne.clientEquipementId ?? undefined,
        clientId: result.panne.clientId,
        dateDeclaration: result.panne.dateDeclaration.toISOString().split('T')[0],
        description: result.panne.description,
        piecesJointes: result.panne.piecesJointes.map((pj) => ({
          id: pj.id, filename: pj.filename, size: pj.size, type: pj.mimeType, previewUrl: pj.url,
        })),
      },
    }, { status: 201 })
  } catch (e) {
    console.error('[POST /api/pannes/[id]/convert]', e)
    return NextResponse.json({ error: 'Erreur interne du serveur.' }, { status: 500 })
  }
}
