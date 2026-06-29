import { NextRequest, NextResponse } from 'next/server'
import { InterventionStatus, InterventionType } from '@prisma/client'
import { prisma } from '@/lib/prisma'

function err(msg: string, status: number) {
  return NextResponse.json({ error: msg }, { status })
}

type Params = { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id: rawId } = await params
    const id = Number(rawId)
    if (!Number.isInteger(id) || id <= 0) return err('Identifiant invalide.', 400)

    const body = await req.json().catch(() => ({})) as Record<string, unknown>

    const intervention = await prisma.intervention.findUnique({
      where: { id },
      include: { clientEquipement: { select: { equipementId: true } } },
    })
    if (!intervention) return err('Intervention introuvable.', 404)

    if (intervention.statut === InterventionStatus.ANNULEE)
      return err('Une intervention annulée ne peut pas être clôturée.', 422)

    const updateData: Record<string, unknown> = {
      statut: InterventionStatus.REALISEE,
      dateRealisation: intervention.dateRealisation ?? new Date(),
    }

    if (typeof body.diagnostic === 'string') updateData.diagnostic = body.diagnostic || null
    if (typeof body.actionsRealisees === 'string') updateData.actionsRealisees = body.actionsRealisees || null
    if (typeof body.materielUtilise === 'string') updateData.materielUtilise = body.materielUtilise || null
    if (typeof body.observations === 'string') updateData.observations = body.observations || null
    if (typeof body.dureeMinutes === 'number' && body.dureeMinutes > 0)
      updateData.dureeMinutes = body.dureeMinutes

    if (
      intervention.type === InterventionType.CURATIVE &&
      intervention.clientEquipementId
    ) {
      const ds = intervention.datePrevue.toISOString().split('T')[0]
      const covering = await prisma.contract.findFirst({
        where: {
          clientId: intervention.clientId,
          dateDebut: { lte: new Date(ds + 'T23:59:59') },
          dateFin: { gte: new Date(ds + 'T00:00:00') },
          equipements: { some: { clientEquipementId: intervention.clientEquipementId } },
        },
        select: { id: true },
      })
      updateData.couvertureContrat = covering !== null
      if (covering && !intervention.contractId) updateData.contractId = covering.id
    }

    const updated = await prisma.intervention.update({
      where: { id },
      data: updateData,
      include: { clientEquipement: { select: { equipementId: true } } },
    })

    return NextResponse.json({
      id: updated.id,
      reference: updated.reference,
      type: updated.type,
      statut: updated.statut,
      clientId: updated.clientId,
      equipementId: updated.clientEquipement?.equipementId ?? 0,
      clientEquipementId: updated.clientEquipementId ?? undefined,
      technicienId: updated.technicienId ?? undefined,
      contractId: updated.contractId ?? undefined,
      datePrevue: updated.datePrevue.toISOString().split('T')[0],
      dateRealisation: updated.dateRealisation
        ? updated.dateRealisation.toISOString().split('T')[0]
        : undefined,
      couvertureContrat: updated.couvertureContrat,
      description: updated.description,
      diagnostic: updated.diagnostic ?? undefined,
      actionsRealisees: updated.actionsRealisees ?? undefined,
      materielUtilise: updated.materielUtilise ?? undefined,
      dureeMinutes: updated.dureeMinutes ?? undefined,
      observations: updated.observations ?? undefined,
    })
  } catch (e) {
    console.error('[PATCH /api/interventions/[id]/close]', e)
    return NextResponse.json({ error: 'Erreur interne du serveur.' }, { status: 500 })
  }
}
