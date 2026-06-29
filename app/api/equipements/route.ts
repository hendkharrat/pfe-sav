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

export async function GET() {
  try {
    const equipements = await prisma.equipment.findMany({
      orderBy: { reference: 'asc' },
      include: { images: true },
    })
    return NextResponse.json(equipements.map(mapEquipment))
  } catch (e) {
    console.error('[GET /api/equipements]', e)
    return NextResponse.json({ error: 'Erreur interne du serveur.' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null)
    if (!body) return err('Corps de la requête invalide.', 400)

    const { reference, type, marque, modele, numeroSerie, description, images } =
      body as Record<string, unknown>

    if (typeof reference !== 'string' || !reference.trim())
      return err('La référence est obligatoire.', 400)
    if (typeof type !== 'string' || !['CLIMATISEUR', 'SYSTEME_SURPRESSION'].includes(type))
      return err('Le type est invalide.', 400)
    if (typeof marque !== 'string' || !marque.trim())
      return err('La marque est obligatoire.', 400)
    if (typeof modele !== 'string' || !modele.trim())
      return err('Le modèle est obligatoire.', 400)

    const existing = await prisma.equipment.findUnique({
      where: { reference: reference.trim() },
      select: { id: true },
    })
    if (existing) return err('Un équipement avec cette référence existe déjà.', 409)

    type ImageInput = { filename?: string; previewUrl?: string; isMain?: boolean }
    const imagesData: ImageInput[] = Array.isArray(images) ? (images as ImageInput[]) : []

    const created = await prisma.equipment.create({
      data: {
        reference: reference.trim(),
        type: type as 'CLIMATISEUR' | 'SYSTEME_SURPRESSION',
        marque: marque.trim(),
        modele: modele.trim(),
        numeroSerie: typeof numeroSerie === 'string' && numeroSerie.trim() ? numeroSerie.trim() : null,
        description: typeof description === 'string' && description.trim() ? description.trim() : null,
        images: imagesData.length > 0 ? {
          create: imagesData.map((img) => ({
            filename: img.filename ?? 'image',
            url: img.previewUrl ?? '',
            isMain: img.isMain ?? false,
          })),
        } : undefined,
      },
      include: { images: true },
    })

    return NextResponse.json(mapEquipment(created), { status: 201 })
  } catch (e) {
    console.error('[POST /api/equipements]', e)
    return NextResponse.json({ error: 'Erreur interne du serveur.' }, { status: 500 })
  }
}
