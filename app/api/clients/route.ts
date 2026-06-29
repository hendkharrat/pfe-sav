import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { ClientType } from '@prisma/client'
import { prisma } from '@/lib/prisma'

function err(msg: string, status: number) {
  return NextResponse.json({ error: msg }, { status })
}

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

export async function GET() {
  try {
    const clients = await prisma.client.findMany({
      orderBy: { dateCreation: 'asc' },
      include: {
        _count: { select: { clientEquipements: true } },
      },
    })

    return NextResponse.json(clients.map(({ passwordHash: _ph, ...c }) => mapClient(c)))
  } catch (e) {
    console.error('[GET /api/clients]', e)
    return NextResponse.json({ error: 'Erreur interne du serveur.' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null)
    if (!body) return err('Corps de la requête invalide.', 400)

    const { typeClient, societe, contact, prenom, nom, email, telephone, adresse, ville, password } =
      body as Record<string, unknown>

    const validTypes = ['SOCIETE', 'PERSONNE_PHYSIQUE']
    if (typeof typeClient !== 'string' || !validTypes.includes(typeClient))
      return err('Type de client invalide.', 400)
    if (typeof email !== 'string' || !email.trim()) return err("L'email est requis.", 400)
    if (typeof password !== 'string' || !password.trim()) return err('Le mot de passe est requis.', 400)
    if (typeClient === 'SOCIETE' && (typeof societe !== 'string' || !societe.trim()))
      return err('La société est requise pour un client de type Société.', 400)
    if (typeClient === 'PERSONNE_PHYSIQUE' && (typeof prenom !== 'string' || !prenom.trim()))
      return err('Le prénom est requis pour une personne physique.', 400)
    if (typeClient === 'PERSONNE_PHYSIQUE' && (typeof nom !== 'string' || !nom.trim()))
      return err('Le nom est requis pour une personne physique.', 400)

    const existing = await prisma.client.findUnique({
      where: { email: email.trim() },
      select: { id: true },
    })
    if (existing) return err('Un client avec cet email existe déjà.', 409)

    const passwordHash = await bcrypt.hash(password.trim(), 10)

    const created = await prisma.client.create({
      data: {
        typeClient: typeClient as ClientType,
        societe: typeClient === 'SOCIETE' && typeof societe === 'string' ? societe.trim() || null : null,
        contact: typeClient === 'SOCIETE' && typeof contact === 'string' ? contact.trim() || null : null,
        prenom: typeClient === 'PERSONNE_PHYSIQUE' && typeof prenom === 'string' ? prenom.trim() || null : null,
        nom: typeClient === 'PERSONNE_PHYSIQUE' && typeof nom === 'string' ? nom.trim() || null : null,
        email: email.trim(),
        telephone: typeof telephone === 'string' && telephone.trim() ? telephone.trim() : null,
        adresse: typeof adresse === 'string' && adresse.trim() ? adresse.trim() : null,
        ville: typeof ville === 'string' && ville.trim() ? ville.trim() : null,
        passwordHash,
      },
      include: { _count: { select: { clientEquipements: true } } },
    })

    const { passwordHash: _ph, ...rest } = created
    return NextResponse.json(mapClient(rest), { status: 201 })
  } catch (e) {
    console.error('[POST /api/clients]', e)
    return NextResponse.json({ error: 'Erreur interne du serveur.' }, { status: 500 })
  }
}
