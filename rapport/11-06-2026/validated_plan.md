# Plan — Audit PFE SAV Manager & Refonte Analyse Métier / UML

## Contexte

Le rapport PFE actuel (`nouveau rapport.docx`, ~69 000 caractères) présente une architecture académique complète (Next.js frontend + backend Node.js + Prisma/MySQL + couche DAO), ce qui est **correct et à conserver**. En revanche, l'**analyse métier** contient des erreurs significatives par rapport au périmètre fonctionnel réel : champ priorité inexistant, entité ClientEquipement absente, règles de facturation incorrectes, entités manquantes, dashboards non différenciés, etc.

**Périmètre de correction** : uniquement le modèle métier — entités, cas d'utilisation, backlog, sprints, diagrammes de classes, diagrammes de séquence, règles de gestion. L'architecture (couches frontend/backend/BDD, DAO, transactions SQL) est conservée telle quelle ou adaptée pour refléter le modèle métier corrigé.

---

## Sources analysées

| Source | Contenu extrait |
|---|---|
| `README.md` | Périmètre fonctionnel complet, règles métier, acteurs, entités |
| `nouveau rapport.docx` | Texte intégral (69 063 chars) — structure chapitre/sprint |
| `types/index.ts` | Toutes les interfaces TypeScript — source de vérité des entités |
| `lib/interventions.ts` | Logique métier : génération planning, disponibilité technicien, couverture contrat |
| `lib/auth.ts` | Authentification email OU téléphone 8 chiffres |
| `lib/constants.ts` | Labels FR, statuts, TVA 19 %, TND, villes tunisiennes |
| `data/mock-*.ts` | 9 fichiers : entités, relations, données représentatives |
| `components/shared/GenerateInvoiceDialog.tsx` | Règle éligibilité facture |
| `components/forms/ContractForm.tsx` | Génération automatique planning préventif à la création |

---

## Phase 1 — Audit des incohérences métier identifiées

### Incohérences CRITIQUES (diagramme ou besoin faux)

| # | Emplacement dans le rapport | Problème | Correction |
|---|---|---|---|
| C1 | Sprint 2 — CU-12 intitulé et scénario | **« Déclarer une panne avec priorité »** — le champ priorité n'existe pas dans le modèle métier réel. | Renommer CU-12 en **« Déclarer une panne »**. Supprimer toute mention de priorité dans le scénario nominal, les règles de gestion et le backlog Sprint 2. |
| C2 | Sprint 2 — backlog US-14 à US-24 | Aucune US pour la conversion panne → intervention curative. | Ajouter US **« En tant qu'administrateur, je veux convertir une panne en intervention curative »**. |
| C3 | Sprint 1 — CU-01 scénario nominal | « Il saisit son email et son mot de passe » uniquement. | Compléter : « Il saisit son **email ou son numéro de téléphone à 8 chiffres** et son mot de passe. » Adapter le diagramme de séquence de connexion (condition : identifiant = email OU téléphone). |
| C4 | Diagramme de classes global | Relation directe `Client → Équipement` supposée ou absente de `ClientEquipement`. | La relation correcte est : `Client 1..* ClientEquipement *..1 Équipement`. `ClientEquipement` est l'entité pivot obligatoire. Refaire le diagramme de classes global. |
| C5 | Sprint 1 — CU-05 « Gérer les équipements » | Équipement décrit comme appartenant au client. | L'équipement appartient à un **catalogue global indépendant**. Distinguer le CU « Gérer le catalogue équipements » du CU « Affecter un équipement à un client via ClientEquipement ». |
| C6 | Sprint 1 — CU-06 / contrat | Contrat associé directement à des équipements (`Équipement`). | Un contrat couvre des **installations `ClientEquipement`** (pas des équipements du catalogue directement). Corriger l'entité `Contract` : attribut `clientEquipementIds[]`. |
| C7 | Sprint 2 — CU-08 génération planning | « L'administrateur lance la génération du planning » (action manuelle déclenchée à la demande). | La génération du planning préventif est **automatiquement déclenchée par le Système à la sauvegarde du contrat**, selon les dates et la périodicité. Acteur principal = **Système**. |

### Incohérences IMPORTANTES (fonctionnalité manquante ou mal formulée)

| # | Emplacement | Problème | Correction |
|---|---|---|---|
| I1 | Diagramme de classes global et par sprint | Entités `EquipmentImage`, `PieceJointe`, `LigneFacture` absentes. | Ajouter ces trois entités avec leurs attributs et associations dans le diagramme de classes global et les sprints concernés. |
| I2 | Spécification des besoins | Types de client (`SOCIETE` / `PERSONNE_PHYSIQUE`) non mentionnés. | Ajouter dans les besoins fonctionnels : le client peut être une **société** (champs `societe`, `contact`) ou une **personne physique** (champs `prenom`, `nom`). |
| I3 | Spécification des besoins | Types d'équipements non mentionnés. | Préciser deux types : **`CLIMATISEUR`** et **`SYSTEME_SURPRESSION`**. |
| I4 | Sprint 2 — déclaration panne | Pièces jointes non mentionnées. | Ajouter : « Le client peut joindre **plusieurs pièces jointes** (images, PDF, audio) à sa déclaration de panne. » Entité `PieceJointe` liée à `Panne`. |
| I5 | Sprint 2 — affectation technicien | La vérification de disponibilité est décrite mais sans préciser la règle métier. | Préciser : **un technicien ne peut pas être affecté à deux interventions à la même date**. La vérification se fait par comparaison de `datePrevue`. |
| I6 | Sprint 3 — backlog et CU | Dashboard technicien absent. | Ajouter US et CU : **« En tant que technicien, je veux consulter mon dashboard personnel »** (KPIs assignés, taux de réalisation, planning semaine). |
| I7 | Sprint 3 — backlog et CU | Dashboard client absent. | Ajouter US et CU : **« En tant que client, je veux consulter mon espace »** (équipements affectés, interventions en cours, pannes ouvertes, factures en attente). |
| I8 | Sprint 3 — backlog | Historique technicien absent. | Ajouter US : **« En tant que technicien, je veux consulter mon historique d'interventions »** (réalisées/annulées filtrées par technicien). |
| I9 | Sprint 3 — backlog | Marquage facture payée absent. | Ajouter US : **« En tant qu'administrateur, je veux marquer une facture comme payée »**. |
| I10 | Sprint 3 — règles de gestion facture | Règle d'éligibilité incomplète. | Préciser : **la facture est générée uniquement si l'intervention est de type CURATIVE + statut REALISEE + `couvertureContrat = false`**. Les interventions préventives et les interventions couvertes par contrat ne génèrent jamais de facture. |
| I11 | Spécification des besoins | TVA et monnaie absentes. | Ajouter dans les règles de gestion de la facturation : **TVA = 19 %**, monnaie = **Dinar Tunisien (TND)**. `montantTTC = montantHT × 1,19`. |
| I12 | Backlog produit global | Seulement 12 user stories, périmètre très incomplet. | Étendre à ~35 user stories couvrant l'intégralité des fonctionnalités. |
| I13 | Sprint 3 — acteurs | `Technicien` absent comme acteur dans le diagramme de cas d'utilisation Sprint 3. | Ajouter Technicien : consultation historique, consultation dashboard, consultation planning. |
| I14 | Sprint 1 — soft-delete utilisateur | La règle est présente mais incomplète. | Préciser : l'utilisateur désactivé reste visible dans la liste avec une action **« Restaurer »** permettant de réactiver son accès. |
| I15 | Sprint 1 — images équipements | Entité `EquipmentImage` absente. | Un équipement possède **plusieurs images** (`EquipmentImage[]`), dont une est marquée image principale (`isMain: boolean`). |

### Incohérences MINEURES (wording, formulation académique)

| # | Emplacement | Problème | Correction |
|---|---|---|---|
| m1 | Tous les CU et séquences de sprint | Scénarios font référence à la « table utilisateur », « table contrat_equipement » dans les règles de gestion. | Adapter pour nommer les entités du modèle de classes : `User`, `ClientEquipement`, `Contract`, etc. (cohérence avec les diagrammes UML). |
| m2 | Backlog produit | US-33 « Exporter des données » marqué Faible. | Conserver mais ajouter la précision : « Export CSV partiel, non finalisé dans la version de démonstration ». |
| m3 | Sprint 2 backlog | US-14 « planifier une intervention préventive » attribuée à l'administrateur. | Préciser : la planification automatique est initiée par le **Système** lors de la création du contrat ; l'administrateur peut ensuite modifier manuellement. |
| m4 | Formulation acteurs Chap 2 | Description de l'acteur Client trop restrictive (« signale les pannes et consulte l'historique »). | Compléter : le client consulte aussi ses équipements affectés, ses interventions, ses factures, et dispose d'un dashboard dédié. |

---

## Phase 2 — Plan de production des livrables

### Livrable 1 — Rapport d'audit des incohérences
Tableau structuré complet basé sur la phase 1. Priorités C/I/m. Format directement insérable dans le rapport.

### Livrable 2 — Nouvelle spécification des besoins

**Besoins fonctionnels** (21 fonctionnalités) :
1. Authentification email OU téléphone (8 chiffres, sans indicatif) + gestion rôles
2. CRUD utilisateurs internes (admin + technicien), soft-delete avec restauration
3. CRUD clients (SOCIETE / PERSONNE_PHYSIQUE), villes tunisiennes, mot de passe portail client
4. Catalogue équipements global (CLIMATISEUR / SYSTEME_SURPRESSION), images multiples, image principale
5. Affectation `ClientEquipement` (date achat, localisation facultative, date installation, notes)
6. CRUD contrats couvrant des installations `ClientEquipement`, statut calculé dynamiquement (ACTIF / BIENTOT_EXPIRE / EXPIRE)
7. Génération automatique du planning préventif à la création du contrat (périodicité : mensuelle, trimestrielle, semestrielle, annuelle)
8. Vérification disponibilité technicien par date avant affectation
9. Gestion interventions préventives (sans priorité), affectation technicien
10. Gestion interventions curatives (sans priorité), affectation technicien, vérification couverture contrat
11. Déclaration panne par le client avec plusieurs pièces jointes simulées (image, PDF, audio)
12. Prise en charge panne et conversion en intervention curative
13. Planning hebdomadaire (1 semaine, 2 semaines) et mensuel
14. Démarrage et clôture d'intervention par le technicien (diagnostic, actions réalisées, durée)
15. Vérification couverture contrat à la clôture d'une intervention curative
16. Génération facture (curative + REALISEE + hors contrat uniquement), TVA 19 %, TND, lignes de détail
17. Marquage facture payée par l'administrateur
18. Consultation historique par rôle (admin : tout, technicien : ses interventions, client : ses interventions)
19. Dashboard administrateur (KPIs globaux, graphiques mensuels)
20. Dashboard technicien (interventions assignées, taux de réalisation, planning semaine)
21. Dashboard client (équipements, interventions en cours, pannes, factures en attente)

**Besoins non fonctionnels** :
- Sécurité : authentification obligatoire, RBAC (3 rôles), session sécurisée
- Performance : temps de réponse rapide, pagination des listes
- Ergonomie : interface 100 % française, responsive, thème clair/sombre
- Maintenabilité : TypeScript strict, architecture modulaire, composants réutilisables
- Disponibilité : accessibilité à tout moment depuis navigateur web
- Localisation : TND, TVA 19 %, villes tunisiennes

**Acteurs** :
- **Administrateur** : CRUD complet sur toutes les entités, génération factures, dashboards
- **Technicien** : consultation ses interventions, démarrage/clôture, planning personnel, historique
- **Client** : déclaration panne + PJ, consultation ses équipements/interventions/factures/historique, dashboard
- **Système** : génération automatique planning préventif, calcul statut contrat, vérification couverture, vérification disponibilité, calcul montant facture

### Livrable 3 — Nouveau Product Backlog (~35 US)

**Sprint 1 — Authentification et référentiel métier** (~13 US) :
- US-01 : connexion email ou téléphone
- US-02 : déconnexion
- US-03 : gestion utilisateurs internes (CRUD + soft-delete + restauration)
- US-04 : contrôle d'accès par rôle
- US-05 à US-08 : CRUD clients (SOCIETE / PERSONNE_PHYSIQUE, villes)
- US-09 à US-10 : catalogue équipements + images multiples
- US-11 : affectation ClientEquipement (depuis module Client ou module Équipements)
- US-12 à US-13 : CRUD contrats + prévisualisation/génération planning préventif

**Sprint 2 — Interventions, pannes et planning** (~12 US) :
- US-14 : planifier intervention préventive
- US-15 : consulter le planning (admin + technicien)
- US-16 : affecter technicien avec vérification disponibilité
- US-17 : démarrer intervention (technicien)
- US-18 : clôturer intervention préventive (technicien)
- US-19 : clôturer intervention curative avec vérification couverture (technicien)
- US-20 : déclarer panne avec pièces jointes (client)
- US-21 : prendre en charge une panne (admin)
- US-22 : convertir panne en intervention curative (admin)
- US-23 : créer intervention curative directement (admin)
- US-24 : consulter historique interventions (admin)
- US-25 : suivre interventions en cours

**Sprint 3 — Facturation, historique et dashboards** (~10 US) :
- US-26 : générer facture curative hors contrat (admin)
- US-27 : consulter factures (admin)
- US-28 : consulter mes factures (client)
- US-29 : marquer facture payée (admin)
- US-30 : consulter historique (technicien — ses interventions)
- US-31 : consulter historique (client — ses interventions)
- US-32 : dashboard administrateur (KPIs, graphiques)
- US-33 : dashboard technicien
- US-34 : dashboard client (« Mon espace »)
- US-35 : filtres, recherche, pagination (toutes les listes)

### Livrable 4 — Planification des sprints (tableau)

| Sprint | Objectif | Entités principales | Règles métier couvertes |
|---|---|---|---|
| Sprint 1 | Authentification + référentiel | User, Client, Equipment, EquipmentImage, ClientEquipement, Contract | Login email/téléphone, RBAC, statut contrat, génération planning |
| Sprint 2 | Interventions + pannes + planning | Intervention, Panne, PieceJointe, Contract | Sans priorité, disponibilité technicien, couverture contrat, conversion panne |
| Sprint 3 | Facturation + historique + dashboards | Invoice, LigneFacture | Curative+réalisée+hors contrat, TVA 19 %, TND, dashboards par rôle |

### Livrable 5 — PlantUML Cas d'utilisation global
4 acteurs (Admin, Technicien, Client, Système), ~25 CU, relations `<<include>>` et `<<extend>>` correctes, frontières système.

### Livrable 6 — PlantUML Diagramme de classes global
11 entités avec attributs clés et multiplicités :
`User`, `Client`, `Equipment`, `EquipmentImage`, `ClientEquipement`, `Contract`, `Intervention`, `Panne`, `PieceJointe`, `Invoice`, `LigneFacture`.

Relations corrigées :
- `Equipment` 1 → * `EquipmentImage`
- `Client` 1 → * `ClientEquipement`
- `Equipment` 1 → * `ClientEquipement`
- `Contract` 1 → * `ClientEquipement` (via `clientEquipementIds[]`)
- `Intervention` *..1 `ClientEquipement`
- `Intervention` *..0..1 `Contract` (préventive)
- `Intervention` *..0..1 `Panne` (curative depuis panne)
- `Panne` 1 → * `PieceJointe`
- `Invoice` *..1 `Intervention` (curative, réalisée, hors contrat)
- `Invoice` 1 → * `LigneFacture`
- `Intervention` *..0..1 `User` (technicien affecté)

### Livrables 7–9 — PlantUML par Sprint

**Chaque sprint contient :**
1. Diagramme de cas d'utilisation du sprint
2. Diagramme de classes du sprint
3. Diagrammes de séquence (avec participants : Acteur / Interface / Service/Contrôleur / DAO / Base de données)

**Séquences Sprint 1** :
- Connexion par email ou téléphone (condition sur le type d'identifiant)
- Création utilisateur interne (avec unicité email)
- Création client (SOCIETE ou PERSONNE_PHYSIQUE)
- Ajout équipement avec images multiples
- Affectation équipement à client via ClientEquipement
- Création contrat avec génération automatique planning préventif (acteur Système)

**Séquences Sprint 2** :
- Déclaration panne avec pièces jointes (client)
- Conversion panne → intervention curative (admin)
- Affectation technicien avec vérification disponibilité
- Consultation planning
- Clôture intervention préventive (technicien, sans facture)
- Clôture intervention curative avec vérification couverture contrat

**Séquences Sprint 3** :
- Génération facture curative hors contrat (avec règle éligibilité + calcul TVA)
- Consultation factures selon rôle (admin : toutes / client : les siennes)
- Consultation historique selon rôle
- Consultation dashboard administrateur
- Consultation dashboard technicien
- Consultation dashboard client

### Livrable 10 — Recommandations exactes pour modifier le .docx
Checklist chapitre par chapitre : quoi remplacer, quoi ajouter, quoi reformuler.

---

## Éléments à supprimer ou corriger définitivement du rapport (métier uniquement)

| Élément à supprimer | Remplacer par |
|---|---|
| Champ **priorité** sur les pannes | Aucun champ priorité — supprimer de CU-12, backlog Sprint 2, règles de gestion |
| Champ **priorité** sur les interventions | Aucun champ priorité — supprimer de toute mention dans Sprint 2 |
| Facturation des **interventions préventives** | Facture uniquement pour curative + réalisée + hors contrat |
| Relation directe **Client → Équipement** | Relation via `ClientEquipement` (entité pivot obligatoire) |
| **Contrat couvrant des équipements du catalogue** directement | Contrat couvrant des installations `ClientEquipement` (`clientEquipementIds[]`) |
| Génération planning comme **action manuelle de l'administrateur** | Génération automatique par le **Système** à la sauvegarde du contrat |
| Description CU-01 : « email et mot de passe » uniquement | Authentification : **email OU numéro de téléphone à 8 chiffres** |
| Acteur Client limité à « signaler panne + consulter historique » | Ajouter : dashboard, interventions, factures, équipements affectés |
| Dashboard unique ou non différencié | Trois dashboards distincts : **Admin**, **Technicien**, **Client** |

---

## Ce qui est conservé tel quel dans le rapport

- Architecture académique complète : Frontend (Next.js/React) + Backend/API + ORM (Prisma) + MySQL
- Couche DAO/Repository dans les diagrammes de séquence
- Transactions SQL (COMMIT/ROLLBACK) dans les scénarios
- Middleware d'authentification et contrôle d'accès
- Méthodologie Scrum, rôles Product Owner / Scrum Master / Équipe
- Présentation de l'organisme EDI Solutions
- Analyse de l'existant, SWOT, critique de l'existant
- Comparatif Odoo / Mainti4

---

## Checklist de validation finale (modèle métier)

- [ ] Aucun champ priorité sur `Panne` ni sur `Intervention` dans aucun diagramme ou backlog
- [ ] `ClientEquipement` présent comme entité pivot dans le diagramme de classes global et Sprint 1
- [ ] `EquipmentImage` présente et liée à `Equipment` (1 → *)
- [ ] `PieceJointe` présente et liée à `Panne` (1 → *)
- [ ] `LigneFacture` présente et liée à `Invoice` (1 → *)
- [ ] `Contract.clientEquipementIds[]` (pas `equipementIds[]`)
- [ ] Diagramme de séquence connexion : branche email OU téléphone
- [ ] Règle facture : curative + REALISEE + couvertureContrat = false → mentionnée dans CU et règles de gestion
- [ ] TVA 19 % et TND dans les règles de gestion de `Invoice`
- [ ] Génération planning préventif : acteur = Système, déclencheur = création contrat
- [ ] Dashboard technicien et dashboard client présents dans Sprint 3 (CU + séquence)
- [ ] Historique technicien présent dans Sprint 3
- [ ] Marquage facture payée présent dans Sprint 3
- [ ] Types client `SOCIETE` / `PERSONNE_PHYSIQUE` mentionnés dans besoins + CU
- [ ] Types équipement `CLIMATISEUR` / `SYSTEME_SURPRESSION` mentionnés
- [ ] Soft-delete utilisateur avec action « Restaurer » présent dans Sprint 1
- [ ] Vérification disponibilité technicien par date décrite dans CU affectation + règles de gestion
- [ ] Conversion panne → intervention curative présente dans Sprint 2 (CU + séquence)
- [ ] Backlog ≥ 35 user stories couvrant les 3 sprints
- [ ] Tous les noms d'entités cohérents entre backlog, diagrammes de classes et diagrammes de séquence

---

## Fichiers de référence pour la production

| Fichier | Contenu clé utilisé |
|---|---|
| `types/index.ts` | Source de vérité : noms des entités, attributs, types |
| `lib/interventions.ts` | `generatePreventiveInterventionPreviews`, `isTechnicianAvailable`, `calculateContractStatus`, `findActiveContractForClientEquipement` |
| `lib/auth.ts` | `authenticate()` — logique email OU téléphone |
| `components/shared/GenerateInvoiceDialog.tsx` | Règle éligibilité facture |
| `components/forms/ContractForm.tsx` | Déclenchement automatique génération planning |
| `lib/constants.ts` | Statuts, periodicités, TVA, TND, villes |
