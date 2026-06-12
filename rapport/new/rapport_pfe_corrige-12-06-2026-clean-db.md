# Rapport de Projet de Fin d'Études

Application Web de Gestion du Service Après-Vente (SAV Manager)

---

## Dédicace

[À compléter]

---

## Remerciements

[À compléter]

---

## Introduction générale

Les sociétés doivent actuellement faire face à une accélération de la transformation numérique, les poussant à réévaluer leurs méthodes afin d'optimiser leur efficacité, leur réactivité et la qualité de leurs prestations. Cette transformation numérique exerce une influence significative sur les systèmes de gestion interne, où la centralisation et l'automatisation des informations sont devenues essentielles pour la performance. Dans ce cadre, les informations ont une importance majeure dans le processus décisionnel. Elles facilitent le suivi des actions, prévoient les exigences, améliorent l'utilisation des ressources et assurent une traçabilité précise des opérations. L'implémentation de systèmes d'information organisés est donc essentielle, notamment dans les secteurs qui exigent une coordination étroite, tel que le service après-vente (SAV).

Le support client constitue un aspect primordial pour les sociétés dédiées à l'installation et à l'entretien de matériels techniques. Il inclut des actions telles que la gestion des clients, des contrats, du matériel, ainsi que la programmation et la surveillance des interventions préventives et correctives. Cependant, ces processus sont fréquemment administrés de façon manuelle ou dissociée, ce qui provoque des problèmes de suivi, des pertes de données et un manque de visibilité globale.

Ce projet de fin d'études consiste en la conception et le développement d'une application web pour la gestion des services après-vente relatifs à la maintenance des climatiseurs et des systèmes de surpression. Le but essentiel est de regrouper les informations, d'automatiser les opérations commerciales et de renforcer la collaboration entre les divers intervenants du système.

Afin d'atteindre ces objectifs, la méthode Scrum a été mise en œuvre. Cette méthode agile favorise un développement progressif et récurrent du système par le biais de divers sprints, tout en garantissant une plus grande réactivité aux exigences et une amélioration constante du produit.

Notre recherche sera organisée de la manière suivante :

Le **premier chapitre** présente l'étude préalable, le contexte du projet, ainsi que la problématique et la solution proposée.

Le **deuxième chapitre** est consacré à la capture et la spécification des besoins.

Le **troisième chapitre** traite le Sprint 1 — Authentification et référentiel métier.

Le **quatrième chapitre** traite le Sprint 2 — Gestion des interventions.

Le **cinquième chapitre** traite le Sprint 3 — Facturation et tableau de bord.

---

# Chapitre 1 : Étude préalable

Plan :

**Introduction**

Ce premier chapitre pose les bases du projet en présentant l'organisme d'accueil, le cadre du stage, l'analyse de l'existant, la problématique identifiée et la solution proposée. Il constitue le fondement sur lequel repose l'ensemble des décisions de conception et de développement.

## 1.1 Présentation de l'organisme d'accueil

### 1.1.1 Historique

EDI SOLUTIONS est une entreprise spécialisée dans les services d'ingénierie informatique et les solutions digitales. Elle a été créée pour aider les entreprises à se transformer numériquement en développant des solutions adaptées à leurs besoins. Au fil du temps, elle a élargi ses activités pour inclure le développement web, l'intégration de systèmes d'information et les solutions ERP.

### 1.1.2 Domaine d'activité

L'entreprise opère principalement dans le secteur des technologies de l'information et de la communication. Ses activités incluent :

- Le conseil et l'audit des systèmes d'information ;
- Le développement d'applications web et mobiles ;
- L'intégration de solutions ERP et cloud ;
- La mise en place de systèmes d'information sur mesure.

### 1.1.3 Positionnement

L'entreprise se positionne comme un fournisseur de solutions numériques innovantes, capable de répondre aux besoins spécifiques des entreprises de toutes tailles. Elle se distingue par sa capacité à proposer des solutions personnalisées et évolutives, adaptées aux processus métiers de ses clients.

### 1.1.4 Produits et services

Les principaux services proposés incluent :

- Développement de solutions web et mobiles ;
- Mise en place de plateformes de gestion (ERP) ;
- Solutions e-commerce et e-booking ;
- Audit et optimisation des systèmes d'information ;
- Accompagnement à la transformation digitale.

### 1.1.5 Organisation et environnement de travail

La structure de l'entreprise est basée sur une approche axée sur les projets, où les groupes collaborent ensemble. Le milieu de travail repose sur des outils contemporains de création de logiciels, promouvant des méthodes agiles, en particulier Scrum, ainsi que l'emploi de technologies web actuelles telles que React et Next.js.

## 1.2 Cadre du stage

### 1.2.1 Type et durée du stage

Le stage effectué était un stage de fin d'études, réalisé durant la dernière année de licence en informatique de gestion. Ce stage a duré quatre mois et a inclus les phases d'analyse, de conception, de développement et de documentation.

### 1.2.2 Missions réalisées

Durant ce stage, plusieurs missions ont été effectuées :

- Analyse des besoins du système de gestion du service après-vente ;
- Étude de l'existant et identification des limites ;
- Conception des diagrammes UML (cas d'utilisation, classes, séquences) ;
- Participation à la définition de l'architecture de l'application ;
- Développement progressif des fonctionnalités selon la méthodologie Scrum.

### 1.2.3 Contribution au projet

La principale contribution a été de concevoir et créer une application web pour la gestion du service après-vente. Ce projet a permis de structurer les processus de gestion des interventions, d'automatiser la planification des opérations de maintenance, d'améliorer la traçabilité des interventions et de contribuer à la modélisation et à la création des divers modules du système.

## 1.3 Cadre du projet

### 1.3.1 Problématique

La gestion actuelle du service après-vente est affectée par plusieurs problèmes dus à l'absence d'un système centralisé et automatisé. Cela entraîne des difficultés dans la planification des interventions, un suivi inefficace des contrats de maintenance, ainsi qu'une confusion entre les interventions préventives et curatives.

De plus, la facturation des interventions hors contrat est faite manuellement, ce qui augmente le risque d'erreurs et ralentit le processus global. Le manque de visibilité en temps réel sur les interventions et les techniciens complique également la prise de décision.

### 1.3.2 Objectifs à atteindre

L'objectif principal du projet est de concevoir et développer une application web pour digitaliser et centraliser la gestion du service après-vente afin d'améliorer son efficacité globale. Les objectifs spécifiques sont :

- Centraliser les données clients, équipements et contrats ;
- Automatiser la planification des interventions préventives à la création des contrats ;
- Gérer efficacement les interventions curatives et leur traçabilité ;
- Assurer la traçabilité complète des opérations ;
- Automatiser la génération des factures pour les interventions hors contrat ;
- Améliorer la coordination entre les acteurs du système ;
- Fournir une meilleure visibilité sur l'activité via des tableaux de bord différenciés.

## 1.4 Analyse de l'existant

### 1.4.1 Étude de l'existant

Le service après-vente se base principalement sur la gestion des contrats de maintenance, le suivi des équipements installés et la réalisation d'interventions techniques. Les informations relatives aux clients et aux équipements sont généralement enregistrées dans des fichiers bureautiques ou des dossiers administratifs. Ces informations comprennent les coordonnées du client, le type d'équipement, la localisation et l'historique des interventions.

Lors de l'installation d'un équipement, un contrat de maintenance peut être établi. Ce contrat précise la durée du service, la fréquence des visites préventives et les équipements couverts. Les contrats servent de référence pour planifier les interventions périodiques.

Les interventions préventives sont programmées selon une périodicité définie dans le contrat, en fonction de l'exigence de la fiche technique de la machine. L'administrateur prépare un planning et attribue les tâches aux techniciens en fonction de leur disponibilité.

En cas de panne, le client contacte l'entreprise afin de signaler un dysfonctionnement. Une intervention curative est alors enregistrée et assignée à un technicien. Ces interventions peuvent faire l'objet d'une facturation lorsqu'elles ne sont pas couvertes par un contrat.

Le technicien effectue l'intervention sur site, réalise le diagnostic, procède à la maintenance ou à la réparation et valide la fin de l'intervention. Les informations sont ensuite enregistrées et archivées dans les documents administratifs internes.

Les interventions hors contrat donnent lieu à une facturation basée sur plusieurs critères, notamment :

- Le type d'intervention,
- Le matériel utilisé,
- Le temps de travail.

Le fonctionnement actuel du service après-vente s'appuie principalement sur :

- Des fichiers tableurs,
- Des documents papier,
- Des communications téléphoniques,
- La messagerie.

### 1.4.2 Critiques de l'existant

| **Aspect étudié** | **Avantages** | **Inconvénients** |
| --- | --- | --- |
| Gestion des clients et équipements | Les informations de base sur les clients et le matériel sont bien conservées. | Informations dispersées sur plusieurs supports, ce qui complique leur gestion. |
| Gestion des contrats | Existence d'un suivi des contrats de maintenance. | Difficulté de mise à jour et consultation rapide. |
| Planification des interventions | Les visites préventives sont organisées en fonction de leur périodicité. | La planification manuelle peut entraîner des oublis. |
| Gestion des interventions curatives | Possibilité d'enregistrer les demandes clients. | Manque d'automatisation dans le traitement. |
| Suivi des interventions | Un historique est conservé dans les documents internes. | Traçabilité limitée et difficile à exploiter. |
| Communication entre acteurs | Les échanges directs sont rapides. | Risque de perte d'informations et coordination complexe. |
| Facturation | Facturation basée sur les interventions réalisées. | La génération des factures est manuelle et nécessite beaucoup de temps. |
| Outils utilisés | Simplicité des outils bureautiques. | Absence de centralisation et faible intégration. |

### 1.4.3 Les applications existantes

**Application 1 : Odoo Maintenance**

Odoo est un ERP open source qui propose plusieurs modules, notamment pour la gestion de maintenance, le support client et la facturation.

Avantages :

- Gestion des équipements,
- Planification des maintenances préventives,
- Gestion des tickets.

Limites :

- Complexité de configuration,
- Coût élevé pour certaines fonctionnalités,
- Trop généraliste pour des besoins spécifiques.

**Application 2 : Mainti4 (logiciel GMAO)**

Avantages :

- Planification automatique,
- Historique complet des interventions,
- Tableaux de bord analytiques.

Inconvénients :

- Solution lourde pour PME,
- Interface parfois complexe,
- Formation nécessaire.

### 1.4.4 Analyse SWOT

|  | **Forces** | **Faiblesses** |
| --- | --- | --- |
| **Internes** | Existence d'un processus SAV structuré ; expérience métier des techniciens ; disponibilité d'un historique des interventions ; présence de contrats de maintenance ; relation continue avec les clients. | Absence d'un système informatisé centralisé ; données dispersées (Excel, papier, appels) ; suivi manuel des interventions et contrats ; manque de visibilité en temps réel ; risque élevé d'erreurs dans la facturation. |
| **Externes** | **Opportunités** : transformation digitale des entreprises ; automatisation des processus métier ; amélioration de la productivité ; meilleure exploitation des données. | **Menaces** : résistance au changement des utilisateurs ; risque de perte de données existantes ; dépendance aux méthodes manuelles actuelles ; complexité d'adoption du nouveau système. |

L'analyse SWOT de la situation actuelle du service après-vente indique que l'organisation dispose déjà d'une structure, mais celle-ci manque de modernité. Le système en place s'appuie sur des techniques éprouvées, telles que la gestion des clients, des équipements et des contrats de maintenance, ainsi que sur les données relatives aux interventions antérieures. Ces composants sont essentiels pour établir un système informatique. Toutefois, cette évaluation souligne aussi plusieurs problèmes majeurs, notamment l'absence de centralisation et le déficit d'automatisation dans les processus de facturation et de planification.

## 1.5 Solution proposée

Après avoir analysé la situation actuelle et identifié les limites des méthodes de gestion du service après-vente, il est clair qu'il est nécessaire de mettre en place une solution informatique pour améliorer l'organisation, le suivi et la coordination des activités de maintenance.

Nous proposons de créer une application web pour la gestion du service après-vente, destinée aux entreprises qui installent et maintiennent des climatiseurs et des systèmes de surpression. Cette solution permettra de :

- Centraliser les données clients, équipements et contrats ;
- Gérer un catalogue global d'équipements et leur affectation aux clients ;
- Automatiser la génération du planning des interventions préventives ;
- Assurer le suivi complet des interventions curatives et préventives ;
- Permettre aux clients de déclarer leurs pannes en ligne ;
- Automatiser la facturation des interventions hors contrat ;
- Offrir des tableaux de bord différenciés selon le rôle de l'utilisateur.

L'application comportera plusieurs modules :

- Gestion des utilisateurs internes (administrateur et technicien)
- Gestion des clients (société ou personne physique)
- Catalogue d'équipements avec affectation client
- Gestion des contrats de maintenance
- Gestion des interventions préventives et curatives
- Gestion des pannes et pièces jointes
- Gestion de la facturation
- Planning et historique
- Tableaux de bord différenciés par rôle

## 1.6 Processus de développement

### 1.6.1 Les méthodologies Agile

Les méthodologies agiles sont des approches de gestion de projets de manière flexible. Elles permettent de s'adapter aux changements, de travailler en équipe et de livrer le produit progressivement. Contrairement aux méthodes classiques, les méthodes agiles permettent de développer un produit de manière incrémentale, en intégrant régulièrement les retours des utilisateurs.

### 1.6.2 La méthodologie SCRUM

Pour ce projet, la méthode Scrum a été adoptée. Cette approche se fonde sur des cycles de développement courts nommés Sprints, une liste de fonctionnalités désignée Product Backlog et une organisation des tâches pour chaque sprint. Le projet se décompose en plusieurs sprints, chacun offrant une portion opérationnelle du système. Les principaux atouts de Scrum incluent une organisation du travail optimisée, une visibilité constante sur l'avancement, une adaptation rapide aux exigences et une progression continue.

[IMAGE À INSÉRER : Diagramme de la méthodologie SCRUM]

### 1.6.3 Langages de modélisation

Pour la conception du système, le langage UML (Unified Modeling Language) est utilisé. Les principaux diagrammes utilisés sont :

- Diagramme de cas d'utilisation,
- Diagramme de classes,
- Diagramme de séquence.

Ces diagrammes permettent de représenter le fonctionnement du système de manière claire et structurée.

## Conclusion du Chapitre 1

Ce chapitre a présenté le contexte général du projet et les limites du système existant. L'analyse a montré la nécessité de développer une solution informatique adaptée. La solution proposée repose sur une application web de gestion du service après-vente, développée selon la méthodologie Scrum. Le chapitre suivant sera consacré à la préparation du projet et à la capture des besoins.

---

# Chapitre 2 : Préparation du projet

Plan

**Introduction**

Après avoir présenté le cadre général du projet, nous entamons la phase de préparation du projet selon la méthodologie Scrum. Cette étape vise à identifier, analyser et modéliser les besoins du système SAV, ainsi qu'à définir l'organisation du projet, l'environnement de travail et l'architecture adoptée.

## 2.1 Capture des besoins

### 2.1.1 Spécification des besoins

#### a) Exigences fonctionnelles

L'application doit permettre d'assurer les fonctionnalités suivantes :

**1. Authentification et gestion des sessions**

- Connexion par e-mail ou numéro de téléphone avec mot de passe.
- Gestion des accès selon les rôles (Administrateur, Technicien, Client).
- Déconnexion sécurisée.

**2. Gestion des utilisateurs internes**

- Création, consultation, modification et désactivation des utilisateurs.
- Réactivation des comptes désactivés.
- Gestion des administrateurs et techniciens.

**3. Gestion des clients**

- Création, consultation, modification et suppression des clients.
- Gestion des clients société ou personne physique.
- Sélection de la ville depuis une liste tunisienne.
- Accès client via mot de passe.

**4. Gestion des équipements**

- Gestion d'un catalogue global d'équipements.
- Ajout, modification, consultation et suppression des équipements.
- Gestion des types d'équipements (climatiseur ou système de surpression).
- Gestion de plusieurs images par équipement avec image principale.

**5. Affectation des équipements aux clients**

- Association d'un équipement à un client.
- Enregistrement de la date d'achat, de la date d'installation et de la localisation.
- Affectation depuis le module Client ou Équipement.

**6. Gestion des contrats**

- Création, consultation, modification et suppression des contrats.
- Association d'un contrat à un client et à ses équipements.
- Définition de la périodicité (mensuelle, trimestrielle, semestrielle ou annuelle).
- Calcul automatique du statut du contrat.

**7. Génération du planning préventif**

- Génération automatique des interventions préventives.
- Prévisualisation du planning avant validation du contrat.

**8. Gestion des interventions**

- Gestion des interventions préventives et curatives.
- Affectation des techniciens.
- Vérification automatique de la disponibilité des techniciens.

**9. Gestion des pannes**

- Déclaration des pannes par le client.
- Ajout d'une description et de pièces jointes.
- Conversion d'une `Panne` en intervention curative par l'administrateur.

**10. Gestion de la facturation**

- Génération des factures pour les interventions curatives hors contrat.
- Calcul du montant HT, de la TVA (19 %) et du montant TTC.
- Marquage des factures comme payées.

**11. Tableaux de bord**

- Tableau de bord global pour l'administrateur.
- Tableau de bord personnel pour le technicien.
- Espace personnel pour le client.

**12. Historique et planning**

- Consultation de l'historique selon le rôle.
- Consultation du planning en vue hebdomadaire ou mensuelle.

#### b) Exigences non fonctionnelles

Le système doit également respecter plusieurs contraintes non fonctionnelles :

**Sécurité** : authentification obligatoire, contrôle d'accès basé sur les rôles (RBAC), session sécurisée sans stockage du mot de passe, chiffrement des mots de passe en base de données.

**Performance** : temps de réponse rapide, listes paginées pour optimiser les performances.

**Ergonomie** : interface entièrement en français, intuitive, responsive (desktop, tablette, mobile), thème clair et thème sombre.

**Maintenabilité** : code TypeScript avec typage statique strict, architecture modulaire, composants réutilisables, séparation des responsabilités.

**Disponibilité** : accessibilité à tout moment depuis un navigateur web moderne, sans installation préalable.

**Localisation** : monnaie TND, TVA 19 %, villes tunisiennes.

**Fiabilité** : validation des données saisies côté client, messages d'erreur explicites.

## 2.2 Modélisation des besoins

#### a) Identification des acteurs

Le système fait intervenir quatre acteurs ayant des rôles distincts :

| **Acteur** | **Description** | **Permissions principales** |
| --- | --- | --- |
| **Administrateur** | Gestionnaire principal du système SAV | CRUD complet sur toutes les entités ; génération des factures et du planning ; consultation de tous les dashboards et historiques |
| **Technicien** | Agent de maintenance terrain | Consultation de ses interventions assignées uniquement ; démarrage et clôture d'interventions ; consultation de son planning et de son historique personnel |
| **Client** | Bénéficiaire du service après-vente | Déclaration de pannes avec pièces jointes ; consultation de ses équipements, interventions, pannes, factures et historique ; accès à son espace personnel |
| **Système** | Entité automatique déclenchée par des événements métier | Génération automatique du planning préventif ; calcul du statut des contrats ; vérification de disponibilité des techniciens ; vérification de la couverture contractuelle ; calcul des montants des factures |

#### b) Identification des cas d'utilisation

Les principaux cas d'utilisation du système sont :

**Administrateur**

- Se connecter
- Gérer les utilisateurs internes (CRUD + soft-delete + restauration)
- Gérer les clients (CRUD, SOCIETE / PERSONNE_PHYSIQUE)
- Gérer le catalogue d'équipements (CRUD + images multiples)
- Affecter un équipement à un client via `ClientEquipement`
- Gérer les contrats de maintenance
- Affecter un technicien à une intervention (avec vérification disponibilité)
- Planifier une intervention préventive
- Créer une intervention curative
- Prendre en charge une panne et la convertir en intervention curative
- Générer une facture (curative + réalisée + hors contrat)
- Marquer une facture comme payée
- Consulter le planning (hebdomadaire / mensuel)
- Consulter l'historique global des interventions
- Consulter le tableau de bord global

**Technicien**

- Se connecter
- Consulter ses interventions assignées
- Démarrer une intervention
- Clôturer une intervention préventive
- Clôturer une intervention curative (avec vérification automatique de la couverture)
- Consulter son planning
- Consulter son historique d'interventions
- Consulter son tableau de bord personnel

**Client**

- Se connecter
- Déclarer une panne avec pièces jointes
- Consulter ses pannes
- Consulter ses interventions
- Consulter ses factures
- Consulter son historique
- Consulter son espace personnel (dashboard)

**Système**

- Générer automatiquement le planning préventif à la création d'un contrat
- Calculer dynamiquement le statut des contrats
- Vérifier la disponibilité d'un technicien par date
- Vérifier automatiquement la couverture contractuelle à la clôture d'une intervention curative
- Calculer le montant TTC des factures (TVA 19 %)

#### c) Diagramme de cas d'utilisation global

[IMAGE À INSÉRER : Diagramme de cas d'utilisation global]

## 2.3 Diagramme de classes global

Le diagramme de classes global représente la structure générale du système ainsi que les relations entre les onze entités principales.

[IMAGE À INSÉRER : Diagramme de classes global]

**Description des entités :**

| **Entité** | **Description** |
| --- | --- |
| User | Utilisateur interne : administrateur ou technicien. Attributs : id, prenom, nom, email, telephone, password, role (admin/technician), actif, dateCreation. |
| Client | Client métier : société ou personne physique. Attributs : id, typeClient (SOCIETE/PERSONNE_PHYSIQUE), societe, contact, prenom, nom, email, telephone, password, adresse, ville, dateCreation. |
| Equipment | Équipement du catalogue global, indépendant de tout client. Attributs : id, reference, type (CLIMATISEUR/SYSTEME_SURPRESSION), marque, modele, numeroSerie, description. |
| `EquipmentImage` | Image associée à un équipement. Attributs : id, filename, previewUrl, isMain. |
| `ClientEquipement` | Table de jonction entre Client et Equipment. Matérialise l'installation d'un équipement chez un client. Attributs : id, clientId, equipementId, dateAchat, dateInstallation, localisation (optionnel), notes. |
| `Contract` | Contrat de maintenance couvrant des installations `ClientEquipement`. Attributs : id, reference, clientId, dateDebut, dateFin, periodicite, statut (ACTIF/BIENTOT_EXPIRE/EXPIRE), clientEquipementIds[]. |
| `Intervention` | Intervention préventive ou curative, sans champ de priorité. Attributs : id, reference, type (PREVENTIVE/CURATIVE), clientId, equipementId, clientEquipementId, technicienId, contractId, datePrevue, dateRealisation, statut (PLANIFIEE/EN_COURS/REALISEE/ANNULEE), couvertureContrat, description, diagnostic, actionsRealisees, materielUtilise, dureeMinutes. |
| `Panne` | Déclaration de panne par un client, sans champ de priorité. Attributs : id, reference, clientId, equipementId, clientEquipementId, dateDeclaration, description, statut (EN_ATTENTE/PRISE_EN_CHARGE/CONVERTIE/ANNULEE), interventionId, piecesJointes[]. |
| `PieceJointe` | Pièce jointe associée à une panne. Attributs : id, filename, size, type, previewUrl. |
| `Invoice` | Facture générée pour une intervention curative réalisée hors contrat. Attributs : id, numero, clientId, interventionId, dateEmission, montantHT, tva, montantTTC, statut (PAYEE/IMPAYEE/EN_ATTENTE), lignes[]. |
| `LigneFacture` | Ligne de détail d'une facture. Attributs : description, quantite, prixUnitaire, montant. |

**Relations principales :**

- Client 1 → \* `ClientEquipement`
- Equipment 1 → \* `ClientEquipement`
- Equipment 1 → \* `EquipmentImage`
- `Contract` couvre \* `ClientEquipement` (via clientEquipementIds[]) — un contrat peut couvrir plusieurs installations `ClientEquipement` ; une installation peut être couverte par plusieurs contrats dans le temps, mais par un seul contrat actif à la fois
- `Intervention` \* → 1 `ClientEquipement`
- `Intervention` \* → 0..1 `Contract`
- `Panne` 1 → \* `PieceJointe`
- `Panne` 0..1 → 1 `Intervention` (conversion)
- `Invoice` \* → 1 `Intervention`
- `Invoice` 1 → \* `LigneFacture`
- `Intervention` \* → 0..1 User (technicien affecté)

## 2.4 Pilotage du projet avec Scrum

### 2.4.1 Équipe et rôles

Le projet est organisé selon la méthodologie Scrum. Les rôles principaux sont :

| **Rôle** | **Description** |
| --- | --- |
| **Product Owner** | Définit les besoins fonctionnels du projet et priorise le backlog |
| **Scrum Master** | Assure le suivi de la méthodologie Scrum et facilite les cérémonies |
| **Équipe de développement** | Réalise l'analyse, la conception et le développement des fonctionnalités |

### 2.4.2 Le Backlog du produit

Le Product Backlog regroupe l'ensemble des fonctionnalités du système sous forme d'User Stories.

| **ID** | **Acteur** | **User Story** | **Priorité** |
| --- | --- | --- | --- |
| US-01 | Tout utilisateur | En tant qu'utilisateur, je veux me connecter avec mon e-mail ou mon numéro de téléphone et mon mot de passe, afin d'accéder aux fonctionnalités de mon rôle. | Haute |
| US-02 | Tout utilisateur | En tant qu'utilisateur connecté, je veux me déconnecter afin de sécuriser ma session. | Haute |
| US-03 | Administrateur | En tant qu'administrateur, je veux gérer les comptes des utilisateurs internes (CRUD + désactivation + restauration). | Haute |
| US-04 | Système | En tant que système, je veux restreindre l'accès aux pages selon le rôle de l'utilisateur. | Haute |
| US-05 | Administrateur | En tant qu'administrateur, je veux créer une fiche client (société ou personne physique). | Haute |
| US-06 | Administrateur | En tant qu'administrateur, je veux modifier et désactiver ou supprimer une fiche client selon les contraintes d'intégrité. | Haute |
| US-07 | Administrateur | En tant qu'administrateur, je veux ajouter un équipement au catalogue global avec images multiples. | Haute |
| US-08 | Administrateur | En tant qu'administrateur, je veux affecter un équipement du catalogue à un client via `ClientEquipement`. | Haute |
| US-09 | Administrateur | En tant qu'administrateur, je veux créer un contrat couvrant des installations `ClientEquipement`. | Haute |
| US-10 | Système | En tant que système, je veux générer automatiquement le planning préventif à la création d'un contrat. | Haute |
| US-11 | Administrateur | En tant qu'administrateur, je veux affecter un technicien disponible à une intervention. | Haute |
| US-12 | Administrateur | En tant qu'administrateur, je veux consulter le planning en vue hebdomadaire ou mensuelle. | Haute |
| US-13 | Technicien | En tant que technicien, je veux démarrer une intervention assignée. | Haute |
| US-14 | Technicien | En tant que technicien, je veux clôturer une intervention préventive sans générer de facture. | Haute |
| US-15 | Technicien | En tant que technicien, je veux clôturer une intervention curative avec vérification de la couverture contractuelle. | Haute |
| US-16 | Client | En tant que client, je veux déclarer une panne avec pièces jointes, sans champ de priorité. | Haute |
| US-17 | Administrateur | En tant qu'administrateur, je veux prendre en charge une panne et la convertir en intervention curative. | Haute |
| US-18 | Administrateur | En tant qu'administrateur, je veux créer directement une intervention curative. | Haute |
| US-19 | Administrateur | En tant qu'administrateur, je veux générer une facture pour une intervention curative réalisée hors contrat (TVA 19 %, TND). | Haute |
| US-20 | Administrateur | En tant qu'administrateur, je veux marquer une facture comme payée. | Haute |
| US-21 | Administrateur | En tant qu'administrateur, je veux consulter toutes les factures du système. | Haute |
| US-22 | Client | En tant que client, je veux consulter mes factures. | Moyenne |
| US-23 | Technicien | En tant que technicien, je veux consulter l'historique de mes interventions. | Moyenne |
| US-24 | Client | En tant que client, je veux consulter l'historique des interventions sur mes équipements. | Moyenne |
| US-25 | Administrateur | En tant qu'administrateur, je veux consulter un tableau de bord global avec KPIs et graphiques. | Haute |
| US-26 | Technicien | En tant que technicien, je veux consulter mon tableau de bord personnel (interventions assignées, planning semaine). | Haute |
| US-27 | Client | En tant que client, je veux consulter mon espace personnel (équipements, interventions, pannes, factures). | Haute |
| US-28 | Tous | En tant qu'utilisateur, je veux filtrer, rechercher et paginer les listes de données. | Moyenne |

### 2.4.3 Planification des sprints

| **Sprint** | **Objectif** | **Fonctionnalités couvertes** | **Entités concernées** |
| --- | --- | --- | --- |
| **Sprint 1** | Authentification et référentiel métier | Connexion (email ou téléphone), déconnexion, contrôle d'accès, CRUD utilisateurs (soft-delete + restauration), CRUD clients, catalogue équipements + images, affectation `ClientEquipement`, gestion contrats, génération automatique planning préventif | User, Client, Equipment, `EquipmentImage`, `ClientEquipement`, `Contract` |
| **Sprint 2** | Gestion des interventions et des pannes | Planning (hebdomadaire/mensuel), affectation technicien (vérification disponibilité), démarrage/clôture interventions, déclaration panne avec pièces jointes, conversion panne → curative, vérification couverture contractuelle, historique admin | `Intervention`, `Panne`, `PieceJointe`, `Contract`, `ClientEquipement` |
| **Sprint 3** | Facturation, historique et tableaux de bord | Génération facture (curative + réalisée + hors contrat, TVA 19 %, TND, lignes), marquage payée, consultation factures, historique technicien, historique client, dashboard admin (KPIs + graphiques), dashboard technicien, dashboard client | `Invoice`, `LigneFacture`, `Intervention`, Client, User |

## 2.5 Environnement de travail

### 2.5.1 Environnement matériel

Le développement de l'application a été réalisé avec les équipements suivants :

| **Élément** | **Caractéristiques** |
| --- | --- |
| Machine | PC Portable |
| Processeur | Intel Core i5 |
| Mémoire RAM | 8 Go |
| Stockage | SSD 512 Go |

### 2.5.2 Environnement logiciel

| **Outil** | **Description** |
| --- | --- |
| Visual Studio Code [IMAGE À INSÉRER : logo Visual Studio Code] | Environnement de développement intégré |
| Next.js | Framework Frontend (App Router) |
| React | Bibliothèque JavaScript |
| TypeScript | Typage statique strict |
| Tailwind CSS | Framework CSS utilitaire |
| Prisma | ORM pour la base de données |
| MySQL | Système de gestion de base de données |

## 2.6 Architecture de l'application

L'application est construite sur une architecture web en trois couches qui sépare clairement le frontend, la logique métier et la base de données.

**Couche présentation (Frontend)** Le frontend de l'application est développé en utilisant Next.js et React. Cette combinaison permet de créer une interface utilisateur à la fois moderne et dynamique. Les composants React assurent une séparation claire des responsabilités d'affichage.

**Couche logique métier (Backend / API)** La couche backend expose des routes API RESTful implémentées sous forme de contrôleurs. Chaque contrôleur gère la validation des données, l'exécution de la logique métier et les appels vers la base de données.

**Couche d'accès aux données (Prisma / MySQL)** L'accès à la base de données est géré via Prisma ORM. Cette couche exécute les requêtes vers la base de données MySQL et garantit l'intégrité des données via la gestion des transactions (COMMIT/ROLLBACK).

*[Insérer ici le diagramme d'architecture 3 couches]*

## Conclusion du Chapitre 2

Dans ce chapitre, nous avons établi les exigences fonctionnelles et non fonctionnelles de l'application en précisant leurs règles métier. Nous avons repéré quatre protagonistes (Administrateur, Technicien, Client, Système) et représenté leurs interactions à travers 28 User Stories réparties sur 3 sprints. Le schéma de classes global présente les 11 entités du modèle, incluant l'entité intermédiaire `ClientEquipement` qui associe les clients aux équipements du catalogue. Le prochain chapitre traitera du Sprint 1 — Authentification et référentiel métier.

---

# Chapitre 3 : Sprint 1 — Authentification et référentiel métier

Plan

**Introduction**

Dans le chapitre précédent, nous avons traité de la phase préparatoire du projet ainsi que des spécifications du système. Ce chapitre aborde le premier sprint du projet, réalisé selon la méthode Scrum. Ce sprint est essentiel pour le développement de l'application, car il établit les fondations du système, surtout en ce qui concerne l'authentification des utilisateurs et la gestion des données cruciales.

Les fonctionnalités développées pendant ce sprint sont principalement axées sur :

- L'authentification par e-mail ou numéro de téléphone et la déconnexion des utilisateurs ;
- La gestion des utilisateurs internes avec désactivation logique et restauration ;
- La gestion des clients (société ou personne physique) ;
- La gestion du catalogue d'équipements avec images multiples ;
- L'affectation des équipements aux clients via `ClientEquipement` ;
- La gestion des contrats de maintenance avec génération automatique du planning préventif.

## 3.1 Backlog du Sprint 1

| **ID** | **User Story** | **Acteur** | **Priorité** | **Critères d'acceptation** |
| --- | --- | --- | --- | --- |
| US-01 | En tant qu'utilisateur, je veux me connecter avec mon e-mail ou mon numéro de téléphone et mon mot de passe afin d'accéder aux fonctionnalités de mon rôle. | Tout utilisateur | Élevée | Connexion réussie avec e-mail OU téléphone 8 chiffres valide + mot de passe correct ; erreur affichée si identifiant ou mot de passe incorrect ; compte inactif refusé. |
| US-02 | En tant qu'utilisateur connecté, je veux me déconnecter afin de sécuriser ma session. | Tout utilisateur | Élevée | Session fermée ; redirection vers la page de connexion. |
| US-03 | En tant qu'administrateur, je veux gérer les comptes utilisateurs internes (CRUD + désactivation + restauration). | Administrateur | Élevée | CRUD complet ; désactivation logique (actif = false) ; utilisateur désactivé visible avec action « Restaurer ». |
| US-04 | En tant que système, je veux contrôler les accès selon le rôle de l'utilisateur. | Système | Élevée | Chaque rôle n'accède qu'aux pages et données autorisées ; redirection si accès non autorisé. |
| US-05 | En tant qu'administrateur, je veux créer une fiche client (société ou personne physique) avec ville tunisienne et mot de passe portail. | Administrateur | Élevée | Formulaire adapté au type ; ville sélectionnée depuis liste tunisienne ; mot de passe portail renseigné ; unicité email vérifiée. |
| US-06 | En tant qu'administrateur, je veux modifier et désactiver ou supprimer une fiche client selon les contraintes d'intégrité. | Administrateur | Moyenne | Modifications enregistrées ; suppression si aucune contrainte d'intégrité active ; désactivation proposée sinon. |
| US-07 | En tant qu'administrateur, je veux ajouter un équipement au catalogue global avec type, référence, numéro de série et images multiples. | Administrateur | Élevée | Équipement ajouté au catalogue global ; type CLIMATISEUR ou SYSTEME_SURPRESSION ; plusieurs images ; une image principale désignée. |
| US-08 | En tant qu'administrateur, je veux affecter un équipement du catalogue à un client via `ClientEquipement`. | Administrateur | Élevée | Enregistrement `ClientEquipement` créé avec dateAchat, dateInstallation, localisation optionnelle. |
| US-09 | En tant qu'administrateur, je veux créer un contrat couvrant des installations `ClientEquipement` d'un client. | Administrateur | Élevée | Contrat lié à un client et à un ensemble de `ClientEquipement` ; périodicité choisie ; dates valides. |
| US-10 | En tant que système, je veux générer automatiquement le planning préventif lors de la création d'un contrat. | Système | Élevée | Interventions préventives créées selon périodicité et installations couvertes ; prévisualisation avant validation. |
| US-11 | En tant qu'administrateur, je veux consulter un contrat et ses interventions planifiées. | Administrateur | Moyenne | Détail du contrat avec liste des interventions générées. |

## 3.2 Analyse

### 3.2.1 Diagramme de cas d'utilisation du Sprint 1

*[Insérer ici le diagramme de cas d'utilisation Sprint 1]*

Acteurs impliqués dans ce sprint :

**Administrateur** : gestion des utilisateurs, clients, catalogue équipements, affectation `ClientEquipement`, contrats.

**Tout utilisateur** : connexion, déconnexion.

**Système** : contrôle d'accès par rôle, génération automatique du planning préventif.

### 3.2.2 Description des cas d'utilisation

#### CU-01 : S'authentifier

| **Champ** | **Contenu** |
| --- | --- |
| **Description** | Ce cas d'utilisation permet à un utilisateur de s'authentifier dans le système. |
| **Acteurs** | Administrateur, Technicien, Client |
| **Préconditions** | L'utilisateur possède un compte valide et actif. |
| **Postconditions** | L'utilisateur accède à son espace personnel selon son rôle. |

**Scénario nominal :**

1. L'utilisateur ouvre l'interface de connexion.
2. Il saisit son identifiant (**adresse e-mail ou numéro de téléphone à 8 chiffres**) et son mot de passe.
3. Le système détecte le type d'identifiant : si l'identifiant contient un « @ », il s'agit d'un e-mail ; sinon, il s'agit d'un numéro de téléphone.
4. Le système recherche l'utilisateur correspondant dans la base de données.
5. Le système vérifie le mot de passe.
6. Le système crée la session et redirige l'utilisateur vers son tableau de bord selon son rôle.

**Scénarios alternatifs :**

- Identifiant (e-mail ou téléphone) non reconnu → message d'erreur affiché.
- Mot de passe incorrect → message d'erreur affiché.
- Compte inactif (actif = false) → accès refusé avec message d'erreur.

#### CU-02 : Se déconnecter

| **Champ** | **Contenu** |
| --- | --- |
| **Description** | Ce cas d'utilisation permet à un utilisateur connecté de fermer sa session. |
| **Acteurs** | Administrateur, Technicien, Client |
| **Préconditions** | L'utilisateur est connecté. |
| **Postconditions** | La session est fermée ; l'utilisateur est redirigé vers la page de connexion. |

**Scénario nominal :**

1. L'utilisateur clique sur « Déconnexion ».
2. Le système ferme la session.
3. L'utilisateur est redirigé vers la page de connexion.

#### CU-03 : Gérer les utilisateurs internes

| **Champ** | **Contenu** |
| --- | --- |
| **Description** | Ce cas d'utilisation permet à l'administrateur de gérer les comptes des utilisateurs internes (administrateurs et techniciens). |
| **Acteur principal** | Administrateur |
| **Préconditions** | L'administrateur est authentifié. |
| **Postconditions** | Les modifications sont enregistrées dans la base de données. |

**Fonctionnalités :**

- Créer un utilisateur interne (prénom, nom, e-mail, téléphone, rôle, mot de passe) ;
- Modifier un utilisateur existant ;
- Désactiver un utilisateur (soft-delete : actif = false) ;
- Restaurer un utilisateur désactivé (actif = true) ;
- Consulter la liste des utilisateurs avec filtres.

**Scénario nominal (Créer) :**

1. L'administrateur saisit les informations du nouvel utilisateur ainsi que son rôle.
2. L'interface transmet les données au contrôleur.
3. Le contrôleur valide le format de l'e-mail et du téléphone.
4. Le contrôleur vérifie l'unicité de l'e-mail.
5. La base de données confirme que l'e-mail n'existe pas.
6. Le contrôleur chiffre le mot de passe.
7. Le contrôleur demande l'enregistrement du nouvel utilisateur.
8. La base de données enregistre les données.
9. La base confirme l'insertion ; la liste des utilisateurs est mise à jour.

**Scénario nominal (Désactiver) :**

1. L'administrateur clique sur « Désactiver » pour un utilisateur actif.
2. Le système effectue une mise à jour : actif = false.
3. L'utilisateur disparaît des listes actives mais reste visible dans la liste complète avec une action « Restaurer ».

**Règles de gestion :**

- Chaque utilisateur interne doit avoir un e-mail unique.
- Le mot de passe est chiffré avant stockage.
- Un utilisateur désactivé (actif = false) ne peut plus se connecter.
- L'action « Restaurer » remet actif = true.
- Les comptes clients ne sont pas gérés ici — ils appartiennent au module Clients.

#### CU-04 : Gérer les clients

| **Champ** | **Contenu** |
| --- | --- |
| **Description** | Ce cas d'utilisation permet à l'administrateur de gérer les fiches clients. |
| **Acteur principal** | Administrateur |
| **Préconditions** | L'administrateur est authentifié. |
| **Postconditions** | Les modifications sont enregistrées dans la base de données. |

**Fonctionnalités :**

- Créer un client de type **société** (champs : raison sociale societe, nom du contact) ou **personne physique** (champs : prenom, nom) ;
- Renseigner e-mail, téléphone, adresse, ville (liste tunisienne), mot de passe portail ;
- Modifier et supprimer un client ;
- Consulter la liste avec filtres.

**Règles de gestion :**

- Le type SOCIETE requiert le champ societe (raison sociale).
- Le type PERSONNE_PHYSIQUE requiert les champs prenom et nom.
- L'e-mail doit être unique dans le système.
- Chaque client dispose d'un mot de passe pour accéder au portail client.

#### CU-05 : Gérer le catalogue d'équipements

| **Champ** | **Contenu** |
| --- | --- |
| **Description** | Ce cas d'utilisation permet à l'administrateur de gérer le catalogue global d'équipements, indépendant de tout client. |
| **Acteur principal** | Administrateur |
| **Préconditions** | L'administrateur est authentifié. |
| **Postconditions** | L'équipement est enregistré dans le catalogue. |

**Fonctionnalités :**

- Créer un équipement avec : référence, type (CLIMATISEUR ou SYSTEME_SURPRESSION), marque, modèle, numéro de série, description ;
- Ajouter plusieurs images (`EquipmentImage`) dont une image principale (isMain = true) ;
- Modifier et supprimer un équipement ;
- Consulter le catalogue avec filtres par type et marque.

**Règles de gestion :**

- Le catalogue est global : un équipement n'appartient pas à un client spécifique.
- Le numéro de série est unique.
- Une seule image est désignée comme image principale.

#### CU-06 : Affecter un équipement à un client (`ClientEquipement`)

| **Champ** | **Contenu** |
| --- | --- |
| **Description** | Ce cas d'utilisation permet à l'administrateur de créer un enregistrement `ClientEquipement` qui matérialise l'installation d'un équipement du catalogue chez un client. |
| **Acteur principal** | Administrateur |
| **Préconditions** | L'administrateur est authentifié ; le client existe ; l'équipement existe dans le catalogue. |
| **Postconditions** | Un enregistrement `ClientEquipement` est créé en base de données. |

**Scénario nominal :**

1. L'administrateur accède au module client (ou à la fiche équipement).
2. Il sélectionne un équipement du catalogue et un client.
3. Il renseigne la date d'achat, la date d'installation et, optionnellement, la localisation.
4. L'interface transmet les données au contrôleur.
5. Le contrôleur vérifie que l'équipement et le client existent.
6. Le contrôleur vérifie qu'un même équipement n'est pas déjà affecté deux fois au même client.
7. La base de données enregistre l'entrée dans la table `ClientEquipement`.
8. La base confirme l'enregistrement.

**Règles de gestion :**

- La date d'installation est obligatoire. La localisation est facultative.
- Un même équipement peut être affecté à plusieurs clients différents (via des enregistrements `ClientEquipement` distincts).
- L'affectation ne modifie pas le catalogue global.

#### CU-07 : Gérer les contrats de maintenance

| **Champ** | **Contenu** |
| --- | --- |
| **Description** | Ce cas d'utilisation permet à l'administrateur de créer un contrat de maintenance couvrant des installations `ClientEquipement`. |
| **Acteur principal** | Administrateur |
| **Préconditions** | L'administrateur est authentifié ; le client existe ; des enregistrements `ClientEquipement` existent pour ce client. |
| **Postconditions** | Le contrat est enregistré en base ; les interventions préventives sont générées automatiquement par le Système. |

**Scénario nominal :**

1. L'administrateur saisit les informations du contrat : client, date de début, date de fin, périodicité, installations `ClientEquipement` couvertes.
2. L'interface transmet les données au contrôleur.
3. Le contrôleur vérifie que la date de fin est supérieure à la date de début.
4. Le contrôleur vérifie que les `ClientEquipement` sélectionnés appartiennent bien au client choisi.
5. Le système démarre une transaction.
6. La base de données enregistre le contrat avec la liste clientEquipementIds[].
7. Le **Système** génère automatiquement les interventions préventives selon la périodicité et les installations couvertes.
8. Le système valide la transaction (COMMIT).
9. L'interface affiche la confirmation de création.

**Scénarios alternatifs :**

- Dates invalides (fin ≤ début) → message d'erreur affiché.
- `ClientEquipement` non rattachés au client → erreur « installations hors client ».
- Erreur base de données → transaction annulée (ROLLBACK) ; message d'erreur affiché.

**Règles de gestion :**

- Un contrat couvre des installations `ClientEquipement`, et non des équipements du catalogue directement.
- Le statut est calculé dynamiquement : ACTIF si fin > aujourd'hui + 30 jours ; BIENTOT_EXPIRE si fin entre aujourd'hui et aujourd'hui + 30 jours ; EXPIRE si fin < aujourd'hui.
- La génération du planning est automatique et ne requiert aucune action manuelle de l'administrateur.

#### CU-08 : Générer automatiquement le planning préventif (Système)

| **Champ** | **Contenu** |
| --- | --- |
| **Description** | Ce cas d'utilisation décrit le traitement automatique effectué par le Système lors de la sauvegarde d'un contrat. |
| **Acteur principal** | **Système** |
| **Préconditions** | Un contrat valide vient d'être enregistré avec ses clientEquipementIds[], ses dates et sa périodicité. |
| **Postconditions** | Les interventions préventives sont créées en base de données pour toute la durée du contrat. |

**Scénario nominal :**

1. Le Système reçoit les données du contrat (dateDebut, dateFin, periodicite, clientEquipementIds[]).
2. Le Système calcule les dates des interventions selon la périodicité choisie.
3. Pour chaque date calculée et chaque `ClientEquipement` couvert, le Système crée une intervention préventive.
4. Le Système enregistre toutes les interventions dans la base de données.
5. La prévisualisation du planning est affichée à l'administrateur avant la confirmation finale.

**Règles de gestion :**

- La génération est automatique : elle est déclenchée par la sauvegarde du contrat, non par une action manuelle.
- Une intervention préventive est générée pour chaque couple (date, `ClientEquipement` couvert).
- Périodicités : mensuelle (12/an), trimestrielle (4/an), semestrielle (2/an), annuelle (1/an).

## 3.3 Conception

### 3.3.1 Diagramme de classes du Sprint 1

*[Insérer ici le diagramme de classes Sprint 1]*

Les entités impliquées dans ce sprint sont : User, Client, Equipment, `EquipmentImage`, `ClientEquipement`, `Contract`, `Intervention` (préventive générée automatiquement).

### 3.3.2 Diagrammes de séquence

#### a) Diagramme de séquence : Connexion (email ou téléphone)

*[Insérer ici le diagramme de séquence — Connexion]*

**Identification textuelle — Connexion :**

Nom : S'authentifier Acteur principal : Tout utilisateur (Admin / Technicien / Client) Participants : Interface (Frontend) → Contrôleur (AuthController) → Base de données (MySQL)

Scénario nominal :

1. L'utilisateur saisit son identifiant et son mot de passe.
2. L'Interface transmet les données au Contrôleur.
3. Le Contrôleur détecte le type d'identifiant :
   - Si l'identifiant contient un « @ » → recherche par e-mail dans User puis Client.
   - Sinon (8 chiffres) → recherche par téléphone dans User puis Client.
4. Le contrôleur interroge la base de données.
5. La base retourne l'enregistrement correspondant (ou null si non trouvé).
6. Le Contrôleur vérifie le mot de passe (hash comparison).
7. Si valide et compte actif → le Contrôleur crée la session et retourne les informations de l'utilisateur.
8. L'Interface redirige l'utilisateur vers son tableau de bord selon le rôle.

Scénarios alternatifs :

- SA1 : Identifiant non reconnu → la base de données retourne null → erreur « Identifiant incorrect ».
- SA2 : Mot de passe incorrect → erreur « Mot de passe incorrect ».
- SA3 : Compte inactif → erreur « Compte désactivé ».

#### b) Diagramme de séquence : Déconnexion

*[Insérer ici le diagramme de séquence — Déconnexion]*

Scénario nominal :

1. L'utilisateur clique sur « Déconnexion ».
2. L'Interface envoie la demande au Contrôleur.
3. Le Contrôleur ferme la session.
4. L'Interface redirige vers la page de connexion.

#### c) Identification textuelle — Créer un utilisateur

Nom du cas d'utilisation : Créer un utilisateur Acteur principal : Administrateur Objectif : Permettre à l'administrateur d'ajouter un nouvel utilisateur interne dans le système avec un rôle spécifique.

Préconditions :

- L'administrateur est authentifié.
- La connexion à la base de données est disponible.

Postconditions :

- Le nouvel utilisateur est enregistré dans la base de données.
- La liste des utilisateurs est mise à jour.

Scénario nominal :

1. L'administrateur saisit les informations du nouvel utilisateur ainsi que son rôle.
2. L'Interface transmet les données au Contrôleur.
3. Le Contrôleur valide le format de l'e-mail et du numéro de téléphone.
4. Le Contrôleur demande la vérification de l'unicité de l'e-mail.
5. Le contrôleur interroge la base de données.
6. La base retourne le résultat de la recherche.
7. Si l'e-mail n'existe pas, le Contrôleur chiffre le mot de passe.
8. Le Contrôleur demande l'enregistrement du nouvel utilisateur.
9. La base de données enregistre les données.
10. La base confirme l'enregistrement.
11. Le système rafraîchit la liste des utilisateurs.
12. L'Interface affiche la liste mise à jour à l'administrateur.

Scénario alternatif 1 — E-mail déjà utilisé :

- La base de données indique que l'e-mail existe déjà.
- Le Contrôleur envoie un message d'erreur à l'Interface.
- L'Interface affiche le message « E-mail déjà utilisé ».

Scénario alternatif 2 — Erreur base de données :

- Une erreur survient pendant l'insertion.
- La base de données retourne une erreur au contrôleur.
- L'Interface affiche un message d'erreur à l'administrateur.

Règles de gestion :

- Chaque utilisateur interne doit avoir un e-mail unique.
- Le mot de passe doit être chiffré avant l'enregistrement.
- Le rôle doit appartenir aux rôles autorisés : admin ou technician.
- Le numéro de téléphone est stocké sur 8 chiffres sans indicatif.

#### d) Diagramme de séquence : Modification utilisateur

*[Insérer ici le diagramme de séquence — Modification utilisateur]*

#### e) Identification textuelle — Suppression utilisateur (soft-delete)

Nom du cas d'utilisation : Désactiver un utilisateur Acteur principal : Administrateur Objectif : Permettre à l'administrateur de retirer l'accès d'un utilisateur sans supprimer définitivement ses données (soft-delete).

Préconditions :

- L'administrateur est authentifié.
- L'utilisateur à désactiver existe et son actif est true.

Postconditions :

- L'utilisateur est désactivé (actif = false).
- L'utilisateur ne peut plus se connecter.
- L'utilisateur reste visible dans la liste avec une action « Restaurer ».

Scénario nominal :

1. L'administrateur clique sur « Désactiver » dans la ligne de l'utilisateur.
2. L'Interface envoie la demande avec l'identifiant de l'utilisateur au Contrôleur.
3. Le Contrôleur vérifie que l'utilisateur existe et est actif.
4. Le contrôleur met à jour la base de données.
5. La base de données effectue la mise à jour : actif = false.
6. La base de données confirme la mise à jour.
7. L'Interface met à jour la liste et affiche le bouton « Restaurer » pour cet utilisateur.

Scénario alternatif — Erreur base de données :

- Une erreur survient lors de la mise à jour.
- La base de données retourne une erreur au contrôleur.
- L'Interface affiche un message d'erreur à l'administrateur.

Règles de gestion :

- La désactivation est logique : actif = false.
- Les utilisateurs désactivés ne peuvent pas se connecter au système.
- Les données historiques de l'utilisateur sont conservées dans la base de données.
- L'action « Restaurer » remet actif = true et permet à l'utilisateur de se reconnecter.

#### f) Diagramme de séquence : Contrôle d'accès

*[Insérer ici le diagramme de séquence — Contrôle d'accès]*

#### g) Identification textuelle — Créer un client

Nom du cas d'utilisation : Créer un client Acteur principal : Administrateur Objectif : Permettre à l'administrateur d'ajouter un nouveau client (société ou personne physique).

Préconditions :

- L'administrateur est authentifié.

Postconditions :

- Le client est enregistré dans la base de données.
- La liste des clients est mise à jour.

Scénario nominal :

1. L'administrateur sélectionne le type de client (SOCIETE ou PERSONNE_PHYSIQUE).
2. L'administrateur saisit les informations adaptées au type choisi.
3. Il sélectionne la ville depuis la liste des villes tunisiennes.
4. Il renseigne le mot de passe d'accès au portail client.
5. L'Interface transmet les données au Contrôleur.
6. Le Contrôleur valide les informations saisies.
7. Le Contrôleur vérifie l'unicité de l'e-mail.
8. La base de données confirme que l'e-mail n'existe pas.
9. Le Contrôleur chiffre le mot de passe portail.
10. Le Contrôleur demande l'enregistrement du client.
11. La base de données enregistre les données.
12. La base confirme l'ajout ; la liste est mise à jour.

Scénarios alternatifs :

- SA1 : Champs obligatoires manquants → validation échoue ; message d'erreur affiché.
- SA2 : E-mail déjà utilisé → message « E-mail déjà utilisé ».
- SA3 : Erreur base de données → message d'erreur.

Règles de gestion :

- SOCIETE → champ societe obligatoire.
- PERSONNE_PHYSIQUE → champs prenom et nom obligatoires.
- L'e-mail doit être unique dans le système.
- Le mot de passe portail est chiffré avant stockage.

#### h) Diagramme de séquence : Ajout équipement et gestion des images

*[Insérer ici le diagramme de séquence — Ajout équipement]*

#### i) Identification textuelle — Créer un contrat et générer le planning

Nom du cas d'utilisation : Créer un contrat de maintenance Acteur principal : Administrateur Objectif : Permettre à l'administrateur de créer un contrat de maintenance et déclencher la génération automatique du planning préventif par le Système.

Préconditions :

- L'administrateur est authentifié.
- Le client existe dans la base de données.
- Des enregistrements `ClientEquipement` existent pour ce client.

Postconditions :

- Le contrat est enregistré dans la base de données avec ses clientEquipementIds[].
- Les interventions préventives sont générées automatiquement par le Système.
- La transaction est validée avec succès.

Scénario nominal :

1. L'administrateur saisit les informations du contrat et sélectionne les installations `ClientEquipement` couvertes.
2. L'Interface transmet les données au Contrôleur.
3. Le Contrôleur valide les dates du contrat (fin > début).
4. Le Contrôleur vérifie que les `ClientEquipement` appartiennent au client sélectionné.
5. Le système démarre une transaction.
6. La base de données enregistre le contrat.
7. Le **Système** analyse les `ClientEquipement` couverts et la périodicité.
8. Le Système calcule les dates d'intervention selon la périodicité.
9. Le Système crée une intervention préventive pour chaque couple (date, `ClientEquipement`).
10. La base de données enregistre toutes les interventions générées.
11. Le système valide la transaction (COMMIT).
12. L'Interface affiche la confirmation et le planning généré.

Scénarios alternatifs :

- SA1 : Dates invalides (fin ≤ début) → message d'erreur ; pas de création.
- SA2 : `ClientEquipement` hors client → erreur « installations hors client ».
- SA3 : Erreur base de données → ROLLBACK ; message d'erreur.

Règles de gestion :

- Un contrat couvre des installations `ClientEquipement`, non des équipements du catalogue directement.
- La génération est automatique ; l'administrateur n'a pas à lancer manuellement cette opération.
- Les opérations d'enregistrement sont exécutées dans une transaction atomique.

#### j) Diagramme de séquence : Consultation d'un contrat

*[Insérer ici le diagramme de séquence — Consultation contrat]*

## Réalisation

[IMAGE À INSÉRER : captures d'écran de réalisation Sprint 1]

## Conclusion du Chapitre 3

Ce sprint a permis de mettre en place les fondations du système : l'authentification sécurisée par e-mail ou téléphone, la gestion des référentiels métier (utilisateurs, clients, catalogue équipements avec images, affectation `ClientEquipement`), la gestion des contrats et la génération automatique du planning préventif par le Système. Le chapitre suivant présente le Sprint 2 dédié à la gestion des interventions et des pannes.

---

# Chapitre 4 : Sprint 2 — Gestion des interventions

Plan

**Introduction**

Suite à l'implémentation des fonctionnalités fondamentales du système lors du Sprint 1, ce deuxième sprint se concentre sur la gestion des interventions préventives et correctives, la déclaration des pannes et le calendrier des techniciens. Ce sprint constitue le noyau fonctionnel du système SAV.

Les caractéristiques élaborées au cours de ce sprint portent principalement sur :

- La vérification du calendrier sur une base hebdomadaire et mensuelle ;
- La répartition des techniciens avec contrôle de disponibilité ;
- Le début et la fin des interventions par les techniciens ;
- Les clients peuvent déclarer des pannes avec plusieurs pièces jointes ;
- La gestion et la transformation des pannes en actions correctives ;
- L'automatisation de la vérification de la couverture contractuelle lors de la clôture.

## 4.1 Backlog du Sprint 2

| **ID** | **User Story** | **Acteur** | **Priorité** | **Critères d'acceptation** |
| --- | --- | --- | --- | --- |
| US-11 | En tant qu'administrateur, je veux affecter un technicien disponible à une intervention. | Administrateur | Élevée | Vérification disponibilité par date ; technicien indisponible signalé et non sélectionnable ; statut PLANIFIEE après affectation. |
| US-12 | En tant qu'administrateur/technicien, je veux consulter le planning en vue hebdomadaire ou mensuelle. | Admin / Technicien | Élevée | Vues 1 semaine, 2 semaines, mensuelle ; admin voit tout ; technicien voit uniquement ses interventions. |
| US-13 | En tant que technicien, je veux démarrer une intervention assignée. | Technicien | Élevée | Statut passe à EN_COURS ; seules ses interventions sont accessibles. |
| US-14 | En tant que technicien, je veux clôturer une intervention préventive. | Technicien | Élevée | Saisie : compte rendu, actions, matériel, durée ; statut REALISEE ; aucune facture générée. |
| US-15 | En tant que technicien, je veux clôturer une intervention curative. | Technicien | Élevée | Saisie : diagnostic, actions, matériel, durée ; statut REALISEE ; couverture contractuelle vérifiée automatiquement. |
| US-16 | En tant que client, je veux déclarer une panne sur l'un de mes équipements, sans champ de priorité, avec pièces jointes. | Client | Élevée | Sélection équipement affecté au client ; description obligatoire ; pièces jointes (image, PDF, audio) ; aucun champ de priorité ; statut EN_ATTENTE. |
| US-17 | En tant qu'administrateur, je veux prendre en charge une panne et la convertir en intervention curative. | Administrateur | Élevée | `Panne` passe à PRISE_EN_CHARGE puis CONVERTIE ; intervention curative créée ; couverture contractuelle détectée automatiquement. |
| US-18 | En tant qu'administrateur, je veux créer directement une intervention curative. | Administrateur | Élevée | Formulaire avec client, installation `ClientEquipement`, date, description ; couverture détectée automatiquement ; aucun champ de priorité. |
| US-19 | En tant qu'administrateur, je veux consulter l'historique de toutes les interventions. | Administrateur | Moyenne | Liste paginée ; filtres par date, type, statut, client, technicien. |
| US-20 | En tant qu'administrateur, je veux suivre les interventions en cours. | Administrateur | Élevée | Vue filtrée sur statuts PLANIFIEE et EN_COURS. |

## 4.2 Analyse

### 4.2.1 Diagramme de cas d'utilisation du Sprint 2

*[Insérer ici le diagramme de cas d'utilisation Sprint 2]*

Les acteurs impliqués dans ce sprint sont :

**Administrateur** : affectation technicien, création intervention curative, prise en charge et conversion panne, consultation planning global, historique.

**Technicien** : consultation planning personnel, démarrage et clôture d'interventions.

**Client** : déclaration de panne avec pièces jointes.

**Système** : vérification disponibilité technicien, vérification couverture contractuelle.

### 4.2.2 Description des cas d'utilisation

#### CU-09 : Affecter un technicien à une intervention

| **Champ** | **Contenu** |
| --- | --- |
| **Description** | Ce cas d'utilisation permet à l'administrateur d'affecter un technicien disponible à une intervention planifiée. |
| **Acteur principal** | Administrateur |
| **Préconditions** | L'administrateur est authentifié ; l'intervention existe ; le technicien possède un compte actif. |
| **Postconditions** | Le technicien est affecté ; le statut de l'intervention devient PLANIFIEE ; l'intervention apparaît dans le planning du technicien. |

**Scénario nominal :**

1. L'administrateur demande l'affectation d'un technicien à une intervention.
2. L'Interface transmet la demande au Contrôleur avec l'identifiant de l'intervention et du technicien.
3. Le Contrôleur vérifie l'existence de l'intervention.
4. Le Contrôleur vérifie que le technicien est actif.
5. Le Contrôleur vérifie la disponibilité du technicien à la date prévue.
6. La base de données confirme que le technicien n'a pas d'autre intervention à cette date.
7. Le Contrôleur met à jour l'intervention avec le technicien affecté et le statut PLANIFIEE.
8. La base de données effectue la mise à jour.
9. L'Interface confirme l'affectation.

**Scénarios alternatifs :**

- SA1 : Intervention introuvable → message d'erreur.
- SA2 : Technicien inactif ou introuvable → message d'erreur.
- SA3 : Technicien indisponible à cette date → message « Technicien indisponible à la date prévue ».
- SA4 : Erreur base de données → message d'erreur.

**Règles de gestion :**

- Seuls les techniciens actifs peuvent être affectés.
- **Un technicien ne peut pas être affecté à deux interventions prévues à la même date.**
- L'affectation met automatiquement le statut de l'intervention à PLANIFIEE.

#### CU-10 : Consulter le planning

| **Champ** | **Contenu** |
| --- | --- |
| **Description** | Permet de consulter les interventions programmées sous forme de calendrier. |
| **Acteurs** | Administrateur, Technicien |
| **Préconditions** | Des interventions planifiées existent. |
| **Postconditions** | Le planning est affiché selon le rôle. |

**Scénario nominal :**

1. L'utilisateur ouvre le module Planning.
2. Le système récupère les interventions selon le rôle :
   - Administrateur → toutes les interventions.
   - Technicien → uniquement ses interventions assignées.
3. Le planning est affiché en vue hebdomadaire (1 semaine ou 2 semaines) ou mensuelle.

**Règles de gestion :**

- Le technicien ne voit que les interventions dont il est l'affectataire.
- Des filtres sont disponibles pour l'administrateur (type, statut, technicien).

#### CU-11 : Clôturer une intervention préventive

| **Champ** | **Contenu** |
| --- | --- |
| **Description** | Permet au technicien de clôturer une intervention préventive réalisée. |
| **Acteur principal** | Technicien |
| **Préconditions** | Le technicien est authentifié et affecté à l'intervention ; le statut est PLANIFIEE ou EN_COURS. |
| **Postconditions** | Le statut passe à REALISEE ; aucune facture n'est générée. |

**Scénario nominal :**

1. Le technicien saisit les informations de clôture : compte rendu, actions réalisées, matériel utilisé, durée en minutes.
2. L'Interface transmet les données au Contrôleur.
3. Le Contrôleur vérifie que le technicien est bien affecté à l'intervention.
4. Le Contrôleur vérifie que le statut est PLANIFIEE ou EN_COURS.
5. Le Contrôleur met à jour le statut à REALISEE.
6. La base de données effectue la mise à jour.
7. L'Interface affiche la confirmation.

**Règles de gestion :**

- Seul le technicien affecté peut clôturer l'intervention.
- **Une intervention préventive ne génère jamais de facture.**
- La durée est saisie en minutes.

#### CU-12 : Déclarer une panne

| **Champ** | **Contenu** |
| --- | --- |
| **Description** | Ce cas d'utilisation permet au client de signaler une panne sur l'un de ses équipements. |
| **Acteur principal** | Client |
| **Préconditions** | Le client est authentifié ; il possède au moins un équipement affecté. |
| **Postconditions** | La panne est enregistrée avec le statut EN_ATTENTE. |

**Scénario nominal :**

1. Le client accède au module de déclaration de panne.
2. Il sélectionne l'un de ses équipements affectés (parmi ses `ClientEquipement`).
3. Il saisit une description de la panne (**obligatoire**).
4. Il joint éventuellement une ou plusieurs pièces jointes (images, PDF, fichiers audio).
5. Il soumet la déclaration.
6. L'Interface transmet les données au Contrôleur.
7. Le Contrôleur vérifie que l'équipement appartient bien au client.
8. Le Contrôleur enregistre la panne avec ses `PieceJointe`[] associées.
9. La panne est créée avec le statut EN_ATTENTE.

**Scénarios alternatifs :**

- SA1 : Description manquante → validation échoue ; message « Description obligatoire ».
- SA2 : Équipement non rattaché au client → erreur « Équipement introuvable ».

**Règles de gestion :**

- La description est obligatoire.
- **Aucun champ de priorité n'est présent.**
- Les pièces jointes sont de type image, PDF ou audio.
- La panne est créée avec le statut EN_ATTENTE.

#### CU-13 : Prendre en charge une panne

| **Champ** | **Contenu** |
| --- | --- |
| **Description** | Permet à l'administrateur de prendre en charge une panne déclarée. |
| **Acteur principal** | Administrateur |
| **Préconditions** | Une panne a été déclarée avec le statut EN_ATTENTE. |
| **Postconditions** | Le statut de la panne passe à PRISE_EN_CHARGE. |

**Scénario nominal :**

1. L'administrateur consulte la liste des pannes.
2. Il sélectionne une panne EN_ATTENTE.
3. Il clique sur « Prendre en charge ».
4. Le statut de la panne est mis à jour à PRISE_EN_CHARGE.

#### CU-14 : Convertir une panne en intervention curative

| **Champ** | **Contenu** |
| --- | --- |
| **Description** | Permet à l'administrateur de convertir une panne en intervention curative afin d'organiser le traitement technique. |
| **Acteur principal** | Administrateur |
| **Préconditions** | Une panne est en statut EN_ATTENTE ou PRISE_EN_CHARGE. |
| **Postconditions** | Une intervention curative est créée ; la panne passe au statut CONVERTIE. |

**Scénario nominal :**

1. L'administrateur consulte les pannes.
2. Il sélectionne une panne et clique sur « Convertir en intervention ».
3. Il saisit la date prévue de l'intervention.
4. Il affecte optionnellement un technicien disponible à cette date.
5. Le Contrôleur crée une intervention curative liée à la panne.
6. Le Système vérifie automatiquement si l'installation `ClientEquipement` est couverte par un contrat actif.
7. L'attribut couvertureContrat est renseigné.
8. La panne passe au statut CONVERTIE.

**Règles de gestion :**

- **Aucun champ de priorité n'est associé à l'intervention curative créée.**
- La couverture contractuelle est vérifiée automatiquement par le Système.
- Si un technicien est affecté, la disponibilité est vérifiée.

#### CU-15 : Vérifier automatiquement la couverture contractuelle (Système)

| **Champ** | **Contenu** |
| --- | --- |
| **Description** | Le Système vérifie si une intervention curative est couverte par un contrat actif. |
| **Acteur principal** | Système |
| **Préconditions** | Une intervention curative existe avec un clientEquipementId renseigné. |
| **Postconditions** | L'attribut couvertureContrat de l'intervention est renseigné (true ou false). |

**Scénario nominal :**

1. Le Système récupère le clientEquipementId de l'intervention.
2. Le Système recherche les contrats actifs (statut = ACTIF) couvrant cet enregistrement `ClientEquipement`.
3. Si un contrat actif est trouvé dans la période : couvertureContrat = true.
4. Sinon : couvertureContrat = false.
5. Le résultat est enregistré dans la base de données.

## 4.3 Conception

### 4.3.1 Diagramme de classes du Sprint 2

*[Insérer ici le diagramme de classes Sprint 2]*

Les entités impliquées dans ce sprint sont : `Intervention`, `Panne`, `PieceJointe`, `Contract`, `ClientEquipement`, User (technicien).

### 4.3.2 Diagrammes de séquence

#### a) Diagramme de séquence : Génération automatique du planning préventif

*[Insérer ici le diagramme de séquence — Génération planning]*

#### b) Identification textuelle — Affecter un technicien à une intervention

Nom du cas d'utilisation : Affecter un technicien à une intervention Acteur principal : Administrateur Objectif : Permettre à l'administrateur d'affecter un technicien disponible à une intervention planifiée.

Préconditions :

- L'administrateur est authentifié.
- L'intervention existe dans la base de données.
- Le technicien existe et possède un compte actif.

Postconditions :

- Le technicien est affecté à l'intervention.
- Le statut de l'intervention devient PLANIFIEE.
- L'intervention apparaît dans le planning du technicien.

Scénario nominal :

1. L'administrateur demande l'affectation d'un technicien à une intervention.
2. L'Interface transmet la demande au Contrôleur avec l'identifiant de l'intervention et du technicien.
3. Le Contrôleur vérifie l'existence de l'intervention.
4. Le Contrôleur vérifie que le technicien est actif.
5. Le Contrôleur vérifie la disponibilité du technicien à la date prévue.
6. La base de données confirme que le technicien est disponible (aucune autre intervention à cette date).
7. Le Contrôleur met à jour l'intervention avec le technicien affecté et le statut PLANIFIEE.
8. La base de données effectue la mise à jour.
9. La base confirme la modification.
10. L'Interface affiche la confirmation de l'affectation.

Scénario alternatif 1 — Technicien indisponible :

- La base de données retourne que le technicien est déjà affecté à cette date.
- Le Contrôleur retourne un message d'indisponibilité.
- L'Interface affiche « Technicien indisponible à la date prévue ».

Scénario alternatif 2 — Technicien introuvable ou inactif :

- La base de données retourne que le technicien est inexistant ou inactif.
- L'Interface affiche un message d'erreur.

Règles de gestion :

- Une intervention doit exister avant toute affectation.
- Seuls les techniciens actifs peuvent être affectés.
- **Un technicien ne peut pas être affecté à deux interventions prévues à la même date.**
- L'affectation met automatiquement le statut de l'intervention à PLANIFIEE.

#### c) Diagramme de séquence : Consultation du planning

*[Insérer ici le diagramme de séquence — Consultation planning]*

#### d) Identification textuelle — Clôturer une intervention préventive

Nom du cas d'utilisation : Clôturer une intervention préventive Acteur principal : Technicien Objectif : Permettre au technicien de valider et clôturer une intervention préventive après sa réalisation.

Préconditions :

- Le technicien est authentifié.
- Le technicien est affecté à l'intervention.
- L'intervention possède le statut PLANIFIEE ou EN_COURS.

Postconditions :

- Les informations de réalisation sont enregistrées.
- Le statut de l'intervention devient REALISEE.
- Aucune facture n'est générée.

Scénario nominal :

1. Le technicien saisit les informations de clôture : compte rendu, actions réalisées, matériel utilisé, durée en minutes.
2. L'Interface transmet les données au Contrôleur.
3. Le Contrôleur vérifie que le technicien est bien affecté à l'intervention.
4. Le Contrôleur vérifie que le statut est PLANIFIEE ou EN_COURS.
5. Le Contrôleur met à jour le statut à REALISEE.
6. La base de données effectue la mise à jour.
7. La base confirme la modification.
8. L'Interface affiche la confirmation.

Règles de gestion :

- Seul le technicien affecté peut clôturer l'intervention.
- **Une intervention préventive ne génère jamais de facture.**
- La durée est obligatoire et exprimée en minutes.

#### e) Diagramme de séquence : Déclaration de panne

*[Insérer ici le diagramme de séquence — Déclaration de panne]*

#### f) Identification textuelle — Création et affectation d'une intervention curative

Nom du cas d'utilisation : Créer et affecter une intervention curative Acteur principal : Administrateur Objectif : Permettre à l'administrateur de créer une intervention curative et d'y affecter un technicien disponible.

Préconditions :

- L'administrateur est authentifié.
- Le client et l'installation `ClientEquipement` existent dans le système.

Postconditions :

- L'intervention curative est créée avec la couverture contractuelle renseignée.
- Le technicien est affecté et le statut passe à PLANIFIEE.

Scénario nominal :

1. L'administrateur saisit les informations de l'intervention curative (client, `ClientEquipement`, date prévue, description).
2. L'Interface transmet les données au Contrôleur.
3. Le Contrôleur vérifie les informations.
4. Le **Système** vérifie automatiquement la couverture contractuelle pour cet enregistrement `ClientEquipement`.
5. L'attribut couvertureContrat est renseigné automatiquement.
6. L'administrateur sélectionne un technicien.
7. Le Contrôleur vérifie la disponibilité du technicien à la date prévue.
8. La base de données enregistre l'intervention curative avec le technicien affecté et le statut PLANIFIEE.
9. La base confirme la création.
10. L'Interface affiche une confirmation à l'administrateur.

Scénario alternatif — Technicien indisponible :

- La base de données retourne que le technicien est indisponible à la date prévue.
- L'Interface affiche « Technicien indisponible à la date prévue ».

Règles de gestion :

- **Aucun champ de priorité n'est associé à l'intervention curative.**
- La couverture contractuelle est vérifiée automatiquement par le Système.
- Seul un technicien actif et disponible peut être affecté.

#### g) Diagramme de séquence : Clôture intervention curative et vérification couverture

*[Insérer ici le diagramme de séquence — Clôture intervention curative]*

## Réalisation

[IMAGE À INSÉRER : captures d'écran de réalisation Sprint 2]

## Conclusion du Chapitre 4

Ce sprint a permis de développer le cœur fonctionnel du système SAV : la gestion complète du cycle de vie des interventions préventives et curatives, la déclaration de pannes avec pièces jointes par les clients, la conversion de pannes en interventions curatives, et la vérification automatique de la couverture contractuelle. Le chapitre suivant présente le Sprint 3, dédié à la facturation et aux tableaux de bord.

---

# Chapitre 5 : Sprint 3 — Facturation et tableau de bord

Plan

**Introduction**

Suite à l'implémentation des fonctionnalités d'authentification, de gestion du référentiel métier et de gestion des interventions lors des sprints précédents, ce troisième sprint se concentre sur les fonctionnalités de supervision et de suivi général du système.

Ce sprint a pour objectif de compléter l'application en y intégrant :

- La génération des factures pour les interventions curatives hors contrat ;
- Le marquage des factures comme payées ;
- L'historique des interventions, différencié par rôle ;
- Les tableaux de bord différenciés (administrateur, technicien, client).

## 5.1 Backlog du Sprint 3

| **ID** | **User Story** | **Acteur** | **Priorité** | **Critères d'acceptation** |
| --- | --- | --- | --- | --- |
| US-19 | En tant qu'administrateur, je veux générer une facture pour une intervention curative réalisée et hors contrat (TVA 19 %, TND, lignes de détail). | Administrateur | Élevée | Éligibilité vérifiée : type = CURATIVE + statut = REALISEE + couvertureContrat = false ; lignes de détail (main-d'œuvre, matériel) ; montantTTC = montantHT × 1,19. |
| US-20 | En tant qu'administrateur, je veux marquer une facture comme payée. | Administrateur | Élevée | Statut de la facture mis à jour à PAYEE. |
| US-21 | En tant qu'administrateur, je veux consulter toutes les factures avec filtres (statut, client, date). | Administrateur | Élevée | Liste paginée ; filtres fonctionnels. |
| US-22 | En tant que client, je veux consulter mes factures. | Client | Moyenne | Seules les factures liées au client connecté sont affichées ; lecture seule. |
| US-23 | En tant que technicien, je veux consulter l'historique de mes interventions réalisées ou annulées. | Technicien | Moyenne | Seules les interventions assignées au technicien connecté sont affichées. |
| US-24 | En tant que client, je veux consulter l'historique des interventions sur mes équipements. | Client | Moyenne | Seules les interventions liées aux équipements du client connecté sont affichées. |
| US-25 | En tant qu'administrateur, je veux consulter un tableau de bord global avec KPIs et graphiques. | Administrateur | Élevée | KPIs : interventions totales / en attente / réalisées, contrats actifs/expirés, clients, équipements, CA mensuel, factures impayées ; graphiques mensuels. |
| US-26 | En tant que technicien, je veux consulter mon tableau de bord personnel. | Technicien | Élevée | Affichage : interventions assignées, taux de réalisation, planning de la semaine. |
| US-27 | En tant que client, je veux consulter mon espace personnel. | Client | Élevée | Affichage : équipements affectés, interventions en cours, pannes ouvertes, factures en attente. |
| US-28 | En tant qu'utilisateur, je veux filtrer, rechercher et paginer les listes de données. | Tous | Moyenne | Filtres disponibles sur toutes les listes ; pagination fonctionnelle. |

## 5.2 Analyse

### 5.2.1 Diagramme de cas d'utilisation du Sprint 3

*[Insérer ici le diagramme de cas d'utilisation Sprint 3]*

Les acteurs impliqués dans ce sprint sont :

**Administrateur** : génération et consultation factures, marquage payée, historique global, tableau de bord admin.

**Technicien** : consultation de son historique, consultation de son tableau de bord personnel.

**Client** : consultation de ses factures, de son historique, de son espace personnel.

### 5.2.2 Description des cas d'utilisation

#### CU-16 : Générer une facture

| **Champ** | **Contenu** |
| --- | --- |
| **Description** | Ce cas d'utilisation permet à l'administrateur de générer une facture pour une intervention éligible. |
| **Acteur principal** | Administrateur |
| **Préconditions** | L'administrateur est authentifié ; une intervention curative réalisée et hors couverture contractuelle existe. |
| **Postconditions** | La facture est créée et enregistrée dans la base de données. |

**Règles d'éligibilité (trois conditions cumulatives) :**

- Type de l'intervention = CURATIVE
- Statut de l'intervention = REALISEE
- Couverture contractuelle = false (couvertureContrat = false)

**Scénario nominal :**

1. L'administrateur accède à la liste des interventions éligibles à la facturation.
2. Il sélectionne une intervention répondant aux trois conditions.
3. Il saisit les lignes de détail de la facture (`LigneFacture`) : main-d'œuvre et matériel utilisé.
4. L'Interface transmet les données au Contrôleur.
5. Le Contrôleur vérifie les trois conditions d'éligibilité.
6. Le Contrôleur calcule le montant HT (somme des lignes), la TVA (19 %) et le montant TTC.
7. La base de données enregistre la facture et ses lignes de détail.
8. La base confirme la création.
9. L'Interface affiche la facture générée.

**Scénario alternatif — Intervention non éligible :**

- L'une des trois conditions n'est pas satisfaite (intervention préventive, ou non réalisée, ou couverte par contrat).
- Le Contrôleur retourne une erreur.
- L'Interface affiche « Intervention non éligible à la facturation ».

**Règles de gestion :**

- **Les interventions préventives ne génèrent jamais de facture.**
- **Les interventions curatives couvertes par un contrat actif ne génèrent pas de facture.**
- La TVA est de **19 %** : montantTTC = montantHT × 1,19.
- La monnaie est le **Dinar Tunisien (TND)**.
- La facture est créée avec le statut IMPAYEE ou EN_ATTENTE.

#### CU-17 : Consulter les factures

| **Champ** | **Contenu** |
| --- | --- |
| **Description** | Ce cas d'utilisation permet de consulter les factures selon les droits d'accès. |
| **Acteurs** | Administrateur, Client |
| **Préconditions** | L'utilisateur est authentifié. |
| **Postconditions** | Les factures accessibles à l'utilisateur sont affichées en lecture seule. |

**Scénario nominal :**

1. L'utilisateur accède au module des factures.
2. Le Contrôleur filtre les factures selon le rôle :
   - Administrateur → toutes les factures.
   - Client → uniquement ses factures.
3. Le contrôleur interroge la base de données avec le filtre approprié.
4. Les factures sont affichées avec les filtres disponibles.

**Règles de gestion :**

- Le client ne peut consulter que ses propres factures.
- La consultation est en lecture seule pour le client.
- L'administrateur peut appliquer des filtres par statut, client et date d'émission.

#### CU-18 : Marquer une facture comme payée

| **Champ** | **Contenu** |
| --- | --- |
| **Description** | Permet à l'administrateur de mettre à jour le statut de paiement d'une facture. |
| **Acteur principal** | Administrateur |
| **Préconditions** | La facture existe avec le statut IMPAYEE ou EN_ATTENTE. |
| **Postconditions** | Le statut de la facture est mis à jour à PAYEE. |

**Scénario nominal :**

1. L'administrateur sélectionne une facture impayée.
2. Il clique sur « Marquer comme payée ».
3. Le Contrôleur met à jour le statut à PAYEE.
4. La base de données effectue la mise à jour.
5. L'Interface confirme la modification.

**Règles de gestion :**

- Seul l'administrateur peut effectuer cette action.
- Le statut PAYEE est définitif.

#### CU-19 : Consulter le tableau de bord administrateur

| **Champ** | **Contenu** |
| --- | --- |
| **Description** | Permet à l'administrateur de consulter les indicateurs globaux du système SAV. |
| **Acteur principal** | Administrateur |
| **Préconditions** | L'administrateur est authentifié ; des données existent dans le système. |
| **Postconditions** | Les statistiques et graphiques sont affichés. |

**Contenu du tableau de bord :**

- Nombre total d'interventions (toutes, en cours, réalisées, annulées) ;
- Contrats actifs et expirés ;
- Nombre de clients et d'équipements dans le catalogue ;
- Chiffre d'affaires mensuel (somme des factures payées du mois en cours) ;
- Nombre de factures impayées ;
- Graphiques d'activité mensuelle (interventions par mois) ;
- Répartition par type d'intervention (préventive / curative).

#### CU-20 : Consulter le tableau de bord technicien

| **Champ** | **Contenu** |
| --- | --- |
| **Description** | Permet au technicien de consulter son tableau de bord personnel. |
| **Acteur principal** | Technicien |
| **Préconditions** | Le technicien est authentifié. |
| **Postconditions** | Les indicateurs personnels et le planning du technicien sont affichés. |

**Contenu du tableau de bord :**

- Nombre d'interventions assignées (en cours et planifiées) ;
- Taux de réalisation (interventions réalisées / total assignées) ;
- Planning de la semaine en cours (interventions à venir) ;
- Dernières interventions réalisées.

#### CU-21 : Consulter l'espace client (dashboard client)

| **Champ** | **Contenu** |
| --- | --- |
| **Description** | Permet au client de consulter un résumé de sa situation dans le système. |
| **Acteur principal** | Client |
| **Préconditions** | Le client est authentifié. |
| **Postconditions** | L'espace personnel du client est affiché. |

**Contenu de l'espace client :**

- Équipements affectés (liste des `ClientEquipement` du client) ;
- Interventions en cours (statut EN_COURS) sur ses équipements ;
- Pannes ouvertes (statut EN_ATTENTE ou PRISE_EN_CHARGE) ;
- Factures en attente de paiement.

#### CU-22 : Consulter l'historique des interventions

| **Champ** | **Contenu** |
| --- | --- |
| **Description** | Permet de consulter l'historique des interventions réalisées ou annulées, filtré selon le rôle. |
| **Acteurs** | Administrateur, Technicien, Client |
| **Préconditions** | L'utilisateur est authentifié. |
| **Postconditions** | L'historique filtré selon le rôle est affiché. |

**Scénario nominal :**

1. L'utilisateur ouvre le module Historique.
2. Le Contrôleur filtre les interventions selon le rôle :
   - Administrateur → toutes les interventions avec statut REALISEE ou ANNULEE.
   - Technicien → uniquement ses interventions assignées avec ces statuts.
   - Client → uniquement les interventions liées à ses `ClientEquipement`.
3. Les résultats sont affichés avec filtres (date, type, statut, client, technicien selon le rôle).

#### CU-23 : Filtrer les interventions

| **Champ** | **Contenu** |
| --- | --- |
| **Description** | Permet de rechercher et filtrer les interventions selon différents critères. |
| **Acteurs** | Administrateur, Technicien, Client |
| **Préconditions** | Des interventions existent dans le système. |
| **Postconditions** | Les résultats filtrés sont affichés avec pagination. |

**Scénario nominal :**

1. L'utilisateur saisit les critères de recherche disponibles selon son rôle.
2. Le système applique les filtres.
3. Les interventions correspondantes sont affichées avec pagination.

## 5.3 Conception

### 5.3.1 Diagramme de classes du Sprint 3

*[Insérer ici le diagramme de classes Sprint 3]*

Les entités impliquées dans ce sprint sont : `Invoice`, `LigneFacture`, `Intervention`, `Contract`, Client, User.

### 5.3.2 Diagrammes de séquence

#### a) Diagramme de séquence : Génération d'une facture

*[Insérer ici le diagramme de séquence — Génération facture]*

#### b) Identification textuelle — Consultation des factures

Nom du cas d'utilisation : Consulter les factures Acteur principal : Administrateur / Client Objectif : Permettre à l'utilisateur de consulter les factures enregistrées dans le système selon ses droits d'accès.

Préconditions :

- L'utilisateur est authentifié.
- Des factures existent dans la base de données.

Postconditions :

- Les factures accessibles à l'utilisateur sont affichées en lecture seule.

Scénario nominal :

1. L'utilisateur ouvre le module des factures.
2. L'Interface transmet la demande au Contrôleur avec l'identifiant et le rôle de l'utilisateur.
3. Le Contrôleur vérifie le rôle :
   - Si rôle = admin → la base de données retourne toutes les factures.
   - Si rôle = client → la base de données retourne uniquement les factures dont le clientId correspond à l'utilisateur connecté.
4. La base de données retourne les enregistrements.
5. Le Contrôleur retourne les données à l'Interface.
6. L'Interface affiche les factures avec les filtres et la pagination.

Règles de gestion :

- L'administrateur voit toutes les factures ; le client ne voit que les siennes.
- La consultation est en lecture seule pour le client.
- Des filtres sont disponibles : statut (PAYEE, IMPAYEE, EN_ATTENTE), date d'émission.

#### c) Diagramme de séquence : Consultation du tableau de bord administrateur

*[Insérer ici le diagramme de séquence — Dashboard administrateur]*

#### d) Identification textuelle — Consultation de l'historique avec filtres

Nom du cas d'utilisation : Consulter l'historique avec filtres Acteur principal : Administrateur / Technicien / Client Objectif : Permettre à l'utilisateur de consulter l'historique des interventions selon son rôle et des critères de filtrage.

Préconditions :

- L'utilisateur est authentifié.
- Des interventions avec statut REALISEE ou ANNULEE existent dans le système.

Postconditions :

- L'historique filtré selon le rôle est affiché avec pagination.

Scénario nominal :

1. L'utilisateur ouvre le module Historique.
2. L'Interface transmet la demande au Contrôleur avec l'identifiant, le rôle et les filtres.
3. Le Contrôleur détermine le périmètre visible selon le rôle :
   - Admin → toutes les interventions REALISEE ou ANNULEE.
   - Technicien → ses interventions assignées avec ces statuts.
   - Client → les interventions liées à ses `ClientEquipement`.
4. Le contrôleur interroge la base de données avec les filtres appropriés.
5. La base retourne les enregistrements.
6. L'Interface affiche les résultats avec pagination.

Règles de gestion :

- Seules les interventions avec statut REALISEE ou ANNULEE apparaissent dans l'historique.
- Le technicien ne voit que ses propres interventions.
- Le client ne voit que les interventions liées à ses équipements affectés.

#### e) Diagramme de séquence : Consultation de l'historique côté client

*[Insérer ici le diagramme de séquence — Historique client]*

#### f) Identification textuelle — Consultation du tableau de bord technicien

Nom du cas d'utilisation : Consulter le tableau de bord technicien Acteur principal : Technicien Objectif : Permettre au technicien de consulter ses indicateurs personnels.

Préconditions :

- Le technicien est authentifié.

Postconditions :

- Le tableau de bord personnel du technicien est affiché.

Scénario nominal :

1. Le technicien accède à son tableau de bord.
2. L'Interface transmet la demande au Contrôleur avec l'identifiant du technicien.
3. Le contrôleur récupère les interventions assignées au technicien depuis la base de données.
4. Le Contrôleur calcule les indicateurs : nombre total d'interventions assignées, nombre en cours, nombre réalisées, taux de réalisation.
5. Le Contrôleur récupère les interventions planifiées pour la semaine en cours.
6. L'Interface affiche le tableau de bord.

Règles de gestion :

- Le tableau de bord est filtré sur le technicien connecté uniquement.
- Le taux de réalisation = interventions REALISEE / total interventions assignées × 100.

#### g) Diagramme de séquence : Consultation de l'espace client

*[Insérer ici le diagramme de séquence — Espace client]*

## Réalisation

[IMAGE À INSÉRER : captures d'écran de réalisation Sprint 3]

## Conclusion du Chapitre 5

Ce sprint a permis de finaliser le système SAV avec les fonctionnalités de pilotage : génération des factures selon les règles d'éligibilité strictes (curative + réalisée + hors contrat), calcul automatique de la TVA à 19 % en dinar tunisien, marquage des factures payées, et des tableaux de bord différenciés pour l'administrateur, le technicien et le client.

---

## Conclusion générale

Ce projet de fin d'études a abouti à la conception et au développement d'une application web de gestion du service après-vente, spécialisée dans la maintenance des climatiseurs et des systèmes de surpression.

L'application offre une solution complète et intégrée pour digitaliser les processus SAV :

**Un référentiel métier structuré** : catalogue d'équipements indépendant des clients, relation `ClientEquipement` pour matérialiser les installations, gestion des contrats avec génération automatique du planning préventif.

**Une gestion opérationnelle complète** : cycle de vie des interventions préventives et curatives, déclaration de pannes avec pièces jointes, conversion panne → intervention, vérification de disponibilité des techniciens.

**Un suivi financier automatisé** : facturation conditionnelle (curative + réalisée + hors contrat), calcul automatique de la TVA à 19 %, gestion des statuts de paiement.

**Des espaces différenciés par rôle** : tableau de bord global pour l'administrateur, tableau de bord personnel pour le technicien, espace client dédié.

Sur le plan technique, ce projet a permis de maîtriser une architecture moderne en trois couches (Frontend Next.js/React, Backend API, Base de données Prisma/MySQL) avec Prisma ORM garantissant la séparation des préoccupations et l'intégrité transactionnelle des données.

La méthodologie Scrum adoptée a permis un développement itératif et incrémental, avec trois sprints progressifs couvrant l'ensemble du périmètre fonctionnel.

Ce projet constitue une base solide pour une mise en production future, avec des perspectives d'évolution comme l'intégration de notifications temps réel, la génération de rapports d'activité avancés ou l'extension à d'autres types d'équipements de maintenance.

*Rapport rédigé dans le cadre d'un Projet de Fin d'Études (PFE) — Licence en Informatique de Gestion*
*Entreprise d'accueil : EDI Solutions*
*Étudiant(e) : Hend Kharrat*

---

## Résumé — Mots-clés — Abstract — Keywords

[IMAGE À INSÉRER : résumé, mots-clés, abstract, keywords]

<!-- END OF CONVERTED DOCX -->
