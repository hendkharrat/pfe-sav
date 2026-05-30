# Spécification Frontend — Application Web de Gestion SAV

> **Document de référence** pour la génération automatique via v0, Lovable ou Bolt.
> Projet de fin d'études — Application web de gestion du service après-vente (SAV)
> pour la maintenance des climatiseurs et systèmes de surpression.

---

## 1. Présentation générale

L'application **SAV Manager** est une plateforme web de gestion du service après-vente destinée à une entreprise spécialisée dans l'installation et la maintenance de climatiseurs et de systèmes de surpression.

### Objectifs principaux

- **Centralisation des données** : regrouper toutes les informations clients, équipements, contrats et interventions au même endroit.
- **Automatisation de la planification** : générer automatiquement le planning des interventions préventives selon la périodicité des contrats de maintenance.
- **Suivi des interventions** : gérer le cycle de vie complet des interventions préventives (maintenance planifiée) et curatives (pannes déclarées).
- **Gestion de la facturation** : générer et consulter les factures pour les interventions hors contrat.
- **Tableau de bord de pilotage** : offrir une vue synthétique des indicateurs clés de l'activité SAV.

### Contexte métier

| Entité | Description |
|---|---|
| Clients | Entreprises ou particuliers ayant souscrit un contrat ou fait appel au SAV |
| Équipements | Climatiseurs ou systèmes de surpression installés chez les clients |
| Contrats | Accords de maintenance définissant la fréquence des visites préventives |
| Interventions préventives | Visites de maintenance planifiées selon le contrat |
| Interventions curatives | Dépannages suite à une panne déclarée par le client |
| Factures | Générées uniquement pour les interventions hors contrat |

---

## 2. Objectifs du frontend

### Expérience utilisateur (UX)

- Interface **simple et intuitive**, accessible sans formation longue
- **Navigation fluide** avec retour visuel immédiat sur chaque action
- **Séparation claire des rôles** : chaque utilisateur voit uniquement ce qui lui est accessible
- **Visualisation rapide** des données importantes via cards KPI et graphiques
- **Gestion efficace** des opérations SAV : création, modification, validation en quelques clics
- **Feedback utilisateur** : messages de succès, d'erreur et de confirmation sur toutes les actions

### Interface utilisateur (UI)

- Design **professionnel de type SaaS** (inspiré de Vercel, Linear, Notion)
- **Responsive design** : desktop prioritaire, compatible tablette et mobile
- Composants **shadcn/ui** pour la cohérence visuelle
- Icônes **lucide-react** exclusivement
- Graphiques **Recharts** pour les visualisations de données
- Aucune bibliothèque UI supplémentaire (pas de Material UI, Ant Design, etc.)

---

## 3. Rôles utilisateurs

Le système distingue trois rôles avec des accès et des interfaces différents.

### 3.1 Administrateur

L'administrateur est le gestionnaire principal du système SAV. Il dispose d'un accès complet à toutes les données et fonctionnalités.

**Fonctionnalités accessibles :**

- Se connecter / se déconnecter
- Consulter le tableau de bord global
- Gérer les utilisateurs (CRUD complet)
- Gérer les clients (CRUD complet + fiche détail)
- Gérer les équipements (CRUD complet + association client)
- Gérer les contrats (CRUD complet + association équipements)
- Planifier les interventions préventives (génération automatique du planning)
- Gérer les interventions curatives (création + affectation)
- Affecter des techniciens aux interventions
- Générer les factures pour interventions hors contrat
- Consulter toutes les factures
- Consulter l'historique complet des interventions avec filtres avancés
- Suivre les contrats bientôt expirés

### 3.2 Technicien

Le technicien est l'opérateur terrain. Il voit uniquement ses interventions assignées.

**Fonctionnalités accessibles :**

- Se connecter / se déconnecter
- Consulter son tableau de bord personnel
- Voir ses interventions assignées du jour et à venir
- Consulter son planning personnel
- Démarrer une intervention (changement de statut : PLANIFIÉE → EN_COURS)
- Clôturer une intervention préventive avec compte rendu
- Diagnostiquer et valider une intervention curative avec rapport
- Consulter l'historique de ses interventions passées

### 3.3 Client

Le client accède à un espace limité pour signaler des pannes et consulter ses informations.

**Fonctionnalités accessibles :**

- Se connecter / se déconnecter
- Consulter son tableau de bord personnel (résumé de ses équipements et interventions)
- Déclarer une panne avec description et niveau de priorité
- Consulter l'historique de ses interventions (limité à ses équipements)
- Consulter ses propres factures (lecture seule)
- Consulter son profil

---

## 4. Architecture frontend souhaitée

### Structure des dossiers Next.js

```
sav-manager/
├── app/
│   ├── layout.tsx                    # Layout racine avec providers
│   ├── page.tsx                      # Redirection vers /login ou /dashboard
│   ├── login/
│   │   └── page.tsx                  # Page de connexion
│   ├── dashboard/
│   │   └── page.tsx                  # Dashboard selon le rôle
│   ├── utilisateurs/
│   │   ├── page.tsx                  # Liste des utilisateurs
│   │   └── [id]/page.tsx             # Détail utilisateur
│   ├── clients/
│   │   ├── page.tsx                  # Liste des clients
│   │   └── [id]/page.tsx             # Fiche client
│   ├── equipements/
│   │   ├── page.tsx                  # Liste des équipements
│   │   └── [id]/page.tsx             # Détail équipement
│   ├── contrats/
│   │   ├── page.tsx                  # Liste des contrats
│   │   └── [id]/page.tsx             # Détail contrat
│   ├── interventions/
│   │   ├── page.tsx                  # Liste toutes interventions
│   │   └── planning/
│   │       └── page.tsx              # Vue planning / calendrier
│   ├── pannes/
│   │   └── page.tsx                  # Déclaration et liste des pannes (client)
│   ├── factures/
│   │   ├── page.tsx                  # Liste des factures
│   │   └── [id]/page.tsx             # Détail facture
│   ├── historique/
│   │   └── page.tsx                  # Historique des interventions
│   └── profil/
│       └── page.tsx                  # Profil utilisateur connecté
│
├── components/
│   ├── layout/
│   │   ├── AppSidebar.tsx            # Sidebar de navigation
│   │   ├── AppHeader.tsx             # Header supérieur
│   │   └── AppLayout.tsx             # Layout principal avec sidebar + header
│   ├── ui/                           # Composants shadcn/ui (générés)
│   ├── dashboard/
│   │   ├── StatCard.tsx              # Carte KPI
│   │   ├── DashboardCharts.tsx       # Graphiques Recharts
│   │   ├── UrgentInterventions.tsx   # Liste interventions urgentes
│   │   └── ExpiringContracts.tsx     # Contrats bientôt expirés
│   ├── forms/
│   │   ├── UserForm.tsx              # Formulaire utilisateur
│   │   ├── ClientForm.tsx            # Formulaire client
│   │   ├── EquipmentForm.tsx         # Formulaire équipement
│   │   ├── ContractForm.tsx          # Formulaire contrat
│   │   ├── InterventionForm.tsx      # Formulaire intervention
│   │   └── PanneForm.tsx             # Formulaire déclaration panne
│   ├── tables/
│   │   └── DataTable.tsx             # Table générique avec filtres et pagination
│   └── shared/
│       ├── StatusBadge.tsx           # Badge statut coloré
│       ├── RoleBadge.tsx             # Badge rôle utilisateur
│       ├── PriorityBadge.tsx         # Badge priorité intervention
│       ├── SearchInput.tsx           # Champ de recherche
│       ├── FilterBar.tsx             # Barre de filtres
│       ├── ConfirmDialog.tsx         # Modal de confirmation
│       ├── PlanningCalendar.tsx      # Vue calendrier/planning
│       ├── InvoiceDetails.tsx        # Détail facture en lecture seule
│       ├── EmptyState.tsx            # Écran vide (aucune donnée)
│       └── LoadingState.tsx          # Indicateur de chargement
│
├── data/
│   ├── mock-users.ts                 # Données mockées utilisateurs
│   ├── mock-clients.ts               # Données mockées clients
│   ├── mock-equipements.ts           # Données mockées équipements
│   ├── mock-contrats.ts              # Données mockées contrats
│   ├── mock-interventions.ts         # Données mockées interventions
│   ├── mock-factures.ts              # Données mockées factures
│   └── mock-stats.ts                 # Données mockées statistiques
│
├── types/
│   └── index.ts                      # Tous les types TypeScript
│
├── lib/
│   ├── auth.ts                       # Simulation authentification (localStorage)
│   ├── utils.ts                      # Fonctions utilitaires (cn, formatDate, etc.)
│   └── constants.ts                  # Constantes (statuts, rôles, priorités)
│
└── hooks/
    ├── useAuth.ts                    # Hook pour l'utilisateur connecté
    └── useLocalStorage.ts            # Hook localStorage pour simuler CRUD
```

### Routes de l'application

| Route | Accès | Description |
|---|---|---|
| `/login` | Public | Page de connexion simulée |
| `/dashboard` | Tous | Dashboard adapté selon le rôle |
| `/utilisateurs` | Admin | Gestion des comptes utilisateurs |
| `/clients` | Admin | Gestion des clients |
| `/clients/[id]` | Admin | Fiche détail client |
| `/equipements` | Admin | Gestion des équipements |
| `/contrats` | Admin | Gestion des contrats |
| `/interventions` | Admin, Tech | Liste des interventions |
| `/interventions/planning` | Admin, Tech | Vue planning |
| `/pannes` | Client | Déclaration et suivi des pannes |
| `/factures` | Admin, Client | Gestion des factures |
| `/historique` | Admin, Tech, Client | Historique des interventions |
| `/profil` | Tous | Profil de l'utilisateur connecté |

---

## 5. Design system

### Palette de couleurs

```css
/* Couleurs principales */
--primary: #1E40AF;          /* Bleu professionnel principal */
--primary-foreground: #FFFFFF;
--secondary: #64748B;        /* Gris secondaire */
--background: #F8FAFC;       /* Fond général très clair */
--surface: #FFFFFF;          /* Fond des cards */
--border: #E2E8F0;           /* Bordures subtiles */
--muted: #94A3B8;            /* Texte secondaire */

/* Couleurs d'état */
--success: #16A34A;          /* Vert : réalisé / actif / payé */
--warning: #D97706;          /* Orange : en attente / planifiée */
--danger: #DC2626;           /* Rouge : urgence / expiré / impayé */
--info: #2563EB;             /* Bleu : information / en cours */
```

### Badges de statut

| Statut | Couleur | Texte affiché |
|---|---|---|
| REALISEE / ACTIF / PAYEE | Vert (#16A34A) | Réalisée / Actif / Payée |
| PLANIFIEE / EN_ATTENTE | Orange (#D97706) | Planifiée / En attente |
| EN_COURS | Bleu (#2563EB) | En cours |
| ANNULEE / EXPIRE / IMPAYEE | Rouge (#DC2626) | Annulée / Expiré / Impayée |
| BIENTOT_EXPIRE | Jaune (#CA8A04) | Bientôt expiré |

### Typographie

- **Police** : Inter (Google Fonts) ou système par défaut
- **Titres** : font-semibold / font-bold
- **Corps** : text-sm (14px) pour les tables, text-base (16px) pour le contenu
- **Labels** : text-xs text-muted-foreground pour les étiquettes

### Composants clés

- **Cards** : `rounded-xl border bg-white shadow-sm` avec `p-6`
- **Tables** : fond blanc, lignes alternées légèrement grises, hover sur chaque ligne
- **Boutons** : primaire bleu, secondaire outline, destructif rouge
- **Modales** : Dialog shadcn/ui avec backdrop semi-transparent
- **Formulaires** : labels au-dessus des champs, messages d'erreur en rouge sous les inputs
- **Sidebar** : fond blanc, largeur 240px sur desktop, icônes + texte, collapsible sur mobile

---

## 6. Layout principal

### Structure générale

```
┌─────────────────────────────────────────────────────┐
│  HEADER : Logo | Titre page | Notifications | User  │
├───────────────┬─────────────────────────────────────┤
│               │                                     │
│   SIDEBAR     │      ZONE PRINCIPALE                │
│   Navigation  │                                     │
│   selon rôle  │  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐  │
│               │  │ KPI │ │ KPI │ │ KPI │ │ KPI │  │
│  • Dashboard  │  └─────┘ └─────┘ └─────┘ └─────┘  │
│  • Clients    │                                     │
│  • Équipem.   │  ┌─────────────┐ ┌───────────────┐ │
│  • Contrats   │  │  Graphique  │ │  Liste récente│ │
│  • Intervent. │  └─────────────┘ └───────────────┘ │
│  • Factures   │                                     │
│  • Historique │                                     │
│               │                                     │
└───────────────┴─────────────────────────────────────┘
```

### Sidebar (`AppSidebar.tsx`)

- Position fixe à gauche, hauteur 100vh
- Largeur : 240px sur desktop, icon-only (64px) sur tablette, drawer sur mobile
- Logo / nom de l'application en haut : **SAV Manager**
- Liens de navigation avec icône lucide + texte
- Lien actif mis en évidence (fond bleu clair, texte bleu)
- Bouton de déconnexion en bas avec icône `LogOut`

### Header (`AppHeader.tsx`)

- Hauteur fixe : 64px
- Gauche : bouton hamburger (mobile) + titre de la page courante
- Droite :
  - Icône cloche (notifications mockées, badge rouge avec chiffre)
  - Avatar avec initiales de l'utilisateur
  - Nom et rôle de l'utilisateur connecté
  - Menu déroulant : Profil / Déconnexion

---

## 7. Pages détaillées à créer

### 7.1 Page Login (`/login`)

**Contenu de la page :**

```
┌────────────────────────────────────┐
│          🔧 SAV Manager            │
│  Gestion du Service Après-Vente   │
│                                    │
│  ┌──────────────────────────────┐  │
│  │  Email                       │  │
│  │  [_________________________] │  │
│  │                              │  │
│  │  Mot de passe                │  │
│  │  [_________________________] │  │
│  │                              │  │
│  │  Rôle (simulation)           │  │
│  │  [Administrateur ▼]          │  │
│  │                              │  │
│  │  [    Se connecter    ]      │  │
│  └──────────────────────────────┘  │
│                                    │
│  ⚠ Email ou mot de passe incorrect │
└────────────────────────────────────┘
```

**Comportement :**

- Sélecteur de rôle : `Administrateur | Technicien | Client`
- Validation simulée : email = `admin@sav.com`, mot de passe = `admin123` (selon le rôle sélectionné)
- Identifiants mockés par rôle :
  - Admin : `admin@sav.com` / `admin123`
  - Technicien : `tech@sav.com` / `tech123`
  - Client : `client@sav.com` / `client123`
- En cas d'erreur : message d'erreur rouge sous le formulaire
- Après succès : stocker le rôle en `localStorage` et rediriger vers `/dashboard`
- Design centré sur la page avec card blanche sur fond gris clair

### 7.2 Dashboard Administrateur (`/dashboard`)

**KPI Cards (ligne supérieure) :**

| KPI | Icône | Couleur |
|---|---|---|
| Total clients | Users | Bleu |
| Total équipements | Settings | Bleu |
| Contrats actifs | FileCheck | Vert |
| Contrats expirés | AlertTriangle | Rouge |
| Interventions du jour | Calendar | Orange |
| Interventions en cours | Activity | Bleu |
| Factures impayées | CreditCard | Rouge |

**Graphiques (ligne centrale) :**

- **Graphique 1** — BarChart Recharts : nombre d'interventions par mois (12 derniers mois), deux barres par mois (préventive vs curative)
- **Graphique 2** — PieChart Recharts : répartition préventives / curatives sur la période

**Listes rapides (bas de page) :**

- **Interventions urgentes** : table compacte avec colonnes (client, équipement, priorité badge, date, statut badge, bouton Voir)
- **Contrats bientôt expirés** : table compacte avec colonnes (référence, client, date fin, jours restants, bouton Voir)

### 7.3 Gestion des utilisateurs (`/utilisateurs`)

**Table des utilisateurs :**

| Colonne | Type | Description |
|---|---|---|
| Nom | text | Prénom + Nom |
| Email | text | Adresse email |
| Rôle | badge | Administrateur / Technicien / Client |
| Statut | badge | Actif (vert) / Inactif (gris) |
| Date création | date | Format JJ/MM/AAAA |
| Actions | boutons | Voir · Modifier · Désactiver |

**Fonctionnalités :**

- Barre de recherche par nom ou email
- Filtre par rôle (Select : Tous / Admin / Technicien / Client)
- Filtre par statut (Select : Tous / Actif / Inactif)
- Bouton `+ Ajouter un utilisateur` (ouvre une modale)
- Pagination 10 lignes par page

**Modal formulaire utilisateur :**

```
Champs :
- Prénom * (text input)
- Nom * (text input)
- Email * (email input, validation format)
- Rôle * (select : Administrateur / Technicien / Client)
- Mot de passe * (password input, min 8 caractères)
- Statut (switch : Actif / Inactif)

Boutons : Annuler | Enregistrer
```

**Comportement CRUD simulé :**
- Ajout : ajout dans le state local + toast de succès
- Modification : mise à jour dans le state local
- Désactivation : soft delete (statut = inactif), pas de suppression physique

### 7.4 Gestion des clients (`/clients`)

**Table des clients :**

| Colonne | Description |
|---|---|
| Société | Nom de l'entreprise cliente |
| Contact | Nom du responsable |
| Email | Email de contact |
| Téléphone | Numéro de téléphone |
| Ville | Localisation |
| Équipements | Nombre (badge bleu) |
| Actions | Voir · Modifier · Supprimer |

**Fonctionnalités :**

- Recherche par nom société ou email
- Bouton `+ Ajouter un client`
- Modal formulaire client (Société*, Contact*, Email*, Téléphone, Adresse, Ville, Code postal)

**Page fiche client (`/clients/[id]`) :**

Onglets :
1. **Informations** : données générales du client
2. **Équipements** : liste des équipements associés (table compacte)
3. **Contrats** : contrats de maintenance actifs et expirés
4. **Interventions** : historique des interventions (5 dernières)

### 7.5 Gestion des équipements (`/equipements`)

**Table des équipements :**

| Colonne | Description |
|---|---|
| Référence | Code unique de l'équipement |
| Type | Climatiseur / Système de surpression |
| Modèle | Modèle de l'appareil |
| Marque | Fabricant |
| Client | Société cliente associée |
| Localisation | Adresse d'installation |
| Statut | En service / En panne / Hors service |
| Actions | Voir · Modifier · Supprimer |

**Fonctionnalités :**

- Filtres : Type (Select), Client (Select), Statut (Select)
- Recherche par référence ou modèle
- Modal formulaire équipement :
  - Référence* (text)
  - Type* (select : Climatiseur / Système de surpression)
  - Marque* (text)
  - Modèle* (text)
  - Numéro de série (text)
  - Client associé* (select avec liste clients)
  - Localisation* (text)
  - Date d'installation (date)
  - Statut (select)

### 7.6 Gestion des contrats (`/contrats`)

**Table des contrats :**

| Colonne | Description |
|---|---|
| Référence | Code du contrat |
| Client | Société cliente |
| Date début | JJ/MM/AAAA |
| Date fin | JJ/MM/AAAA |
| Périodicité | Mensuelle / Trimestrielle / Semestrielle / Annuelle |
| Équipements | Nombre d'équipements couverts |
| Statut | Actif · Expiré · Bientôt expiré |
| Actions | Voir · Modifier |

**Fonctionnalités :**

- Filtre par statut (Actif / Expiré / Bientôt expiré)
- Filtre par client
- Badge coloré sur le statut :
  - Actif = vert
  - Bientôt expiré (< 30 jours) = orange
  - Expiré = rouge

**Modal formulaire contrat :**

```
- Référence* (auto-générée ou saisie)
- Client* (select avec liste clients)
- Date de début* (date picker)
- Date de fin* (date picker, validation : fin > début)
- Périodicité* (select)
- Équipements couverts* (multi-select des équipements du client)
- Description / Notes (textarea)

Boutons : Annuler | Créer le contrat
```

**Page détail contrat (`/contrats/[id]`) :**

- En-tête avec statut badge et durée restante
- Informations du contrat
- Table des équipements couverts
- Historique des interventions préventives liées au contrat

### 7.7 Gestion des interventions (`/interventions`)

**Table des interventions :**

| Colonne | Description |
|---|---|
| Référence | Code intervention |
| Type | Préventive / Curative |
| Client | Société cliente |
| Équipement | Référence équipement |
| Technicien | Nom du technicien assigné |
| Date prévue | JJ/MM/AAAA |
| Priorité | Faible · Moyenne · Élevée · Urgente |
| Statut | Planifiée · En cours · Réalisée · Annulée |
| Couverture | Sous contrat / Hors contrat |
| Actions | Voir · Affecter · Changer statut |

**Filtres avancés :**

```
[Recherche] [Type ▼] [Statut ▼] [Priorité ▼] [Client ▼] [Technicien ▼] [Date début] [Date fin]
```

**Boutons d'action :**

- `+ Planifier une intervention` (admin)
- `+ Générer le planning préventif` (admin, lance la génération automatique mockée)

**Modal formulaire intervention :**

```
- Type* (radio : Préventive / Curative)
- Client* (select)
- Équipement* (select filtré par client)
- Technicien (select)
- Date prévue* (date picker)
- Priorité* (select : Faible / Moyenne / Élevée / Urgente)
- Description* (textarea)
- Couverture contrat (auto-détectée, read-only)
```

**Modal affectation technicien :**

```
- Intervention : [affichée en lecture seule]
- Date prévue : [affichée]
- Technicien* (select avec disponibilité simulée)

Bouton : Affecter
```

### 7.8 Planning des interventions (`/interventions/planning`)

**Vue calendrier hebdomadaire :**

- Navigation semaine précédente / semaine suivante
- Affichage des jours de la semaine en colonnes
- Dans chaque colonne : liste des interventions du jour sous forme de cards
- Card intervention : `[Badge type] Ref — Client — Technicien [Badge statut]`

**Filtres :**

- Filtre par technicien (Select)
- Filtre par type d'intervention (Select)
- Toggle Vue calendrier / Vue liste

**Interactions :**

- Clic sur une intervention : ouvre un panel latéral ou une modale avec le détail
- Bouton "Affecter technicien" sur chaque intervention non affectée

**Données mockées :** Générer des interventions réparties sur 4 semaines glissantes.

### 7.9 Déclaration de panne (`/pannes`)

**Formulaire déclaration panne (côté client) :**

```
- Mon équipement* (select, filtré par équipements du client connecté)
- Description de la panne* (textarea, min 20 caractères)
- Niveau de priorité* (radio/select : Faible / Moyenne / Élevée / Urgente)
- Pièce jointe (input file, bouton seul, aucun upload réel)

[  Envoyer la déclaration  ]
```

- Après envoi : message de confirmation vert "Votre déclaration a été enregistrée"
- Réinitialisation du formulaire après 3 secondes

**Table des pannes déclarées :**

- Colonnes : Date déclaration, Équipement, Description (tronquée), Priorité, Statut
- Pagination, filtres par statut

### 7.10 Espace technicien — Dashboard et interventions

**Dashboard technicien (`/dashboard`) :**

- KPI Cards :
  - Mes interventions aujourd'hui
  - En cours
  - Planifiées cette semaine
  - Réalisées ce mois
- Table "Mes interventions du jour" : équipement, client, adresse, priorité, statut, actions
- Lien vers planning personnel

**Détail intervention (modal ou page) :**

```
Informations :
- Référence, type, client, équipement, adresse
- Date prévue, priorité, statut actuel

Actions disponibles :
- [Démarrer l'intervention]  → statut : EN_COURS
- [Clôturer l'intervention]  → ouvre formulaire compte rendu

Formulaire compte rendu :
- Date de réalisation* (date, pré-remplie avec aujourd'hui)
- Diagnostic* (textarea)
- Actions réalisées* (textarea)
- Matériel utilisé (text)
- Durée d'intervention (number + "minutes")
- Statut final* (select : Réalisée / Annulée)
- Observations (textarea)

[Annuler]  [Valider et clôturer]
```

- Pour les interventions curatives : affichage automatique de la couverture contractuelle (badge Sous contrat / Hors contrat)

### 7.11 Facturation (`/factures`)

**Table des factures (administrateur) :**

| Colonne | Description |
|---|---|
| Numéro | FAC-AAAA-XXXX |
| Client | Société cliente |
| Intervention | Référence liée |
| Montant HT | Montant calculé |
| TVA (19%) | Montant TVA |
| Montant TTC | Total TTC |
| Date émission | JJ/MM/AAAA |
| Statut | Payée · Impayée · En attente |
| Actions | Voir · Marquer payée |

**Génération de facture :**

- Bouton `Générer une facture` sur les interventions curatives hors contrat et réalisées
- La facture est créée avec les données de l'intervention (client, équipement, durée, matériel)
- Calcul automatique mocké : montant = durée × taux horaire + matériel

**Page détail facture (`/factures/[id]`) — lecture seule :**

```
┌─────────────────────────────────────────┐
│  SAV Manager                FACTURE     │
│  [Adresse entreprise]   N° FAC-2024-001 │
│                         Date: 15/01/2024│
├─────────────────────────────────────────┤
│  Facturer à :                           │
│  [Nom client]                           │
│  [Adresse client]                       │
├─────────────────────────────────────────┤
│  Désignation    Qté   PU HT    Total HT │
│  Main d'œuvre   3h    50,00   150,00    │
│  Matériel       1     80,00    80,00    │
├─────────────────────────────────────────┤
│                 Sous-total HT : 230,00  │
│                 TVA 19%      :  43,70   │
│                 TOTAL TTC    : 273,70   │
└─────────────────────────────────────────┘
│  [📥 Exporter PDF]  (bouton non fonctionnel, affiche toast)   │
```

**Côté client :** Afficher uniquement ses propres factures, sans bouton de génération.

### 7.12 Historique (`/historique`)

**Table historique :**

- Toutes les interventions réalisées ou annulées
- Colonnes identiques à la table interventions
- Filtres avancés : date début, date fin, type, statut, client, technicien, équipement
- Pagination : 20 lignes par page
- Export CSV simulé (bouton + toast)
- Message `EmptyState` si aucun résultat

**Côté client :** Historique limité aux interventions de ses propres équipements.
**Côté technicien :** Historique de ses propres interventions passées.

---

## 8. Données mockées

### Types TypeScript (`types/index.ts`)

```typescript
// Énumérations
export type Role = 'ADMINISTRATEUR' | 'TECHNICIEN' | 'CLIENT';

export type InterventionType = 'PREVENTIVE' | 'CURATIVE';

export type InterventionStatus =
  | 'PLANIFIEE'
  | 'EN_COURS'
  | 'REALISEE'
  | 'ANNULEE';

export type ContractStatus = 'ACTIF' | 'EXPIRE' | 'BIENTOT_EXPIRE';

export type InvoiceStatus = 'PAYEE' | 'IMPAYEE' | 'EN_ATTENTE';

export type Priority = 'FAIBLE' | 'MOYENNE' | 'ELEVEE' | 'URGENTE';

export type EquipmentType = 'CLIMATISEUR' | 'SYSTEME_SURPRESSION';

export type EquipmentStatus = 'EN_SERVICE' | 'EN_PANNE' | 'HORS_SERVICE';

export type Periodicity =
  | 'MENSUELLE'
  | 'TRIMESTRIELLE'
  | 'SEMESTRIELLE'
  | 'ANNUELLE';

// Entités principales
export interface User {
  id: string;
  prenom: string;
  nom: string;
  email: string;
  role: Role;
  actif: boolean;
  dateCreation: string;
  avatar?: string;
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
  userId?: string; // Lien vers le compte User du client
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
  statut: EquipmentStatus;
}

export interface Contract {
  id: string;
  reference: string;
  clientId: string;
  dateDebut: string;
  dateFin: string;
  periodicite: Periodicity;
  statut: ContractStatus;
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
  priorite: Priority;
  statut: InterventionStatus;
  couvertureContrat: boolean;
  description: string;
  diagnostic?: string;
  actionsRealisees?: string;
  materielUtilise?: string;
  dureeMinutes?: number;
  observations?: string;
}

export interface Invoice {
  id: string;
  numero: string;
  clientId: string;
  interventionId: string;
  dateEmission: string;
  montantHT: number;
  tva: number;       // En pourcentage, ex : 19
  montantTTC: number;
  statut: InvoiceStatus;
  lignes: InvoiceLine[];
}

export interface InvoiceLine {
  designation: string;
  quantite: number;
  prixUnitaireHT: number;
  totalHT: number;
}

export interface DashboardStats {
  totalClients: number;
  totalEquipements: number;
  contratsActifs: number;
  contratsExpires: number;
  interventionsAujourdhui: number;
  interventionsEnCours: number;
  facturesImpayees: number;
  interventionsParMois: MonthlyData[];
  repartitionTypes: { preventive: number; curative: number };
}

export interface MonthlyData {
  mois: string;
  preventive: number;
  curative: number;
}
```

### Données mockées (`data/mock-*.ts`)

**Utilisateurs mockés (8 entrées) :**
- 2 administrateurs
- 3 techniciens (Ahmed, Mohamed, Sarra)
- 3 clients (liés aux sociétés clientes)

**Clients mockés (6 entreprises) :**
- Exemple : TechBuild SARL, HydroSystems SA, ClimaPro Tunisia, AquaForce Industries...
- Chaque client a 2 à 4 équipements associés

**Équipements mockés (15 à 20 équipements) :**
- Mix climatiseurs et systèmes de surpression
- Répartis entre les clients

**Contrats mockés (8 contrats) :**
- 5 actifs, 2 expirés, 1 bientôt expiré
- Périodicités variées

**Interventions mockées (25 à 30 interventions) :**
- Mix préventives/curatives
- Statuts variés
- Couvrant les 6 derniers mois

**Factures mockées (10 factures) :**
- Liées aux interventions curatives hors contrat
- Statuts : payée, impayée, en attente

**Statistiques dashboard :**
- Données sur 12 mois pour les graphiques BarChart et PieChart

---

## 9. Règles métier à simuler côté frontend

Les règles suivantes doivent être respectées dans la logique applicative du frontend :

| Règle | Implémentation |
|---|---|
| Chaque utilisateur possède un rôle | Stocké dans `localStorage` après connexion simulée |
| Un client peut avoir plusieurs équipements | Relation `clientId` dans `Equipment` |
| Un contrat appartient à un client | Relation `clientId` dans `Contract` |
| Un contrat couvre plusieurs équipements | Tableau `equipementIds` dans `Contract` |
| Une intervention est préventive ou curative | Champ `type` dans `Intervention` |
| Une intervention préventive ne génère pas de facture | Bouton "Générer facture" masqué si `type = PREVENTIVE` |
| Une intervention curative hors contrat peut générer une facture | Bouton visible si `type = CURATIVE && !couvertureContrat && statut = REALISEE` |
| Un technicien est affecté uniquement si disponible | Vérification dans le state local (pas deux interventions le même jour) |
| Les clients voient uniquement leurs données | Filtrage par `clientId` lors de l'affichage |
| Les administrateurs voient toutes les données | Aucun filtrage par client |
| Les techniciens voient uniquement leurs interventions | Filtrage par `technicienId` |
| La suppression utilisateur est logique (soft delete) | Champ `actif = false` uniquement |
| Un équipement ne peut avoir qu'un contrat actif | Vérification lors de la création du contrat |

---

## 10. Composants UI à créer

### Composants layout

**`AppSidebar.tsx`**
- Props : `role: Role`, `currentPath: string`
- Navigation dynamique selon le rôle
- État collapsed/expanded (localStorage)
- Logo + liens + déconnexion

**`AppHeader.tsx`**
- Props : `pageTitle: string`, `user: User`
- Bouton hamburger mobile
- Avatar + nom + rôle + dropdown menu
- Badge notifications

**`AppLayout.tsx`**
- Wrapper qui inclut Sidebar + Header + `{children}`
- Gestion du layout responsive

### Composants shared

**`StatCard.tsx`**
```typescript
interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  color?: 'blue' | 'green' | 'orange' | 'red';
  trend?: { value: number; label: string };
  onClick?: () => void;
}
```

**`DataTable.tsx`**
```typescript
interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  searchPlaceholder?: string;
  filters?: FilterConfig[];
  onAdd?: () => void;
  addLabel?: string;
  pagination?: boolean;
  pageSize?: number;
}
```

**`StatusBadge.tsx`**
```typescript
interface StatusBadgeProps {
  status: InterventionStatus | ContractStatus | InvoiceStatus | EquipmentStatus;
}
// Rendu : badge coloré avec label français
```

**`RoleBadge.tsx`**
- Affiche le rôle avec couleur (Admin=violet, Technicien=bleu, Client=vert)

**`PriorityBadge.tsx`**
- Faible=gris, Moyenne=bleu, Élevée=orange, Urgente=rouge avec animation pulse

**`FilterBar.tsx`**
- Barre de filtres horizontale avec selects et date pickers
- Bouton "Réinitialiser les filtres"

**`ConfirmDialog.tsx`**
```typescript
interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'default' | 'destructive';
}
```

**`EmptyState.tsx`**
```typescript
interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}
```

**`PlanningCalendar.tsx`**
- Vue hebdomadaire avec colonnes par jour
- Affichage des interventions sous forme de cards colorées
- Navigation semaine précédente/suivante

**`DashboardCharts.tsx`**
- BarChart Recharts : interventions par mois
- PieChart Recharts : répartition préventive/curative
- Responsive avec `ResponsiveContainer`

### Composants formulaires

Tous les formulaires utilisent **React Hook Form** ou gestion de state locale simple.

**`UserForm.tsx`** — Champs : prénom, nom, email, rôle, mot de passe, statut
**`ClientForm.tsx`** — Champs : société, contact, email, téléphone, adresse, ville
**`EquipmentForm.tsx`** — Champs : référence, type, marque, modèle, série, client, localisation
**`ContractForm.tsx`** — Champs : référence, client, dates, périodicité, équipements (multi-select)
**`InterventionForm.tsx`** — Champs : type, client, équipement, technicien, date, priorité, description
**`PanneForm.tsx`** — Champs : équipement, description, priorité, pièce jointe (simulée)

---

## 11. Navigation par rôle

### Administrateur — Menu sidebar

```
📊  Dashboard
👥  Utilisateurs
🏢  Clients
🔧  Équipements
📄  Contrats
🔨  Interventions
    └── 📅 Planning
⚠️  Pannes
💰  Factures
📋  Historique
👤  Profil
```

### Technicien — Menu sidebar

```
📊  Dashboard
🔨  Mes interventions
📅  Mon planning
📋  Historique
👤  Profil
```

### Client — Menu sidebar

```
📊  Mon espace
⚠️  Déclarer une panne
🔨  Mes interventions
💰  Mes factures
👤  Mon profil
```

---

## 12. Contraintes importantes

### Règles absolues

- **Frontend uniquement** — aucun backend, aucune API réelle
- **Pas de Prisma** — aucune dépendance ORM
- **Pas de MySQL** — aucune base de données réelle
- **Pas d'authentification réelle** — simulation complète côté interface avec `localStorage`
- **Toutes les actions CRUD** modifient uniquement le state local React (ou `localStorage`)
- **Interface entièrement en français** — labels, messages, placeholders, toasts
- **Code TypeScript strict** — aucun `any`, types définis dans `types/index.ts`
- **Responsive obligatoire** — desktop (prioritaire) + tablette + mobile

### Gestion de la session simulée

```typescript
// lib/auth.ts
const MOCK_USERS = {
  'admin@sav.com': { password: 'admin123', role: 'ADMINISTRATEUR' },
  'tech@sav.com': { password: 'tech123', role: 'TECHNICIEN' },
  'client@sav.com': { password: 'client123', role: 'CLIENT' },
};

export function login(email: string, password: string): User | null { ... }
export function logout(): void { localStorage.removeItem('sav_session'); }
export function getCurrentUser(): User | null { ... }
```

### Gestion du state

- Utiliser `useState` et `useReducer` pour les données locales
- `localStorage` uniquement pour persister la session entre les rechargements
- Éviter les stores complexes (Zustand/Redux non nécessaires pour un prototype)

### Qualité du code

- Composants réutilisables avec des props typées
- Pas de duplication de logique
- Séparation claire : présentation / logique / données
- Commentaires en français sur les fonctions complexes

---

## 13. Résultat attendu

L'application générée doit comporter :

- **Page de connexion** avec sélecteur de rôle simulé
- **Dashboard adaptatif** selon le rôle connecté
- **Module Utilisateurs** : table + filtres + modal CRUD (admin uniquement)
- **Module Clients** : table + fiche détail + modal CRUD
- **Module Équipements** : table + filtres + modal CRUD
- **Module Contrats** : table + modal avec multi-select équipements + détail
- **Module Interventions** : table + filtres avancés + affectation technicien
- **Planning** : vue hebdomadaire avec interventions colorées
- **Espace Client** : déclaration de panne + historique limité + factures
- **Espace Technicien** : planning + clôture d'intervention + compte rendu
- **Facturation** : génération + détail lecture seule + simulation export PDF
- **Historique** : table filtrée + pagination + export CSV simulé
- **Design professionnel** : SaaS, épuré, cohérent, adapté à un projet de fin d'études

---

## 14. Prompt prêt à utiliser dans v0 / Lovable / Bolt

```
Génère une application web frontend complète appelée "SAV Manager" — 
Gestion du Service Après-Vente pour la maintenance de climatiseurs et systèmes de surpression.

STACK TECHNIQUE : Next.js 14, React, TypeScript, Tailwind CSS, shadcn/ui, lucide-react, Recharts.
AUCUN backend, AUCUN Prisma, AUCUN MySQL. Toutes les données sont mockées en local.
L'authentification est simulée avec localStorage. CRUD simulé en state local uniquement.
Interface entièrement en FRANÇAIS.

---

3 RÔLES UTILISATEURS :
1. Administrateur — accès complet à tout le système
2. Technicien — voit uniquement ses interventions assignées
3. Client — voit uniquement ses équipements, pannes et factures

---

PAGE LOGIN (/login) :
- Formulaire : email + mot de passe + sélecteur de rôle (Admin/Technicien/Client)
- Identifiants mockés : admin@sav.com/admin123 | tech@sav.com/tech123 | client@sav.com/client123
- Après connexion : stocker en localStorage et rediriger vers /dashboard
- Design centré, card blanche sur fond gris clair

---

LAYOUT PRINCIPAL :
- Sidebar gauche (240px) : logo "SAV Manager", navigation selon le rôle, lien déconnexion en bas
- Header (64px) : titre page + avatar + notifications badge + dropdown profil
- Zone de contenu principale scrollable

---

DASHBOARD ADMINISTRATEUR (/dashboard) :
- 7 StatCards : Total clients, Total équipements, Contrats actifs, Contrats expirés, Interventions du jour, Interventions en cours, Factures impayées
- BarChart Recharts : interventions par mois (12 mois, barres préventive + curative)
- PieChart Recharts : répartition préventive/curative
- Table interventions urgentes (priorité URGENTE ou ELEVEE)
- Table contrats bientôt expirés (< 30 jours)

---

PAGES PRINCIPALES (admin) :

/utilisateurs — Table avec colonnes [nom, email, rôle badge, statut badge, date création, actions]. Filtres : rôle, statut. Recherche par nom/email. Bouton "+ Ajouter". Modal formulaire CRUD complet.

/clients — Table avec [société, contact, email, téléphone, ville, nb équipements, actions]. Page détail /clients/[id] avec 4 onglets : Informations / Équipements / Contrats / Interventions.

/equipements — Table avec [référence, type, marque, modèle, client, localisation, statut, actions]. Types : Climatiseur / Système de surpression. Filtres : type, client, statut.

/contrats — Table avec [référence, client, date début, date fin, périodicité, nb équipements, statut badge, actions]. Badges : Actif(vert)/Bientôt expiré(orange)/Expiré(rouge). Modal avec multi-select équipements.

/interventions — Table avec [référence, type, client, équipement, technicien, date, priorité badge, statut badge, couverture, actions]. Filtres avancés : date, statut, type, client, technicien. Bouton affecter technicien.

/interventions/planning — Vue calendrier hebdomadaire, interventions sous forme de cards colorées par statut, navigation semaine, filtre technicien.

/factures — Table avec [numéro, client, intervention, montant HT, TVA 19%, montant TTC, date, statut, actions]. Page détail lecture seule avec simulation bouton export PDF (toast seulement).

/historique — Table paginée de toutes les interventions réalisées/annulées. Filtres : date, statut, type, client, technicien, équipement. Message "Aucune intervention trouvée" si vide.

---

ESPACE TECHNICIEN :
Dashboard avec KPIs personnels. Table "Mes interventions du jour". Modal détail avec boutons [Démarrer] et [Clôturer]. Formulaire compte rendu : diagnostic, actions réalisées, matériel, durée, statut final.

---

ESPACE CLIENT :
Dashboard avec résumé équipements. Formulaire déclaration panne : sélection équipement, description, priorité, pièce jointe simulée. Historique interventions filtré par ses équipements. Ses factures en lecture seule.

---

DONNÉES MOCKÉES (à créer dans /data/) :
- 8 utilisateurs (2 admin, 3 techniciens, 3 clients)
- 6 clients (entreprises tunisiennes)
- 15 équipements (mix climatiseurs + surpression)
- 8 contrats (5 actifs, 2 expirés, 1 bientôt expiré)
- 25 interventions (mix préventives/curatives, statuts variés, 6 derniers mois)
- 10 factures avec lignes détaillées
- Stats pour 12 mois (graphiques)

---

TYPES TYPESCRIPT (dans /types/index.ts) :
Role, InterventionType, InterventionStatus, ContractStatus, InvoiceStatus, Priority, EquipmentType, EquipmentStatus, Periodicity, User, Client, Equipment, Contract, Intervention, Invoice, InvoiceLine, DashboardStats, MonthlyData.

---

COMPOSANTS À CRÉER :
AppSidebar, AppHeader, AppLayout, StatCard, DataTable, StatusBadge, RoleBadge, PriorityBadge, SearchInput, FilterBar, ConfirmDialog, EmptyState, LoadingState, DashboardCharts, PlanningCalendar, InvoiceDetails, UserForm, ClientForm, EquipmentForm, ContractForm, InterventionForm, PanneForm.

---

DESIGN SYSTEM :
Couleur primaire : bleu #1E40AF. Fond : #F8FAFC. Cards blanches avec shadow-sm et rounded-xl.
Badges : vert=réalisé/actif/payé, orange=planifié/en attente, rouge=urgence/expiré/impayé, bleu=en cours.
Typographie Inter. Interface épurée style SaaS (inspiré Linear/Vercel). Responsive obligatoire.

---

RÈGLES MÉTIER SIMULÉES :
- Bouton "Générer facture" visible uniquement si intervention CURATIVE + HORS CONTRAT + REALISEE
- Interventions préventives : jamais de facture générée
- Technicien : ne voit que ses interventions (filtrage par technicienId)
- Client : ne voit que ses données (filtrage par clientId)
- Suppression utilisateur = soft delete (actif = false)
- Un équipement ne peut avoir qu'un seul contrat actif à la fois

Génère l'application complète avec navigation fonctionnelle, données mockées cohérentes, formulaires validés, badges colorés, graphiques Recharts, et design professionnel adapté à un projet de fin d'études.
```
