import { NextRequest, NextResponse } from 'next/server'
import { PanneStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'

function err(msg: string, status: number) {
  return NextResponse.json({ error: msg }, { status })
}

const PANNE_INCLUDE = {
  clientEquipement: { select: { equipementId: true } },
  piecesJointes: true,
} as const

function mapPanne(p: {
  id: number; reference: string; clientId: number; clientEquipementId: number | null;
  dateDeclaration: Date; description: string; statut: PanneStatus; interventionId: number | null;
  clientEquipement?: { equipementId: number } | null;
  piecesJointes?: { id: number; filename: string; url: string; size: number; mimeType: string }[];
}) {
  return {
    id: p.id, reference: p.reference, clientId: p.clientId,
    equipementId: p.clientEquipement?.equipementId ?? 0,
    clientEquipementId: p.clientEquipementId ?? undefined,
    dateDeclaration: p.dateDeclaration.toISOString().split('T')[0],
    description: p.description, statut: p.statut,
    interventionId: p.interventionId ?? undefined,
    piecesJointes: (p.piecesJointes ?? []).map((pj) => ({
      id: pj.id, filename: pj.filename, size: pj.size, type: pj.mimeType, previewUrl: pj.url,
    })),
  }
}

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id: rawId } = await params
    const id = Number(rawId)
    if (!Number.isInteger(id) || id <= 0) return err('Identifiant invalide.', 400)
    const panne = await prisma.panne.findUnique({ where: { id }, include: PANNE_INCLUDE })
    if (!panne) return err('Panne introuvable.', 404)
    return NextResponse.json(mapPanne(panne))
  } catch (e) {
    console.error('[GET /api/pannes/[id]]', e)
    return NextResponse.json({ error: 'Erreur interne du serveur.' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id: rawId } = await params
    const id = Number(rawId)
    if (!Number.isInteger(id) || id <= 0) return err('Identifiant invalide.', 400)
    const panne = await prisma.panne.findUnique({ where: { id } })
    if (!panne) return err('Panne introuvable.', 404)

    const body = await req.json().catch(() => ({})) as Record<string, unknown>
    const updateData: Record<string, unknown> = {}

    if (typeof body.description === 'string' && body.description.trim())
      updateData.description = body.description.trim()

    if (typeof body.statut === 'string') {
      const valid = ['EN_ATTENTE', 'PRISE_EN_CHARGE', 'CONVERTIE', 'ANNULEE']
      if (!valid.includes(body.statut)) return err('Statut invalide.', 400)
      if (panne.statut === PanneStatus.CONVERTIE)
        return err('Une panne convertie ne peut pas être modifiée.', 422)
      updateData.statut = body.statut as PanneStatus
    }

    const updated = await prisma.panne.update({ where: { id }, data: updateData, include: PANNE_INCLUDE })
    return NextResponse.json(mapPanne(updated))
  } catch (e) {
    console.error('[PATCH /api/pannes/[id]]', e)
    return NextResponse.json({ error: 'Erreur interne du serveur.' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { id: rawId } = await params
    const id = Number(rawId)
    if (!Number.isInteger(id) || id <= 0) return err('Identifiant invalide.', 400)
    const panne = await prisma.panne.findUnique({ where: { id }, select: { statut: true } })
    if (!panne) return err('Panne introuvable.', 404)
    if (panne.statut === PanneStatus.CONVERTIE)
      return err('Une panne convertie ne peut pas être supprimée.', 409)

    await prisma.panne.delete({ where: { id } })
    return new NextResponse(null, { status: 204 })
  } catch (e) {
    console.error('[DELETE /api/pannes/[id]]', e)
    return NextResponse.json({ error: 'Erreur interne du serveur.' }, { status: 500 })
  }
}
