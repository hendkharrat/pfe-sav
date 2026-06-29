import { NextRequest, NextResponse } from 'next/server'
import { InterventionStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'

function err(msg: string, status: number) {
  return NextResponse.json({ error: msg }, { status })
}

function mapIntervention(i: {
  id: number; reference: string; type: string; statut: InterventionStatus;
  clientId: number; clientEquipementId: number | null; technicienId: number | null;
  contractId: number | null; datePrevue: Date; dateRealisation: Date | null;
  couvertureContrat: boolean; description: string; diagnostic: string | null;
  actionsRealisees: string | null; materielUtilise: string | null; dureeMinutes: number | null;
  observations: string | null;
  clientEquipement?: { equipementId: number } | null;
}) {
  return {
    id: i.id, reference: i.reference, type: i.type, statut: i.statut,
    clientId: i.clientId,
    equipementId: i.clientEquipement?.equipementId ?? 0,
    clientEquipementId: i.clientEquipementId ?? undefined,
    technicienId: i.technicienId ?? undefined,
    contractId: i.contractId ?? undefined,
    datePrevue: i.datePrevue.toISOString().split('T')[0],
    dateRealisation: i.dateRealisation ? i.dateRealisation.toISOString().split('T')[0] : undefined,
    couvertureContrat: i.couvertureContrat, description: i.description,
    diagnostic: i.diagnostic ?? undefined, actionsRealisees: i.actionsRealisees ?? undefined,
    materielUtilise: i.materielUtilise ?? undefined, dureeMinutes: i.dureeMinutes ?? undefined,
    observations: i.observations ?? undefined,
  }
}

const INT_INCLUDE = { clientEquipement: { select: { equipementId: true } } } as const

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id: rawId } = await params
    const id = Number(rawId)
    if (!Number.isInteger(id) || id <= 0) return err('Identifiant invalide.', 400)
    const item = await prisma.intervention.findUnique({ where: { id }, include: INT_INCLUDE })
    if (!item) return err('Intervention introuvable.', 404)
    return NextResponse.json(mapIntervention(item))
  } catch (e) {
    console.error('[GET /api/interventions/[id]]', e)
    return NextResponse.json({ error: 'Erreur interne du serveur.' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id: rawId } = await params
    const id = Number(rawId)
    if (!Number.isInteger(id) || id <= 0) return err('Identifiant invalide.', 400)
    const existing = await prisma.intervention.findUnique({ where: { id } })
    if (!existing) return err('Intervention introuvable.', 404)

    const body = await req.json().catch(() => ({})) as Record<string, unknown>
    const updateData: Record<string, unknown> = {}

    if (typeof body.description === 'string' && body.description.trim())
      updateData.description = body.description.trim()
    if (typeof body.diagnostic === 'string') updateData.diagnostic = body.diagnostic || null
    if (typeof body.actionsRealisees === 'string') updateData.actionsRealisees = body.actionsRealisees || null
    if (typeof body.materielUtilise === 'string') updateData.materielUtilise = body.materielUtilise || null
    if (typeof body.observations === 'string') updateData.observations = body.observations || null
    if (typeof body.dureeMinutes === 'number') updateData.dureeMinutes = body.dureeMinutes

    if (body.technicienId !== undefined) {
      const raw = body.technicienId
      if (raw === null || raw === '') {
        updateData.technicienId = null
      } else {
        const techId = Number(raw)
        if (Number.isInteger(techId) && techId > 0) updateData.technicienId = techId
      }
    }

    if (body.contractId !== undefined) {
      const raw = body.contractId
      if (raw === null || raw === '') {
        updateData.contractId = null
      } else {
        const ctrId = Number(raw)
        if (Number.isInteger(ctrId) && ctrId > 0) updateData.contractId = ctrId
      }
    }

    if (typeof body.datePrevue === 'string') {
      const d = new Date(body.datePrevue + 'T12:00:00')
      if (!isNaN(d.getTime())) updateData.datePrevue = d
    }

    const updated = await prisma.intervention.update({ where: { id }, data: updateData, include: INT_INCLUDE })
    return NextResponse.json(mapIntervention(updated))
  } catch (e) {
    console.error('[PATCH /api/interventions/[id]]', e)
    return NextResponse.json({ error: 'Erreur interne du serveur.' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { id: rawId } = await params
    const id = Number(rawId)
    if (!Number.isInteger(id) || id <= 0) return err('Identifiant invalide.', 400)
    const existing = await prisma.intervention.findUnique({
      where: { id },
      select: { facture: { select: { id: true } }, panne: { select: { id: true } } },
    })
    if (!existing) return err('Intervention introuvable.', 404)
    if (existing.facture) return err('Cette intervention est liée à une facture et ne peut pas être supprimée.', 409)
    if (existing.panne) {
      await prisma.panne.update({ where: { id: existing.panne.id }, data: { interventionId: null } })
    }
    await prisma.intervention.delete({ where: { id } })
    return new NextResponse(null, { status: 204 })
  } catch (e) {
    console.error('[DELETE /api/interventions/[id]]', e)
    return NextResponse.json({ error: 'Erreur interne du serveur.' }, { status: 500 })
  }
}
