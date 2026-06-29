import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

function err(msg: string, status: number) {
  return NextResponse.json({ error: msg }, { status })
}

function mapUser(u: {
  id: number; prenom: string; nom: string; email: string;
  telephone: string | null; role: string; actif: boolean; dateCreation: Date;
}) {
  return {
    id: u.id,
    prenom: u.prenom,
    nom: u.nom,
    email: u.email,
    telephone: u.telephone ?? undefined,
    role: u.role === 'ADMIN' ? 'admin' : 'technician',
    actif: u.actif,
    dateCreation: u.dateCreation.toISOString().split('T')[0],
  }
}

const ROLE_MAP: Record<string, 'ADMIN' | 'TECHNICIAN'> = {
  admin: 'ADMIN',
  technician: 'TECHNICIAN',
}

export async function GET() {
  try {
    const users = await prisma.user.findMany({ orderBy: { dateCreation: 'asc' } })
    return NextResponse.json(users.map(({ passwordHash: _ph, ...u }) => mapUser(u)))
  } catch (e) {
    console.error('[GET /api/users]', e)
    return NextResponse.json({ error: 'Erreur interne du serveur.' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null)
    if (!body) return err('Corps de la requête invalide.', 400)

    const { prenom, nom, email, telephone, role, password, actif } =
      body as Record<string, unknown>

    if (typeof prenom !== 'string' || !prenom.trim()) return err('Le prénom est obligatoire.', 400)
    if (typeof nom !== 'string' || !nom.trim()) return err('Le nom est obligatoire.', 400)
    if (typeof email !== 'string' || !email.trim()) return err("L'email est obligatoire.", 400)
    if (typeof password !== 'string' || !password.trim())
      return err('Le mot de passe est obligatoire.', 400)
    if (typeof role !== 'string' || !ROLE_MAP[role])
      return err('Le rôle est invalide.', 400)

    const existing = await prisma.user.findUnique({
      where: { email: email.trim() },
      select: { id: true },
    })
    if (existing) return err('Un utilisateur avec cet email existe déjà.', 409)

    const passwordHash = await bcrypt.hash(password.trim(), 10)
    const created = await prisma.user.create({
      data: {
        prenom: prenom.trim(),
        nom: nom.trim(),
        email: email.trim(),
        telephone: typeof telephone === 'string' && telephone.trim() ? telephone.trim() : null,
        role: ROLE_MAP[role],
        passwordHash,
        actif: actif === false ? false : true,
      },
    })

    const { passwordHash: _ph, ...rest } = created
    return NextResponse.json(mapUser(rest), { status: 201 })
  } catch (e) {
    console.error('[POST /api/users]', e)
    return NextResponse.json({ error: 'Erreur interne du serveur.' }, { status: 500 })
  }
}
