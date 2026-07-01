import { NextRequest, NextResponse } from 'next/server'
import { ContractStatus, Periodicite } from '@prisma/client'
import { prisma } from '@/lib/prisma'

function err(msg: string, status: number) {
  return NextResponse.json({ error: msg }, { status })
}

function computeContractStatut(dateFin: Date): ContractStatus {
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const fin = new Date(dateFin); fin.setHours(0, 0, 0, 0)
  const soon = new Date(today); soon.setDate(soon.getDate() + 30)
  if (fin < today) return ContractStatus.EXPIRE
  if (fin < soon) return ContractStatus.BIENTOT_EXPIRE
  return ContractStatus.ACTIF
}

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id: rawId } = await params
    const id = Number(rawId)
    if (!Number.isInteger(id) || id <= 0) return err('Identifiant invalide.', 400)
    const contract = await prisma.contract.findUnique({
      where: { id },
      include: {
        client: { select: { id: true, societe: true, prenom: true, nom: true, typeClient: true } },
        equipements: {
          include: {
            clientEquipement: {
              select: { id: true, equipementId: true, localisation: true },
            },
          },
        },
        _count: { select: { interventions: true } },
      },
    })
    if (!contract) return err('Contrat introuvable.', 404)

    return NextResponse.json({
      id: contract.id,
      reference: contract.reference,
      clientId: contract.clientId,
      dateDebut: contract.dateDebut.toISOString().split('T')[0],
      dateFin: contract.dateFin.toISOString().split('T')[0],
      periodicite: contract.periodicite,
      statut: computeContractStatut(contract.dateFin),
      description: contract.description ?? undefined,
      clientEquipementIds: contract.equipements.map((e) => e.clientEquipementId),
      client: contract.client,
      interventionsCount: contract._count.interventions,
    })
  } catch (e) {
    console.error('[GET /api/contracts/[id]]', e)
    return NextResponse.json({ error: 'Erreur interne du serveur.' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id: rawId } = await params
    const id = Number(rawId)
    if (!Number.isInteger(id) || id <= 0) return err('Identifiant invalide.', 400)
    const existing = await prisma.contract.findUnique({ where: { id } })
    if (!existing) return err('Contrat introuvable.', 404)

    const body = await req.json().catch(() => ({})) as Record<string, unknown>
    const updateData: Record<string, unknown> = {}

    if (typeof body.description === 'string') updateData.description = body.description || null
    if (typeof body.reference === 'string' && body.reference.trim()) {
      const dup = await prisma.contract.findUnique({ where: { reference: body.reference.trim() } })
      if (dup && dup.id !== id) return err(`La référence "${body.reference}" existe déjà.`, 409)
      updateData.reference = body.reference.trim()
    }

    const validPeriodicites = ['MENSUELLE', 'TRIMESTRIELLE', 'SEMESTRIELLE', 'ANNUELLE']
    if (typeof body.periodicite === 'string' && validPeriodicites.includes(body.periodicite))
      updateData.periodicite = body.periodicite as Periodicite

    if (typeof body.dateDebut === 'string' || typeof body.dateFin === 'string') {
      const newStart = body.dateDebut
        ? new Date((body.dateDebut as string) + 'T12:00:00')
        : existing.dateDebut
      const newEnd = body.dateFin
        ? new Date((body.dateFin as string) + 'T12:00:00')
        : existing.dateFin
      if (isNaN(newStart.getTime()) || isNaN(newEnd.getTime())) return err('Dates invalides.', 400)
      if (newEnd <= newStart) return err('La date de fin doit être postérieure à la date de début.', 400)
      if (body.dateDebut) updateData.dateDebut = newStart
      if (body.dateFin) {
        updateData.dateFin = newEnd
        updateData.statut = computeContractStatut(newEnd)
      }
    }

    if (typeof body.statut === 'string') {
      const valid = Object.values(ContractStatus)
      if (!valid.includes(body.statut as ContractStatus)) return err('Statut invalide.', 400)
      updateData.statut = body.statut as ContractStatus
    }

    const updated = await prisma.contract.update({
      where: { id },
      data: updateData,
      include: { equipements: { select: { clientEquipementId: true } } },
    })

    return NextResponse.json({
      id: updated.id,
      reference: updated.reference,
      clientId: updated.clientId,
      dateDebut: updated.dateDebut.toISOString().split('T')[0],
      dateFin: updated.dateFin.toISOString().split('T')[0],
      periodicite: updated.periodicite,
      statut: computeContractStatut(updated.dateFin),
      description: updated.description ?? undefined,
      clientEquipementIds: updated.equipements.map((e) => e.clientEquipementId),
    })
  } catch (e) {
    console.error('[PATCH /api/contracts/[id]]', e)
    return NextResponse.json({ error: 'Erreur interne du serveur.' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { id: rawId } = await params
    const id = Number(rawId)
    if (!Number.isInteger(id) || id <= 0) return err('Identifiant invalide.', 400)
    const existing = await prisma.contract.findUnique({ where: { id } })
    if (!existing) return err('Contrat introuvable.', 404)

    const factureCount = await prisma.facture.count({
      where: { intervention: { contractId: id } },
    })
    if (factureCount > 0)
      return err('Ce contrat ne peut pas être supprimé car il est lié à des factures.', 409)

    await prisma.contract.delete({ where: { id } })
    return new NextResponse(null, { status: 204 })
  } catch (e) {
    console.error('[DELETE /api/contracts/[id]]', e)
    return NextResponse.json({ error: 'Erreur interne du serveur.' }, { status: 500 })
  }
}
