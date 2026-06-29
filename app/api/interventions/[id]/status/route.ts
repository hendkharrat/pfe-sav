import { NextRequest, NextResponse } from 'next/server'
import { InterventionStatus } from '@prisma/client'
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

    if (typeof body.statut !== 'string') return err('Le statut est requis.', 400)
    const validStatuts = ['PLANIFIEE', 'EN_COURS', 'REALISEE', 'ANNULEE']
    if (!validStatuts.includes(body.statut)) return err('Statut invalide.', 400)

    const intervention = await prisma.intervention.findUnique({ where: { id } })
    if (!intervention) return err('Intervention introuvable.', 404)

    const newStatut = body.statut as InterventionStatus
    const updateData: Record<string, unknown> = { statut: newStatut }

    if (newStatut === InterventionStatus.REALISEE && !intervention.dateRealisation) {
      updateData.dateRealisation = new Date()
    }

    const updated = await prisma.intervention.update({
      where: { id },
      data: updateData,
      select: { id: true, statut: true, dateRealisation: true, reference: true },
    })

    return NextResponse.json({
      ...updated,
      dateRealisation: updated.dateRealisation
        ? updated.dateRealisation.toISOString().split('T')[0]
        : undefined,
    })
  } catch (e) {
    console.error('[PATCH /api/interventions/[id]/status]', e)
    return NextResponse.json({ error: 'Erreur interne du serveur.' }, { status: 500 })
  }
}
