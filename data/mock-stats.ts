import { DashboardStats } from '@/types';

export const mockAdminStats: DashboardStats = {
  totalInterventions: 127,
  pendingInterventions: 8,
  completedInterventions: 112,
  urgentInterventions: 2,
  activeContracts: 5,
  expiredContracts: 2,
  totalClients: 18,
  totalEquipment: 34,
  monthlyRevenue: 12500,
  overdueInvoices: 1,
};

export const mockTechnicianStats: DashboardStats = {
  totalInterventions: 34,
  pendingInterventions: 3,
  completedInterventions: 28,
  urgentInterventions: 1,
  activeContracts: 0,
  expiredContracts: 0,
  totalClients: 12,
  totalEquipment: 0,
  monthlyRevenue: 0,
  overdueInvoices: 0,
};

export const mockClientStats: DashboardStats = {
  totalInterventions: 4,
  pendingInterventions: 2,
  completedInterventions: 2,
  urgentInterventions: 1,
  activeContracts: 2,
  expiredContracts: 1,
  totalClients: 1,
  totalEquipment: 2,
  monthlyRevenue: 0,
  overdueInvoices: 0,
};
