import { ClientEquipement } from '@/types';

/**
 * Join records linking Equipment catalog entries to specific client installations.
 * Derived from the original Equipment.clientId / localisation / dateInstallation data.
 *
 * ID convention: ce-{N} where N matches the equipment number (eq-N → ce-N).
 */
export const mockClientEquipements: ClientEquipement[] = [
  // client 1 (EDI Solutions) — eq 1
  {
    id: 1,
    clientId: 1,
    equipementId: 1,
    dateAchat: '2023-06-01',
    localisation: 'Bureau Étage 2',
    dateInstallation: '2023-06-15',
  },
  // client 1 (EDI Solutions) — eq 2
  {
    id: 2,
    clientId: 1,
    equipementId: 2,
    dateAchat: '2023-08-10',
    localisation: 'Sécurité',
    dateInstallation: '2023-08-20',
  },
  // client 2 (Résidence Les Berges du Lac) — eq 3
  {
    id: 3,
    clientId: 2,
    equipementId: 3,
    dateAchat: '2022-10-20',
    localisation: 'Halls Communs',
    dateInstallation: '2022-11-01',
  },
  // client 3 (Ahmed Ben Salah) — eq 4
  {
    id: 4,
    clientId: 3,
    equipementId: 4,
    dateAchat: '2023-03-01',
    localisation: 'Résidentielle',
    dateInstallation: '2023-03-10',
  },
  // client 1 (EDI Solutions) — eq 5
  {
    id: 5,
    clientId: 1,
    equipementId: 5,
    dateAchat: '2023-09-01',
    localisation: 'Salle de Réunion',
    dateInstallation: '2023-09-10',
  },
  // client 1 (EDI Solutions) — eq 6
  {
    id: 6,
    clientId: 1,
    equipementId: 6,
    dateAchat: '2023-10-25',
    localisation: 'Chaufferie Sous-Sol',
    dateInstallation: '2023-11-05',
  },
  // client 1 (EDI Solutions) — eq 7
  {
    id: 7,
    clientId: 1,
    equipementId: 7,
    dateAchat: '2022-07-10',
    localisation: 'Atelier de Production',
    dateInstallation: '2022-07-20',
  },
  // client 2 (Résidence Les Berges du Lac) — eq 8
  {
    id: 8,
    clientId: 2,
    equipementId: 8,
    dateAchat: '2024-01-05',
    localisation: 'Bureaux Administratifs',
    dateInstallation: '2024-01-15',
  },
  // client 2 (Résidence Les Berges du Lac) — eq 9
  {
    id: 9,
    clientId: 2,
    equipementId: 9,
    dateAchat: '2023-04-08',
    localisation: 'Local Technique RDC',
    dateInstallation: '2023-04-18',
  },
  // client 3 (Ahmed Ben Salah) — eq 10
  {
    id: 10,
    clientId: 3,
    equipementId: 10,
    dateAchat: '2024-02-20',
    localisation: 'Cave Technique',
    dateInstallation: '2024-02-28',
  },
  // client 3 (Ahmed Ben Salah) — eq 11
  {
    id: 11,
    clientId: 3,
    equipementId: 11,
    dateAchat: '2024-02-25',
    localisation: 'Chambre Principale',
    dateInstallation: '2024-03-05',
  },
  // client 4 (Groupe Sahel Industrie) — eq 12
  {
    id: 12,
    clientId: 4,
    equipementId: 12,
    dateAchat: '2024-02-01',
    localisation: 'Open Space Étage 1',
    dateInstallation: '2024-02-10',
  },
  // client 4 (Groupe Sahel Industrie) — eq 13
  {
    id: 13,
    clientId: 4,
    equipementId: 13,
    dateAchat: '2024-02-05',
    localisation: 'Local Technique Sous-Sol',
    dateInstallation: '2024-02-15',
  },
  // client 5 (Hôtel Les Jasmins Hammamet) — eq 14
  {
    id: 14,
    clientId: 5,
    equipementId: 14,
    dateAchat: '2023-05-02',
    localisation: 'Hall de Réception',
    dateInstallation: '2023-05-12',
  },
  // client 5 (Hôtel Les Jasmins Hammamet) — eq 15
  {
    id: 15,
    clientId: 5,
    equipementId: 15,
    dateAchat: '2023-06-10',
    localisation: 'Local Technique Piscine',
    dateInstallation: '2023-06-20',
  },
  // client 6 (Centre Médical Ibn Sina) — eq 16
  {
    id: 16,
    clientId: 6,
    equipementId: 16,
    dateAchat: '2024-03-01',
    localisation: 'Bloc Consultation A',
    dateInstallation: '2024-03-10',
  },
  // client 6 (Centre Médical Ibn Sina) — eq 17
  {
    id: 17,
    clientId: 6,
    equipementId: 17,
    dateAchat: '2024-03-05',
    localisation: 'Chaufferie Bloc B',
    dateInstallation: '2024-03-15',
  },
];
