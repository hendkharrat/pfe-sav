import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

function err(message: string, status: number) {
  return NextResponse.json({ error: message }, { status })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null)
    if (!body || typeof body.identifier !== 'string' || typeof body.password !== 'string') {
      return err("L'identifiant et le mot de passe sont requis.", 400)
    }

    const { identifier, password } = body as { identifier: string; password: string }
    const id = identifier.trim()
    const pwd = password.trim()

    if (!id || !pwd) {
      return err("L'identifiant et le mot de passe sont requis.", 400)
    }

    // 1. Try internal users (admin / technician) by email or telephone
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: id },
          { telephone: id },
        ],
      },
    })

    if (user) {
      if (!user.actif) {
        return err('Ce compte utilisateur est désactivé. Contactez un administrateur.', 403)
      }
      const passwordOk = await bcrypt.compare(pwd, user.passwordHash)
      if (!passwordOk) {
        return err('Identifiant ou mot de passe incorrect.', 401)
      }
      return NextResponse.json({
        isAuthenticated: true,
        loginTime: new Date().toISOString(),
        role: user.role === 'ADMIN' ? 'admin' : 'technician',
        displayName: `${user.prenom} ${user.nom}`,
        email: user.email,
        telephone: user.telephone ?? undefined,
        userId: user.id,
      })
    }

    // 2. Try clients by email or telephone
    const client = await prisma.client.findFirst({
      where: {
        OR: [
          { email: id },
          { telephone: id },
        ],
      },
    })

    if (client) {
      const passwordOk = await bcrypt.compare(pwd, client.passwordHash)
      if (!passwordOk) {
        return err('Identifiant ou mot de passe incorrect.', 401)
      }
      const displayName =
        client.typeClient === 'PERSONNE_PHYSIQUE'
          ? `${client.prenom ?? ''} ${client.nom ?? ''}`.trim()
          : (client.societe ?? client.contact ?? client.email)
      return NextResponse.json({
        isAuthenticated: true,
        loginTime: new Date().toISOString(),
        role: 'client',
        displayName,
        email: client.email,
        telephone: client.telephone ?? undefined,
        clientId: client.id,
      })
    }

    // No match found
    return err('Identifiant ou mot de passe incorrect.', 401)
  } catch (e) {
    console.error('[POST /api/auth/login]', e)
    return err('Erreur interne du serveur.', 500)
  }
}
