# SAV Manager

**Application Web de Gestion du Service Après-Vente**

Plateforme frontend de démonstration pour la gestion complète d'un service après-vente spécialisé dans la maintenance de climatiseurs et de systèmes de surpression. L'application couvre la gestion des utilisateurs internes, des clients, du catalogue d'équipements, des affectations client-équipement, des contrats de maintenance, des interventions préventives et curatives, des pannes, des factures, de l'historique et du planning, avec des tableaux de bord différenciés selon le rôle de l'utilisateur.

---

## Contexte

Ce projet a été réalisé dans le cadre d'un **projet de fin d'études (PFE)**.

Il s'agit d'une application **frontend de démonstration** : toutes les données sont simulées via des fichiers de données mockées. Il n'existe aucune API, aucun backend et aucune base de données réelle. L'authentification est simulée via `localStorage`. Les opérations CRUD sont gérées dans l'état local React et se réinitialisent au rechargement de la page.

---

## Stack technique

| Technologie | Version | Usage |
|---|---|---|
| Next.js | 16.2.6 | Framework React (App Router) |
| React | 19 | Bibliothèque UI |
| TypeScript | 5.7.3 | Typage statique strict |
| Tailwind CSS | 4.x | Styles utilitaires |
| shadcn/ui | — | Composants UI (Radix UI + CVA) |
| lucide-react | 0.564 | Icônes |
| Recharts | 2.15 | Graphiques des dashboards |
| next-themes | 0.4.6 | Thème clair / sombre |
| localStorage | — | Session d'authentification simulée |

> **Note :** ESLint n'est pas configuré dans cette version de démonstration. Le script `npm run lint` a été retiré.

---

## Fonctionnalités principales

- Authentification simulée par rôle (administrateur, technicien, client), par email **ou numéro de téléphone (8 chiffres, sans indicatif)**.
- Tableaux de bord adaptés à chaque rôle avec KPIs et graphiques.
- Gestion des utilisateurs internes (administrateur et technicien), avec numéro de téléphone.
- Gestion des clients : société ou personne physique, sélection de ville tunisienne, affectation d'équipements.
- Catalogue d'équipements indépendant du client, avec images multiples (une image principale).
- Affectation des équipements du catalogue aux clients via une relation `ClientEquipement` (date d'achat, localisation, date d'installation). La localisation est facultative.
- Contrats de maintenance couvrant les équipements affectés, avec calcul automatique du statut (actif / bientôt expiré / expiré).
- Génération et prévisualisation du planning préventif lors de la création d'un contrat (périodicité, dates, technicien).
- Vérification de disponibilité des techniciens par date pour les interventions.
- Déclaration de pannes avec pièces jointes multiples (simulées) et conversion en intervention curative.
- Interventions préventives et curatives sans champ de priorité.
- Génération de factures pour les interventions curatives réalisées et hors couverture contrat, avec chargement d'un exemple automatique.
- Planning en vue hebdomadaire (1 semaine, 2 semaines) et mensuelle.
- Thème clair / sombre.

---

## Fonctionnalités par rôle

### Administrateur

- **Dashboard global** : statistiques, KPIs, graphiques d'activité par mois et par type.
- **Utilisateurs** : CRUD des utilisateurs internes (administrateur et technicien). Les comptes clients ne sont pas gérés ici. Un utilisateur désactivé reste visible dans la liste avec une action **Restaurer** permettant de réactiver son accès.
- **Clients** : CRUD, société ou personne physique, ville sélectionnée depuis une liste de villes tunisiennes, affectation d'équipements du catalogue via `ClientEquipement`. Chaque client dispose d'un mot de passe pour l'accès au portail client. La localisation chez le client est facultative.
- **Équipements** : catalogue global sans champ client ni statut ; images multiples avec une image principale ; CRUD complet avec filtres par type et marque. La fiche équipement permet d'affecter l'équipement à un client directement depuis le module Équipements, sans modifier le catalogue (l'affectation est enregistrée dans `ClientEquipement`).
- **Contrats** : CRUD, couverture des installations `ClientEquipement` du client, prévisualisation du planning préventif généré par dates et périodicité, affectation de technicien avec détection de conflit de disponibilité.
- **Interventions** : CRUD, préventives et curatives, sans priorité, affectation de technicien avec vérification de disponibilité par date.
- **Planning** : vue hebdomadaire (1 semaine, 2 semaines) et mensuelle, filtres par type, statut et technicien.
- **Pannes** : gestion des signalements, prise en charge, conversion en intervention curative, annulation ; sans champ de priorité.
- **Factures** : génération pour les interventions curatives réalisées hors contrat, chargement automatique d'un exemple, marquage comme payée.
- **Historique** : liste des interventions réalisées ou annulées, statistiques.

### Technicien

- **Dashboard personnel** : interventions assignées, taux de réalisation, planning de la semaine.
- **Mes interventions** : liste filtrée des interventions assignées, sans colonne technicien ni filtre technicien. Démarrage et clôture d'interventions.
- **Planning** : vue de son propre planning.
- **Historique** : historique de ses interventions réalisées ou annulées.

### Client

- **Dashboard personnel** : équipements assignés, interventions en cours, pannes ouvertes, factures en attente.
- **Déclaration de panne** : signalement sur ses équipements affectés, sans champ de priorité, avec pièces jointes simulées multiples.
- **Mes pannes** : suivi des déclarations et de leur statut.
- **Mes interventions** : liste des interventions sur ses équipements, sans colonne client.
- **Mes factures** : consultation des factures le concernant.
- **Historique** : historique des interventions réalisées sur ses équipements.

---

## Comptes de démonstration

La connexion accepte **l'email ou le numéro de téléphone** comme identifiant.

### Utilisateurs internes

| Rôle | Email | Téléphone | Mot de passe |
|---|---|---|---|
| Administrateur | `admin@sav.com` | `71100200` | `admin123` |
| Technicien | `tech@sav.com` | `98200300` | `tech123` |

### Clients (portail client)

Les clients s'authentifient directement depuis leurs enregistrements dans le module **Clients**.

| Client | Email | Téléphone | Mot de passe |
|---|---|---|---|
| Ahmed Ben Salah (particulier) | `ahmed.bensalah@mail.tn` | `98765432` | `ahmed123` |
| EDI Solutions (société) | `contact@edi-solutions.tn` | `71345678` | `edi123` |
| Centre Médical Ibn Sina (société) | `maintenance@ibnsina.tn` | `71234567` | `ibnsina123` |

---

## Installation et démarrage

**Prérequis** : Node.js 18+ et npm.

```bash
# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm run dev
```

L'application est accessible à l'adresse : [http://localhost:3000](http://localhost:3000)

---

## Commandes disponibles

```bash
# Développement
npm run dev

# Build de production
npm run build

# Vérification TypeScript (sans émission)
npx tsc --noEmit
```

---

## Structure du projet

```
sav-manager-frontend-setup/
├── app/                        # Routes Next.js (App Router)
│   ├── dashboard/
│   ├── utilisateurs/
│   ├── clients/
│   ├── equipements/
│   ├── contrats/
│   ├── interventions/
│   │   └── planning/
│   ├── pannes/
│   ├── factures/
│   ├── historique/
│   └── login/
├── components/
│   ├── layout/                 # AppLayout, AppHeader, navigation
│   ├── shared/                 # Composants réutilisables (badges, dialogs, tableaux)
│   ├── forms/                  # Formulaires métier (clients, contrats, interventions…)
│   ├── dashboard/              # Composants spécifiques aux dashboards
│   └── ui/                     # Composants shadcn/ui
├── data/                       # Données mockées
│   ├── mock-users.ts
│   ├── mock-clients.ts
│   ├── mock-equipments.ts
│   ├── mock-client-equipements.ts
│   ├── mock-contracts.ts
│   ├── mock-interventions.ts
│   ├── mock-pannes.ts
│   └── mock-invoices.ts
├── lib/                        # Utilitaires et logique métier
│   ├── auth.ts                 # Authentification simulée (localStorage)
│   ├── interventions.ts        # Helpers métier interventions/planning/contrats
│   ├── table.ts                # Tri et pagination des tableaux
│   ├── constants.ts            # Labels et constantes applicatives
│   └── utils.ts                # Fonctions utilitaires générales
├── hooks/                      # Hooks React personnalisés
│   └── useAuth.ts
└── types/                      # Définitions TypeScript
    └── index.ts
```

---

## Modèle de données

| Entité | Description |
|---|---|
| `User` | Utilisateur interne : administrateur ou technicien |
| `Client` | Client métier : société ou personne physique (ville tunisienne). Dispose d'un mot de passe pour le portail client. |
| `Equipment` | Équipement du catalogue global (climatiseur, surpression) avec images multiples |
| `EquipmentImage` | Image associée à un équipement (nom de fichier, URL de prévisualisation, indicateur image principale) |
| `ClientEquipement` | Affectation d'un équipement du catalogue à un client (date d'achat, localisation facultative, date d'installation). Peut être créée depuis le module Client ou depuis la fiche équipement du module Équipements. |
| `Contract` | Contrat de maintenance couvrant des installations `ClientEquipement` d'un client |
| `Intervention` | Intervention préventive ou curative, sans priorité |
| `Panne` | Déclaration de panne soumise par un client, sans priorité |
| `PieceJointe` | Pièce jointe simulée associée à une panne |
| `Invoice` | Facture générée pour une intervention curative réalisée hors contrat |
| `LigneFacture` | Ligne de détail d'une facture (main-d'œuvre, matériel) |

---

## Règles métier

- L'application est **entièrement frontend** : aucune persistance réelle des données.
- Les opérations CRUD modifient l'état local React et sont perdues au rechargement.
- La session utilisateur est stockée dans `localStorage` sous la clé `sav_session`. Elle contient rôle, identifiant et nom d'affichage (pas de mot de passe).
- La connexion est possible avec l'email **ou** le numéro de téléphone.
- Les utilisateurs internes s'authentifient depuis `mock-users.ts` ; les clients depuis `mock-clients.ts`.
- La localisation d'un équipement chez le client est facultative.
- La description d'une panne est obligatoire mais sans longueur minimale.
- Un **technicien** ne voit que les interventions qui lui sont assignées.
- Un **client** ne voit que ses propres données (équipements affectés, interventions, pannes, factures).
- Les **interventions préventives** ne génèrent pas de factures.
- Les factures sont générées uniquement pour les interventions **curatives, réalisées et hors couverture contrat**.
- La monnaie utilisée est le **dinar tunisien (TND)** avec une TVA à **19 %**.
- Le statut d'un contrat (actif / bientôt expiré / expiré) est calculé dynamiquement à partir des dates.
- Un technicien ne peut pas être affecté à deux interventions à la même date (vérification de disponibilité).
- Lors de la création d'une intervention curative depuis une panne, la date prévue doit être sélectionnée avant de pouvoir choisir un technicien. Les techniciens indisponibles à la date choisie sont signalés et ne peuvent pas être sélectionnés.
- Les numéros de téléphone sont stockés sur 8 chiffres, sans indicatif pays.
- Le planning préventif est généré automatiquement à la création d'un contrat selon les dates et la périodicité choisies.

---

## Interface utilisateur

- **Langue** : entièrement en français.
- **Design** : style SaaS professionnel, thème clair/sombre via `next-themes`.
- **Responsive** : compatible desktop, tablette et mobile.
- **Navigation** : sidebar sur desktop, navigation mobile adaptée selon le rôle.
- **Dialogs** : détails et formulaires en modales centrées (aucun Sheet/Drawer pour les formulaires métier).
- **Tableaux** : pagination et colonnes triables sur toutes les pages de listes.
- **Planning** : vue hebdomadaire (1 semaine, 2 semaines) et vue mensuelle avec grille calendrier.

---

## Parcours de démonstration

### Administrateur

```
Connexion → Dashboard → Clients (créer client + affecter équipement)
→ Contrats (créer contrat + voir planning préventif généré)
→ Interventions → Planning → Pannes → Factures (générer + marquer payée)
→ Historique
```

### Technicien

```
Connexion → Dashboard → Mes interventions → Démarrer / Clôturer
→ Planning → Historique
```

### Client

```
Connexion → Dashboard → Déclaration de panne (avec pièces jointes)
→ Mes pannes → Mes interventions → Mes factures → Historique
```

---

## Limitations connues

| Limitation | Détail |
|---|---|
| Pas de backend | Aucune API REST ou GraphQL ; données simulées en mémoire |
| Pas de persistance | Les modifications sont perdues au rechargement de la page |
| État local par page | Chaque page gère son propre état `clientEquipements`. Une affectation créée depuis la page Équipements n'est pas visible en temps réel dans la page Clients, et vice-versa. Les deux vues se resynchronisent au rechargement. |
| Upload de fichiers | Simulé (nom de fichier enregistré, aucun fichier réellement stocké) |
| Export CSV | Logique présente, export réel non implémenté en démonstration |
| Authentification | Simplifiée via `localStorage`, sans JWT ni session serveur |
| ESLint | Non configuré dans cette version de démonstration |

---

## Note académique

Projet réalisé dans le cadre d'un **projet de fin d'études (PFE)**.

L'objectif est de démontrer la maîtrise du développement frontend moderne avec Next.js, React, TypeScript et une architecture de composants professionnelle, appliquée à un cas métier réel de gestion de service après-vente.
