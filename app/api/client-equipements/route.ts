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

export async function GET() {
  try {
    const records = await prisma.clientEquipement.findMany({
      orderBy: { dateInstallation: 'asc' },
    })

    return NextResponse.json(records.map(mapCE))
  } catch (e) {
    console.error('[GET /api/client-equipements]', e)
    return NextResponse.json({ error: 'Erreur interne du serveur.' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null)
    if (!body) return err('Corps de la requête invalide.', 400)

    const { dateInstallation, dateAchat, localisation, notes } =
      body as Record<string, unknown>

    const clientId = Number((body as Record<string, unknown>).clientId)
    if (!Number.isInteger(clientId) || clientId <= 0) return err('Le client est requis.', 400)

    const equipementId = Number((body as Record<string, unknown>).equipementId)
    if (!Number.isInteger(equipementId) || equipementId <= 0) return err("L'équipement est requis.", 400)

    if (typeof dateInstallation !== 'string' || !dateInstallation)
      return err("La date d'installation est requise.", 400)

    if (typeof dateAchat === 'string' && dateAchat && dateInstallation < dateAchat) {
      return err("La date d'installation doit être égale ou postérieure à la date d'achat.", 400)
    }

    const client = await prisma.client.findUnique({ where: { id: clientId }, select: { id: true } })
    if (!client) return err('Client introuvable.', 404)

    const equipment = await prisma.equipment.findUnique({ where: { id: equipementId }, select: { id: true } })
    if (!equipment) return err('Équipement introuvable.', 404)

    const created = await prisma.clientEquipement.create({
      data: {
        clientId,
        equipementId,
        dateInstallation: new Date(dateInstallation + 'T12:00:00'),
        dateAchat: typeof dateAchat === 'string' && dateAchat ? new Date(dateAchat + 'T12:00:00') : null,
        localisation: typeof localisation === 'string' && localisation.trim() ? localisation.trim() : null,
        notes: typeof notes === 'string' && notes.trim() ? notes.trim() : null,
      },
    })

    return NextResponse.json(mapCE(created), { status: 201 })
  } catch (e) {
    console.error('[POST /api/client-equipements]', e)
    return NextResponse.json({ error: 'Erreur interne du serveur.' }, { status: 500 })
  }
}
