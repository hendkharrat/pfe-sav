import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function err(msg: string, status: number) {
  return NextResponse.json({ error: msg }, { status })
}

function mapEquipment(eq: {
  id: number; reference: string; type: string; marque: string; modele: string;
  numeroSerie: string | null; description: string | null;
  images: { id: number; filename: string; url: string; isMain: boolean }[];
}) {
  return {
    id: eq.id,
    reference: eq.reference,
    type: eq.type,
    marque: eq.marque,
    modele: eq.modele,
    numeroSerie: eq.numeroSerie ?? '',
    description: eq.description ?? undefined,
    images: eq.images.map((img) => ({
      id: img.id,
      filename: img.filename,
      previewUrl: img.url,
      isMain: img.isMain,
    })),
  }
}

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id: rawId } = await params
    const id = Number(rawId)
    if (!Number.isInteger(id) || id <= 0) return err('Identifiant invalide.', 400)
    const eq = await prisma.equipment.findUnique({ where: { id }, include: { images: true } })
    if (!eq) return err('Équipement introuvable.', 404)
    return NextResponse.json(mapEquipment(eq))
  } catch (e) {
    console.error('[GET /api/equipements/[id]]', e)
    return NextResponse.json({ error: 'Erreur interne du serveur.' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id: rawId } = await params
    const id = Number(rawId)
    if (!Number.isInteger(id) || id <= 0) return err('Identifiant invalide.', 400)
    const eq = await prisma.equipment.findUnique({ where: { id }, select: { id: true } })
    if (!eq) return err('Équipement introuvable.', 404)

    const body = await req.json().catch(() => ({})) as Record<string, unknown>
    const updateData: Record<string, unknown> = {}

    if (typeof body.reference === 'string' && body.reference.trim()) {
      const conflict = await prisma.equipment.findFirst({
        where: { reference: body.reference.trim(), NOT: { id } },
        select: { id: true },
      })
      if (conflict) return err('Un équipement avec cette référence existe déjà.', 409)
      updateData.reference = body.reference.trim()
    }
    if (typeof body.type === 'string' && ['CLIMATISEUR', 'SYSTEME_SURPRESSION'].includes(body.type))
      updateData.type = body.type
    if (typeof body.marque === 'string' && body.marque.trim())
      updateData.marque = body.marque.trim()
    if (typeof body.modele === 'string' && body.modele.trim())
      updateData.modele = body.modele.trim()
    if (typeof body.numeroSerie === 'string')
      updateData.numeroSerie = body.numeroSerie.trim() || null
    if ('description' in body)
      updateData.description =
        typeof body.description === 'string' && body.description.trim()
          ? body.description.trim()
          : null

    if (Array.isArray(body.images)) {
      type ImageInput = { filename?: string; previewUrl?: string; isMain?: boolean }
      const imagesData = body.images as ImageInput[]
      await prisma.equipmentImage.deleteMany({ where: { equipmentId: id } })
      if (imagesData.length > 0) {
        await prisma.equipmentImage.createMany({
          data: imagesData.map((img) => ({
            equipmentId: id,
            filename: img.filename ?? 'image',
            url: img.previewUrl ?? '',
            isMain: img.isMain ?? false,
          })),
        })
      }
    }

    const updated = await prisma.equipment.update({
      where: { id },
      data: updateData,
      include: { images: true },
    })
    return NextResponse.json(mapEquipment(updated))
  } catch (e) {
    console.error('[PATCH /api/equipements/[id]]', e)
    return NextResponse.json({ error: 'Erreur interne du serveur.' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { id: rawId } = await params
    const id = Number(rawId)
    if (!Number.isInteger(id) || id <= 0) return err('Identifiant invalide.', 400)
    const eq = await prisma.equipment.findUnique({
      where: { id },
      include: { _count: { select: { clientEquipements: true } } },
    })
    if (!eq) return err('Équipement introuvable.', 404)

    if (eq._count.clientEquipements > 0) {
      return err(
        'Impossible de supprimer cet équipement car il est affecté à des clients.',
        409
      )
    }

    await prisma.equipment.delete({ where: { id } })
    return new NextResponse(null, { status: 204 })
  } catch (e) {
    console.error('[DELETE /api/equipements/[id]]', e)
    return NextResponse.json({ error: 'Erreur interne du serveur.' }, { status: 500 })
  }
}
