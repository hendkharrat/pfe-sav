import { NextRequest, NextResponse } from 'next/server'
import { PanneStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'

function err(msg: string, status: number) {
  return NextResponse.json({ error: msg }, { status })
}

function mapPanne(p: {
  id: number; reference: string; clientId: number; clientEquipementId: number | null;
  dateDeclaration: Date; description: string; statut: PanneStatus; interventionId: number | null;
  clientEquipement?: { equipementId: number } | null;
  piecesJointes?: { id: number; filename: string; url: string; size: number; mimeType: string }[];
}) {
  return {
    id: p.id,
    reference: p.reference,
    clientId: p.clientId,
    equipementId: p.clientEquipement?.equipementId ?? 0,
    clientEquipementId: p.clientEquipementId ?? undefined,
    dateDeclaration: p.dateDeclaration.toISOString().split('T')[0],
    description: p.description,
    statut: p.statut,
    interventionId: p.interventionId ?? undefined,
    piecesJointes: (p.piecesJointes ?? []).map((pj) => ({
      id: pj.id,
      filename: pj.filename,
      size: pj.size,
      type: pj.mimeType,
      previewUrl: pj.url,
    })),
  }
}

const PANNE_INCLUDE = {
  clientEquipement: { select: { equipementId: true } },
  piecesJointes: true,
} as const

async function nextPanneRef(): Promise<string> {
  const year = new Date().getFullYear()
  const prefix = `PAN-${year}-`
  const latest = await prisma.panne.findFirst({
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

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const where: Record<string, unknown> = {}

    const statut = searchParams.get('statut')
    const clientIdRaw = searchParams.get('clientId')
    const validStatuts = ['EN_ATTENTE', 'PRISE_EN_CHARGE', 'CONVERTIE', 'ANNULEE']
    if (statut && validStatuts.includes(statut)) where.statut = statut as PanneStatus
    if (clientIdRaw) {
      const clientId = Number(clientIdRaw)
      if (Number.isInteger(clientId) && clientId > 0) where.clientId = clientId
    }

    const pannes = await prisma.panne.findMany({
      where,
      orderBy: { dateDeclaration: 'desc' },
      include: PANNE_INCLUDE,
    })
    return NextResponse.json(pannes.map(mapPanne))
  } catch (e) {
    console.error('[GET /api/pannes]', e)
    return NextResponse.json({ error: 'Erreur interne du serveur.' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null)
    if (!body) return err('Corps de la requête invalide.', 400)

    const { description, piecesJointes } = body as Record<string, unknown>

    const clientId = Number((body as Record<string, unknown>).clientId)
    if (!Number.isInteger(clientId) || clientId <= 0) return err('Le client est requis.', 400)

    const clientEquipementId = Number((body as Record<string, unknown>).clientEquipementId)
    if (!Number.isInteger(clientEquipementId) || clientEquipementId <= 0)
      return err("L'équipement client est requis.", 400)

    if (typeof description !== 'string' || !description.trim())
      return err('La description est requise.', 400)

    const client = await prisma.client.findUnique({ where: { id: clientId }, select: { id: true } })
    if (!client) return err('Client introuvable.', 404)

    const ce = await prisma.clientEquipement.findUnique({
      where: { id: clientEquipementId },
      select: { id: true, clientId: true },
    })
    if (!ce) return err('Équipement client introuvable.', 404)
    if (ce.clientId !== clientId) return err("Cet équipement n'appartient pas à ce client.", 422)

    const reference = await nextPanneRef()

    const created = await prisma.panne.create({
      data: {
        reference,
        clientId,
        clientEquipementId,
        description: description.trim(),
        statut: PanneStatus.EN_ATTENTE,
        piecesJointes: Array.isArray(piecesJointes) && piecesJointes.length > 0
          ? {
              create: (piecesJointes as { filename: string; url: string; size: number; mimeType: string }[])
                .filter((pj) => pj.filename)
                .map((pj) => ({
                  filename: pj.filename,
                  url: pj.url ?? '',
                  size: pj.size ?? 0,
                  mimeType: pj.mimeType ?? 'application/octet-stream',
                })),
            }
          : undefined,
      },
      include: PANNE_INCLUDE,
    })

    return NextResponse.json(mapPanne(created), { status: 201 })
  } catch (e) {
    console.error('[POST /api/pannes]', e)
    return NextResponse.json({ error: 'Erreur interne du serveur.' }, { status: 500 })
  }
}
