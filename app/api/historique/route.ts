import { NextRequest, NextResponse } from 'next/server'
import { InterventionStatus, InterventionType } from '@prisma/client'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const role = searchParams.get('role') ?? 'admin'
    const userIdRaw = searchParams.get('userId')
    const clientIdRaw = searchParams.get('clientId')
    const userId = userIdRaw ? Number(userIdRaw) : undefined
    const clientId = clientIdRaw ? Number(clientIdRaw) : undefined

    const type = searchParams.get('type')
    const statut = searchParams.get('statut')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    const technicienIdRaw = searchParams.get('technicienId')
    const filterClientIdRaw = searchParams.get('clientId')
    const technicienId = technicienIdRaw ? Number(technicienIdRaw) : undefined
    const filterClientId = filterClientIdRaw ? Number(filterClientIdRaw) : undefined

    const where: Record<string, unknown> = {
      statut: { in: [InterventionStatus.REALISEE, InterventionStatus.ANNULEE] },
    }

    if (role === 'technician' && userId && Number.isInteger(userId) && userId > 0) {
      where.technicienId = userId
    } else if (role === 'client' && clientId && Number.isInteger(clientId) && clientId > 0) {
      where.clientId = clientId
    }

    const validTypes = ['PREVENTIVE', 'CURATIVE']
    if (type && validTypes.includes(type)) where.type = type as InterventionType

    const validStatuts = ['REALISEE', 'ANNULEE']
    if (statut && validStatuts.includes(statut)) where.statut = statut as InterventionStatus

    if (dateFrom || dateTo) {
      const datePrevue: Record<string, Date> = {}
      if (dateFrom) datePrevue.gte = new Date(dateFrom + 'T00:00:00')
      if (dateTo) datePrevue.lte = new Date(dateTo + 'T23:59:59')
      where.datePrevue = datePrevue
    }

    if (role === 'admin') {
      if (technicienId && Number.isInteger(technicienId) && technicienId > 0)
        where.technicienId = technicienId
      if (filterClientId && Number.isInteger(filterClientId) && filterClientId > 0)
        where.clientId = filterClientId
    }

    const interventions = await prisma.intervention.findMany({
      where,
      orderBy: { datePrevue: 'desc' },
      include: {
        client: {
          select: {
            id: true, typeClient: true, societe: true, contact: true,
            prenom: true, nom: true, email: true,
          },
        },
        technicien: {
          select: { id: true, prenom: true, nom: true, email: true },
        },
        clientEquipement: {
          include: {
            equipement: {
              select: {
                id: true, reference: true, type: true, marque: true, modele: true,
              },
            },
          },
        },
        contract: {
          select: { id: true, reference: true, periodicite: true },
        },
        facture: {
          select: { id: true, numero: true, statut: true, montantTTC: true, dateEmission: true },
        },
      },
    })

    const result = interventions.map((i) => ({
      id: i.id,
      reference: i.reference,
      type: i.type,
      statut: i.statut,
      clientId: i.clientId,
      equipementId: i.clientEquipement?.equipementId ?? 0,
      clientEquipementId: i.clientEquipementId ?? undefined,
      technicienId: i.technicienId ?? undefined,
      contractId: i.contractId ?? undefined,
      datePrevue: i.datePrevue.toISOString().split('T')[0],
      dateRealisation: i.dateRealisation ? i.dateRealisation.toISOString().split('T')[0] : undefined,
      couvertureContrat: i.couvertureContrat,
      description: i.description,
      diagnostic: i.diagnostic ?? undefined,
      actionsRealisees: i.actionsRealisees ?? undefined,
      materielUtilise: i.materielUtilise ?? undefined,
      dureeMinutes: i.dureeMinutes ?? undefined,
      observations: i.observations ?? undefined,
      client: i.client,
      technicien: i.technicien ?? undefined,
      clientEquipement: i.clientEquipement
        ? {
            id: i.clientEquipement.id,
            localisation: i.clientEquipement.localisation ?? undefined,
            equipement: i.clientEquipement.equipement,
          }
        : undefined,
      contract: i.contract ?? undefined,
      facture: i.facture
        ? {
            id: i.facture.id,
            numero: i.facture.numero,
            statut: i.facture.statut,
            montantTTC: i.facture.montantTTC,
            dateEmission: i.facture.dateEmission.toISOString().split('T')[0],
          }
        : undefined,
    }))

    return NextResponse.json(result)
  } catch (e) {
    console.error('[GET /api/historique]', e)
    return NextResponse.json({ error: 'Erreur interne du serveur.' }, { status: 500 })
  }
}
