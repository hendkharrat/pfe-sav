// Auth & Users
export type UserRole = 'admin' | 'technician' | 'client';

export type InterventionType = 'PREVENTIVE' | 'CURATIVE';
export type InterventionStatut = 'PLANIFIEE' | 'EN_COURS' | 'REALISEE' | 'ANNULEE';
export type InterventionPriorite = 'FAIBLE' | 'MOYENNE' | 'ELEVEE' | 'URGENTE';
export type ContractStatut = 'ACTIF' | 'EXPIRE' | 'BIENTOT_EXPIRE';
export type EquipmentStatut = 'EN_SERVICE' | 'EN_PANNE' | 'HORS_SERVICE';
export type EquipmentType = 'CLIMATISEUR' | 'SYSTEME_SURPRESSION';
export type InvoiceStatut = 'PAYEE' | 'IMPAYEE' | 'EN_ATTENTE';

export interface User {
  id: string;
  prenom: string;
  nom: string;
  email: string;
  role: UserRole;
  actif: boolean;
  dateCreation: string;
}

export interface Client {
  id: string;
  societe: string;
  contact: string;
  email: string;
  telephone: string;
  adresse: string;
  ville: string;
  codePostal: string;
  dateCreation: string;
  nombreEquipements: number;
  userId: string;
}

export interface Equipment {
  id: string;
  reference: string;
  type: EquipmentType;
  marque: string;
  modele: string;
  numeroSerie: string;
  clientId: string;
  localisation: string;
  dateInstallation: string;
  statut: EquipmentStatut;
}

export interface Contract {
  id: string;
  reference: string;
  clientId: string;
  dateDebut: string;
  dateFin: string;
  periodicite: 'MENSUELLE' | 'TRIMESTRIELLE' | 'SEMESTRIELLE' | 'ANNUELLE';
  statut: ContractStatut;
  equipementIds: string[];
  description?: string;
}

export interface Intervention {
  id: string;
  reference: string;
  type: InterventionType;
  clientId: string;
  equipementId: string;
  technicienId?: string;
  contractId?: string;
  datePrevue: string;
  dateRealisation?: string;
  priorite: InterventionPriorite;
  statut: InterventionStatut;
  couvertureContrat: boolean;
  description: string;
  diagnostic?: string;
  actionsRealisees?: string;
  materielUtilise?: string;
  dureeMinutes?: number;
  observations?: string;
}

export interface LigneFacture {
  description: string;
  quantite: number;
  prixUnitaire: number;
  montant: number;
}

export interface Invoice {
  id: string;
  numero: string;
  clientId: string;
  interventionId?: string;
  dateEmission: string;
  montantHT: number;
  tva: number;
  montantTTC: number;
  statut: InvoiceStatut;
  lignes: LigneFacture[];
}

// Dashboard Stats
export interface DashboardStats {
  totalInterventions: number;
  pendingInterventions: number;
  completedInterventions: number;
  urgentInterventions: number;
  activeContracts: number;
  expiredContracts: number;
  totalClients: number;
  totalEquipment: number;
  monthlyRevenue: number;
  overdueInvoices: number;
}

// Session
export interface AuthSession {
  user: User;
  isAuthenticated: boolean;
  loginTime: string;
}

export type PanneStatut =
  | 'EN_ATTENTE'
  | 'PRISE_EN_CHARGE'
  | 'CONVERTIE'
  | 'ANNULEE';

export interface Panne {
  id: string;
  reference: string;
  clientId: string;
  equipementId: string;
  dateDeclaration: string;
  description: string;
  priorite: InterventionPriorite;
  statut: PanneStatut;
  interventionId?: string;
  pieceJointeNom?: string;
}

