import { NextRequest, NextResponse } from 'next/server'
import { InterventionStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'

function err(msg: string, status: number) {
  return NextResponse.json({ error: msg }, { status })
}

function dayBounds(date: Date) {
  const ds = date.toISOString().split('T')[0]
  return { gte: new Date(ds + 'T00:00:00'), lte: new Date(ds + 'T23:59:59') }
}

type Params = { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id: rawId } = await params
    const id = Number(rawId)
    if (!Number.isInteger(id) || id <= 0) return err('Identifiant invalide.', 400)

    const body = await req.json().catch(() => ({})) as Record<string, unknown>

    const technicienId = Number(body.technicienId)
    if (!Number.isInteger(technicienId) || technicienId <= 0)
      return err('Le technicien est requis.', 400)

    const intervention = await prisma.intervention.findUnique({ where: { id } })
    if (!intervention) return err('Intervention introuvable.', 404)

    if (intervention.statut === InterventionStatus.REALISEE)
      return err('Une intervention réalisée ne peut plus être réaffectée.', 422)
    if (intervention.statut === InterventionStatus.ANNULEE)
      return err('Une intervention annulée ne peut plus être réaffectée.', 422)

    const tech = await prisma.user.findUnique({ where: { id: technicienId } })
    if (!tech) return err('Technicien introuvable.', 404)
    if (tech.role !== 'TECHNICIAN') return err("Cet utilisateur n'est pas technicien.", 422)
    if (!tech.actif) return err('Ce technicien est désactivé.', 422)

    const conflict = await prisma.intervention.findFirst({
      where: {
        technicienId,
        datePrevue: dayBounds(intervention.datePrevue),
        statut: { not: InterventionStatus.ANNULEE },
        id: { not: id },
      },
      select: { id: true, reference: true },
    })
    if (conflict)
      return err('Ce technicien est déjà affecté à une intervention à cette date.', 409)

    const updated = await prisma.intervention.update({
      where: { id },
      data: {
        technicienId,
        statut:
          intervention.statut === InterventionStatus.PLANIFIEE
            ? InterventionStatus.PLANIFIEE
            : intervention.statut,
      },
      select: { id: true, technicienId: true, statut: true, reference: true },
    })

    return NextResponse.json(updated)
  } catch (e) {
    console.error('[PATCH /api/interventions/[id]/assign]', e)
    return NextResponse.json({ error: 'Erreur interne du serveur.' }, { status: 500 })
  }
}
