import {
  PrismaClient,
  UserRole,
  ClientType,
  EquipmentType,
  ContractStatus,
  Periodicite,
  InterventionType,
  InterventionStatus,
  PanneStatus,
  FactureStatus,
} from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding SAV Manager database...')

  // --- Cleanup in reverse dependency order ---
  await prisma.ligneFacture.deleteMany()
  await prisma.facture.deleteMany()
  await prisma.pieceJointe.deleteMany()
  await prisma.panne.deleteMany()
  await prisma.intervention.deleteMany()
  await prisma.contractEquipement.deleteMany()
  await prisma.contract.deleteMany()
  await prisma.clientEquipement.deleteMany()
  await prisma.equipmentImage.deleteMany()
  await prisma.equipment.deleteMany()
  await prisma.client.deleteMany()
  await prisma.user.deleteMany()
  console.log('  Cleaned existing data')

  // --- Pre-compute password hashes in parallel ---
  const [h_admin, h_tech, h_demo] = await Promise.all([
    bcrypt.hash('admin123', 10),
    bcrypt.hash('tech123', 10),
    bcrypt.hash('demo123', 10),
  ])
  console.log('  Password hashes computed')

  // --- 1. Users (1 admin + 3 technicians) ---
  await prisma.user.createMany({
    data: [
      {
        id: 1,
        prenom: 'Sami', nom: 'Meftah',
        email: 'admin@sav.com', telephone: '71100200',
        passwordHash: h_admin, role: UserRole.ADMIN,
        actif: true, dateCreation: new Date('2024-01-15T12:00:00'),
      },
      {
        id: 2,
        prenom: 'Mohamed', nom: 'Trabelsi',
        email: 'tech@sav.com', telephone: '98200300',
        passwordHash: h_tech, role: UserRole.TECHNICIAN,
        actif: true, dateCreation: new Date('2024-02-20T12:00:00'),
      },
      {
        id: 3,
        prenom: 'Walid', nom: 'Jlassi',
        email: 'tech2@sav.com', telephone: '98200301',
        passwordHash: h_tech, role: UserRole.TECHNICIAN,
        actif: true, dateCreation: new Date('2024-02-25T12:00:00'),
      },
      {
        id: 4,
        prenom: 'Ahmed', nom: 'Miled',
        email: 'tech3@sav.com', telephone: '98200302',
        passwordHash: h_tech, role: UserRole.TECHNICIAN,
        actif: true, dateCreation: new Date('2024-04-10T12:00:00'),
      },
    ],
  })
  console.log('  Users seeded (4)')

  // --- 2. Clients ---
  await prisma.client.createMany({
    data: [
      {
        id: 1,
        typeClient: ClientType.SOCIETE,
        societe: 'EDI Solutions Démo', contact: 'Amine Elleuch',
        email: 'contact@edi-demo.tn', telephone: '71345678',
        passwordHash: h_demo,
        adresse: 'Route de Tunis km 3', ville: 'Sfax',
        dateCreation: new Date('2024-01-10T12:00:00'),
      },
      {
        id: 2,
        typeClient: ClientType.SOCIETE,
        societe: 'Clinique El Amel', contact: 'Responsable Maintenance',
        email: 'contact@clinique-demo.tn', telephone: '71345679',
        passwordHash: h_demo,
        adresse: 'Avenue Habib Bourguiba', ville: 'Tunis',
        dateCreation: new Date('2024-01-20T12:00:00'),
      },
      {
        id: 3,
        typeClient: ClientType.PERSONNE_PHYSIQUE,
        prenom: 'Sara', nom: 'Mejri',
        email: 'sara.mejri@demo.tn', telephone: '55667788',
        passwordHash: h_demo,
        adresse: '15 Rue des Oliviers', ville: 'Sfax',
        dateCreation: new Date('2024-02-05T12:00:00'),
      },
    ],
  })
  console.log('  Clients seeded (3)')

  // --- 3. Equipment (global catalog) ---
  await prisma.equipment.createMany({
    data: [
      { id: 1, reference: 'EQ-001', type: EquipmentType.CLIMATISEUR,        marque: 'Daikin',     modele: 'FTXC35B',  numeroSerie: 'DAI-DEMO-001', description: 'Équipement A sous contrat pour EDI Solutions Démo' },
      { id: 2, reference: 'EQ-002', type: EquipmentType.SYSTEME_SURPRESSION, marque: 'Grundfos',   modele: 'CM3-5',    numeroSerie: 'GRU-DEMO-001', description: 'Équipement B sous contrat pour EDI Solutions Démo' },
      { id: 3, reference: 'EQ-003', type: EquipmentType.SYSTEME_SURPRESSION, marque: 'Wilo',       modele: 'Stratos',  numeroSerie: 'WIL-DEMO-001', description: 'Équipement C hors contrat pour panne/facture' },
      { id: 4, reference: 'EQ-004', type: EquipmentType.CLIMATISEUR,        marque: 'Mitsubishi', modele: 'MSZ-LN35', numeroSerie: 'MIT-DEMO-001', description: 'Équipement de Clinique El Amel' },
      { id: 5, reference: 'EQ-005', type: EquipmentType.CLIMATISEUR,        marque: 'Samsung',    modele: 'AR12',     numeroSerie: 'SAM-DEMO-001', description: 'Équipement de Sara Mejri' },
    ],
  })
  console.log('  Equipment seeded (5)')

  // --- 4. ClientEquipements (installations) ---
  await prisma.clientEquipement.createMany({
    data: [
      { id: 1, clientId: 1, equipementId: 1, dateAchat: new Date('2024-05-20T12:00:00'), localisation: 'Bureaux étage 1',    dateInstallation: new Date('2024-06-01T12:00:00') },
      { id: 2, clientId: 1, equipementId: 2, dateAchat: new Date('2024-07-10T12:00:00'), localisation: 'Chaufferie',          dateInstallation: new Date('2024-07-20T12:00:00') },
      { id: 3, clientId: 1, equipementId: 3, dateAchat: new Date('2024-09-01T12:00:00'), localisation: 'Local technique RDC', dateInstallation: new Date('2024-09-15T12:00:00') },
      { id: 4, clientId: 2, equipementId: 4, dateAchat: new Date('2025-01-10T12:00:00'), localisation: 'Bloc consultation',   dateInstallation: new Date('2025-01-20T12:00:00') },
      { id: 5, clientId: 3, equipementId: 5, dateAchat: new Date('2025-03-01T12:00:00'), localisation: 'Salon',               dateInstallation: new Date('2025-03-10T12:00:00') },
    ],
  })
  console.log('  ClientEquipements seeded (5)')

  // --- 5. Contracts ---
  // CTR-001: ACTIF — main demo contract (CE-1 and CE-2 covered; CE-3 deliberately excluded)
  // CTR-002: BIENTOT_EXPIRE — for status filter demo
  // CTR-003: EXPIRE — for status filter demo
  await prisma.contract.createMany({
    data: [
      {
        id: 1, reference: 'CTR-001', clientId: 1,
        dateDebut: new Date('2026-07-02T12:00:00'), dateFin: new Date('2026-12-31T12:00:00'),
        periodicite: Periodicite.TRIMESTRIELLE, statut: ContractStatus.ACTIF,
        description: 'Contrat de maintenance trimestrielle couvrant deux installations EDI Solutions Démo.',
      },
      {
        id: 2, reference: 'CTR-002', clientId: 1,
        dateDebut: new Date('2026-04-02T12:00:00'), dateFin: new Date('2026-07-20T12:00:00'),
        periodicite: Periodicite.TRIMESTRIELLE, statut: ContractStatus.BIENTOT_EXPIRE,
        description: 'Contrat bientôt expiré utilisé pour démontrer le filtre des statuts.',
      },
      {
        id: 3, reference: 'CTR-003', clientId: 2,
        dateDebut: new Date('2025-07-02T12:00:00'), dateFin: new Date('2026-06-30T12:00:00'),
        periodicite: Periodicite.TRIMESTRIELLE, statut: ContractStatus.EXPIRE,
        description: 'Ancien contrat expiré utilisé pour démontrer le filtre des statuts.',
      },
    ],
  })
  console.log('  Contracts seeded (3) — CTR-001 ACTIF, CTR-002 BIENTOT_EXPIRE, CTR-003 EXPIRE')

  await prisma.contractEquipement.createMany({
    data: [
      { contractId: 1, clientEquipementId: 1 },
      { contractId: 1, clientEquipementId: 2 },
      { contractId: 2, clientEquipementId: 1 },
      { contractId: 3, clientEquipementId: 4 },
    ],
  })
  console.log('  ContractEquipements seeded (4) — CE-3 not covered by any contract')

  // --- 6. Interventions ---
  // INT-2026-001/002: preventive, one per covered CE; techniciens assigned at seed time
  //   (UI collects technician per row but the contract POST API drops technicienId —
  //    seeded directly here as the workaround)
  // INT-2026-003: backup curative — REALISEE, couvertureContrat=false, NO facture
  //   → guaranteed eligible in GenerateInvoiceDialog; first live-generated facture → FAC-2026-001
  // Converting PAN-2026-001 live creates INT-2026-004 (next available reference)
  // Technician 1 (id=2) is unavailable on 2026-07-02 because of INT-2026-001
  await prisma.intervention.createMany({
    data: [
      {
        id: 1, reference: 'INT-2026-001', type: InterventionType.PREVENTIVE,
        clientId: 1, clientEquipementId: 1, contractId: 1, technicienId: 2,
        datePrevue: new Date('2026-07-02T12:00:00'),
        statut: InterventionStatus.PLANIFIEE, couvertureContrat: true,
        description: 'Maintenance préventive trimestrielle — Daikin FTXC35B',
      },
      {
        id: 2, reference: 'INT-2026-002', type: InterventionType.PREVENTIVE,
        clientId: 1, clientEquipementId: 2, contractId: 1, technicienId: 3,
        datePrevue: new Date('2026-10-02T12:00:00'),
        statut: InterventionStatus.PLANIFIEE, couvertureContrat: true,
        description: 'Maintenance préventive trimestrielle — Grundfos CM3-5',
      },
      {
        id: 3, reference: 'INT-2026-003', type: InterventionType.CURATIVE,
        clientId: 1, clientEquipementId: 3, technicienId: 4,
        datePrevue: new Date('2026-06-25T12:00:00'),
        dateRealisation: new Date('2026-06-28T16:30:00'),
        statut: InterventionStatus.REALISEE, couvertureContrat: false,
        description: 'Intervention curative sur système de surpression hors contrat',
        diagnostic: "Joint d'étanchéité principal usé — fuite détectée au raccord DN25",
        actionsRealisees: 'Remplacement du joint, purge du circuit, équilibrage des pressions et test de démarrage sur 30 minutes.',
        materielUtilise: 'Joint torique DN25 (x2), graisse silicone technique',
        dureeMinutes: 90,
        observations: 'Équipement remis en service. Contrôle recommandé à J+30.',
      },
      {
        id: 4, reference: 'INT-2026-004', type: InterventionType.CURATIVE,
        clientId: 1, clientEquipementId: 3, technicienId: 4,
        datePrevue: new Date('2026-06-10T12:00:00'),
        dateRealisation: new Date('2026-06-11T15:30:00'),
        statut: InterventionStatus.REALISEE, couvertureContrat: false,
        description: 'Intervention curative facturée — système de surpression hors contrat',
        diagnostic: 'Pressostat défectueux provoquant des arrêts intermittents.',
        actionsRealisees: 'Remplacement du pressostat, contrôle du câblage et test de pression.',
        materielUtilise: 'Pressostat de remplacement, connecteurs électriques',
        dureeMinutes: 75,
        observations: 'Intervention terminée et facturée.',
      },
    ],
  })
  console.log('  Interventions seeded (4) — INT-2026-003 facture-eligible (no facture), INT-2026-004 linked to FAC-2026-001')

  // --- 7. Pannes ---
  // PAN-2026-001: EN_ATTENTE → live jury demo (prise en charge → convert → INT-2026-004)
  // PAN-2026-002: CONVERTIE → INT-2026-003 (companion for historique)
  await prisma.panne.createMany({
    data: [
      {
        id: 1, reference: 'PAN-2026-001',
        clientId: 1, clientEquipementId: 3,
        dateDeclaration: new Date('2026-07-02T09:00:00'),
        statut: PanneStatus.EN_ATTENTE,
        description: 'Bruit anormal au démarrage du système de surpression avec chute de pression après quelques minutes.',
      },
      {
        id: 2, reference: 'PAN-2026-002',
        clientId: 1, clientEquipementId: 3,
        dateDeclaration: new Date('2026-06-20T09:00:00'),
        statut: PanneStatus.CONVERTIE, interventionId: 3,
        description: "Pression insuffisante — l'équipement ne monte pas en régime.",
      },
      {
        id: 3, reference: 'PAN-2026-003',
        clientId: 1, clientEquipementId: 3,
        dateDeclaration: new Date('2026-06-09T09:30:00'),
        statut: PanneStatus.CONVERTIE, interventionId: 4,
        description: 'Arrêts intermittents du système de surpression.',
      },
    ],
  })
  console.log('  Pannes seeded (3) — PAN-2026-001 EN_ATTENTE (live demo), PAN-2026-002/003 CONVERTIE')

  // --- 8. Factures & LigneFactures ---
  // FAC-2026-001 is linked to INT-2026-004 (already REALISEE+facturée).
  // INT-2026-003 remains facture-eligible → next generated facture will be FAC-2026-002.
  await prisma.facture.createMany({
    data: [
      {
        id: 1, numero: 'FAC-2026-001', clientId: 1, interventionId: 4,
        dateEmission: new Date('2026-06-12T10:00:00'),
        montantHT: 180, tva: 34.2, montantTTC: 214.2,
        statut: FactureStatus.PAYEE,
      },
    ],
  })
  console.log('  Factures seeded (1) — FAC-2026-001 (PAYEE, linked to INT-2026-004)')

  await prisma.ligneFacture.createMany({
    data: [
      { factureId: 1, description: "Main-d'œuvre intervention curative", quantite: 1, prixUnitaire: 120, montant: 120 },
      { factureId: 1, description: 'Pressostat de remplacement',         quantite: 1, prixUnitaire: 60,  montant: 60  },
    ],
  })
  console.log('  LigneFactures seeded (2)')

  console.log('\nSeed completed successfully.')
  console.log('  Users: 4 (1 admin + 3 technicians)')
  console.log('  Clients: 3 (EDI Solutions Démo, Clinique El Amel, Sara Mejri)')
  console.log('  Equipment: 5 (EQ-001 → EQ-005)')
  console.log('  ClientEquipements: 5 | CE-3 not covered by any contract')
  console.log('  Contracts: 3 (CTR-001 ACTIF, CTR-002 BIENTOT_EXPIRE, CTR-003 EXPIRE)')
  console.log('  ContractEquipements: 4 (CE-3 never covered)')
  console.log('  Interventions: 4 | INT-2026-003 facture-eligible, INT-2026-004 → FAC-2026-001')
  console.log('  Pannes: 3 | PAN-2026-001 EN_ATTENTE (live demo), PAN-2026-002/003 CONVERTIE')
  console.log('  Factures: 1 (FAC-2026-001, PAYEE) | LigneFactures: 2')
  console.log('  Converting PAN-2026-001 live → INT-2026-005 | Next new facture → FAC-2026-002')
  console.log('  ──────────────────────────────────────────────────────────────────')
  console.log('  ACCOUNTS:')
  console.log('    Admin:    admin@sav.com             / admin123')
  console.log('    Tech 1:   tech@sav.com              / tech123')
  console.log('    Tech 2:   tech2@sav.com             / tech123')
  console.log('    Tech 3:   tech3@sav.com             / tech123')
  console.log('    Client 1: contact@edi-demo.tn       / demo123')
  console.log('    Client 2: contact@clinique-demo.tn  / demo123')
  console.log('    Client 3: sara.mejri@demo.tn        / demo123')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('Seed failed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
