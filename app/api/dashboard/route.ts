import { NextRequest, NextResponse } from 'next/server'
import { InterventionStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const role = searchParams.get('role') ?? 'admin'
    const userIdRaw = searchParams.get('userId')
    const clientIdRaw = searchParams.get('clientId')
    const userId = userIdRaw ? Number(userIdRaw) : undefined
    const clientId = clientIdRaw ? Number(clientIdRaw) : undefined

    const today = new Date(); today.setHours(0, 0, 0, 0)
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59)

    if (role === 'admin') {
      const [
        totalInterventions,
        pendingInterventions,
        completedInterventions,
        urgentInterventions,
        activeContracts,
        expiredContracts,
        totalClients,
        totalEquipment,
        monthlyRevenueAgg,
        overdueInvoices,
      ] = await Promise.all([
        prisma.intervention.count(),
        prisma.intervention.count({ where: { statut: InterventionStatus.PLANIFIEE } }),
        prisma.intervention.count({ where: { statut: InterventionStatus.REALISEE } }),
        prisma.intervention.count({ where: { statut: InterventionStatus.EN_COURS } }),
        prisma.contract.count({ where: { dateFin: { gte: today } } }),
        prisma.contract.count({ where: { dateFin: { lt: today } } }),
        prisma.client.count(),
        prisma.equipment.count(),
        prisma.facture.aggregate({
          where: {
            statut: 'PAYEE',
            dateEmission: { gte: monthStart, lte: monthEnd },
          },
          _sum: { montantTTC: true },
        }),
        prisma.facture.count({ where: { statut: 'IMPAYEE' } }),
      ])

      return NextResponse.json({
        totalInterventions,
        pendingInterventions,
        completedInterventions,
        urgentInterventions,
        activeContracts,
        expiredContracts,
        totalClients,
        totalEquipment,
        monthlyRevenue: monthlyRevenueAgg._sum.montantTTC ?? 0,
        overdueInvoices,
      })
    }

    if (role === 'technician' && userId && Number.isInteger(userId) && userId > 0) {
      const techWhere = { technicienId: userId }
      const [
        totalInterventions,
        pendingInterventions,
        completedInterventions,
        urgentInterventions,
        distinctClients,
      ] = await Promise.all([
        prisma.intervention.count({ where: techWhere }),
        prisma.intervention.count({ where: { ...techWhere, statut: InterventionStatus.PLANIFIEE } }),
        prisma.intervention.count({ where: { ...techWhere, statut: InterventionStatus.REALISEE } }),
        prisma.intervention.count({ where: { ...techWhere, statut: InterventionStatus.EN_COURS } }),
        prisma.intervention.findMany({
          where: techWhere,
          select: { clientId: true },
          distinct: ['clientId'],
        }),
      ])

      return NextResponse.json({
        totalInterventions,
        pendingInterventions,
        completedInterventions,
        urgentInterventions,
        activeContracts: 0,
        expiredContracts: 0,
        totalClients: distinctClients.length,
        totalEquipment: 0,
        monthlyRevenue: 0,
        overdueInvoices: 0,
      })
    }

    if (role === 'client' && clientId && Number.isInteger(clientId) && clientId > 0) {
      const clientWhere = { clientId }
      const [
        totalInterventions,
        pendingInterventions,
        completedInterventions,
        urgentInterventions,
        activeContracts,
        expiredContracts,
        totalEquipment,
        overdueInvoices,
      ] = await Promise.all([
        prisma.intervention.count({ where: clientWhere }),
        prisma.intervention.count({ where: { ...clientWhere, statut: InterventionStatus.PLANIFIEE } }),
        prisma.intervention.count({ where: { ...clientWhere, statut: InterventionStatus.REALISEE } }),
        prisma.intervention.count({ where: { ...clientWhere, statut: InterventionStatus.EN_COURS } }),
        prisma.contract.count({ where: { clientId, dateFin: { gte: today } } }),
        prisma.contract.count({ where: { clientId, dateFin: { lt: today } } }),
        prisma.clientEquipement.count({ where: { clientId } }),
        prisma.facture.count({ where: { clientId, statut: 'IMPAYEE' } }),
      ])

      return NextResponse.json({
        totalInterventions,
        pendingInterventions,
        completedInterventions,
        urgentInterventions,
        activeContracts,
        expiredContracts,
        totalClients: 1,
        totalEquipment,
        monthlyRevenue: 0,
        overdueInvoices,
      })
    }

    return NextResponse.json({ error: "Paramètres de rôle invalides ou manquants." }, { status: 400 })
  } catch (e) {
    console.error('[GET /api/dashboard]', e)
    return NextResponse.json({ error: 'Erreur interne du serveur.' }, { status: 500 })
  }
}
