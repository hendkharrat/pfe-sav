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

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id: rawId } = await params
    const id = Number(rawId)
    if (!Number.isInteger(id) || id <= 0) return err('Identifiant invalide.', 400)
    const user = await prisma.user.findUnique({ where: { id } })
    if (!user) return err('Utilisateur introuvable.', 404)
    const { passwordHash: _ph, ...rest } = user
    return NextResponse.json(mapUser(rest))
  } catch (e) {
    console.error('[GET /api/users/[id]]', e)
    return NextResponse.json({ error: 'Erreur interne du serveur.' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id: rawId } = await params
    const id = Number(rawId)
    if (!Number.isInteger(id) || id <= 0) return err('Identifiant invalide.', 400)
    const user = await prisma.user.findUnique({ where: { id }, select: { id: true, email: true } })
    if (!user) return err('Utilisateur introuvable.', 404)

    const body = await req.json().catch(() => ({})) as Record<string, unknown>
    const updateData: Record<string, unknown> = {}

    if (typeof body.prenom === 'string' && body.prenom.trim())
      updateData.prenom = body.prenom.trim()
    if (typeof body.nom === 'string' && body.nom.trim())
      updateData.nom = body.nom.trim()
    if (typeof body.email === 'string' && body.email.trim()) {
      if (body.email.trim() !== user.email) {
        const conflict = await prisma.user.findUnique({
          where: { email: body.email.trim() },
          select: { id: true },
        })
        if (conflict) return err('Un utilisateur avec cet email existe déjà.', 409)
      }
      updateData.email = body.email.trim()
    }
    if (typeof body.telephone === 'string')
      updateData.telephone = body.telephone.trim() || null
    if (typeof body.role === 'string' && ROLE_MAP[body.role])
      updateData.role = ROLE_MAP[body.role]
    if (typeof body.actif === 'boolean')
      updateData.actif = body.actif
    if (typeof body.password === 'string' && body.password.trim())
      updateData.passwordHash = await bcrypt.hash(body.password.trim(), 10)

    const updated = await prisma.user.update({ where: { id }, data: updateData })
    const { passwordHash: _ph, ...rest } = updated
    return NextResponse.json(mapUser(rest))
  } catch (e) {
    console.error('[PATCH /api/users/[id]]', e)
    return NextResponse.json({ error: 'Erreur interne du serveur.' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { id: rawId } = await params
    const id = Number(rawId)
    if (!Number.isInteger(id) || id <= 0) return err('Identifiant invalide.', 400)
    const user = await prisma.user.findUnique({ where: { id }, select: { id: true } })
    if (!user) return err('Utilisateur introuvable.', 404)

    const updated = await prisma.user.update({
      where: { id },
      data: { actif: false },
    })
    const { passwordHash: _ph, ...rest } = updated
    return NextResponse.json(mapUser(rest))
  } catch (e) {
    console.error('[DELETE /api/users/[id]]', e)
    return NextResponse.json({ error: 'Erreur interne du serveur.' }, { status: 500 })
  }
}
