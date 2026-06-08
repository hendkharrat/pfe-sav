import { UserRole } from '@/types';

export const ROLES = {
  ADMIN: 'admin' as UserRole,
  TECHNICIAN: 'technician' as UserRole,
  CLIENT: 'client' as UserRole,
};

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administrateur',
  technician: 'Technicien',
  client: 'Client',
};

export const INTERVENTION_TYPE_LABELS: Record<string, string> = {
  PREVENTIVE: 'Préventive',
  CURATIVE: 'Curative',
};

export const INTERVENTION_STATUS = {
  PLANIFIEE: 'PLANIFIEE',
  EN_COURS: 'EN_COURS',
  REALISEE: 'REALISEE',
  ANNULEE: 'ANNULEE',
};

export const INTERVENTION_STATUS_LABELS: Record<string, string> = {
  PLANIFIEE: 'Planifiée',
  EN_COURS: 'En cours',
  REALISEE: 'Réalisée',
  ANNULEE: 'Annulée',
};

export const CONTRACT_STATUS = {
  ACTIVE: 'ACTIF',
  EXPIRED: 'EXPIRE',
  COMING_SOON: 'BIENTOT_EXPIRE',
};

export const CONTRACT_STATUS_LABELS: Record<string, string> = {
  ACTIF: 'Actif',
  EXPIRE: 'Expiré',
  BIENTOT_EXPIRE: 'Bientôt expiré',
};

export const EQUIPMENT_TYPE_LABELS: Record<string, string> = {
  CLIMATISEUR: 'Climatiseur',
  SYSTEME_SURPRESSION: 'Système de surpression',
};

export const CONTRACT_FREQUENCY_LABELS: Record<string, string> = {
  MENSUELLE: 'Mensuelle',
  TRIMESTRIELLE: 'Trimestrielle',
  SEMESTRIELLE: 'Semestrielle',
  ANNUELLE: 'Annuelle',
};

export const INVOICE_STATUS_LABELS: Record<string, string> = {
  PAYEE: 'Payée',
  IMPAYEE: 'Impayée',
  EN_ATTENTE: 'En attente',
};

export const PANNE_STATUS = {
  EN_ATTENTE: 'EN_ATTENTE',
  PRISE_EN_CHARGE: 'PRISE_EN_CHARGE',
  CONVERTIE: 'CONVERTIE',
  ANNULEE: 'ANNULEE',
};

export const PANNE_STATUS_LABELS: Record<string, string> = {
  EN_ATTENTE: 'En attente',
  PRISE_EN_CHARGE: 'Prise en charge',
  CONVERTIE: 'Convertie',
  ANNULEE: 'Annulée',
};

export const TUNISIAN_CITIES = [
  'Tunis',
  'Ariana',
  'Ben Arous',
  'La Marsa',
  'Carthage',
  'Sidi Bou Said',
  'La Goulette',
  'Le Bardo',
  'Manouba',
  'Nabeul',
  'Hammamet',
  'Sousse',
  'Monastir',
  'Mahdia',
  'Sfax',
  'Gabès',
  'Médenine',
  'Djerba Midoun',
  'Houmt Souk',
  'Tataouine',
  'Kairouan',
  'Kasserine',
  'Sidi Bouzid',
  'Gafsa',
  'Tozeur',
  'Kébili',
  'Béja',
  'Jendouba',
  'Le Kef',
  'Siliana',
  'Bizerte',
  'Zaghouan',
] as const;

