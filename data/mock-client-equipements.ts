import { ClientEquipement } from '@/types';

/**
 * Join records linking Equipment catalog entries to specific client installations.
 * Derived from the original Equipment.clientId / localisation / dateInstallation data.
 *
 * ID convention: ce-{N} where N matches the equipment number (eq-N → ce-N).
 */
export const mockClientEquipements: ClientEquipement[] = [
  // client-1 (EDI Solutions) — eq-1
  {
    id: 'ce-1',
    clientId: 'client-1',
    equipementId: 'eq-1',
    dateAchat: '2023-06-01',
    localisation: 'Bureau Étage 2',
    dateInstallation: '2023-06-15',
  },
  // client-1 (EDI Solutions) — eq-2
  {
    id: 'ce-2',
    clientId: 'client-1',
    equipementId: 'eq-2',
    dateAchat: '2023-08-10',
    localisation: 'Sécurité',
    dateInstallation: '2023-08-20',
  },
  // client-2 (Résidence Les Berges du Lac) — eq-3
  {
    id: 'ce-3',
    clientId: 'client-2',
    equipementId: 'eq-3',
    dateAchat: '2022-10-20',
    localisation: 'Halls Communs',
    dateInstallation: '2022-11-01',
  },
  // client-3 (Ahmed Ben Salah) — eq-4
  {
    id: 'ce-4',
    clientId: 'client-3',
    equipementId: 'eq-4',
    dateAchat: '2023-03-01',
    localisation: 'Résidentielle',
    dateInstallation: '2023-03-10',
  },
  // client-1 (EDI Solutions) — eq-5
  {
    id: 'ce-5',
    clientId: 'client-1',
    equipementId: 'eq-5',
    dateAchat: '2023-09-01',
    localisation: 'Salle de Réunion',
    dateInstallation: '2023-09-10',
  },
  // client-1 (EDI Solutions) — eq-6
  {
    id: 'ce-6',
    clientId: 'client-1',
    equipementId: 'eq-6',
    dateAchat: '2023-10-25',
    localisation: 'Chaufferie Sous-Sol',
    dateInstallation: '2023-11-05',
  },
  // client-1 (EDI Solutions) — eq-7
  {
    id: 'ce-7',
    clientId: 'client-1',
    equipementId: 'eq-7',
    dateAchat: '2022-07-10',
    localisation: 'Atelier de Production',
    dateInstallation: '2022-07-20',
  },
  // client-2 (Résidence Les Berges du Lac) — eq-8
  {
    id: 'ce-8',
    clientId: 'client-2',
    equipementId: 'eq-8',
    dateAchat: '2024-01-05',
    localisation: 'Bureaux Administratifs',
    dateInstallation: '2024-01-15',
  },
  // client-2 (Résidence Les Berges du Lac) — eq-9
  {
    id: 'ce-9',
    clientId: 'client-2',
    equipementId: 'eq-9',
    dateAchat: '2023-04-08',
    localisation: 'Local Technique RDC',
    dateInstallation: '2023-04-18',
  },
  // client-3 (Ahmed Ben Salah) — eq-10
  {
    id: 'ce-10',
    clientId: 'client-3',
    equipementId: 'eq-10',
    dateAchat: '2024-02-20',
    localisation: 'Cave Technique',
    dateInstallation: '2024-02-28',
  },
  // client-3 (Ahmed Ben Salah) — eq-11
  {
    id: 'ce-11',
    clientId: 'client-3',
    equipementId: 'eq-11',
    dateAchat: '2024-02-25',
    localisation: 'Chambre Principale',
    dateInstallation: '2024-03-05',
  },
  // client-4 (Groupe Sahel Industrie) — eq-12
  {
    id: 'ce-12',
    clientId: 'client-4',
    equipementId: 'eq-12',
    dateAchat: '2024-02-01',
    localisation: 'Open Space Étage 1',
    dateInstallation: '2024-02-10',
  },
  // client-4 (Groupe Sahel Industrie) — eq-13
  {
    id: 'ce-13',
    clientId: 'client-4',
    equipementId: 'eq-13',
    dateAchat: '2024-02-05',
    localisation: 'Local Technique Sous-Sol',
    dateInstallation: '2024-02-15',
  },
  // client-5 (Hôtel Les Jasmins Hammamet) — eq-14
  {
    id: 'ce-14',
    clientId: 'client-5',
    equipementId: 'eq-14',
    dateAchat: '2023-05-02',
    localisation: 'Hall de Réception',
    dateInstallation: '2023-05-12',
  },
  // client-5 (Hôtel Les Jasmins Hammamet) — eq-15
  {
    id: 'ce-15',
    clientId: 'client-5',
    equipementId: 'eq-15',
    dateAchat: '2023-06-10',
    localisation: 'Local Technique Piscine',
    dateInstallation: '2023-06-20',
  },
  // client-6 (Centre Médical Ibn Sina) — eq-16
  {
    id: 'ce-16',
    clientId: 'client-6',
    equipementId: 'eq-16',
    dateAchat: '2024-03-01',
    localisation: 'Bloc Consultation A',
    dateInstallation: '2024-03-10',
  },
  // client-6 (Centre Médical Ibn Sina) — eq-17
  {
    id: 'ce-17',
    clientId: 'client-6',
    equipementId: 'eq-17',
    dateAchat: '2024-03-05',
    localisation: 'Chaufferie Bloc B',
    dateInstallation: '2024-03-15',
  },
];
