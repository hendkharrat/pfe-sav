import { Contract, ContractStatut, Intervention, User } from '@/types';
import { mockClients } from '@/data/mock-clients';
import { mockContracts } from '@/data/mock-contracts';
import { mockUsers } from '@/data/mock-users';

const CLIENT_USER_TO_CLIENT_ID: Record<string, string> = {
  'user-client-1': 'client-3',
};

export function getClientIdForUser(user: User): string | null {
  if (user.role !== 'client') return null;
  const mapped = CLIENT_USER_TO_CLIENT_ID[user.id];
  if (mapped) return mapped;
  const byEmail = mockClients.find(
    (c) => c.email.toLowerCase() === user.email.toLowerCase()
  );
  return byEmail?.id ?? null;
}

export function filterInterventionsByRole(
  interventions: Intervention[],
  user: User
): Intervention[] {
  if (user.role === 'admin') return interventions;
  if (user.role === 'technician') {
    return interventions.filter((i) => i.technicienId === user.id);
  }
  const clientId = getClientIdForUser(user);
  if (!clientId) return [];
  return interventions.filter((i) => i.clientId === clientId);
}

export function calculateContractStatus(contract: Contract): ContractStatut {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dateFin = new Date(contract.dateFin);
  dateFin.setHours(0, 0, 0, 0);
  const thirtyDaysFromNow = new Date(today);
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

  if (dateFin < today) return 'EXPIRE';
  if (dateFin < thirtyDaysFromNow) return 'BIENTOT_EXPIRE';
  return 'ACTIF';
}

export function findActiveContractForEquipment(
  equipmentId: string,
  clientId: string
): Contract | null {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const match = mockContracts.find((contract) => {
    if (contract.clientId !== clientId) return false;
    if (!contract.equipementIds.includes(equipmentId)) return false;
    if (calculateContractStatus(contract) !== 'ACTIF') return false;
    const dateDebut = new Date(contract.dateDebut);
    dateDebut.setHours(0, 0, 0, 0);
    const dateFin = new Date(contract.dateFin);
    dateFin.setHours(0, 0, 0, 0);
    return dateDebut <= today && dateFin >= today;
  });

  return match ?? null;
}

export function getContractCoverage(equipmentId: string, clientId: string): {
  couvertureContrat: boolean;
  contractId?: string;
} {
  const contract = findActiveContractForEquipment(equipmentId, clientId);
  if (!contract) {
    return { couvertureContrat: false };
  }
  return { couvertureContrat: true, contractId: contract.id };
}

export function isTechnicianAvailable(
  technicienId: string,
  datePrevue: string,
  interventions: Intervention[],
  excludeInterventionId?: string
): boolean {
  return !interventions.some(
    (intervention) =>
      intervention.technicienId === technicienId &&
      intervention.datePrevue === datePrevue &&
      intervention.statut !== 'ANNULEE' &&
      intervention.id !== excludeInterventionId
  );
}

export const TECHNICIAN_UNAVAILABLE_MESSAGE =
  'Ce technicien est déjà affecté à une intervention à cette date.';

export function getTechnicianName(technicienId?: string): string {
  if (!technicienId) return 'Non affecté';
  const tech = mockUsers.find((u) => u.id === technicienId);
  if (!tech) return 'N/A';
  return `${tech.prenom} ${tech.nom}`;
}

export function getActiveTechnicians() {
  return mockUsers.filter((u) => u.role === 'technician' && u.actif);
}

export function generateInterventionReference(existing: Intervention[]): string {
  const year = new Date().getFullYear();
  const prefix = `INT-${year}-`;
  const numbers = existing
    .map((i) => {
      const match = i.reference.match(new RegExp(`^INT-${year}-(\\d+)$`));
      return match ? parseInt(match[1], 10) : 0;
    })
    .filter((n) => n > 0);
  const next = numbers.length > 0 ? Math.max(...numbers) + 1 : 1;
  return `${prefix}${String(next).padStart(3, '0')}`;
}

export function formatDateFr(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00');
  return date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function getWeekStart(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function toDateInputValue(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function isDateInRange(
  dateStr: string,
  start?: string,
  end?: string
): boolean {
  if (!start && !end) return true;
  const date = new Date(dateStr + 'T12:00:00');
  if (start) {
    const startDate = new Date(start + 'T12:00:00');
    if (date < startDate) return false;
  }
  if (end) {
    const endDate = new Date(end + 'T12:00:00');
    if (date > endDate) return false;
  }
  return true;
}

export function startOfMonth(date: Date): Date {
  const d = new Date(date);
  d.setDate(1);
  d.setHours(12, 0, 0, 0);
  return d;
}

export function endOfMonth(date: Date): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + 1, 0);
  d.setHours(12, 0, 0, 0);
  return d;
}

export function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

export function getMonthGridDays(date: Date): (Date | null)[] {
  const first = startOfMonth(date);
  const last = endOfMonth(date);
  // JS getDay: 0=Sunday … 6=Saturday; we want Mon=0 as column offset
  const jsDay = first.getDay();
  const leadingCount = jsDay === 0 ? 6 : jsDay - 1;
  const result: (Date | null)[] = Array.from({ length: leadingCount }, () => null);
  const current = new Date(first);
  while (current <= last) {
    result.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return result;
}

export function formatMonthYearFr(date: Date): string {
  return date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
}
