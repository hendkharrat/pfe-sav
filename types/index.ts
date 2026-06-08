// Auth & Users
export type UserRole = 'admin' | 'technician' | 'client';

export type ClientType = 'SOCIETE' | 'PERSONNE_PHYSIQUE';

export type InterventionType = 'PREVENTIVE' | 'CURATIVE';
export type InterventionStatut = 'PLANIFIEE' | 'EN_COURS' | 'REALISEE' | 'ANNULEE';
export type InterventionPriorite = 'FAIBLE' | 'MOYENNE' | 'ELEVEE' | 'URGENTE';
export type ContractStatut = 'ACTIF' | 'EXPIRE' | 'BIENTOT_EXPIRE';
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
  typeClient: ClientType;
  /** Company name — required when typeClient === 'SOCIETE'. */
  societe?: string;
  /** Primary contact person — used for SOCIETE only. */
  contact?: string;
  /** First name — required when typeClient === 'PERSONNE_PHYSIQUE'. */
  prenom?: string;
  /** Last name — required when typeClient === 'PERSONNE_PHYSIQUE'. */
  nom?: string;
  email: string;
  telephone: string;
  adresse: string;
  ville: string;
  dateCreation: string;
  nombreEquipements: number;
  userId: string;
}

// --- Equipment ---

export interface EquipmentImage {
  id: string;
  filename: string;
  previewUrl?: string;
  isMain: boolean;
}

/** Generic equipment catalog record — not tied to a specific client installation. */
export interface Equipment {
  id: string;
  reference: string;
  type: EquipmentType;
  marque: string;
  modele: string;
  numeroSerie: string;
  description?: string;
  images?: EquipmentImage[];
}

/** Join record linking an Equipment model to a specific Client installation. */
export interface ClientEquipement {
  id: string;
  clientId: string;
  equipementId: string;
  localisation: string;
  dateInstallation: string;
  notes?: string;
}

// --- Contract ---

export interface Contract {
  id: string;
  reference: string;
  clientId: string;
  dateDebut: string;
  dateFin: string;
  periodicite: 'MENSUELLE' | 'TRIMESTRIELLE' | 'SEMESTRIELLE' | 'ANNUELLE';
  statut: ContractStatut;
  /** IDs of ClientEquipement records covered by this contract. */
  clientEquipementIds: string[];
  /** @deprecated Use clientEquipementIds instead. */
  equipementIds?: string[];
  description?: string;
}

// --- Intervention ---

export interface Intervention {
  id: string;
  reference: string;
  type: InterventionType;
  clientId: string;
  equipementId: string;
  /** Reference to the ClientEquipement join record (optional for backwards compatibility). */
  clientEquipementId?: string;
  technicienId?: string;
  contractId?: string;
  datePrevue: string;
  dateRealisation?: string;
  statut: InterventionStatut;
  couvertureContrat: boolean;
  description: string;
  diagnostic?: string;
  actionsRealisees?: string;
  materielUtilise?: string;
  dureeMinutes?: number;
  observations?: string;
}

/** Ephemeral preview row used during contract creation before saving. */
export interface PreventiveInterventionPreview {
  id: string;
  datePrevue: string;
  clientEquipementId: string;
  equipementId: string;
  clientId: string;
  technicienId?: string;
  description: string;
}

// --- Factures ---

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

// --- Pannes ---

export interface PieceJointe {
  id: string;
  filename: string;
  size: number;
  type: string;
  previewUrl?: string;
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
  /** Reference to the ClientEquipement join record for richer location resolution. */
  clientEquipementId?: string;
  dateDeclaration: string;
  description: string;
  priorite: InterventionPriorite;
  statut: PanneStatut;
  interventionId?: string;
  /** @deprecated Use piecesJointes instead. */
  pieceJointeNom?: string;
  piecesJointes?: PieceJointe[];
}

// --- Dashboard ---

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

// --- Session ---

export interface AuthSession {
  user: User;
  isAuthenticated: boolean;
  loginTime: string;
}
