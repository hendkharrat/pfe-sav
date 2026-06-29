import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function err(msg: string, status: number) {
  return NextResponse.json({ error: msg }, { status })
}

function mapCE(ce: {
  id: number; clientId: number; equipementId: number;
  dateAchat: Date | null; localisation: string | null;
  dateInstallation: Date; notes: string | null;
}) {
  return {
    id: ce.id,
    clientId: ce.clientId,
    equipementId: ce.equipementId,
    dateAchat: ce.dateAchat ? ce.dateAchat.toISOString().split('T')[0] : undefined,
    localisation: ce.localisation ?? undefined,
    dateInstallation: ce.dateInstallation.toISOString().split('T')[0],
    notes: ce.notes ?? undefined,
  }
}

type Params = { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id: rawId } = await params
    const id = Number(rawId)
    if (!Number.isInteger(id) || id <= 0) return err('Identifiant invalide.', 400)
    const ce = await prisma.clientEquipement.findUnique({ where: { id }, select: { id: true } })
    if (!ce) return err('Équipement client introuvable.', 404)

    const body = await req.json().catch(() => ({})) as Record<string, unknown>
    const updateData: Record<string, unknown> = {}

    if (typeof body.localisation === 'string')
      updateData.localisation = body.localisation.trim() || null
    if (typeof body.notes === 'string')
      updateData.notes = body.notes.trim() || null
    if (typeof body.dateAchat === 'string')
      updateData.dateAchat = body.dateAchat ? new Date(body.dateAchat + 'T12:00:00') : null
    if (typeof body.dateInstallation === 'string' && body.dateInstallation)
      updateData.dateInstallation = new Date(body.dateInstallation + 'T12:00:00')

    const updated = await prisma.clientEquipement.update({ where: { id }, data: updateData })
    return NextResponse.json(mapCE(updated))
  } catch (e) {
    console.error('[PATCH /api/client-equipements/[id]]', e)
    return NextResponse.json({ error: 'Erreur interne du serveur.' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { id: rawId } = await params
    const id = Number(rawId)
    if (!Number.isInteger(id) || id <= 0) return err('Identifiant invalide.', 400)
    const ce = await prisma.clientEquipement.findUnique({
      where: { id },
      include: {
        _count: { select: { contracts: true, interventions: true, pannes: true } },
      },
    })
    if (!ce) return err('Équipement client introuvable.', 404)

    const { contracts, interventions, pannes } = ce._count
    if (contracts > 0 || interventions > 0 || pannes > 0) {
      return err(
        "Impossible de retirer cet équipement car il est lié à des contrats, interventions ou pannes.",
        409
      )
    }

    await prisma.clientEquipement.delete({ where: { id } })
    return new NextResponse(null, { status: 204 })
  } catch (e) {
    console.error('[DELETE /api/client-equipements/[id]]', e)
    return NextResponse.json({ error: 'Erreur interne du serveur.' }, { status: 500 })
  }
}
