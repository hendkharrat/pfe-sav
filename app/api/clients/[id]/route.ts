import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { ClientType } from '@prisma/client'
import { prisma } from '@/lib/prisma'

function err(msg: string, status: number) {
  return NextResponse.json({ error: msg }, { status })
}

const CLIENT_INCLUDE = {
  _count: { select: { clientEquipements: true } },
} as const

function mapClient(c: {
  id: number; typeClient: ClientType; societe: string | null; contact: string | null;
  prenom: string | null; nom: string | null; email: string; telephone: string | null;
  adresse: string | null; ville: string | null; dateCreation: Date;
  _count: { clientEquipements: number };
}) {
  return {
    id: c.id,
    typeClient: c.typeClient,
    societe: c.societe ?? undefined,
    contact: c.contact ?? undefined,
    prenom: c.prenom ?? undefined,
    nom: c.nom ?? undefined,
    email: c.email,
    telephone: c.telephone ?? '',
    adresse: c.adresse ?? '',
    ville: c.ville ?? '',
    dateCreation: c.dateCreation.toISOString().split('T')[0],
    nombreEquipements: c._count.clientEquipements,
  }
}

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id: rawId } = await params
    const id = Number(rawId)
    if (!Number.isInteger(id) || id <= 0) return err('Identifiant invalide.', 400)
    const client = await prisma.client.findUnique({ where: { id }, include: CLIENT_INCLUDE })
    if (!client) return err('Client introuvable.', 404)
    const { passwordHash: _ph, ...rest } = client
    return NextResponse.json(mapClient(rest))
  } catch (e) {
    console.error('[GET /api/clients/[id]]', e)
    return NextResponse.json({ error: 'Erreur interne du serveur.' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id: rawId } = await params
    const id = Number(rawId)
    if (!Number.isInteger(id) || id <= 0) return err('Identifiant invalide.', 400)
    const existing = await prisma.client.findUnique({ where: { id }, select: { id: true, passwordHash: true } })
    if (!existing) return err('Client introuvable.', 404)

    const body = await req.json().catch(() => ({})) as Record<string, unknown>
    const { typeClient, societe, contact, prenom, nom, email, telephone, adresse, ville, password } = body

    const validTypes = ['SOCIETE', 'PERSONNE_PHYSIQUE']
    if (typeof typeClient !== 'string' || !validTypes.includes(typeClient))
      return err('Type de client invalide.', 400)

    if (typeof email === 'string' && email.trim()) {
      const conflict = await prisma.client.findUnique({
        where: { email: email.trim() },
        select: { id: true },
      })
      if (conflict && conflict.id !== id) return err('Un client avec cet email existe déjà.', 409)
    }

    const updateData: Record<string, unknown> = {
      typeClient: typeClient as ClientType,
    }

    if (typeof email === 'string' && email.trim()) updateData.email = email.trim()
    if (typeof telephone === 'string') updateData.telephone = telephone.trim() || null
    if (typeof adresse === 'string') updateData.adresse = adresse.trim() || null
    if (typeof ville === 'string') updateData.ville = ville.trim() || null

    if (typeClient === 'SOCIETE') {
      updateData.societe = typeof societe === 'string' ? societe.trim() || null : null
      updateData.contact = typeof contact === 'string' ? contact.trim() || null : null
      updateData.prenom = null
      updateData.nom = null
    } else {
      updateData.prenom = typeof prenom === 'string' ? prenom.trim() || null : null
      updateData.nom = typeof nom === 'string' ? nom.trim() || null : null
      updateData.societe = null
      updateData.contact = null
    }

    if (typeof password === 'string' && password.trim()) {
      updateData.passwordHash = await bcrypt.hash(password.trim(), 10)
    }

    const updated = await prisma.client.update({
      where: { id },
      data: updateData,
      include: CLIENT_INCLUDE,
    })
    const { passwordHash: _ph, ...rest } = updated
    return NextResponse.json(mapClient(rest))
  } catch (e) {
    console.error('[PATCH /api/clients/[id]]', e)
    return NextResponse.json({ error: 'Erreur interne du serveur.' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { id: rawId } = await params
    const id = Number(rawId)
    if (!Number.isInteger(id) || id <= 0) return err('Identifiant invalide.', 400)
    const client = await prisma.client.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            contrats: true,
            interventions: true,
            pannes: true,
            factures: true,
          },
        },
      },
    })
    if (!client) return err('Client introuvable.', 404)

    const counts = client._count
    if (counts.contrats > 0 || counts.interventions > 0 || counts.pannes > 0 || counts.factures > 0) {
      return err(
        'Impossible de supprimer ce client car il possède des contrats, interventions, pannes ou factures associés.',
        409
      )
    }

    await prisma.clientEquipement.deleteMany({ where: { clientId: id } })
    await prisma.client.delete({ where: { id } })

    return new NextResponse(null, { status: 204 })
  } catch (e) {
    console.error('[DELETE /api/clients/[id]]', e)
    return NextResponse.json({ error: 'Erreur interne du serveur.' }, { status: 500 })
  }
}
