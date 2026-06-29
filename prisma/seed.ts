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

  // --- Pre-compute all password hashes in parallel ---
  const [
    h_admin1, h_admin2,
    h_tech1, h_tech2, h_tech3, h_tech4,
    h_client1, h_client2, h_client3, h_client4, h_client5, h_client6,
  ] = await Promise.all([
    bcrypt.hash('admin123', 10),  // id 1
    bcrypt.hash('admin456', 10),  // id 2
    bcrypt.hash('tech123', 10),   // id 3
    bcrypt.hash('tech456', 10),   // id 4
    bcrypt.hash('tech789', 10),   // id 5
    bcrypt.hash('tech000', 10),   // id 6
    bcrypt.hash('edi123', 10),    // id 1
    bcrypt.hash('berges123', 10), // id 2
    bcrypt.hash('ahmed123', 10),  // id 3
    bcrypt.hash('sahel123', 10),  // id 4
    bcrypt.hash('jasmins123', 10),// id 5
    bcrypt.hash('ibnsina123', 10),// id 6
  ])
  console.log('  Password hashes computed')

  // --- 1. Users (admin + technicians) ---
  await prisma.user.createMany({
    data: [
      {
        id: 1,
        prenom: 'Sami', nom: 'Meftah',
        email: 'admin@sav.com', telephone: '71100200',
        passwordHash: h_admin1, role: UserRole.ADMIN,
        actif: true, dateCreation: new Date('2024-01-15T12:00:00'),
      },
      {
        id: 2,
        prenom: 'Leila', nom: 'Abid',
        email: 'leila.admin@sav.com', telephone: '71100201',
        passwordHash: h_admin2, role: UserRole.ADMIN,
        actif: true, dateCreation: new Date('2024-01-20T12:00:00'),
      },
      {
        id: 3,
        prenom: 'Mohamed', nom: 'Trabelsi',
        email: 'tech@sav.com', telephone: '98200300',
        passwordHash: h_tech1, role: UserRole.TECHNICIAN,
        actif: true, dateCreation: new Date('2024-02-20T12:00:00'),
      },
      {
        id: 4,
        prenom: 'Walid', nom: 'Jlassi',
        email: 'walid.jlassi@sav.com', telephone: '98200301',
        passwordHash: h_tech2, role: UserRole.TECHNICIAN,
        actif: true, dateCreation: new Date('2024-02-25T12:00:00'),
      },
      {
        id: 5,
        prenom: 'Amira', nom: 'Chebbi',
        email: 'amira.chebbi@sav.com', telephone: '98200302',
        passwordHash: h_tech3, role: UserRole.TECHNICIAN,
        actif: false, dateCreation: new Date('2024-03-01T12:00:00'),
      },
      {
        id: 6,
        prenom: 'Ahmed', nom: 'Miled',
        email: 'ahmed.miled@sav.com', telephone: '98200303',
        passwordHash: h_tech4, role: UserRole.TECHNICIAN,
        actif: true, dateCreation: new Date('2024-04-10T12:00:00'),
      },
    ],
  })
  console.log('  Users seeded (6)')

  // --- 2. Clients ---
  await prisma.client.createMany({
    data: [
      {
        id: 1,
        typeClient: ClientType.SOCIETE,
        societe: 'EDI Solutions', contact: 'Mohamed Trabelsi',
        email: 'contact@edi-solutions.tn', telephone: '71345678',
        passwordHash: h_client1,
        adresse: 'Zone Industrielle Charguia II', ville: 'Ariana',
        dateCreation: new Date('2024-01-10T12:00:00'),
      },
      {
        id: 2,
        typeClient: ClientType.SOCIETE,
        societe: 'Résidence Les Berges du Lac', contact: 'Yassine Gharbi',
        email: 'syndic@residence-berges.tn', telephone: '71456789',
        passwordHash: h_client2,
        adresse: 'Rue du Lac Biwa, Les Berges du Lac', ville: 'Tunis',
        dateCreation: new Date('2024-01-20T12:00:00'),
      },
      {
        id: 3,
        typeClient: ClientType.PERSONNE_PHYSIQUE,
        prenom: 'Ahmed', nom: 'Ben Salah',
        email: 'ahmed.bensalah@mail.tn', telephone: '98765432',
        passwordHash: h_client3,
        adresse: 'Résidence El Menzah 9', ville: 'Tunis',
        dateCreation: new Date('2024-02-05T12:00:00'),
      },
      {
        id: 4,
        typeClient: ClientType.SOCIETE,
        societe: 'Groupe Sahel Industrie', contact: 'Karim Bouazizi',
        email: 'info@sahel-industrie.tn', telephone: '73234567',
        passwordHash: h_client4,
        adresse: 'Zone Industrielle Sidi Abdelhamid', ville: 'Sousse',
        dateCreation: new Date('2024-02-15T12:00:00'),
      },
      {
        id: 5,
        typeClient: ClientType.SOCIETE,
        societe: 'Hôtel Les Jasmins Hammamet', contact: 'Nour Belhaj',
        email: 'maintenance@jasmins-hammamet.tn', telephone: '72345678',
        passwordHash: h_client5,
        adresse: 'Route de Sousse', ville: 'Hammamet',
        dateCreation: new Date('2024-03-01T12:00:00'),
      },
      {
        id: 6,
        typeClient: ClientType.SOCIETE,
        societe: 'Centre Médical Ibn Sina', contact: 'Sonia Belhaji',
        email: 'maintenance@ibnsina.tn', telephone: '71234567',
        passwordHash: h_client6,
        adresse: '12 Avenue Habib Bourguiba', ville: 'Tunis',
        dateCreation: new Date('2024-05-20T12:00:00'),
      },
    ],
  })
  console.log('  Clients seeded (6)')

  // --- 3. Equipment (global catalog) ---
  await prisma.equipment.createMany({
    data: [
      { id:  1, reference: 'EQ-001', type: EquipmentType.CLIMATISEUR,        marque: 'CoolMax',            modele: 'CoolMax 3000',               numeroSerie: 'SN-2024-001', description: 'Climatiseur split mural inverter 3000 BTU' },
      { id:  2, reference: 'EQ-002', type: EquipmentType.SYSTEME_SURPRESSION, marque: 'Pressure Pro',       modele: 'Pressure Pro 500',            numeroSerie: 'SN-2024-002', description: 'Surpresseur compact 500 L/h — usage tertiaire' },
      { id:  3, reference: 'EQ-003', type: EquipmentType.CLIMATISEUR,        marque: 'CoolMax',            modele: 'CoolMax 5000',               numeroSerie: 'SN-2024-003', description: 'Climatiseur split mural inverter 5000 BTU — grand volume' },
      { id:  4, reference: 'EQ-004', type: EquipmentType.CLIMATISEUR,        marque: 'HomeClimate',        modele: 'HomeClimate 1500',            numeroSerie: 'SN-2024-004', description: 'Climatiseur résidentiel compact 1500 BTU' },
      { id:  5, reference: 'EQ-005', type: EquipmentType.CLIMATISEUR,        marque: 'Daikin',             modele: 'FTXS50K',                    numeroSerie: 'SN-2024-005', description: 'Climatiseur Daikin inverter 5 kW — technologie Bluevolution' },
      { id:  6, reference: 'EQ-006', type: EquipmentType.SYSTEME_SURPRESSION, marque: 'Grundfos',           modele: 'CM5-8 A-R-I-E-AVBE',         numeroSerie: 'SN-2024-006', description: 'Pompe multicellulaire Grundfos 5 m³/h — usage industriel' },
      { id:  7, reference: 'EQ-007', type: EquipmentType.CLIMATISEUR,        marque: 'Mitsubishi Electric', modele: 'MSZ-LN35VG2',                numeroSerie: 'SN-2023-007', description: 'Climatiseur Mitsubishi Electric Design 3,5 kW' },
      { id:  8, reference: 'EQ-008', type: EquipmentType.CLIMATISEUR,        marque: 'Samsung',            modele: 'AR12TXHQASINEU',             numeroSerie: 'SN-2024-008', description: 'Climatiseur Samsung Wind-Free 12000 BTU' },
      { id:  9, reference: 'EQ-009', type: EquipmentType.SYSTEME_SURPRESSION, marque: 'Wilo',               modele: 'Stratos MAXO 40/0.5-8',      numeroSerie: 'SN-2023-009', description: 'Circulateur Wilo haute efficacité DN40 — régulation automatique' },
      { id: 10, reference: 'EQ-010', type: EquipmentType.SYSTEME_SURPRESSION, marque: 'Grundfos',           modele: 'CR 10-12',                   numeroSerie: 'SN-2024-010', description: 'Pompe centrifuge verticale Grundfos 10 m³/h' },
      { id: 11, reference: 'EQ-011', type: EquipmentType.CLIMATISEUR,        marque: 'LG',                 modele: 'S12EQ.NSJ2',                 numeroSerie: 'SN-2024-011', description: 'Climatiseur LG Dual Inverter 12000 BTU' },
      { id: 12, reference: 'EQ-012', type: EquipmentType.CLIMATISEUR,        marque: 'Carrier',            modele: '42QHC012DS8-S',              numeroSerie: 'SN-2024-012', description: 'Cassette Carrier 12000 BTU — installation plafond' },
      { id: 13, reference: 'EQ-013', type: EquipmentType.SYSTEME_SURPRESSION, marque: 'DAB',                modele: 'Esybox 45/85M',              numeroSerie: 'SN-2024-013', description: 'Groupe de surpression DAB Esybox — variateur intégré' },
      { id: 14, reference: 'EQ-014', type: EquipmentType.CLIMATISEUR,        marque: 'Trane',              modele: 'TTK036C100AA',               numeroSerie: 'SN-2023-014', description: 'Climatiseur Trane 36000 BTU — usage commercial intensif' },
      { id: 15, reference: 'EQ-015', type: EquipmentType.SYSTEME_SURPRESSION, marque: 'Ebara',              modele: 'EVMS 10-7 F5/4.0',           numeroSerie: 'SN-2023-015', description: 'Pompe verticale multistage Ebara 10 m³/h — 4 kW' },
      { id: 16, reference: 'EQ-016', type: EquipmentType.CLIMATISEUR,        marque: 'Daikin',             modele: 'FTXC50B',                    numeroSerie: 'SN-2024-016', description: 'Climatiseur Daikin Sensira 5 kW — gaz R32' },
      { id: 17, reference: 'EQ-017', type: EquipmentType.SYSTEME_SURPRESSION, marque: 'Lowara',             modele: 'SV 208F 15T E/1',            numeroSerie: 'SN-2024-017', description: 'Pompe immergée Lowara SV série 208 — 1,5 kW' },
    ],
  })
  console.log('  Equipment seeded (17)')

  // 4. EquipmentImages — all mock records have empty images arrays
  console.log('  EquipmentImages: none in mock data, skipped')

  // --- 5. ClientEquipements (installations) ---
  await prisma.clientEquipement.createMany({
    data: [
      { id:  1, clientId: 1, equipementId:  1, dateAchat: new Date('2023-06-01T12:00:00'), localisation: 'Bureau Étage 2',           dateInstallation: new Date('2023-06-15T12:00:00') },
      { id:  2, clientId: 1, equipementId:  2, dateAchat: new Date('2023-08-10T12:00:00'), localisation: 'Sécurité',                  dateInstallation: new Date('2023-08-20T12:00:00') },
      { id:  3, clientId: 2, equipementId:  3, dateAchat: new Date('2022-10-20T12:00:00'), localisation: 'Halls Communs',              dateInstallation: new Date('2022-11-01T12:00:00') },
      { id:  4, clientId: 3, equipementId:  4, dateAchat: new Date('2023-03-01T12:00:00'), localisation: 'Résidentielle',              dateInstallation: new Date('2023-03-10T12:00:00') },
      { id:  5, clientId: 1, equipementId:  5, dateAchat: new Date('2023-09-01T12:00:00'), localisation: 'Salle de Réunion',           dateInstallation: new Date('2023-09-10T12:00:00') },
      { id:  6, clientId: 1, equipementId:  6, dateAchat: new Date('2023-10-25T12:00:00'), localisation: 'Chaufferie Sous-Sol',        dateInstallation: new Date('2023-11-05T12:00:00') },
      { id:  7, clientId: 1, equipementId:  7, dateAchat: new Date('2022-07-10T12:00:00'), localisation: 'Atelier de Production',      dateInstallation: new Date('2022-07-20T12:00:00') },
      { id:  8, clientId: 2, equipementId:  8, dateAchat: new Date('2024-01-05T12:00:00'), localisation: 'Bureaux Administratifs',     dateInstallation: new Date('2024-01-15T12:00:00') },
      { id:  9, clientId: 2, equipementId:  9, dateAchat: new Date('2023-04-08T12:00:00'), localisation: 'Local Technique RDC',        dateInstallation: new Date('2023-04-18T12:00:00') },
      { id: 10, clientId: 3, equipementId: 10, dateAchat: new Date('2024-02-20T12:00:00'), localisation: 'Cave Technique',             dateInstallation: new Date('2024-02-28T12:00:00') },
      { id: 11, clientId: 3, equipementId: 11, dateAchat: new Date('2024-02-25T12:00:00'), localisation: 'Chambre Principale',         dateInstallation: new Date('2024-03-05T12:00:00') },
      { id: 12, clientId: 4, equipementId: 12, dateAchat: new Date('2024-02-01T12:00:00'), localisation: 'Open Space Étage 1',         dateInstallation: new Date('2024-02-10T12:00:00') },
      { id: 13, clientId: 4, equipementId: 13, dateAchat: new Date('2024-02-05T12:00:00'), localisation: 'Local Technique Sous-Sol',   dateInstallation: new Date('2024-02-15T12:00:00') },
      { id: 14, clientId: 5, equipementId: 14, dateAchat: new Date('2023-05-02T12:00:00'), localisation: 'Hall de Réception',          dateInstallation: new Date('2023-05-12T12:00:00') },
      { id: 15, clientId: 5, equipementId: 15, dateAchat: new Date('2023-06-10T12:00:00'), localisation: 'Local Technique Piscine',    dateInstallation: new Date('2023-06-20T12:00:00') },
      { id: 16, clientId: 6, equipementId: 16, dateAchat: new Date('2024-03-01T12:00:00'), localisation: 'Bloc Consultation A',        dateInstallation: new Date('2024-03-10T12:00:00') },
      { id: 17, clientId: 6, equipementId: 17, dateAchat: new Date('2024-03-05T12:00:00'), localisation: 'Chaufferie Bloc B',          dateInstallation: new Date('2024-03-15T12:00:00') },
    ],
  })
  console.log('  ClientEquipements seeded (17)')

  // --- 6. Contracts ---
  await prisma.contract.createMany({
    data: [
      { id: 1, reference: 'CTR-001', clientId: 1, dateDebut: new Date('2024-01-01T12:00:00'), dateFin: new Date('2026-12-31T12:00:00'), periodicite: Periodicite.TRIMESTRIELLE, statut: ContractStatus.ACTIF,          description: 'Contrat Maintenance Annuelle' },
      { id: 2, reference: 'CTR-002', clientId: 2, dateDebut: new Date('2024-03-01T12:00:00'), dateFin: new Date('2026-12-31T12:00:00'), periodicite: Periodicite.MENSUELLE,     statut: ContractStatus.ACTIF,          description: 'Contrat Support Premium' },
      { id: 3, reference: 'CTR-003', clientId: 1, dateDebut: new Date('2023-06-15T12:00:00'), dateFin: new Date('2024-06-14T12:00:00'), periodicite: Periodicite.TRIMESTRIELLE, statut: ContractStatus.EXPIRE,         description: 'Garantie Extended 3 ans' },
      { id: 4, reference: 'CTR-004', clientId: 3, dateDebut: new Date('2024-02-01T12:00:00'), dateFin: new Date('2026-12-31T12:00:00'), periodicite: Periodicite.SEMESTRIELLE,  statut: ContractStatus.ACTIF,          description: 'Contrat Entretien Résidentiel' },
      { id: 5, reference: 'CTR-005', clientId: 1, dateDebut: new Date('2024-07-01T12:00:00'), dateFin: new Date('2026-12-31T12:00:00'), periodicite: Periodicite.SEMESTRIELLE,  statut: ContractStatus.ACTIF,          description: 'Contrat Maintenance Équipements Secondaires' },
      { id: 6, reference: 'CTR-006', clientId: 4, dateDebut: new Date('2024-02-15T12:00:00'), dateFin: new Date('2026-12-31T12:00:00'), periodicite: Periodicite.ANNUELLE,      statut: ContractStatus.ACTIF,          description: 'Contrat Maintenance Groupe Sahel Industrie' },
      { id: 7, reference: 'CTR-007', clientId: 5, dateDebut: new Date('2023-07-01T12:00:00'), dateFin: new Date('2026-12-31T12:00:00'), periodicite: Periodicite.MENSUELLE,     statut: ContractStatus.ACTIF,          description: 'Contrat Premium Hôtel Les Jasmins Hammamet' },
      { id: 8, reference: 'CTR-008', clientId: 2, dateDebut: new Date('2023-02-01T12:00:00'), dateFin: new Date('2025-01-31T12:00:00'), periodicite: Periodicite.TRIMESTRIELLE, statut: ContractStatus.EXPIRE,         description: 'Contrat Entretien Bureaux Administratifs' },
      { id: 9, reference: 'CTR-009', clientId: 6, dateDebut: new Date('2025-06-15T12:00:00'), dateFin: new Date('2026-06-15T12:00:00'), periodicite: Periodicite.ANNUELLE,      statut: ContractStatus.BIENTOT_EXPIRE, description: 'Contrat Maintenance Centre Médical Ibn Sina' },
    ],
  })
  console.log('  Contracts seeded (9)')

  // --- 7. ContractEquipements (join table) ---
  await prisma.contractEquipement.createMany({
    data: [
      { contractId:  1, clientEquipementId:  1 },
      { contractId:  1, clientEquipementId:  2 },
      { contractId:  2, clientEquipementId:  3 },
      { contractId:  3, clientEquipementId:  1 },
      { contractId:  4, clientEquipementId:  4 },
      { contractId:  5, clientEquipementId:  5 },
      { contractId:  5, clientEquipementId:  6 },
      { contractId:  6, clientEquipementId: 12 },
      { contractId:  6, clientEquipementId: 13 },
      { contractId:  7, clientEquipementId: 14 },
      { contractId:  7, clientEquipementId: 15 },
      { contractId:  8, clientEquipementId:  8 },
      { contractId:  9, clientEquipementId: 16 },
      { contractId:  9, clientEquipementId: 17 },
    ],
  })
  console.log('  ContractEquipements seeded (14)')

  // --- 8. Interventions ---
  // Note: the deprecated equipementId field from mock data is not stored.
  // Use clientEquipement.equipementId when you need the equipment reference.
  await prisma.intervention.createMany({
    data: [
      {
        id: 1, reference: 'INT-2026-001', type: InterventionType.PREVENTIVE,
        clientId: 1, clientEquipementId: 1, technicienId: 3,
        contractId: 1, datePrevue: new Date('2026-05-12T12:00:00'),
        dateRealisation: new Date('2026-05-12T12:00:00'), statut: InterventionStatus.REALISEE,
        couvertureContrat: true, description: 'Inspection et nettoyage des filtres',
        actionsRealisees: 'Filtres remplacés', dureeMinutes: 135,
        observations: 'Système en bon état.',
      },
      {
        id: 2, reference: 'INT-2026-002', type: InterventionType.CURATIVE,
        clientId: 1, clientEquipementId: 2, technicienId: 4,
        contractId: 1, datePrevue: new Date('2026-05-20T12:00:00'),
        statut: InterventionStatus.PLANIFIEE, couvertureContrat: true,
        description: 'Fuite système surpression détectée',
        observations: 'Client signale problème de pression',
      },
      {
        id: 3, reference: 'INT-2026-003', type: InterventionType.PREVENTIVE,
        clientId: 2, clientEquipementId: 3, technicienId: 3,
        contractId: 2, datePrevue: new Date('2026-05-19T12:00:00'),
        statut: InterventionStatus.EN_COURS, couvertureContrat: true,
        description: 'Contrôle complet du système climatisation',
        dureeMinutes: 120,
        observations: 'Travaux en cours - condensateur à remplacer',
      },
      {
        id: 4, reference: 'INT-2026-004', type: InterventionType.PREVENTIVE,
        clientId: 3, clientEquipementId: 4, technicienId: 4,
        contractId: 4, datePrevue: new Date('2026-05-22T12:00:00'),
        statut: InterventionStatus.PLANIFIEE, couvertureContrat: true,
        description: 'Nettoyage et remplacement filtre',
        observations: 'Maintenance de routine',
      },
      {
        id: 5, reference: 'INT-2026-005', type: InterventionType.CURATIVE,
        clientId: 3, clientEquipementId: 4,
        contractId: 4, datePrevue: new Date('2026-05-21T12:00:00'),
        statut: InterventionStatus.PLANIFIEE, couvertureContrat: true,
        description: 'Bruit anormal au démarrage du compresseur',
        observations: 'Intervention hors contrat couverte par extension',
      },
      {
        id: 6, reference: 'INT-2026-006', type: InterventionType.PREVENTIVE,
        clientId: 1, clientEquipementId: 1,
        contractId: 1, datePrevue: new Date('2026-05-18T12:00:00'),
        statut: InterventionStatus.PLANIFIEE, couvertureContrat: true,
        description: 'Vérification saisonnière avant été',
      },
      {
        id: 7, reference: 'INT-2026-007', type: InterventionType.CURATIVE,
        clientId: 2, clientEquipementId: 3, technicienId: 3,
        contractId: 2, datePrevue: new Date('2026-05-24T12:00:00'),
        statut: InterventionStatus.PLANIFIEE, couvertureContrat: true,
        description: 'Panne signalée - pas de refroidissement',
      },
      {
        id: 8, reference: 'INT-2026-008', type: InterventionType.CURATIVE,
        clientId: 1, clientEquipementId: 1, technicienId: 3,
        datePrevue: new Date('2026-05-10T12:00:00'), dateRealisation: new Date('2026-05-10T12:00:00'),
        statut: InterventionStatus.REALISEE, couvertureContrat: false,
        description: 'Remplacement compresseur climatisation défaillant',
        actionsRealisees: 'Compresseur remplacé, système rechargé en gaz et testé',
        materielUtilise: 'Compresseur Inverter 2.5T', dureeMinutes: 180,
        observations: "Système opérationnel suite à l'intervention.",
      },
      {
        id: 9, reference: 'INT-2026-009', type: InterventionType.CURATIVE,
        clientId: 2, clientEquipementId: 3, technicienId: 4,
        datePrevue: new Date('2026-05-15T12:00:00'), dateRealisation: new Date('2026-05-15T12:00:00'),
        statut: InterventionStatus.REALISEE, couvertureContrat: false,
        description: 'Panne complète du groupe frigorifique — absence de refroidissement',
        actionsRealisees: 'Remplacement module de commande, reconfiguration des paramètres',
        dureeMinutes: 120,
        observations: 'Aucune anomalie détectée après test complet.',
      },
      {
        id: 10, reference: 'INT-2026-010', type: InterventionType.CURATIVE,
        clientId: 3, clientEquipementId: 4, technicienId: 3,
        datePrevue: new Date('2026-05-22T12:00:00'), dateRealisation: new Date('2026-05-22T12:00:00'),
        statut: InterventionStatus.REALISEE, couvertureContrat: false,
        description: 'Dysfonctionnement unité intérieure climatisation',
        actionsRealisees: 'Carte électronique remplacée, calibration effectuée',
        materielUtilise: 'Carte électronique MCU-4000', dureeMinutes: 90,
        observations: 'Système fonctionnel après intervention.',
      },
      {
        id: 11, reference: 'INT-2026-011', type: InterventionType.PREVENTIVE,
        clientId: 2, clientEquipementId: 3, technicienId: 3,
        contractId: 2, datePrevue: new Date('2026-04-10T12:00:00'),
        statut: InterventionStatus.ANNULEE, couvertureContrat: true,
        description: 'Maintenance préventive mensuelle climatisation',
        observations: "Annulée suite à une indisponibilité du technicien.",
      },
      {
        id: 12, reference: 'INT-2026-012', type: InterventionType.CURATIVE,
        clientId: 1, clientEquipementId: 2, technicienId: 4,
        datePrevue: new Date('2026-04-20T12:00:00'),
        statut: InterventionStatus.ANNULEE, couvertureContrat: false,
        description: 'Bruit suspect dans le compresseur du système surpression',
        observations: 'Annulée — problème résolu par le client avant intervention.',
      },
      {
        id: 13, reference: 'INT-2026-013', type: InterventionType.PREVENTIVE,
        clientId: 4, clientEquipementId: 12, technicienId: 6,
        contractId: 6, datePrevue: new Date('2026-03-20T12:00:00'),
        dateRealisation: new Date('2026-03-20T12:00:00'), statut: InterventionStatus.REALISEE,
        couvertureContrat: true, description: 'Inspection annuelle climatisation Open Space',
        actionsRealisees: 'Nettoyage filtre, vérification gaz réfrigérant, test électrique',
        dureeMinutes: 90,
        observations: 'Système en bon état, aucune anomalie détectée.',
      },
      {
        id: 14, reference: 'INT-2026-014', type: InterventionType.CURATIVE,
        clientId: 2, clientEquipementId: 8, technicienId: 4,
        datePrevue: new Date('2026-04-05T12:00:00'), dateRealisation: new Date('2026-04-05T12:00:00'),
        statut: InterventionStatus.REALISEE, couvertureContrat: false,
        description: 'Fuite de gaz réfrigérant — climatiseur bureaux administratifs',
        actionsRealisees: 'Recherche fuite, soudure sur circuit, recharge R410A (1,5 kg)',
        materielUtilise: 'Gaz R410A 1.5 kg, Kit soudure', dureeMinutes: 150,
        observations: 'Étanchéité vérifiée, pression nominale atteinte.',
      },
      {
        id: 15, reference: 'INT-2026-015', type: InterventionType.PREVENTIVE,
        clientId: 5, clientEquipementId: 14, technicienId: 3,
        contractId: 7, datePrevue: new Date('2026-04-18T12:00:00'),
        dateRealisation: new Date('2026-04-18T12:00:00'), statut: InterventionStatus.REALISEE,
        couvertureContrat: true, description: 'Maintenance mensuelle climatisation hall réception',
        actionsRealisees: 'Nettoyage évaporateur, désinfection serpentin, vérification courroies',
        dureeMinutes: 75,
        observations: 'RAS. Prochain entretien prévu mai 2026.',
      },
      {
        id: 16, reference: 'INT-2026-016', type: InterventionType.CURATIVE,
        clientId: 6, clientEquipementId: 16, technicienId: 6,
        datePrevue: new Date('2026-04-28T12:00:00'), dateRealisation: new Date('2026-04-28T12:00:00'),
        statut: InterventionStatus.REALISEE, couvertureContrat: false,
        description: 'Panne totale climatisation bloc consultation — chaleur insupportable',
        actionsRealisees: 'Remplacement ventilateur intérieur, nettoyage condenseur, recharge gaz R32',
        materielUtilise: 'Ventilateur intérieur 18W, Gaz R32 0.8 kg', dureeMinutes: 120,
        observations: 'Système opérationnel. Client informé du risque de récurrence.',
      },
      {
        id: 17, reference: 'INT-2026-017', type: InterventionType.PREVENTIVE,
        clientId: 1, clientEquipementId: 5, technicienId: 4,
        contractId: 5, datePrevue: new Date('2026-03-10T12:00:00'),
        dateRealisation: new Date('2026-03-10T12:00:00'), statut: InterventionStatus.REALISEE,
        couvertureContrat: true, description: 'Maintenance semestrielle Daikin FTXS50K — salle de réunion',
        actionsRealisees: 'Vérification générale, nettoyage filtre, test performances',
        dureeMinutes: 60,
        observations: 'Performances nominales. Filtre légèrement encrassé remplacé.',
      },
      {
        id: 18, reference: 'INT-2026-018', type: InterventionType.PREVENTIVE,
        clientId: 4, clientEquipementId: 13, technicienId: 6,
        datePrevue: new Date('2026-04-15T12:00:00'),
        statut: InterventionStatus.ANNULEE, couvertureContrat: false,
        description: 'Vérification système de surpression sous-sol',
        observations: 'Annulée — accès local technique impossible (travaux de rénovation en cours).',
      },
      {
        id: 19, reference: 'INT-2026-019', type: InterventionType.CURATIVE,
        clientId: 3, clientEquipementId: 10, technicienId: 4,
        datePrevue: new Date('2026-04-22T12:00:00'),
        statut: InterventionStatus.ANNULEE, couvertureContrat: false,
        description: 'Baisse de pression système surpression — cave technique',
        observations: 'Annulée — fausse alerte, pression revenue à la normale sans intervention.',
      },
      {
        id: 20, reference: 'INT-2026-020', type: InterventionType.PREVENTIVE,
        clientId: 4, clientEquipementId: 12, technicienId: 6,
        contractId: 6, datePrevue: new Date('2026-06-10T12:00:00'),
        statut: InterventionStatus.PLANIFIEE, couvertureContrat: true,
        description: 'Maintenance annuelle climatisation Open Space — T2 2026',
      },
      {
        id: 21, reference: 'INT-2026-021', type: InterventionType.PREVENTIVE,
        clientId: 5, clientEquipementId: 15, technicienId: 3,
        contractId: 7, datePrevue: new Date('2026-06-15T12:00:00'),
        statut: InterventionStatus.PLANIFIEE, couvertureContrat: true,
        description: 'Maintenance mensuelle surpression local technique piscine',
      },
      {
        id: 22, reference: 'INT-2026-022', type: InterventionType.CURATIVE,
        clientId: 6, clientEquipementId: 17, technicienId: 4,
        datePrevue: new Date('2026-06-01T12:00:00'),
        statut: InterventionStatus.PLANIFIEE, couvertureContrat: false,
        description: 'Panne pompe surpression — chaufferie bloc B, arrêt complet',
      },
      {
        id: 23, reference: 'INT-2026-023', type: InterventionType.PREVENTIVE,
        clientId: 3, clientEquipementId: 11, technicienId: 6,
        datePrevue: new Date('2026-06-05T12:00:00'),
        statut: InterventionStatus.PLANIFIEE, couvertureContrat: false,
        description: 'Entretien estival climatisation chambre principale',
      },
      {
        id: 24, reference: 'INT-2026-024', type: InterventionType.CURATIVE,
        clientId: 2, clientEquipementId: 9, technicienId: 3,
        datePrevue: new Date('2026-06-12T12:00:00'),
        statut: InterventionStatus.PLANIFIEE, couvertureContrat: false,
        description: 'Réparation pompe surpression — local technique RDC (EN_PANNE)',
      },
      {
        id: 25, reference: 'INT-2026-025', type: InterventionType.CURATIVE,
        clientId: 5, clientEquipementId: 14, technicienId: 6,
        datePrevue: new Date('2026-05-28T12:00:00'),
        statut: InterventionStatus.EN_COURS, couvertureContrat: false,
        description: "Vibrations anormales et bruit persistant dans l'unité extérieure",
        observations: 'Diagnostic en cours — roulement suspect.',
      },
      {
        id: 26, reference: 'INT-2026-026', type: InterventionType.PREVENTIVE,
        clientId: 1, clientEquipementId: 6, technicienId: 4,
        contractId: 5, datePrevue: new Date('2026-05-29T12:00:00'),
        statut: InterventionStatus.EN_COURS, couvertureContrat: true,
        description: 'Contrôle semestriel pompe surpression chaufferie sous-sol',
        observations: 'Vérification en cours — pression stable, capteur à étalonner.',
      },
      {
        id: 27, reference: 'INT-2026-027', type: InterventionType.CURATIVE,
        clientId: 1, clientEquipementId: 7, technicienId: 3,
        datePrevue: new Date('2026-05-30T12:00:00'),
        statut: InterventionStatus.EN_COURS, couvertureContrat: false,
        description: 'Remise en service climatisation atelier de production (HORS_SERVICE)',
        observations: 'Diagnostic en cours — carte électronique principale suspecte.',
      },
      {
        id: 28, reference: 'INT-2026-028', type: InterventionType.PREVENTIVE,
        clientId: 6, clientEquipementId: 16, technicienId: 6,
        contractId: 9, datePrevue: new Date('2026-05-27T12:00:00'),
        statut: InterventionStatus.EN_COURS, couvertureContrat: true,
        description: 'Entretien préventif avant expiration contrat — bloc consultation A',
        observations: 'En attente vérification pression gaz réfrigérant.',
      },
    ],
  })
  console.log('  Interventions seeded (28)')

  // --- 9. Pannes ---
  await prisma.panne.createMany({
    data: [
      {
        id: 1, reference: 'PAN-2026-001',
        clientId: 1, clientEquipementId: 1,
        dateDeclaration: new Date('2026-05-10T12:00:00'),
        description: "Baisse de pression flagrante et fuite d'eau au niveau du split du deuxième étage dans nos bureaux à La Marsa.",
        statut: PanneStatus.CONVERTIE, interventionId: 2,
      },
      {
        id: 2, reference: 'PAN-2026-002',
        clientId: 2, clientEquipementId: 3,
        dateDeclaration: new Date('2026-05-24T12:00:00'),
        description: "Le climatiseur principal du hall de l'immeuble ne s'allume plus du tout. Affichage d'une erreur E6 sur le boîtier de contrôle mural.",
        statut: PanneStatus.EN_ATTENTE,
      },
      {
        id: 3, reference: 'PAN-2026-003',
        clientId: 3, clientEquipementId: 4,
        dateDeclaration: new Date('2026-05-23T12:00:00'),
        description: "Sifflement aigu constant extrêmement dérangeant dès le démarrage du compresseur dans la chambre principale à El Menzah 9.",
        statut: PanneStatus.PRISE_EN_CHARGE,
      },
      {
        id: 4, reference: 'PAN-2026-004',
        clientId: 3, clientEquipementId: 4,
        dateDeclaration: new Date('2026-05-21T12:00:00'),
        description: "La télécommande ne répond plus du tout et l'unité souffle uniquement de l'air chaud malgré le réglage sur 18°C.",
        statut: PanneStatus.CONVERTIE, interventionId: 5,
      },
      {
        id: 5, reference: 'PAN-2026-005',
        clientId: 1, clientEquipementId: 2,
        dateDeclaration: new Date('2026-05-18T12:00:00'),
        description: 'Perte de pression intermittente sur le surpresseur du local technique de sécurité.',
        statut: PanneStatus.ANNULEE,
      },
    ],
  })
  console.log('  Pannes seeded (5)')

  // PieceJointes (attached files to pannes)
  // Note: pj-1 → id 1, pj-3 → id 2 (renumbered sequentially)
  await prisma.pieceJointe.createMany({
    data: [
      {
        id: 1, panneId: 1,
        filename: 'photo_fuite_split.jpg',
        url: '/uploads/pannes/pan-1/photo_fuite_split.jpg',
        size: 245760, mimeType: 'image/jpeg',
      },
      {
        id: 2, panneId: 3,
        filename: 'enregistrement_bruit.mp3',
        url: '/uploads/pannes/pan-3/enregistrement_bruit.mp3',
        size: 1024000, mimeType: 'audio/mpeg',
      },
    ],
  })
  console.log('  PieceJointes seeded (2)')

  // --- 10. Factures ---
  await prisma.facture.createMany({
    data: [
      { id:  1, numero: 'FAC-2024-001', clientId: 1, interventionId:  1, dateEmission: new Date('2024-04-01T12:00:00'), montantHT: 520.83,  tva: 104.17, montantTTC: 625.00,  statut: FactureStatus.PAYEE },
      { id:  2, numero: 'FAC-2024-002', clientId: 1,                     dateEmission: new Date('2024-05-01T12:00:00'), montantHT: 520.83,  tva: 104.17, montantTTC: 625.00,  statut: FactureStatus.EN_ATTENTE },
      { id:  3, numero: 'FAC-2024-003', clientId: 2,                     dateEmission: new Date('2024-04-15T12:00:00'), montantHT: 2916.67, tva: 583.33, montantTTC: 3500.00, statut: FactureStatus.IMPAYEE },
      { id:  4, numero: 'FAC-2026-001', clientId: 1, interventionId:  8, dateEmission: new Date('2026-05-11T12:00:00'), montantHT: 300.00,  tva: 57.00,  montantTTC: 357.00,  statut: FactureStatus.PAYEE },
      { id:  5, numero: 'FAC-2026-002', clientId: 3, interventionId: 10, dateEmission: new Date('2026-05-23T12:00:00'), montantHT: 225.00,  tva: 42.75,  montantTTC: 267.75,  statut: FactureStatus.EN_ATTENTE },
      { id:  6, numero: 'FAC-2026-003', clientId: 2, interventionId:  9, dateEmission: new Date('2026-05-16T12:00:00'), montantHT: 280.00,  tva: 53.20,  montantTTC: 333.20,  statut: FactureStatus.PAYEE },
      { id:  7, numero: 'FAC-2026-004', clientId: 2, interventionId: 14, dateEmission: new Date('2026-04-06T12:00:00'), montantHT: 312.50,  tva: 59.38,  montantTTC: 371.88,  statut: FactureStatus.EN_ATTENTE },
      { id:  8, numero: 'FAC-2026-005', clientId: 6, interventionId: 16, dateEmission: new Date('2026-04-29T12:00:00'), montantHT: 258.33,  tva: 49.08,  montantTTC: 307.41,  statut: FactureStatus.IMPAYEE },
      { id:  9, numero: 'FAC-2026-006', clientId: 4,                     dateEmission: new Date('2026-03-25T12:00:00'), montantHT: 750.00,  tva: 142.50, montantTTC: 892.50,  statut: FactureStatus.PAYEE },
      { id: 10, numero: 'FAC-2026-007', clientId: 5,                     dateEmission: new Date('2026-05-01T12:00:00'), montantHT: 416.67,  tva: 79.17,  montantTTC: 495.84,  statut: FactureStatus.EN_ATTENTE },
      { id: 11, numero: 'FAC-2025-001', clientId: 1,                     dateEmission: new Date('2025-07-01T12:00:00'), montantHT: 520.83,  tva: 104.17, montantTTC: 625.00,  statut: FactureStatus.PAYEE },
    ],
  })
  console.log('  Factures seeded (11)')

  // LigneFactures (invoice line items — IDs auto-generated by Prisma)
  await prisma.ligneFacture.createMany({
    data: [
      // facture 1
      { factureId:  1, description: 'Maintenance Q1 2024',                                                        quantite: 1,   prixUnitaire: 520.83, montant: 520.83 },
      // facture 2
      { factureId:  2, description: 'Maintenance Q2 2024',                                                        quantite: 1,   prixUnitaire: 520.83, montant: 520.83 },
      // facture 3
      { factureId:  3, description: 'Support Premium - Avril 2024',                                               quantite: 1,   prixUnitaire: 2916.67, montant: 2916.67 },
      // facture 4
      { factureId:  4, description: "Intervention curative - Main d'œuvre",                                       quantite: 3,   prixUnitaire: 50,     montant: 150.00 },
      { factureId:  4, description: 'Matériel utilisé : Compresseur Inverter 2.5T',                               quantite: 1,   prixUnitaire: 150,    montant: 150.00 },
      // facture 5
      { factureId:  5, description: "Intervention curative - Main d'œuvre",                                       quantite: 1.5, prixUnitaire: 50,     montant: 75.00 },
      { factureId:  5, description: 'Matériel utilisé : Carte électronique MCU-4000',                             quantite: 1,   prixUnitaire: 150,    montant: 150.00 },
      // facture 6
      { factureId:  6, description: "Main d'œuvre curative — Remplacement module de commande",                    quantite: 2,   prixUnitaire: 65,     montant: 130.00 },
      { factureId:  6, description: 'Module de commande CF-900X',                                                 quantite: 1,   prixUnitaire: 150,    montant: 150.00 },
      // facture 7
      { factureId:  7, description: "Main d'œuvre — Recherche fuite et soudure circuit réfrigérant",              quantite: 2.5, prixUnitaire: 65,     montant: 162.50 },
      { factureId:  7, description: 'Gaz réfrigérant R410A (1.5 kg)',                                              quantite: 1,   prixUnitaire: 150,    montant: 150.00 },
      // facture 8
      { factureId:  8, description: "Main d'œuvre curative — 2h intervention urgent",                             quantite: 2,   prixUnitaire: 65,     montant: 130.00 },
      { factureId:  8, description: 'Ventilateur intérieur 18W',                                                  quantite: 1,   prixUnitaire: 80,     montant: 80.00 },
      { factureId:  8, description: 'Gaz R32 (0.8 kg)',                                                           quantite: 1,   prixUnitaire: 48.33,  montant: 48.33 },
      // facture 9
      { factureId:  9, description: 'Maintenance annuelle contrat CTR-006 — T1 2026',                             quantite: 1,   prixUnitaire: 750.00, montant: 750.00 },
      // facture 10
      { factureId: 10, description: 'Maintenance mensuelle contrat CTR-007 — Mai 2026 (2 équipements)',           quantite: 2,   prixUnitaire: 208.33, montant: 416.67 },
      // facture 11
      { factureId: 11, description: 'Maintenance Q3 2025 — Contrat CTR-001',                                      quantite: 1,   prixUnitaire: 520.83, montant: 520.83 },
    ],
  })
  console.log('  LigneFactures seeded (17)')

  console.log('\nSeed completed successfully.')
  console.log('  Users: 6 (2 admins, 4 technicians)')
  console.log('  Clients: 6')
  console.log('  Equipment: 17')
  console.log('  ClientEquipements: 17')
  console.log('  Contracts: 9 | ContractEquipements: 14')
  console.log('  Interventions: 28')
  console.log('  Pannes: 5 | PieceJointes: 2')
  console.log('  Factures: 11 | LigneFactures: 17')
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
