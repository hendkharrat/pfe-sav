# SAV Manager

**Application Web Full-Stack de Gestion du Service Après-Vente**

Plateforme de gestion complète d'un service après-vente spécialisé dans la maintenance de climatiseurs et de systèmes de surpression. L'application couvre la gestion des utilisateurs internes, des clients, du catalogue d'équipements, des affectations client-équipement, des contrats de maintenance, des interventions préventives et curatives, des pannes, des factures, de l'historique et du planning, avec des tableaux de bord différenciés selon le rôle de l'utilisateur.

Développée dans le cadre d'un **projet de fin d'études (PFE)**, elle repose sur une architecture trois couches : présentation React/Next.js, logique métier via routes API Next.js, et persistance MySQL via Prisma ORM.

---

## Contexte

Ce projet a été réalisé dans le cadre d'un **projet de fin d'études (PFE)**.

L'application est une **plateforme full-stack** : les données sont stockées dans une base MySQL et toutes les opérations CRUD passent par des routes API Next.js. La logique métier et la validation sont centralisées côté serveur. L'authentification est assurée par vérification du mot de passe (bcrypt) dans la route API, avec session stockée dans `localStorage`. Les données mockées restent présentes uniquement comme valeurs par défaut de secours dans certains composants et helpers — elles ne constituent plus la source de données principale.

---

## Stack technique

| Technologie | Version | Usage |
|---|---|---|
| Next.js | 16.2.6 | Framework React (App Router) — pages et routes API |
| React | 19 | Bibliothèque UI |
| TypeScript | 5.7.3 | Typage statique strict |
| Tailwind CSS | 4.x | Styles utilitaires |
| shadcn/ui | — | Composants UI (Radix UI + CVA) |
| lucide-react | 0.564 | Icônes |
| Recharts | 2.15 | Dépendance présente (scaffold `components/ui/chart.tsx`) — non utilisée activement, les dashboards affichent des cartes KPI (`StatCard`) plutôt que des graphiques |
| next-themes | 0.4.6 | Thème clair / sombre |
| Prisma ORM | 5.22.0 | Accès à la base de données |
| MySQL | — | Base de données relationnelle |
| bcrypt | — | Hachage des mots de passe |
| localStorage | — | Session d'authentification côté client |

> **Note :** ESLint n'est pas configuré. Vérification de types via `pnpm tsc --noEmit`.

---

## Architecture

L'application suit une **architecture trois couches** dans un seul projet Next.js :

| Couche | Technologie | Rôle |
|---|---|---|
| Présentation | React + composants Next.js | Pages, formulaires, dialogs, navigation |
| Logique métier | Routes API Next.js (`app/api/`) | Validation, règles métier, appels Prisma |
| Accès aux données | Prisma ORM + MySQL | Persistance relationnelle, migrations |

**Session** : après connexion réussie via `POST /api/auth/login`, un objet de session est stocké dans `localStorage` sous la clé `sav_session`. Il contient le rôle, l'identifiant numérique (`userId` ou `clientId`), l'email et le nom d'affichage — jamais le mot de passe.

**Identifiants techniques** : tous les IDs de la base de données sont des entiers auto-incrémentés (`Int @id @default(autoincrement())`). Les références métier lisibles (`INT-2026-001`, `FAC-2026-001`, `CTR-001`, `EQ-001`) restent des chaînes de caractères.

---

## Fonctionnalités principales

- Authentification par rôle (administrateur, technicien, client), par email **ou numéro de téléphone (8 chiffres, sans indicatif)**, avec vérification bcrypt.
- Tableaux de bord adaptés à chaque rôle avec KPIs et cartes statistiques.
- Gestion des utilisateurs internes (administrateur et technicien) avec désactivation/restauration de compte.
- Gestion des clients : société ou personne physique, sélection de ville tunisienne, affectation d'équipements.
- Catalogue d'équipements indépendant du client, avec images multiples (une image principale).
- Affectation des équipements du catalogue aux clients via une relation `ClientEquipement` (date d'achat, localisation facultative, date d'installation).
- Contrats de maintenance couvrant les équipements affectés, avec calcul automatique du statut (actif / bientôt expiré / expiré) et référence générée automatiquement.
- Génération et prévisualisation du planning préventif à la création d'un contrat (périodicité, dates, technicien) : le technicien choisi dans la prévisualisation est affecté aux interventions générées.
- Vérification de disponibilité des techniciens par date pour les interventions.
- Déclaration de pannes avec pièces jointes multiples (images conservées en base sous forme de data URL pour la prévisualisation, autres fichiers en métadonnées, sans stockage fichier réel), prise en charge et conversion en intervention curative.
- Interventions préventives et curatives sans champ de priorité, liste affichée par défaut du plus récent au plus ancien.
- Clôture d'intervention avec date de réalisation contrôlée : aujourd'hui ou date future.
- Génération de factures pour les interventions curatives réalisées et hors couverture contrat, avec TVA à 19 % (TND).
- Planning en vue hebdomadaire (1 semaine, 2 semaines) et mensuelle.
- Export CSV de l'historique.
- Thème clair / sombre.

---

## Fonctionnalités par rôle

### Administrateur

- **Dashboard global** : statistiques et KPIs affichés via des cartes (`StatCard`).
- **Utilisateurs** : CRUD des utilisateurs internes (administrateur et technicien). Un utilisateur désactivé reste visible avec une action **Restaurer**. Un utilisateur inactif ne peut pas se connecter.
- **Clients** : CRUD, société ou personne physique, ville sélectionnée depuis une liste de villes tunisiennes, affectation d'équipements via `ClientEquipement`.
- **Équipements** : catalogue global avec images multiples et image principale ; CRUD complet avec filtres. Affectation à un client directement depuis la fiche équipement (enregistrée dans `ClientEquipement`).
- **Contrats** : CRUD, couverture des installations `ClientEquipement` du client, prévisualisation du planning préventif, affectation de technicien avec détection de conflit de disponibilité.
- **Interventions** : CRUD, préventives et curatives, affectation de technicien avec vérification de disponibilité par date.
- **Planning** : vue hebdomadaire (1 semaine, 2 semaines) et mensuelle, filtres par type, statut et technicien.
- **Pannes** : gestion des signalements, prise en charge, conversion en intervention curative, annulation.
- **Factures** : génération pour les interventions curatives réalisées hors contrat, marquage comme payée.
- **Historique** : liste des interventions réalisées ou annulées avec statistiques et export CSV.

### Technicien

- **Dashboard personnel** : interventions assignées, taux de réalisation, planning de la semaine.
- **Mes interventions** : liste filtrée des interventions assignées. Démarrage et clôture d'interventions.
- **Planning** : vue de son propre planning.
- **Historique** : historique de ses interventions réalisées ou annulées.

### Client

- **Dashboard personnel** : équipements assignés, interventions en cours, pannes ouvertes, factures en attente.
- **Déclaration de panne** : signalement sur ses équipements affectés, avec pièces jointes (images prévisualisées, autres fichiers en métadonnées).
- **Mes pannes** : suivi des déclarations et de leur statut.
- **Mes interventions** : liste des interventions sur ses équipements.
- **Mes factures** : consultation des factures le concernant.
- **Historique** : historique des interventions réalisées sur ses équipements.

---

## Comptes de démonstration

La connexion accepte **l'email ou le numéro de téléphone** comme identifiant.

### Utilisateurs internes

| Rôle | Email | Téléphone | Mot de passe |
|---|---|---|---|
| Administrateur | `admin@sav.com` | `71100200` | `admin123` |
| Technicien 1 | `tech@sav.com` | `98200300` | `tech123` |
| Technicien 2 | `tech2@sav.com` | `98200301` | `tech123` |
| Technicien 3 | `tech3@sav.com` | `98200302` | `tech123` |

### Clients (portail client)

| Client | Email | Téléphone | Mot de passe |
|---|---|---|---|
| EDI Solutions Démo (société — **client principal de démo**) | `contact@edi-demo.tn` | `71345678` | `demo123` |
| Clinique El Amel (société) | `contact@clinique-demo.tn` | `71345679` | `demo123` |
| Sara Mejri (particulier) | `sara.mejri@demo.tn` | `55667788` | `demo123` |

> **Important** : avant la première connexion (ou après une réinitialisation de la base), vider le `localStorage` du navigateur (clé `sav_session`) pour supprimer toute ancienne session résiduelle. Si `pnpm exec prisma generate` reste bloqué sous Windows, arrêter le serveur de développement (`pnpm dev`) avant de relancer la commande — il peut verrouiller le client Prisma généré.

---

## Scénario de démonstration PFE

La base de démonstration est volontairement **minimale et centrée sur un seul client principal, EDI Solutions Démo** (société), pour un parcours de soutenance clair en six étapes :

1. **Contrat CTR-001 (ACTIF)** — connecté en administrateur, ouvrir le contrat de maintenance d'EDI Solutions Démo : il couvre les installations CE-1 (EQ-001) et CE-2 (EQ-002). CTR-002 (BIENTOT_EXPIRE) et CTR-003 (EXPIRE) illustrent les autres statuts de contrat dans la liste.
2. **Planning préventif** — les interventions `INT-2026-001` (02/07/2026) et `INT-2026-002` (02/10/2026) ont été générées automatiquement à la création de CTR-001 ; les retrouver dans le planning.
3. **Panne PAN-2026-001** — en tant que client (ou admin), ouvrir la panne `PAN-2026-001` (statut `EN_ATTENTE`) déclarée sur l'équipement hors contrat CE-3 (EQ-003).
4. **Prise en charge et conversion** — prendre en charge la panne puis la convertir en intervention curative. Dans la boîte de dialogue de conversion, choisir la date `02/07/2026` : le technicien Mohamed Trabelsi (`tech@sav.com`) apparaît **indisponible** ce jour-là (déjà affecté à `INT-2026-001`), démontrant la vérification de disponibilité.
5. **Facture FAC-2026-001** — dans la liste des factures, `FAC-2026-001` est déjà visible (liée à l'intervention curative historique `INT-2026-004`, statut payée).
6. **Génération d'une nouvelle facture** — `INT-2026-003` (curative, réalisée, hors contrat, sans facture) est éligible à la facturation : la générer depuis la liste des interventions ou des factures pour obtenir `FAC-2026-002`.

---

## Prérequis

- Node.js 18+
- pnpm
- MySQL en cours d'exécution en local (ex. XAMPP)
- Base de données `sav_manager` créée dans MySQL

---

## Variables d'environnement

Créer un fichier `.env` à la racine du projet :

```env
DATABASE_URL="mysql://root:@localhost:3306/sav_manager"
```

---

## Installation et démarrage

```powershell
# Installer les dépendances
pnpm install

# Générer le client Prisma
pnpm exec prisma generate

# Appliquer le schéma à la base de données
pnpm exec prisma db push

# Insérer les données de démonstration
pnpm exec prisma db seed

# Démarrer le serveur de développement
pnpm dev
```

L'application est accessible à l'adresse : [http://localhost:3000](http://localhost:3000)

### Réinitialisation complète (démo)

Pour remettre la base à zéro et réinsérer les données initiales :

```powershell
pnpm exec prisma db push --force-reset
pnpm exec prisma db seed
```

> **Attention** : `--force-reset` supprime toutes les données existantes.

---

## Commandes disponibles

```powershell
# Développement
pnpm dev

# Build de production
pnpm build

# Vérification TypeScript (sans émission)
pnpm tsc --noEmit

# Prisma — génération du client
pnpm exec prisma generate

# Prisma — appliquer le schéma sans migration
pnpm exec prisma db push

# Prisma — insérer les données de démonstration
pnpm exec prisma db seed

# Prisma — interface de navigation des données
pnpm exec prisma studio
```

> Toujours utiliser `pnpm exec prisma ...` — ne pas utiliser `pnpm dlx prisma ...`.

---

## Vérification

```powershell
pnpm exec prisma generate
pnpm tsc --noEmit
pnpm build
```

Les trois commandes doivent terminer sans erreur.

---

## Structure du projet

```
sav-manager-frontend-setup/
├── app/                        # Routes Next.js (App Router)
│   ├── api/                    # Routes API (logique métier + accès Prisma)
│   │   ├── auth/login/
│   │   ├── clients/
│   │   ├── equipements/
│   │   ├── client-equipements/
│   │   ├── contracts/
│   │   ├── interventions/
│   │   ├── pannes/
│   │   ├── factures/
│   │   ├── users/
│   │   ├── dashboard/
│   │   └── historique/
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
├── prisma/
│   ├── schema.prisma           # Schéma Prisma (modèles, relations, types)
│   └── seed.ts                 # Script d'initialisation des données de démonstration
├── data/                       # Données mockées (référence / valeurs de secours)
│   ├── mock-users.ts
│   ├── mock-clients.ts
│   ├── mock-equipments.ts
│   ├── mock-client-equipements.ts
│   ├── mock-contracts.ts
│   ├── mock-interventions.ts
│   ├── mock-pannes.ts
│   └── mock-invoices.ts
├── lib/                        # Utilitaires et logique métier
│   ├── prisma.ts               # Instance Prisma Client (singleton)
│   ├── auth.ts                 # Helpers de session localStorage
│   ├── interventions.ts        # Helpers métier : planning, couverture, disponibilité
│   ├── table.ts                # Tri et pagination des tableaux
│   ├── constants.ts            # Labels et constantes applicatives
│   └── utils.ts                # Fonctions utilitaires générales
├── hooks/                      # Hooks React personnalisés
│   └── useAuth.ts              # Lecture de la session, synthèse de l'utilisateur courant
└── types/                      # Définitions TypeScript
    └── index.ts
```

---

## Modèle de données

Tous les identifiants techniques sont des **entiers auto-incrémentés** (`INT AUTO_INCREMENT`). Les références lisibles (`INT-2026-001`, `FAC-2026-001`, etc.) sont des chaînes de caractères distinctes.

| Entité | Description |
|---|---|
| `User` | Utilisateur interne : administrateur ou technicien. Mot de passe haché bcrypt. |
| `Client` | Client métier : société ou personne physique (ville tunisienne). Mot de passe haché bcrypt pour le portail client. |
| `Equipment` | Équipement du catalogue global (climatiseur, surpression) |
| `EquipmentImage` | Image associée à un équipement (URL, indicateur image principale) |
| `ClientEquipement` | Affectation d'un équipement du catalogue à un client (date d'achat, localisation facultative, date d'installation) |
| `Contract` | Contrat de maintenance couvrant des installations `ClientEquipement` d'un client |
| `ContractEquipement` | Table de jonction entre un contrat et les `ClientEquipement` couverts |
| `Intervention` | Intervention préventive ou curative, sans champ de priorité |
| `Panne` | Déclaration de panne soumise par un client |
| `PieceJointe` | Pièce jointe associée à une panne : images en data URL base64 pour la prévisualisation, autres fichiers en métadonnées (pas de stockage fichier réel) |
| `Facture` | Facture générée pour une intervention curative réalisée hors contrat |
| `LigneFacture` | Ligne de détail d'une facture (main-d'œuvre, matériel) |

---

## Règles métier

- La session utilisateur est stockée dans `localStorage` sous la clé `sav_session`. Elle contient le rôle, l'identifiant numérique et le nom d'affichage. Elle ne contient jamais le mot de passe.
- La connexion est possible avec l'email **ou** le numéro de téléphone (8 chiffres).
- Les utilisateurs internes s'authentifient via la table `User` (rôles `ADMIN` / `TECHNICIAN`). Les clients s'authentifient via la table `Client`. Les mots de passe sont vérifiés côté serveur avec bcrypt.
- Un utilisateur interne inactif ne peut pas se connecter.
- La localisation d'un équipement chez le client (`ClientEquipement`) est facultative.
- Lors de l'affectation d'un équipement à un client, la date d'installation doit être égale ou postérieure à la date d'achat.
- La description d'une panne est obligatoire.
- Un **technicien** ne voit que les interventions qui lui sont assignées.
- Un **client** ne voit que ses propres données (équipements, interventions, pannes, factures).
- Les **interventions préventives** ne génèrent pas de factures.
- Les factures sont générées uniquement pour les interventions **curatives, réalisées et hors couverture contrat**.
- La monnaie utilisée est le **dinar tunisien (TND)** avec une TVA à **19 %**.
- Le statut d'un contrat (actif / bientôt expiré / expiré) est calculé dynamiquement à partir des dates.
- Un technicien ne peut pas être affecté à deux interventions à la même date (vérification de disponibilité côté API).
- La couverture d'une intervention par un contrat est vérifiée côté API lors de la création.
- Le planning préventif est généré automatiquement à la création d'un contrat selon les dates et la périodicité choisies.
- La conversion d'une panne en intervention curative crée une nouvelle intervention liée à la panne.
- Les numéros de téléphone sont stockés sur 8 chiffres, sans indicatif pays.
- La référence d'un contrat est générée automatiquement au format CTR-XXX.
- Lors de la génération du planning préventif, le technicien sélectionné est affecté aux interventions générées après vérification de disponibilité.
- La date de réalisation saisie lors de la clôture d'une intervention doit être égale ou postérieure à la date du jour.
- La liste des interventions est affichée par défaut avec les interventions les plus récentes en premier.

---

## Interface utilisateur

- **Langue** : entièrement en français.
- **Design** : style SaaS professionnel, thème clair/sombre via `next-themes`.
- **Responsive** : compatible desktop, tablette et mobile.
- **Navigation** : sidebar sur desktop, navigation mobile adaptée selon le rôle.
- **Dialogs** : détails et formulaires en modales centrées, responsives et sans débordement horizontal (notamment l'aperçu de génération de facture).
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
| Session localStorage | Pas de JWT ni de cookie HttpOnly ; la session est stockée côté client dans `localStorage` |
| Upload de fichiers | Simulé : les images de panne sont conservées en base sous forme de data URL pour la prévisualisation, tandis que les autres fichiers conservent leurs métadonnées ; aucun stockage fichier réel n'est mis en place |
| Données mockées résiduelles | Les fichiers `data/mock-*.ts` subsistent comme valeurs de secours dans certains composants et helpers — ils ne sont pas la source de données principale |
| Pas de déploiement production | Aucune configuration de déploiement (Dockerfile, CI/CD, variables d'environnement de production) |
| Pas de notifications | Aucun système d'emails ou de notifications push |
| Export CSV | Logique présente dans l'historique, export complet non finalisé |
| ESLint | Non configuré dans cette version |

---

## Note académique

Projet réalisé dans le cadre d'un **projet de fin d'études (PFE)**.

L'objectif est de démontrer la maîtrise du développement **full-stack** moderne avec Next.js, React, TypeScript et Prisma/MySQL, appliquée à un cas métier réel de gestion de service après-vente. L'architecture trois couches (présentation, logique métier, accès aux données) est entièrement implémentée au sein d'un seul projet Next.js App Router.
