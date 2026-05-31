# SAV Manager

**Application Web de Gestion du Service Après-Vente**

Plateforme frontend de démonstration pour la gestion complète d'un service après-vente spécialisé dans la maintenance de climatiseurs et de systèmes de surpression. L'application couvre la gestion des clients, des équipements, des contrats de maintenance, des interventions préventives et curatives, des déclarations de pannes, des factures et de l'historique, avec des tableaux de bord différenciés selon le rôle de l'utilisateur.

---

## Contexte

Ce projet a été réalisé dans le cadre d'un **projet de fin d'études (PFE)**.

Il s'agit d'une application **frontend de démonstration** : toutes les données sont simulées via des fichiers de données mockées. Il n'existe aucune API, aucun backend et aucune base de données réelle. L'authentification est simulée en `localStorage`. Les opérations CRUD sont gérées dans l'état local React et se réinitialisent au rechargement de la page.

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
| localStorage | — | Session d'authentification simulée |

---

## Fonctionnalités par rôle

### Administrateur

- **Dashboard global** : statistiques, KPIs, graphiques d'activité par mois et par type
- **Utilisateurs** : CRUD complet, gestion des rôles et des statuts actif/inactif
- **Clients** : CRUD, fiche détaillée, vue des équipements associés
- **Équipements** : CRUD, filtres par type/client/statut, détail avec couverture contrat
- **Contrats** : CRUD, suivi des dates et périodicités, statut calculé (actif / bientôt expiré / expiré)
- **Interventions** : CRUD complet, affectation de technicien, changement de statut, clôture
- **Planning** : vue hebdomadaire (1 semaine, 2 semaines) et mensuelle, filtres par type/statut/technicien
- **Pannes** : gestion des signalements clients, prise en charge, conversion en intervention curative, annulation
- **Factures** : génération de factures, marquage comme payée, filtres, détail complet
- **Historique** : liste des interventions réalisées ou annulées, export CSV simulé, statistiques

### Technicien

- **Dashboard personnel** : interventions assignées, taux de réalisation, planning de la semaine
- **Mes interventions** : liste filtrée des interventions assignées, démarrage et clôture
- **Planning** : vue de son propre planning (1 semaine, 2 semaines, mois)
- **Historique** : historique de ses propres interventions réalisées/annulées

### Client

- **Espace personnel** : tableau de bord de ses équipements et interventions en cours
- **Déclaration de panne** : formulaire de signalement sur ses équipements
- **Mes pannes** : suivi des déclarations de pannes et de leur statut
- **Mes interventions** : liste des interventions planifiées sur ses équipements
- **Mes factures** : consultation des factures le concernant
- **Historique** : historique des interventions réalisées sur ses équipements

---

## Comptes de démonstration

| Rôle | Email | Mot de passe |
|---|---|---|
| Administrateur | `admin@sav.com` | `admin123` |
| Technicien | `tech@sav.com` | `tech123` |
| Client | `client@sav.com` | `client123` |

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

# Linting
npm run lint
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
│   ├── layout/                 # AppLayout, Sidebar, navigation
│   ├── shared/                 # Composants réutilisables (badges, dialogs, tableaux)
│   ├── forms/                  # Formulaires métier (interventions, contrats, etc.)
│   ├── dashboard/              # Composants spécifiques aux dashboards
│   └── ui/                     # Composants shadcn/ui
├── data/                       # Données mockées (JSON-like)
│   ├── mock-users.ts
│   ├── mock-clients.ts
│   ├── mock-equipments.ts
│   ├── mock-contracts.ts
│   ├── mock-interventions.ts
│   ├── mock-pannes.ts
│   └── mock-invoices.ts
├── lib/                        # Utilitaires et logique métier
│   ├── auth.ts                 # Authentification simulée (localStorage)
│   ├── interventions.ts        # Helpers métier interventions/planning
│   ├── table.ts                # Tri et pagination des tableaux
│   ├── constants.ts            # Labels, constantes applicatives
│   └── utils.ts                # Fonctions utilitaires générales
├── hooks/                      # Hooks React personnalisés
│   ├── useAuth.ts
│   └── useToast.ts
└── types/                      # Définitions TypeScript
    └── index.ts
```

---

## Modèle de données

| Entité | Description |
|---|---|
| `User` | Utilisateur de l'application (admin, technicien, client) |
| `Client` | Société cliente avec contacts et équipements |
| `Equipment` | Équipement (climatiseur ou système de surpression) appartenant à un client |
| `Contract` | Contrat de maintenance liant un client à ses équipements |
| `Intervention` | Intervention préventive ou curative planifiée ou réalisée |
| `Panne` | Déclaration de panne soumise par un client |
| `Invoice` | Facture générée pour une intervention curative hors contrat |

---

## Règles métier

- L'application est **entièrement frontend** : aucune persistance réelle des données.
- Les opérations CRUD modifient l'état local React et sont perdues au rechargement.
- La session utilisateur est stockée dans `localStorage` sous la clé `sav_session`.
- Un **technicien** ne voit que les interventions qui lui sont assignées.
- Un **client** ne voit que ses propres données (équipements, interventions, pannes, factures).
- Les **interventions préventives** ne génèrent pas de factures.
- Les factures ne sont générées que pour les interventions **curatives, réalisées et hors couverture contrat**.
- La monnaie utilisée est le **dinar tunisien (TND)** avec une TVA à **19%**.
- Le statut d'un contrat (actif / bientôt expiré / expiré) est calculé dynamiquement à partir des dates.
- Un technicien ne peut pas être affecté à deux interventions à la même date.

---

## Interface utilisateur

- **Langue** : entièrement en français.
- **Design** : style SaaS professionnel, thème clair/sombre supporté.
- **Responsive** : compatible desktop, tablette et mobile.
- **Navigation** : sidebar sur desktop, navigation mobile adaptée selon le rôle.
- **Dialogs** : les détails et formulaires s'ouvrent en modales centrées (aucun Sheet/Drawer pour les formulaires métier).
- **Tableaux** : pagination et colonnes triables sur toutes les pages de listes.
- **Planning** : vue hebdomadaire (1 semaine, 2 semaines) et vue mensuelle avec grille calendrier.

---

## Parcours de démonstration

### Administrateur

```
Connexion → Dashboard → Clients → Équipements → Contrats
→ Interventions → Planning → Pannes → Factures → Historique
```

### Technicien

```
Connexion → Dashboard → Mes interventions → Démarrer/Clôturer
→ Planning → Historique
```

### Client

```
Connexion → Dashboard → Déclaration de panne → Mes pannes
→ Mes factures → Historique
```

---

## Limitations connues

| Limitation | Détail |
|---|---|
| Pas de backend | Aucune API REST ou GraphQL ; données simulées en mémoire |
| Pas de persistance | Les modifications sont perdues au rechargement de la page |
| Upload de fichiers | Simulé (nom de fichier enregistré, aucun fichier réellement stocké) |
| Export PDF | Fonctionnalité simulée, aucun fichier généré |
| Export CSV | Logique présente, export réel désactivé en démonstration |
| Authentification | Simplifiée via `localStorage`, sans JWT ni session serveur |

---

## Note académique

Projet réalisé dans le cadre d'un **projet de fin d'études (PFE)**.

L'objectif est de démontrer la maîtrise du développement frontend moderne avec Next.js, React, TypeScript et une architecture de composants professionnelle, appliquée à un cas métier réel de gestion de service après-vente.
