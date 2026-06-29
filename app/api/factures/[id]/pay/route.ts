import { NextRequest, NextResponse } from 'next/server'
import { FactureStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'

function err(msg: string, status: number) {
  return NextResponse.json({ error: msg }, { status })
}

type Params = { params: Promise<{ id: string }> }

export async function PATCH(_req: NextRequest, { params }: Params) {
  try {
    const { id: rawId } = await params
    const id = Number(rawId)
    if (!Number.isInteger(id) || id <= 0) return err('Identifiant invalide.', 400)

    const facture = await prisma.facture.findUnique({
      where: { id },
      select: { id: true, statut: true },
    })
    if (!facture) return err('Facture introuvable.', 404)
    if (facture.statut === FactureStatus.PAYEE)
      return err('Cette facture est déjà marquée comme payée.', 409)

    const updated = await prisma.facture.update({
      where: { id },
      data: { statut: FactureStatus.PAYEE },
      select: { id: true, numero: true, statut: true, montantTTC: true, clientId: true },
    })
    return NextResponse.json(updated)
  } catch (e) {
    console.error('[PATCH /api/factures/[id]/pay]', e)
    return NextResponse.json({ error: 'Erreur interne du serveur.' }, { status: 500 })
  }
}
