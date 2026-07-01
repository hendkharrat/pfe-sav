import {
  PrismaClient,
  UserRole,
  EquipmentType,
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
  const [h_admin, h_tech] = await Promise.all([
    bcrypt.hash('admin123', 10),
    bcrypt.hash('tech123', 10),
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

  // --- 2. Equipment (global catalog) ---
  await prisma.equipment.createMany({
    data: [
      { id: 1, reference: 'EQ-001', type: EquipmentType.CLIMATISEUR,        marque: 'Daikin',     modele: 'FTXC35B',  numeroSerie: 'DAI-DEMO-001', description: 'Climatiseur split mural' },
      { id: 2, reference: 'EQ-002', type: EquipmentType.SYSTEME_SURPRESSION, marque: 'Grundfos',   modele: 'CM3-5',    numeroSerie: 'GRU-DEMO-001', description: 'Système de surpression compact' },
      { id: 3, reference: 'EQ-003', type: EquipmentType.SYSTEME_SURPRESSION, marque: 'Wilo',       modele: 'Stratos',  numeroSerie: 'WIL-DEMO-001', description: 'Système de surpression' },
      { id: 4, reference: 'EQ-004', type: EquipmentType.CLIMATISEUR,        marque: 'Mitsubishi', modele: 'MSZ-LN35', numeroSerie: 'MIT-DEMO-001', description: 'Climatiseur split mural' },
      { id: 5, reference: 'EQ-005', type: EquipmentType.CLIMATISEUR,        marque: 'Samsung',    modele: 'AR12',     numeroSerie: 'SAM-DEMO-001', description: 'Climatiseur split mural' },
    ],
  })
  console.log('  Equipment seeded (5)')

  console.log('\nSeed completed successfully.')
  console.log('  Users: 4 (1 admin + 3 technicians)')
  console.log('  Equipment: 5 (EQ-001 → EQ-005)')
  console.log('  ──────────────────────────────────────────────────────────────────')
  console.log('  ACCOUNTS:')
  console.log('    Admin:    admin@sav.com  / admin123')
  console.log('    Tech 1:   tech@sav.com   / tech123')
  console.log('    Tech 2:   tech2@sav.com  / tech123')
  console.log('    Tech 3:   tech3@sav.com  / tech123')
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
