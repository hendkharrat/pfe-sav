import {
  ClientEquipement,
  Contract,
  ContractStatut,
  Equipment,
  Intervention,
  PreventiveInterventionPreview,
  User,
} from '@/types';
import { mockClientEquipements } from '@/data/mock-client-equipements';
import { mockClients } from '@/data/mock-clients';
import { mockContracts } from '@/data/mock-contracts';
import { mockEquipments } from '@/data/mock-equipments';
import { mockInterventions } from '@/data/mock-interventions';
import { mockUsers } from '@/data/mock-users';

// ---------------------------------------------------------------------------
// Auth / role helpers
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Contract status
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// ClientEquipement helpers
// ---------------------------------------------------------------------------

/** Returns all ClientEquipement records assigned to a given client. */
export function getClientEquipements(
  clientId: string,
  clientEquipements: ClientEquipement[] = mockClientEquipements
): ClientEquipement[] {
  return clientEquipements.filter((ce) => ce.clientId === clientId);
}

/**
 * Resolves the Equipment catalog record for a given ClientEquipement id.
 * Returns undefined if either the CE or the equipment is not found.
 */
export function getEquipementForClientEquipement(
  clientEquipementId: string,
  clientEquipements: ClientEquipement[] = mockClientEquipements,
  equipments: Equipment[] = mockEquipments
): Equipment | undefined {
  const ce = clientEquipements.find((c) => c.id === clientEquipementId);
  if (!ce) return undefined;
  return equipments.find((e) => e.id === ce.equipementId);
}

/**
 * Finds the ClientEquipement join record by client + equipment pair.
 * Useful as a bridge when only the old (clientId, equipementId) pair is available.
 */
export function getClientEquipementByEquipmentAndClient(
  clientId: string,
  equipementId: string,
  clientEquipements: ClientEquipement[] = mockClientEquipements
): ClientEquipement | undefined {
  return clientEquipements.find(
    (ce) => ce.clientId === clientId && ce.equipementId === equipementId
  );
}

/**
 * Returns a human-readable French label for a ClientEquipement record.
 * Format: "EQ-001 — CoolMax 3000 — Bureau Étage 2"
 */
export function getClientEquipementLabel(
  clientEquipementId: string,
  clientEquipements: ClientEquipement[] = mockClientEquipements,
  equipments: Equipment[] = mockEquipments
): string {
  const ce = clientEquipements.find((c) => c.id === clientEquipementId);
  if (!ce) return 'Équipement inconnu';
  const eq = equipments.find((e) => e.id === ce.equipementId);
  if (!eq) return 'Équipement inconnu';
  return `${eq.reference} — ${eq.modele} — ${ce.localisation}`;
}

// ---------------------------------------------------------------------------
// Contract coverage helpers (new CE-based API)
// ---------------------------------------------------------------------------

/**
 * Finds an active contract that covers the given ClientEquipement for the client.
 */
export function findActiveContractForClientEquipement(
  clientEquipementId: string,
  clientId: string,
  contracts: Contract[] = mockContracts
): Contract | undefined {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return contracts.find((contract) => {
    if (contract.clientId !== clientId) return false;
    if (!contract.clientEquipementIds.includes(clientEquipementId)) return false;
    if (calculateContractStatus(contract) !== 'ACTIF') return false;
    const dateDebut = new Date(contract.dateDebut);
    dateDebut.setHours(0, 0, 0, 0);
    const dateFin = new Date(contract.dateFin);
    dateFin.setHours(0, 0, 0, 0);
    return dateDebut <= today && dateFin >= today;
  });
}

/** Returns true when an active contract covers the given CE/client pair. */
export function getContractCoverageForClientEquipement(
  clientEquipementId: string,
  clientId: string,
  contracts: Contract[] = mockContracts
): boolean {
  return (
    findActiveContractForClientEquipement(clientEquipementId, clientId, contracts) !== undefined
  );
}

// ---------------------------------------------------------------------------
// Legacy contract coverage wrappers (kept for backward compatibility)
// ---------------------------------------------------------------------------

/**
 * @deprecated Use findActiveContractForClientEquipement instead.
 * Resolves CE internally from clientId + equipementId, then delegates.
 */
export function findActiveContractForEquipment(
  equipmentId: string,
  clientId: string,
  contracts: Contract[] = mockContracts,
  clientEquipements: ClientEquipement[] = mockClientEquipements
): Contract | null {
  const ce = getClientEquipementByEquipmentAndClient(clientId, equipmentId, clientEquipements);
  if (!ce) return null;
  return findActiveContractForClientEquipement(ce.id, clientId, contracts) ?? null;
}

/**
 * @deprecated Use getContractCoverageForClientEquipement instead.
 */
export function getContractCoverage(
  equipmentId: string,
  clientId: string
): { couvertureContrat: boolean; contractId?: string } {
  const contract = findActiveContractForEquipment(equipmentId, clientId);
  if (!contract) return { couvertureContrat: false };
  return { couvertureContrat: true, contractId: contract.id };
}

// ---------------------------------------------------------------------------
// Preventive intervention planning
// ---------------------------------------------------------------------------

const PERIODICITE_MONTHS: Record<Contract['periodicite'], number> = {
  MENSUELLE: 1,
  TRIMESTRIELLE: 3,
  SEMESTRIELLE: 6,
  ANNUELLE: 12,
};

/**
 * Generates a flat list of PreventiveInterventionPreview rows based on
 * contract dates, periodicity, and selected ClientEquipement ids.
 *
 * One row is created per (date, CE) combination.
 * Returns [] if dateDebut/dateFin are invalid or dateFin < dateDebut.
 */
export function generatePreventiveInterventionPreviews(params: {
  contractId?: string;
  clientId: string;
  clientEquipementIds: string[];
  dateDebut: string;
  dateFin: string;
  periodicite: Contract['periodicite'];
  description?: string;
  clientEquipements?: ClientEquipement[];
}): PreventiveInterventionPreview[] {
  const {
    contractId,
    clientId,
    clientEquipementIds,
    dateDebut,
    dateFin,
    periodicite,
    description,
    clientEquipements = mockClientEquipements,
  } = params;

  const start = new Date(dateDebut + 'T12:00:00');
  const end = new Date(dateFin + 'T12:00:00');

  if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) {
    return [];
  }

  const intervalMonths = PERIODICITE_MONTHS[periodicite];
  const defaultDescription = 'Maintenance préventive planifiée dans le cadre du contrat';
  const rowDescription = description?.trim() || defaultDescription;
  const result: PreventiveInterventionPreview[] = [];

  for (const ceId of clientEquipementIds) {
    const ce = clientEquipements.find((c) => c.id === ceId);
    if (!ce) continue;

    let current = new Date(start);

    while (current <= end) {
      const dateStr = current.toISOString().split('T')[0];
      result.push({
        id: `preview-${ceId}-${dateStr}${contractId ? `-${contractId}` : ''}`,
        datePrevue: dateStr,
        clientEquipementId: ceId,
        equipementId: ce.equipementId,
        clientId,
        technicienId: undefined,
        description: rowDescription,
      });

      // Advance by interval without mutating `current` incorrectly across months
      const next = new Date(current);
      next.setMonth(next.getMonth() + intervalMonths);
      current = next;
    }
  }

  return result;
}

/**
 * Converts a PreventiveInterventionPreview into a full Intervention record
 * ready to be appended to local state after contract creation.
 */
export function preventivePreviewToIntervention(
  preview: PreventiveInterventionPreview,
  options: { contractId: string; index: number }
): Intervention {
  const { contractId, index } = options;
  const seq = String(index + 1).padStart(3, '0');
  return {
    id: `int-prev-${contractId}-${index + 1}`,
    reference: `INT-PREV-${contractId.toUpperCase()}-${seq}`,
    type: 'PREVENTIVE',
    clientId: preview.clientId,
    equipementId: preview.equipementId,
    clientEquipementId: preview.clientEquipementId,
    technicienId: preview.technicienId,
    contractId,
    datePrevue: preview.datePrevue,
    priorite: 'MOYENNE',
    statut: 'PLANIFIEE',
    couvertureContrat: true,
    description: preview.description,
  };
}

// ---------------------------------------------------------------------------
// Technician helpers
// ---------------------------------------------------------------------------

/**
 * Returns true when the technician has no conflicting assignments on the
 * given date, considering both existing interventions and in-progress previews.
 *
 * Signature is additive: previewRows and excludeInterventionId are optional
 * so existing 3-arg and 4-arg callers continue to work unchanged.
 */
export function isTechnicianAvailable(
  technicienId: string,
  datePrevue: string,
  interventions: Intervention[] = mockInterventions,
  excludeInterventionId?: string,
  previewRows: PreventiveInterventionPreview[] = []
): boolean {
  const conflictsInInterventions = interventions.some(
    (i) =>
      i.technicienId === technicienId &&
      i.datePrevue === datePrevue &&
      i.statut !== 'ANNULEE' &&
      i.id !== excludeInterventionId
  );
  if (conflictsInInterventions) return false;

  const conflictsInPreviews = previewRows.some(
    (p) =>
      p.technicienId !== undefined &&
      p.technicienId === technicienId &&
      p.datePrevue === datePrevue
  );
  return !conflictsInPreviews;
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

// ---------------------------------------------------------------------------
// Intervention reference generation
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Date utilities
// ---------------------------------------------------------------------------

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
