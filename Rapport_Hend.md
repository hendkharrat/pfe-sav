**PROJET DE FIN D’ETUDES**

#### EN VUE DE L’OBTENTION DU DIPLÔME DE LICENCE

#### EN INFORMATIQUE DE GESTION

#### Parcours : E-Business

```
CONCEPTION ET DEVELOPPEMENT D’UNE APPLICATION WEB DE
GESTION DU SERVICE APRES-VENTE (SAV MANAGER)
```
###### STAGE EFFECTUÉ A : EDI SOLUTIONS

**Présenté par :**

#### Hend Kharrat

```
Devant le Jury composé de :
```
#### M. Kais Loukil (Président)

#### Mme. Sourour Njah (Rapporteur)

#### M. Riadh Turki (Encadrant)

```
Année Universitaire : 202 5 /202 6
```
```
MINISTERE DE L’ENSEIGNEMENT
SUPERIEURET DE LA RECHERCHE
SCIENTIFIQUE
UNIVERSITE DE SFAX
Ecole Supérieure de Commerce
```

### Dédicace

```
Je dédie ce modeste travail à ceux qui ont été ma force, mon soutien et ma source de
motivation tout au long de mon parcours.
À mon cher père, Mohamed Kharrat,
Pour tous les sacrifices consentis, ton soutien constant et la confiance que tu m’as
toujours accordée. Je te témoigne mon profond respect et ma sincère gratitude.
À ma très chère mère, Mouna,
Pour ton amour inconditionnel, ta patience et ta présence permanente à mes côtés.
Merci d’avoir toujours été là pour moi, dans les moments de joie comme dans les
moments difficiles. Cette réussite est aussi la tienne.
À mon fiancé, Mahmoud Kchaou,
Pour ton soutien précieux, ta confiance en moi et l’immense motivation que tu m’as
apportée. Merci de m’avoir encouragée à persévérer et à croire en mes capacités lorsque
j’en avais le plus besoin.
À mes chers frères, Hedi, Abdou et Kayen,
Pour leur affection, leurs encouragements et tous les beaux moments partagés.
À tous ceux qui ont contribué, de près ou de loin, à la réalisation de ce projet.
Avec tout mon amour, ma reconnaissance et mon respect.
```

### Remerciements

Avant tout, je remercie Allah le Tout-Puissant de m’avoir accordé la force, la patience
et la persévérance nécessaires pour mener à bien ce travail.
Je tiens à exprimer ma profonde gratitude à mon encadrant, M. Riadh Turki, pour
son accompagnement, sa disponibilité, ses conseils avisés et son suivi tout au long de la
réalisation de ce projet.
J’adresse également mes sincères remerciements à M. Mohamed Amine Elleuch, qui
m’a beaucoup aidée durant la réalisation de ce projet grâce à son soutien, ses conseils et
son assistance précieuse.
Mes remerciements s’adressent également à l’ensemble de mes enseignants pour la
qualité de leur enseignement et les connaissances qu’ils m’ont transmises durant mon
parcours universitaire.
Enfin, je remercie toutes les personnes qui ont contribué, de près ou de loin, à l’abou-
tissement de ce projet.
À tous, j’exprime ma sincère reconnaissance et ma profonde gratitude.


## Table des matières






- Introduction Générale
- 1 Étude préalable
   - 1.1 Introduction
   - 1.2 Présentation de l’organisme d’accueil
   - 1.3 Cadre du stage
   - 1.4 Cadre du projet
      - 1.4.1 Problématique
      - 1.4.2 Objectifs à atteindre
   - 1.5 Analyse de l’existant
      - 1.5.1 Étude de l’existant
      - 1.5.2 Critiques de l’existant
      - 1.5.3 Les applications existantes
      - 1.5.4 Analyse SWOT
   - 1.6 Solution proposée
   - 1.7 Processus de développement
- 2 Préparation du projet
   - 2.1 Capture des besoins
      - 2.1.1 Spécification des besoins
         - 2.1.1.1 Exigences fonctionnelles
         - 2.1.1.2 Exigences non fonctionnelles
   - 2.2 Modélisation des besoins
      - 2.2.1 Identification des acteurs
      - 2.2.2 Identification des cas d’utilisation
      - 2.2.3 Diagramme de cas d’utilisation global
   - 2.3 Diagramme de classes global
   - 2.4 Pilotage du projet avec Scrum
      - 2.4.1 Équipe et rôles
      - 2.4.2 Le Backlog du produit
      - 2.4.3 Planification des sprints
   - 2.5 Environnement de travail
      - 2.5.1 Environnement matériel
      - 2.5.2 Environnement logiciel
   - 2.6 Architecture de l’application
- 3 Sprint 1 — Authentification et référentiel métier
   - 3.1 Introduction
   - 3.2 Backlog du Sprint
   - 3.3 Analyse
      - 3.3.1 Diagramme de cas d’utilisation du Sprint
      - 3.3.2 Description des cas d’utilisation
         - 3.3.2.1 CU-01 : S’authentifier
         - 3.3.2.2 CU-03 : Gérer les utilisateurs internes
         - 3.3.2.3 CU-04 : Gérer les clients
         - 3.3.2.4 CU-05 : Gérer le catalogue d’équipements
         - 3.3.2.5 CU-06 : Affecter un équipement à un client
         - 3.3.2.6 CU-07 : Gérer les contrats de maintenance
         - 3.3.2.7 CU-08 : Générer automatiquement le planning préventif
   - 3.4 Conception
      - 3.4.1 Diagramme de classes du Sprint
      - 3.4.2 Diagrammes de séquence
         - 3.4.2.1 Diagramme de séquence : Authentification
            - images 3.4.2.2 Diagramme de séquence : Ajout équipement et gestion des
   - 3.5 Réalisation
- 4 Sprint 2 — Gestion des interventions
   - 4.1 Introduction
   - 4.2 Backlog du Sprint
   - 4.3 Analyse
      - 4.3.1 Diagramme de cas d’utilisation du Sprint
      - 4.3.2 Description des cas d’utilisation
         - 4.3.2.1 CU-09 : Affecter un technicien à une intervention
         - 4.3.2.2 CU-10 : Consulter le planning
         - 4.3.2.3 CU-11 : Clôturer une intervention préventive
         - 4.3.2.4 CU-12 : Déclarer une panne
         - 4.3.2.5 CU-13 : Prendre en charge une panne
         - 4.3.2.6 CU-14 : Convertir une panne en intervention curative
   - 4.4 Conception
      - 4.4.1 Diagramme de classes du Sprint
      - 4.4.2 Diagrammes de séquence
            - vérification couverture 4.4.2.1 Diagramme de séquence : Clôture intervention curative et
   - 4.5 Réalisation
- 5 Sprint 3 — Facturation et tableau de bord
   - 5.1 Introduction
   - 5.2 Backlog du Sprint
   - 5.3 Analyse
      - 5.3.1 Diagramme de cas d’utilisation du Sprint
      - 5.3.2 Description des cas d’utilisation
         - 5.3.2.1 CU-16 : Générer une facture
         - 5.3.2.2 CU-17 : Consulter les factures
         - 5.3.2.3 CU-19 : Consulter le tableau de bord administrateur
         - 5.3.2.4 CU-20 : Consulter le tableau de bord technicien
         - 5.3.2.5 CU-21 : Consulter l’espace client
         - 5.3.2.6 CU-22 : Consulter l’historique des interventions
   - 5.4 Conception
      - 5.4.1 Diagramme de classes du Sprint
      - 5.4.2 Diagrammes de séquence
         - 5.4.2.1 Diagramme de séquence : Génération d’une facture
            - client 5.4.2.2 Diagramme de séquence : Consultation de l’historique côté
   - 5.5 Réalisation
- Conclusion Générale
- 1.1 Logo d’EDI SOLUTIONS Table des figures
- 1.2 Diagramme de la méthodologie Scrum
- 2.1 Diagramme de cas d’utilisation global
- 2.2 Diagramme de classes global
- 3.1 Diagramme de cas d’utilisation du Sprint
- 3.2 Diagramme de classes du Sprint
- 3.3 Diagramme de séquence : Authentification
- 3.4 Diagramme de séquence : Ajout équipement et gestion des images
- 3.5 Capture d’écran : interface d’authentification
- 3.6 Capture d’écran : tableau de bord administrateur
- 3.7 Capture d’écran : gestion des clients
- 3.8 Capture d’écran : gestion des contrats
- 4.1 Diagramme de cas d’utilisation du Sprint
- 4.2 Diagramme de classes du Sprint
   - verture 4.3 Diagramme de séquence : Clôture intervention curative et vérification cou-
- 4.4 Capture d’écran : gestion des interventions
- 4.5 Capture d’écran : gestion des pannes
- 4.6 Capture d’écran : conversion d’une panne en intervention curative
- 5.1 Diagramme de cas d’utilisation du Sprint
- 5.2 Diagramme de classes du Sprint
- 5.3 Diagramme de séquence : Génération d’une facture
- 5.4 Diagramme de séquence : Consultation de l’historique côté client
- 5.5 Capture d’écran de la gestion des factures
- 5.6 Capture d’écran : tableau de bord technicien
- 5.7 Capture d’écran : tableau de bord client
- 1.1 Critiques de l’existant Liste des tableaux
- 1.2 Analyse SWOT de la situation actuelle du service après-vente
- 2.1 Exigences fonctionnelles
- 2.2 Exigences non fonctionnelles
- 2.3 Identification des acteurs
- 2.4 Description des classes
- 2.5 Équipe et rôles Scrum
- 2.6 Product Backlog
- 2.7 Planification des sprints
- 2.8 Environnement matériel
- 2.9 Environnement logiciel
- 3.1 Backlog du Sprint
- 3.2 CU-01 : S’authentifier
- 3.3 CU-03 : Gérer les utilisateurs internes
- 3.4 CU-04 : Gérer les clients
- 3.5 CU-05 : Gérer le catalogue d’équipements
- 3.6 CU-06 : Affecter un équipement à un client
- 3.7 CU-07 : Gérer les contrats de maintenance
- 3.8 CU-08 : Générer automatiquement le planning préventif
- 4.1 Backlog du Sprint
- 4.2 CU-09 : Affecter un technicien à une intervention
- 4.3 CU-10 : Consulter le planning
- 4.4 CU-11 : Clôturer une intervention préventive
- 4.5 CU-12 : Déclarer une panne
- 4.6 CU-13 : Prendre en charge une panne
- 4.7 CU-14 : Convertir une panne en intervention curative
- 5.1 Backlog du Sprint
- 5.2 CU-16 : Générer une facture
- 5.3 CU-17 : Consulter les factures
- 5.4 CU-19 : Consulter le tableau de bord administrateur
- 5.5 CU-20 : Consulter le tableau de bord technicien
- 5.6 CU-21 : Consulter l’espace client
- 5.7 CU-22 : Consulter l’historique des interventions


## Introduction Générale

De nos jours, les entreprises se trouvent dans un contexte caractérisé par une rapide
transformation digitale, les incitant à actualiser leurs pratiques de gestion pour accroître
leur efficacité et la qualité de leurs services. Dans ce cadre, la consolidation des données
et l’automatisation des processus deviennent des éléments clés pour garantir un meilleur
suivi des actions et une prise de décision plus efficiente.Le service après-vente (SAV),
en particulier dans le secteur de la maintenance technique, se fonde sur la gestion des
clients, des équipements, des contrats et des interventions. Néanmoins, ces processus sont
fréquemment administrés de façon classique, ce qui cause des problèmes de traçabilité,
un déficit de coopération entre les parties prenantes et un danger d’inexactitudes ou de
perte d’informations.
Ce projet de fin d’études a pour objectif de créer et réaliser une application web pour
la gestion du service après-vente axée sur la maintenance des climatiseurs et des systèmes
de surpression. Le but principal est de regrouper les données, d’améliorer la gestion des
interventions et de renforcer la traçabilité des actions ainsi que la communication entre
les divers utilisateurs du système.
Pour réussir ce projet, la méthode Scrum a été mise en place. Elle permet un dévelop-
pement progressif et itératif du système par le biais de plusieurs sprints, tout en assurant
une meilleure réactivité aux besoins et une évolution continue du produit.

1. Le premier chapitre présente l’étude préalable, le contexte du projet, ainsi que la
    problématique et la solution suggérée.
2. Le deuxième chapitre est dédié à la collecte et à la définition des besoins.
3. Le troisième chapitre traite le Sprint 1 : Authentification et référentiel métier.
4. Le quatrième chapitre traite le Sprint 2 : Gestion des interventions.
5. Le cinquième chapitre traite le Sprint 3 : Facturation et tableau de bord.


Chapitre

## 1 Étude préalable

### 1.1 Introduction

```
Ce premier chapitre établit les fondations du projet en décrivant l’organisme d’accueil,
le contexte du stage , l’étude de la situation actuelle, la question soulevée et la réponse
suggérée.
```
### 1.2 Présentation de l’organisme d’accueil

```
EDI SOLUTIONS est une entreprise spécialisée dans les services d’ingénierie informa-
tique et les solutions digitales. Ses activités couvrent le développement d’applications web
et mobiles, l’intégration de solutions ERP et cloud, le conseil en systèmes d’information
et l’accompagnement à la transformation digitale. L’organisation est orientée projets,
s’appuyant sur des méthodes agiles et des technologies modernes telles que React et
Next.js.
```
```
Figure 1.1 – Logo d’EDI SOLUTIONS
```
### 1.3 Cadre du stage

```
Ce travail s’inscrit dans le cadre d’un stage de fin d’études de quatre mois, réalisé en
dernière année de licence en informatique de gestion. Les missions effectuées ont porté sur
l’analyse des besoins, la conception UML, la définition de l’architecture et le développe-
ment progressif de l’application selon la méthodologie Scrum. La contribution principale a
consisté à concevoir et développer une application web de gestion du service après-vente,
couvrant la planification des interventions, la traçabilité des opérations et la facturation
automatisée.
```

Chapitre 1. Étude préalable

### 1.4 Cadre du projet

#### 1.4.1 Problématique

La gestion actuelle du service après-vente rencontre divers problèmes liés à l’absence
d’un système automatisé et centralisé. Cela cause des complications dans l’organisation
des interventions,un contrôle inadéquat des contrats d’entretien, et une confusion entre
les interventions préventives et curatives.
En outre, la facturation des interventions en dehors du contrat s’effectue de manière
manuelle, ce qui accroît le risque d’inexactitudes et retarde l’ensemble du processus.
L’absence de visibilité instantanée sur les interventions et les techniciens rendent éga-
lement la prise de décision plus complexe.

#### 1.4.2 Objectifs à atteindre

L’objectif principal est de concevoir et développer une application web pour digitaliser
et centraliser la gestion du service après-vente. Les objectifs spécifiques sont :

```
— Centraliser les données clients, équipements et contrats.
— Automatiser la planification des interventions préventives à la création des contrats.
— Assurer le suivi complet des interventions curatives et leur traçabilité.
— Automatiser la génération des factures pour les interventions hors contrat.
— Fournir une meilleure visibilité via des tableaux de bord différenciés par rôle.
```
### 1.5 Analyse de l’existant

#### 1.5.1 Étude de l’existant

Avant ce projet, le service après-ventes s’appuyait sur des outils de bureau (tableaux,
fichiers,papier, communication écrite et appels téléphoniques). Les données concernant
les clients, les équipements,les contrats et les interventions étaient éparpillés sur divers
supports, compliquant le suivi etla coordination difficile. Les actions préventives étaient
organisées de manière manuelle selon les périodicités contractuelles, et la facturation des
interventions non couvertes par le contrat était aussi effectuée de manière artisanale.


Chapitre 1. Étude préalable

Une analyse comparative des outils disponibles, y compris des ERP généralistes et des
applications de gestion.de maintenance (GMAO) a révélé que ces options sont soit trop
compliquées et onéreuses pour des PME,soit trop vagues pour s’adapter aux particularités
de la maintenance des climatiseurs et de systèmes de surpression. Cette observation justifie
la création d’une solution personnalisée.

#### 1.5.2 Critiques de l’existant

```
Table 1.1 – Critiques de l’existant
Aspect étudié Avantages Inconvénients
Gestion des clients et
équipements
```
```
Les informations de base sur
les clients et le matériel sont
bien conservées.
```
```
Informations dispersées sur
plusieurs supports, ce qui com-
plique leur gestion.
Gestion des contrats Existence d’un suivi des
contrats de maintenance.
```
```
Difficulté de mise à jour et
consultation rapide.
Planification des
interventions
```
```
Les visites préventives sont or-
ganisées en fonction de leur pé-
riodicité.
```
```
La planification manuelle peut
entraîner des oublis.
```
```
Gestion des
interventions
curatives
```
```
Possibilité d’enregistrer les de-
mandes clients.
```
```
Manque d’automatisation
dans le traitement.
```
```
Suivi des
interventions
```
```
Un historique est conservé
dans les documents internes.
```
```
Traçabilité limitée et difficile à
exploiter.
Communication
entre acteurs
```
```
Les échanges directs sont ra-
pides.
```
```
Risque de perte d’informations
et coordination complexe.
Facturation Facturation basée sur les inter-
ventions réalisées.
```
```
La génération des factures est
manuelle et nécessite beaucoup
de temps.
Outils utilisés Simplicité des outils bureau-
tiques.
```
```
Absence de centralisation et
faible intégration.
```

Chapitre 1. Étude préalable

#### 1.5.3 Les applications existantes

a) Application 1 : Odoo Maintenance
Odoo est un ERP open source qui propose plusieurs modules, notamment pour la
gestion de maintenance, le support client et la facturation.
Avantages :

- Gestion des équipements
- Planification des maintenances préventives
- Gestion des tickets
Limites :
- Complexité de configuration
- Coût élevé pour certaines fonctionnalités
- Trop généraliste pour des besoins spécifiques
b) Application 2 : Mainti4 (exemple logiciel GMAO)
Avantages :
- Planification automatique
- Historique complet des interventions
- Tableaux de bord analytiques
Limites :
- Solution lourde pour PME
- Interface parfois complexe
- Formation nécessaire


Chapitre 1. Étude préalable

#### 1.5.4 Analyse SWOT

```
Table 1.2 – Analyse SWOT de la situation actuelle du service après-vente
Forces Faiblesses
Internes Existence d’un processus SAV struc-
turé ; expérience métier des tech-
niciens ; disponibilité d’un histo-
rique des interventions ; présence de
contrats de maintenance ; relation
continue avec les clients.
```
```
Absence d’un système informatisé
centralisé ; données dispersées (Ex-
cel, papier, appels) ; suivi manuel des
interventions et contrats ; manque de
visibilité en temps réel ; risque élevé
d’erreurs dans la facturation.
Externes Opportunités : transformation di-
gitale des entreprises ; automatisa-
tion des processus métier ; améliora-
tion de la productivité ; meilleure ex-
ploitation des données.
```
```
Menaces : résistance au change-
ment des utilisateurs ; risque de
perte de données existantes ; dépen-
dance aux méthodes manuelles ac-
tuelles ; complexité d’adoption du
nouveau système.
```
L’analyse SWOT confirme que l’organisation dispose d’une structure métier existante,
mais que l’absence de centralisation et d’automatisation constitue un frein majeur à l’ef-
ficacité opérationnelle.

### 1.6 Solution proposée

Nous proposons une application web de gestion du service après-vente dédiée à la
maintenance des climatiseurs et des systèmes de surpression. Cette solution couvrira les
modules suivants :

```
— * Gestion des utilisateurs internes (administrateur et technicien) et des clients
— * Catalogue global d’équipements avec affectation client via ClientEquipement
— * Gestion des contrats avec génération automatique du planning préventif
— * Suivi complet des interventions préventives et curatives
— * Déclaration de pannes en ligne avec pièces jointes
— * Facturation automatisée des interventions hors contrat (TVA 19 %, TND)
```

Chapitre 1. Étude préalable

```
— * Tableaux de bord différenciés par rôle (administrateur, technicien, client).
```
### 1.7 Processus de développement

Pour la conduite du projet, la méthode Scrum a été adoptée. Cette approche agile
est fondée sur des cycles courts appelés sprints, permettant un développement itératif et
une adaptation continue aux besoins. Le projet est organisé en trois sprints progressifs
couvrant l’ensemble du périmètre fonctionnel.

```
Figure 1.2 – Diagramme de la méthodologie Scrum
```

Chapitre 2. Préparation du projet

Pour la modélisation du système, le langage UML est utilisé à travers trois types de
diagrammes : diagrammes de cas d’utilisation, de classes et de séquence, qui structurent
la conception et la documentation des fonctionnalités développées.

### Conclusion

Ce chapitre a présenté le cadre général du projet ainsi que les limites du système
en place. La recherche a révélé l’importance de développer une solution informatique
adéquate. La proposition avancée repose sur une application web pour la gestion du service
après-vente, élaborée en suivant la méthode Scrum.
Le chapitre suivant abordera la préparation du projet ainsi que l’analyse des
besoins.


Chapitre

## 2 Préparation du projet

### 2.1 Capture des besoins

#### 2.1.1 Spécification des besoins

##### 2.1.1.1 Exigences fonctionnelles

```
Table 2.1 – Exigences fonctionnelles
Module Description condensée
Authentification Connexion par e-mail ou téléphone, contrôle d’accès par rôle
(RBAC), déconnexion sécurisée.
Utilisateurs CRUD des comptes internes (administrateur, technicien)
avec désactivation logique et restauration.
Clients CRUD des fiches clients (société ou personne physique), ville
tunisienne, accès portail client.
Équipements Catalogue global (climatiseur, système de surpression) avec
images multiples et image principale.
Affectation Association équipement–client via ClientEquipement avec
date d’achat, date d’installation et localisation.
Contrats CRUD des contrats couvrant des installations
ClientEquipement avec périodicité et statut calculé.
Planning préventif Génération automatique des interventions préventives lors
de la création d’un contrat.
Interventions Cycle de vie complet (préventives et curatives), affectation
technicien avec vérification de disponibilité.
Pannes Déclaration par le client avec pièces jointes ; conversion en
intervention curative par l’administrateur.
Facturation Génération des factures pour interventions curatives hors
contrat (TVA 19 %, TND) ; marquage payée.
```

Chapitre 2. Préparation du projet

```
Exigences fonctionnelles (suite)
Module Description condensée
Tableaux de bord Dashboard global administrateur, dashboard personnel
technicien, espace client différencié.
Historique Consultation de l’historique des interventions filtrée selon le
rôle de l’utilisateur connecté.
```
##### 2.1.1.2 Exigences non fonctionnelles

```
Table 2.2 – Exigences non fonctionnelles
Exigence Description
Sécurité Authentification obligatoire, contrôle d’accès RBAC, mots de
passe chiffrés, session sans stockage en clair.
Performance Temps de réponse rapide, listes paginées pour limiter le volume
de données chargées.
Ergonomie Interface en français, intuitive, responsive (desktop, tablette,
mobile), thèmes clair et sombre.
Maintenabilité TypeScript avec typage strict, architecture modulaire,
composants réutilisables.
Disponibilité Accessible depuis tout navigateur web moderne sans installation
préalable.
Localisation Monnaie TND, TVA 19 %, liste de villes tunisiennes intégrée.
Fiabilité Validation des données côté client, messages d’erreur explicites.
```
### 2.2 Modélisation des besoins

#### 2.2.1 Identification des acteurs

```
Le système fait intervenir quatre acteurs ayant des rôles distincts :
```

Chapitre 2. Préparation du projet

```
Table 2.3 – Identification des acteurs
Acteur Permissions principales
Administrateur Gère les utilisateurs, les clients, les équi-
pements, les contrats, les interventions, les
factures et le suivi global du système.
Technicien Réalise les interventions, consulte son
planning et son historique.
Client Déclare les pannes, consulte ses factures,
ses interventions et son historique.
```
#### 2.2.2 Identification des cas d’utilisation

Les associations entre acteurs et cas d’utilisation sont représentées dans le diagramme
global. L’administrateur hérite des fonctionnalités du technicien, tandis que le client dis-
pose d’un accès limité aux fonctions de déclaration et de consultation.


Chapitre 2. Préparation du projet

#### 2.2.3 Diagramme de cas d’utilisation global

```
Figure 2.1 – Diagramme de cas d’utilisation global
```
### 2.3 Diagramme de classes global

Le diagramme de classes global représente la structure générale du système ainsi que
les relations entre les onze entités principales.


Chapitre 2. Préparation du projet

```
Figure 2.2 – Diagramme de classes global
```

Chapitre 2. Préparation du projet

```
Description des classes :
Table 2.4 – Description des classes
Entité Description
User Utilisateur interne (administrateur ou technicien). Attributs :
prenom, nom, email, role (admin/technician), actif.
Client Client métier (société ou personne physique). Attributs : type-
Client, societe, prenom, nom, email, adresse, ville.
Equipment Équipement du catalogue global, indépendant de tout client. At-
tributs : reference, type (CLIMATISEUR/SYSTEME_SURPRESSION),
marque, modele, numeroSerie.
EquipmentImage Image associée à un équipement. Attribut notable : isMain
( désigne l’image principale).
ClientEquipement Table de jonction Client–Equipment matérialisant une installa-
tion. Attributs : dateAchat, dateInstallation, localisation
(optionnel).
Contract Contrat de maintenance couvrant des installations
ClientEquipement. Attributs : reference, dateDebut, date-
Fin, periodicite, statut (ACTIF/BIENTOT_EXPIRE/EXPIRE).
Intervention Intervention préventive ou curative, sans champ de priorité.
Attributs : type (PREVENTIVE/CURATIVE), datePrevue, statut
(PLANIFIEE/EN_COURS/REALISEE/ANNULEE), couvertureContrat.
Panne Déclaration de panne par un client, sans champ de
priorité. Attributs : dateDeclaration, description, statut
(EN_ATTENTE/PRISE_EN_CHARGE/CONVERTIE/ANNULEE).
PieceJointe Pièce jointe associée à une panne. Attributs : filename, size, type
(image, PDF ou audio).
Facture Facture pour une intervention curative réalisée hors contrat.
Attributs : numero, dateEmission, montantHT, tva (19 %),
montantTTC, statut (PAYEE/IMPAYEE/EN_ATTENTE).
LigneFacture Ligne de détail d’une facture. Attributs : description, quantite,
prixUnitaire, montant.
```

Chapitre 2. Préparation du projet

### 2.4 Pilotage du projet avec Scrum

#### 2.4.1 Équipe et rôles

```
Le projet est organisé selon la méthodologie Scrum. Les rôles principaux sont :
Table 2.5 – Équipe et rôles Scrum
Rôle Description
Product Owner Définit les besoins fonctionnels du projet et priorise le
backlog
Scrum Master Assure le suivi de la méthodologie Scrum et facilite les
cérémonies
Équipe de développement Réalise l’analyse, la conception et le développement des
fonctionnalités
```
#### 2.4.2 Le Backlog du produit

Le backlog complet comporte 28 user stories. Le tableau suivant présente les user
stories représentatives couvrant les principaux modules du système.

```
Table 2.6 – Product Backlog
ID User Story Acteur Priorité Sprint
US-01 En tant qu’utilisateur, je souhaite me connecter
en utilisant mon adresse e-mail ou mon numéro
de téléphone et mon mot de passe..
```
```
Tout utilisa-
teur
```
```
Haute S1
```
```
US-04 Le système restreint automatiquement l’accès
aux pages selon le rôle de l’utilisateur.
```
```
Système
(auto)
```
```
Haute S1
```
```
US-08 En tant qu’administrateur, je veux affecter
un équipement du catalogue à un client via
ClientEquipement.
```
```
Administrateur Haute S1
```
```
US-09 En tant qu’administrateur, je veux créer
un contrat couvrant des installations
ClientEquipement.
```
```
Administrateur Haute S1
```

Chapitre 2. Préparation du projet

```
Product Backlog (suite)
ID User Story Acteur Priorité Sprint
US-11 En tant qu’administrateur, je veux affecter un
technicien disponible à une intervention.
```
```
Administrateur Haute S2
```
```
US-16 En tant que client, je veux déclarer une panne
avec pièces jointes.
```
```
Client Haute S2
```
```
US-19 En tant qu’administrateur, je veux générer une
facture pour une intervention curative réalisée
hors contrat (TVA 19 %, TND).
```
```
Administrateur Haute S3
```
```
US-25 En tant qu’administrateur, je veux consulter un
tableau de bord global avec KPIs et graphiques.
```
```
Administrateur Haute S3
```
#### 2.4.3 Planification des sprints

```
Table 2.7 – Planification des sprints
Sprint Objectif Fonctionnalités couvertes Entités concernées
Sprint 1 Authentification
et référentiel
métier
```
```
Connexion (email ou téléphone),
contrôle d’accès RBAC ; CRUD utili-
sateurs (soft-delete), clients et équipe-
ments ; affectation ClientEquipement ;
contrats et planning préventif
automatique.
```
```
User,Client,
Equipment,
EquipmentImage,
ClientEquipement,
Contract
```
```
Sprint 2 Gestion des in-
terventions et
des pannes
```
```
Affectation technicien (vérification dis-
ponibilité) ; démarrage et clôture
interventions ; déclaration panne avec
pièces jointes ; conversion panne
→ curative ; vérification couverture
contractuelle.
```
```
Intervention,
Panne, PieceJointe,
Contract,
ClientEquipement
```

Chapitre 2. Préparation du projet

```
Sprint Objectif Fonctionnalités couvertes Entités concernées
Sprint 3 Facturation,
historique et
tableaux de
bord
```
```
Génération factures (curative + hors
contrat, TVA 19 %) ; marquage payée ;
historique par rôle ; dashboards
administrateur, technicien et client.
```
```
Facture,
LigneFacture,
Intervention,
Client, User
```
### 2.5 Environnement de travail

#### 2.5.1 Environnement matériel

```
Le développement de l’application a été réalisé avec les équipements suivants :
Table 2.8 – Environnement matériel
Élément Caractéristiques
Machine PC Portable
Processeur Intel Core i5
Mémoire RAM 8 Go
Stockage SSD 512 Go
```
#### 2.5.2 Environnement logiciel

```
Table 2.9 – Environnement logiciel
Outil Description
Visual Studio Code Environnement de développement intégré
Next.js Framework Frontend (App Router)
React Bibliothèque JavaScript
TypeScript Typage statique strict
Tailwind CSS Framework CSS utilitaire
Prisma ORM pour la base de données
MySQL Système de gestion de base de données
```

Chapitre 3. Sprint 1 — Authentification et référentiel métier

### 2.6 Architecture de l’application

L’application repose sur une structure web en trois niveaux qui distingue nettement
leinterface utilisateur, la logique applicative et le système de données.
Couche présentation (Frontend) Le frontend de l’application est développé en
utilisant Next.js et React. Cette combinaison permet de créer une interface utilisateur à
la fois moderne et dynamique. Les composants React assurent une séparation claire des
responsabilités d’affichage.
Couche logique métier (Backend / API) La couche backend expose des routes
API RESTful implémentées sous forme de contrôleurs. Chaque contrôleur gère la valida-
tion des données, l’exécution de la logique métier et les appels vers la base de données.
Couche d’accès aux données (Prisma / MySQL) L’accès à la base de données est
géré via Prisma ORM. Cette couche exécute les requêtes vers la base de données MySQL et
garantit l’intégrité des données via la gestion des transactions (COMMIT/ROLLBACK).

### Conclusion

Dans ce chapitre, nous avons défini les exigences fonctionnelles et non fonctionnelles
de l’application en détaillant leurs règles de fonctionnement. Nous avons repéré 3 acteurs
(Administrateur, Technicien et Client) en illustrant leurs interactions au moyen de 28 User
Stories distribuées sur 3 sprints. Le diagramme de classes global montre les 11 entités
du modèle, intégrant l’entité intermédiaire ClientEquipement qui relie les clients aux
équipements du catalogue.
Le chapitre suivant abordera le Sprint 1 dédié à l’authentification etréférentiel métier.


Chapitre

## 3 Sprint 1 — Authentification et référentiel métier

### 3.1 Introduction

```
Dans le chapitre précédent, nous avons traité de la phase préparatoire du projet ainsi
que des spécifications du système. Ce chapitre aborde le premier sprint du projet, réalisé
selon la méthode Scrum. Ce sprint est essentiel pour le développement de l’application,
car il établit les fondations du système, surtout en ce qui concerne l’authentification des
utilisateurs et la gestion des données cruciales.
Les fonctionnalités développées pendant ce sprint sont principalement axées sur :
— L’authentification par e-mail ou numéro de téléphone
— La gestion des utilisateurs internes avec désactivation logique et restauration
— La gestion des clients (société ou personne physique)
— La gestion du catalogue d’équipements avec images multiples
— L’affectation des équipements aux clients via ClientEquipement
— La gestion des contrats de maintenance avec génération automatique du planning
préventif.
```
### 3.2 Backlog du Sprint 1

```
Table 3.1 – Backlog du Sprint 1
ID User Story Acteur Priorité
US-01 En tant qu’utilisateur, je souhaite me
connecter à l’aide de mon e-mail ou de mon
numéro de téléphone ainsi que de mon mot
de passe
```
```
Tout
utilisateur
```
```
Élevée
```

Chapitre 3. Sprint 1 — Authentification et référentiel métier

```
Backlog du Sprint 1 (suite)
ID User Story Acteur Priorité
US-03 En tant qu’administrateur, je veux gérer
les comptes utilisateurs internes (CRUD +
désactivation + restauration).
```
```
Administrateur Élevée
```
```
US-04 Le système contrôle automatiquement les
accès selon le rôle de l’utilisateur connecté.
```
```
Système (auto) Élevée
```
```
US-05 En tant qu’administrateur, je veux créer une
fiche client (société ou personne physique).
```
```
Administrateur Élevée
```
```
US-07 En tant qu’administrateur, je souhaite
inclure un appareil dans le catalogue mondial
avec plusieurs images..
```
```
Administrateur Élevée
```
```
US-08 En tant qu’administrateur, je veux affecter
un équipement du catalogue à un client via
ClientEquipement.
```
```
Administrateur Élevée
```
```
US-09 En tant qu’administrateur, je veux créer
un contrat couvrant des installations
ClientEquipement.
```
```
Administrateur Élevée
```
```
US-10 Le système génère automatiquement le
planning préventif lors de la création d’un
contrat.
```
```
Système (auto) Élevée
```

Chapitre 3. Sprint 1 — Authentification et référentiel métier

### 3.3 Analyse

#### 3.3.1 Diagramme de cas d’utilisation du Sprint 1

```
Figure 3.1 – Diagramme de cas d’utilisation du Sprint 1
```
Acteurs impliqués dans ce sprint :
Administrateur : gestion des utilisateurs, clients, catalogue équipements, affectation
ClientEquipement, contrats.
Tout utilisateur : connexion.
Comportements automatiques du système : contrôle d’accès selon le rôle, génération
du planning préventif.


Chapitre 3. Sprint 1 — Authentification et référentiel métier

#### 3.3.2 Description des cas d’utilisation

##### 3.3.2.1 CU-01 : S’authentifier

```
Table 3.2 – CU-01 : S’authentifier
Champ Contenu
Description Ce cas d’utilisation permet à un utilisateur de s’authentifier
dans le système.
Acteurs Administrateur, Technicien, Client
Préconditions L’utilisateur possède un compte valide et actif.
Postconditions L’utilisateur accède à son espace personnel selon son rôle.
```
```
Scénario nominal :
```
1. L’utilisateur ouvre l’interface de connexion.
2. Il saisit son identifiant (adresse e-mail ou numéro de téléphone à 8 chiffres)
    et son mot de passe.
3. Le système détecte le type d’identifiant : si l’identifiant contient un « @ », il s’agit
    d’un e-mail ; sinon, il s’agit d’un numéro de téléphone.
4. Le système recherche l’utilisateur correspondant dans la base de données.
5. Le système vérifie le mot de passe.
6. Le système crée la session et redirige l’utilisateur vers son tableau de bord selon son
    rôle.
Scénarios alternatifs :
— Identifiant (e-mail ou téléphone) non reconnu → message d’erreur affiché.
— Mot de passe incorrect → message d’erreur affiché.
— Compte inactif (actif = false) → accès refusé avec message d’erreur.


Chapitre 3. Sprint 1 — Authentification et référentiel métier

##### 3.3.2.2 CU-03 : Gérer les utilisateurs internes

```
Table 3.3 – CU-03 : Gérer les utilisateurs internes
Champ Contenu
Description Ce cas d’utilisation permet à l’administrateur de gérer les
comptes des utilisateurs internes (administrateurs et techni-
ciens).
Acteur principal Administrateur
Préconditions L’administrateur est authentifié.
Postconditions Les modifications sont enregistrées dans la base de données.
```
Fonctionnalités :
— Créer un utilisateur interne (prénom, nom, e-mail, téléphone, rôle, mot de passe)
— Modifier un utilisateur existant
— Désactiver un utilisateur (soft-delete : actif = false)
— Restaurer un utilisateur désactivé (actif = true)
— Consulter la liste des utilisateurs avec filtres.
Scénario nominal : Le scénario consiste à saisir les informations requises ou à sélec-
tionner un utilisateur existant, à valider les données côté contrôleur (unicité de l’e-mail,
chiffrement du mot de passe), puis à enregistrer la modification en base et à actualiser
l’affichage.
Règles de gestion :
— Chaque utilisateur interne doit avoir un e-mail unique.
— Le mot de passe est chiffré avant stockage.
— Un utilisateur désactivé (actif = false) ne peut plus se connecter.
— L’action « Restaurer » remet actif = true.
— Les comptes clients ne sont pas gérés ici — ils appartiennent au module Clients.


Chapitre 3. Sprint 1 — Authentification et référentiel métier

##### 3.3.2.3 CU-04 : Gérer les clients

```
Table 3.4 – CU-04 : Gérer les clients
Champ Contenu
Description Ce cas d’utilisation permet à l’administrateur de gérer les
fiches clients.
Acteur principal Administrateur
Préconditions L’administrateur est authentifié.
Postconditions Les modifications sont enregistrées dans la base de données.
```
```
Fonctionnalités :
— Créer un client de type société (champs : raison sociale societe, nom du contact)
ou personne physique (champs : prenom, nom)
— Renseigner e-mail, téléphone, adresse, ville (liste tunisienne), mot de passe portail
— Modifier et supprimer un client
— Consulter la liste avec filtres.
Règles de gestion :
— Le type SOCIETE requiert le champ societe (raison sociale).
— Le type PERSONNE_PHYSIQUE requiert les champs prenom et nom.
— L’e-mail doit être unique dans le système.
— Chaque client dispose d’un mot de passe pour accéder au portail client.
```
##### 3.3.2.4 CU-05 : Gérer le catalogue d’équipements

```
Table 3.5 – CU-05 : Gérer le catalogue d’équipements
Champ Contenu
Description Ce cas d’utilisation permet à l’administrateur de gérer le
catalogue global d’équipements, indépendant de tout client.
Acteur principal Administrateur
Préconditions L’administrateur est authentifié.
Postconditions L’équipement est enregistré dans le catalogue.
```

Chapitre 3. Sprint 1 — Authentification et référentiel métier

```
Fonctionnalités :
— Créer un équipement avec : référence, type (CLIMATISEUR ou
SYSTEME_SURPRESSION), marque, modèle, numéro de série, description
— Ajouter plusieurs images (EquipmentImage) dont une image principale (isMain =
true)
— Modifier et supprimer un équipement
— Consulter le catalogue avec filtres par type et marque.
Règles de gestion :
— Le catalogue est global : un équipement n’appartient pas à un client spécifique.
— Le numéro de série est unique.
— Une seule image est désignée comme image principale.
```
##### 3.3.2.5 CU-06 : Affecter un équipement à un client

```
Table 3.6 – CU-06 : Affecter un équipement à un client
Champ Contenu
Description Ce cas d’utilisation permet à l’administrateur de créer
un enregistrement ClientEquipement qui matérialise
l’installation d’un équipement du catalogue chez un client.
Acteur principal Administrateur
Préconditions L’administrateur est authentifié ; le client existe ; l’équipement
existe dans le catalogue.
Postconditions Un enregistrement ClientEquipement est créé en base de
données.
```
Scénario nominal : L’administrateur sélectionne l’équipement et le client, renseigne
la date d’installation et valide ; le contrôleur vérifie l’existence des deux entités et l’absence
de doublon avant d’enregistrer le ClientEquipement.
Règles de gestion :
— La date d’installation est obligatoire. La localisation est facultative.
— Un même équipement peut être affecté à plusieurs clients différents (via des enre-
gistrements ClientEquipement distincts).


Chapitre 3. Sprint 1 — Authentification et référentiel métier

```
— L’affectation ne modifie pas le catalogue global.
```
##### 3.3.2.6 CU-07 : Gérer les contrats de maintenance

```
Table 3.7 – CU-07 : Gérer les contrats de maintenance
Champ Contenu
Description Ce cas d’utilisation permet à l’administrateur de créer
un contrat de maintenance couvrant des installations
ClientEquipement.
Acteur principal Administrateur
Préconditions L’administrateur est authentifié ; le client existe ;
des enregistrements ClientEquipement existent pour ce
client.
Postconditions Le contrat est enregistré en base ; les interventions préventives
sont générées automatiquement par le Système.
```
Scénario nominal : L’administrateur saisit les informations du contrat (client, dates,
périodicité, installations ClientEquipement couvertes) ; le contrôleur vérifie la cohérence
des dates et l’appartenance des installations au client, enregistre le contrat dans une
transaction et déclenche la génération automatique du planning préventif.
Scénarios alternatifs : En cas d’erreur (dates invalides, installations non rattachées
au client ou échec base de données), l’opération est interrompue, la transaction est annulée
et un message explicite est affiché.
Règles de gestion :
— Un contrat couvre des installations ClientEquipement, et non des équipements du
catalogue directement.
— Le statut est calculé dynamiquement : ACTIF si fin > aujourd’hui + 30 jours ;
BIENTOT_EXPIRE si fin entre aujourd’hui et aujourd’hui + 30 jours ; EXPIRE si fin <
aujourd’hui.
— La génération du planning est automatique et ne requiert aucune action manuelle
de l’administrateur.


Chapitre 3. Sprint 1 — Authentification et référentiel métier

##### 3.3.2.7 CU-08 : Générer automatiquement le planning préventif

```
Table 3.8 – CU-08 : Générer automatiquement le planning préventif
Champ Contenu
Description Ce cas d’utilisation décrit le traitement automatique
déclenché par le système lors de la sauvegarde d’un contrat.
Déclencheur Comportement automatique du système
Préconditions Un contrat valide vient d’être enregistré avec ses
clientEquipementIds[], ses dates et sa périodicité.
Postconditions Les interventions préventives sont créées en base de données
pour toute la durée du contrat.
```
Scénario nominal : Le système calcule les dates d’intervention selon la périodicité et
les installations couvertes, puis génère les interventions préventives dans une transaction
unique.
Règles de gestion :
— La génération est automatique : elle est déclenchée par la sauvegarde du contrat,
non par une action manuelle.
— Une intervention préventive est générée pour chaque couple (date,
ClientEquipement couvert).
— Périodicités : mensuelle (12/an), trimestrielle (4/an), semestrielle (2/an), annuelle
(1/an).


Chapitre 3. Sprint 1 — Authentification et référentiel métier

### 3.4 Conception

#### 3.4.1 Diagramme de classes du Sprint 1

```
Figure 3.2 – Diagramme de classes du Sprint 1
```
Les entités impliquées dans ce sprint sont : User, Client, Equipment,
EquipmentImage, ClientEquipement, Contract, Intervention (préventive générée au-
tomatiquement).


Chapitre 3. Sprint 1 — Authentification et référentiel métier

#### 3.4.2 Diagrammes de séquence

##### 3.4.2.1 Diagramme de séquence : Authentification

```
Figure 3.3 – Diagramme de séquence : Authentification
```

Chapitre 3. Sprint 1 — Authentification et référentiel métier

3.4.2.2 Diagramme de séquence : Ajout équipement et gestion des images

```
Figure 3.4 – Diagramme de séquence : Ajout équipement et gestion des images
```

Chapitre 3. Sprint 1 — Authentification et référentiel métier

### 3.5 Réalisation

```
Figure 3.5 – Capture d’écran : interface d’authentification
```
```
Figure 3.6 – Capture d’écran : tableau de bord administrateur
```

Chapitre 4. Sprint 2 — Gestion des interventions

```
Figure 3.7 – Capture d’écran : gestion des clients
```
```
Figure 3.8 – Capture d’écran : gestion des contrats
```
### Conclusion

Ce sprint a permis de mettre en place les fondations du système : l’authentification
sécurisée par e-mail ou téléphone, la gestion des référentiels métier (utilisateurs, clients, ca-
talogue équipements avec images, affectation ClientEquipement), la gestion des contrats
et la génération automatique du planning préventif par le Système.
Le chapitre suivant présente le Sprint 2 dédié à la gestion des interventions et des
pannes.


Chapitre

## 4 Sprint 2 — Gestion des interventions

### 4.1 Introduction

```
Suite à l’implémentation des fonctionnalités fondamentales du système lors du Sprint 1,
ce deuxième sprint se concentre sur la gestion des interventions préventives et correctives,
la déclaration des pannes et le calendrier des techniciens. Ce sprint constitue le noyau
fonctionnel du système SAV.
Les caractéristiques élaborées au cours de ce sprint portent principalement sur :
— La vérification du calendrier sur une base hebdomadaire et mensuelle
— La répartition des techniciens avec contrôle de disponibilité
— Le début et la fin des interventions par les techniciens
— Les clients peuvent déclarer des pannes avec plusieurs pièces jointes
— La gestion et la transformation des pannes en actions correctives
— L’automatisation de la vérification de la couverture contractuelle lors de la clôture.
```
### 4.2 Backlog du Sprint 2

```
Table 4.1 – Backlog du Sprint 2
ID User Story Acteur Priorité
US-11 En tant qu’administrateur, je veux
affecter un technicien disponible à une
intervention.
```
```
Administrateur Élevée
```
```
US-12 En tant qu’administrateur/technicien, je
veux consulter le planning en vue
hebdomadaire ou mensuelle.
```
```
Admin /
Technicien
```
```
Élevée
```
```
US-13 En tant que technicien, je veux démarrer
une intervention assignée.
```
```
Technicien Élevée
```

Chapitre 4. Sprint 2 — Gestion des interventions

```
Backlog du Sprint 2 (suite)
ID User Story Acteur Priorité
US-14 En tant que technicien, je veux clôturer
une intervention préventive.
```
```
Technicien Élevée
```
```
US-15 En tant que technicien, je veux clôturer
une intervention curative avec vérification
de la couverture contractuelle.
```
```
Technicien Élevée
```
```
US-16 En tant que client, je veux déclarer une
panne sur l’un de mes équipements, avec
pièces jointes.
```
```
Client Élevée
```
```
US-17 En tant qu’administrateur, je veux
prendre en charge une panne et la
convertir en intervention curative.
```
```
Administrateur Élevée
```
```
US-18 En tant qu’administrateur, je veux créer
directement une intervention curative.
```
```
Administrateur Élevée
```
### 4.3 Analyse

#### 4.3.1 Diagramme de cas d’utilisation du Sprint 2

```
Figure 4.1 – Diagramme de cas d’utilisation du Sprint 2
```
Les acteurs impliqués dans ce sprint sont :
Administrateur : affectation technicien, création intervention curative, prise en
charge et conversion panne, consultation planning global, historique.


Chapitre 4. Sprint 2 — Gestion des interventions

Technicien : consultation planning personnel, démarrage et clôture d’interventions.
Client : déclaration de panne avec pièces jointes.
Comportements automatiques du système : vérification de disponibilité du technicien,
vérification de la couverture contractuelle.

#### 4.3.2 Description des cas d’utilisation

##### 4.3.2.1 CU-09 : Affecter un technicien à une intervention

```
Table 4.2 – CU-09 : Affecter un technicien à une intervention
Champ Contenu
Description Ce cas d’utilisation permet à l’administrateur d’affecter un
technicien disponible à une intervention planifiée.
Acteur principal Administrateur
Préconditions L’administrateur est authentifié ; l’intervention existe ;
le technicien possède un compte actif.
Postconditions Le technicien est affecté ; le statut de l’intervention devient
PLANIFIEE ; l’intervention apparaît dans le planning
du technicien.
```
Scénario nominal : L’administrateur sélectionne l’intervention et le technicien à
affecter ; le système vérifie l’existence, le statut et la disponibilité du technicien avant
d’enregistrer l’affectation.
Règles de gestion :
— Seuls les techniciens actifs peuvent être affectés.
— Un technicien ne peut pas être affecté à deux interventions prévues à la
même date.
— L’affectation met automatiquement le statut de l’intervention à PLANIFIEE.
— Toute condition invalide (intervention introuvable, technicien inactif, indisponibilité
à la date ou erreur technique) interrompt l’opération avec un message explicite.


Chapitre 4. Sprint 2 — Gestion des interventions

##### 4.3.2.2 CU-10 : Consulter le planning

```
Table 4.3 – CU-10 : Consulter le planning
Champ Contenu
Description Permet de consulter les interventions programmées sous forme
de calendrier.
Acteurs Administrateur, Technicien
Préconditions Des interventions planifiées existent.
Postconditions Le planning est affiché selon le rôle.
```
Scénario nominal : L’utilisateur ouvre le module Planning ; le système filtre les
interventions selon le rôle et les affiche sous forme de calendrier hebdomadaire ou mensuel.
Règles de gestion :
— Le technicien ne voit que les interventions dont il est l’affectataire.
— Des filtres sont disponibles pour l’administrateur (type, statut, technicien).

##### 4.3.2.3 CU-11 : Clôturer une intervention préventive

```
Table 4.4 – CU-11 : Clôturer une intervention préventive
Champ Contenu
Description Permet au technicien de clôturer une intervention préventive
réalisée.
Acteur principal Technicien
Préconditions Le technicien est authentifié et affecté à l’intervention ;
le statut est PLANIFIEE ou EN_COURS.
Postconditions Le statut passe à REALISEE ; aucune facture n’est générée.
```
Scénario nominal : Le technicien saisit le compte rendu, les actions réalisées, le
matériel utilisé et la durée ; le contrôleur vérifie l’affectation et le statut, puis met à jour
l’intervention à REALISEE.
Règles de gestion :
— Seul le technicien affecté peut clôturer l’intervention.


Chapitre 4. Sprint 2 — Gestion des interventions

```
— Une intervention préventive ne génère jamais de facture.
— La durée est saisie en minutes.
```
##### 4.3.2.4 CU-12 : Déclarer une panne

```
Table 4.5 – CU-12 : Déclarer une panne
Champ Contenu
Description Ce cas d’utilisation permet au client de signaler une panne
sur l’un de ses équipements.
Acteur principal Client
Préconditions Le client est authentifié ; il possède au moins un équipement
affecté.
Postconditions La panne est enregistrée avec le statut EN_ATTENTE.
```
Scénario nominal : Le client sélectionne un équipement affecté, saisit la description
obligatoire et joint éventuellement des pièces jointes ; le système valide l’appartenance de
l’équipement, enregistre la panne et lui attribue le statut EN_ATTENTE.
Scénarios alternatifs :
— SA1 : Description manquante → validation échoue ; message « Description obliga-
toire ».
— SA2 : Équipement non rattaché au client → erreur « Équipement introuvable ».
Règles de gestion :
— La description est obligatoire.
— Aucun champ de priorité n’est présent.
— Les pièces jointes sont de type image, PDF ou audio.
— La panne est créée avec le statut EN_ATTENTE.


Chapitre 4. Sprint 2 — Gestion des interventions

##### 4.3.2.5 CU-13 : Prendre en charge une panne

```
Table 4.6 – CU-13 : Prendre en charge une panne
Champ Contenu
Description Permet à l’administrateur de prendre en charge une panne
déclarée.
Acteur principal Administrateur
Préconditions Une panne a été déclarée avec le statut EN_ATTENTE.
Postconditions Le statut de la panne passe à PRISE_EN_CHARGE.
```
Scénario nominal : L’administrateur sélectionne une panne EN_ATTENTE et déclenche
la prise en charge ; le statut est mis à jour à PRISE_EN_CHARGE.

##### 4.3.2.6 CU-14 : Convertir une panne en intervention curative

```
Table 4.7 – CU-14 : Convertir une panne en intervention curative
Champ Contenu
Description Permet à l’administrateur de convertir une panne en
intervention curative afin d’organiser le traitement technique.
Acteur principal Administrateur
Préconditions Une panne est en statut EN_ATTENTE ou PRISE_EN_CHARGE.
Postconditions Une intervention curative est créée ; la panne passe au statut
CONVERTIE.
```
Scénario nominal : L’administrateur sélectionne la panne à convertir, saisit la date
prévue et affecte optionnellement un technicien disponible ; le système crée l’intervention
curative liée à la panne, vérifie automatiquement la couverture contractuelle, renseigne
couvertureContrat et fait passer la panne au statut CONVERTIE.
Règles de gestion :
— Aucun champ de priorité n’est associé à l’intervention curative créée.
— La couverture contractuelle est vérifiée automatiquement par le Système : si un
contrat actif couvre l’installation ClientEquipement à la date de l’intervention,
couvertureContrat = true ; sinon false.


Chapitre 4. Sprint 2 — Gestion des interventions

```
— Si un technicien est affecté, la disponibilité est vérifiée.
```
### 4.4 Conception

#### 4.4.1 Diagramme de classes du Sprint 2

```
Figure 4.2 – Diagramme de classes du Sprint 2
```
Les entités impliquées dans ce sprint sont : Intervention, Panne, PieceJointe,
Contract, ClientEquipement, User (technicien).

#### 4.4.2 Diagrammes de séquence

La génération du planning préventif est déclenchée lors de la création du contrat,
comme présenté dans le Sprint 1.


Chapitre 4. Sprint 2 — Gestion des interventions

4.4.2.1 Diagramme de séquence : Clôture intervention curative et vérification
couverture

```
Figure 4.3 – Diagramme de séquence : Clôture intervention curative et vérification couverture
```

Chapitre 4. Sprint 2 — Gestion des interventions

### 4.5 Réalisation

```
Figure 4.4 – Capture d’écran : gestion des interventions
```
```
Figure 4.5 – Capture d’écran : gestion des pannes
```

Chapitre 5. Sprint 3 — Facturation et tableau de bord

```
Figure 4.6 – Capture d’écran : conversion d’une panne en intervention curative
```
### Conclusion

Ce sprint a permis de développer le cœur fonctionnel du système SAV : la gestion com-
plète du cycle de vie des interventions préventives et curatives, la déclaration de pannes
avec pièces jointes par les clients, la conversion de pannes en interventions curatives, et
la vérification automatique de la couverture contractuelle.
Le chapitre suivant présente le Sprint 3, dédié à la facturation et aux tableaux de
bord.


Chapitre

## 5 Sprint 3 — Facturation et tableau de bord

### 5.1 Introduction

```
Suite à l’implémentation des fonctionnalités d’authentification, de gestion du référen-
tiel métier et de gestion des interventions lors des sprints précédents, ce troisième sprint
se concentre sur les fonctionnalités de supervision et de suivi général du système.
Ce sprint a pour objectif de compléter l’application en y intégrant :
— La génération des factures pour les interventions curatives hors contrat
— Le marquage des factures comme payées
— L’historique des interventions, différencié par rôle
— Les tableaux de bord différenciés (administrateur, technicien, client).
```
### 5.2 Backlog du Sprint 3

```
Table 5.1 – Backlog du Sprint 3
ID User Story Acteur Priorité
US-19 En tant qu’administrateur, je veux
générer une facture pour une intervention
curative réalisée hors contrat (TVA 19 %,
TND).
```
```
Administrateur Élevée
```
```
US-20 En tant qu’administrateur, je veux
marquer une facture comme payée.
```
```
Administrateur Élevée
```
```
US-21 En tant qu’administrateur, je veux
consulter toutes les factures avec filtres
(statut, client, date).
```
```
Administrateur Élevée
```
```
US-24 En tant que client, je veux consulter
l’historique des interventions sur
mes équipements.
```
```
Client Moyenne
```

Chapitre 5. Sprint 3 — Facturation et tableau de bord

```
Backlog du Sprint 3 (suite)
ID User Story Acteur Priorité
US-25 En tant qu’administrateur, je souhaite
accéder à un tableau de bord global
affichant des KPIs et des graphiques..
```
```
Administrateur Élevée
```
```
US-26 En tant que technicien, je veux consulter
mon tableau de bord personnel.
```
```
Technicien Élevée
```
```
US-27 En tant que client, je veux consulter mon
espace personnel.
```
```
Client Élevée
```
### 5.3 Analyse

#### 5.3.1 Diagramme de cas d’utilisation du Sprint 3

```
Figure 5.1 – Diagramme de cas d’utilisation du Sprint 3
```
Les acteurs impliqués dans ce sprint sont :
Administrateur : génération et consultation des factures, marquage payée, historique
global, tableau de bord administrateur.
Technicien : consultation de son historique, consultation de son tableau de bord
personnel.
Client : consultation de ses factures, de son historique, de son espace personnel.


Chapitre 5. Sprint 3 — Facturation et tableau de bord

#### 5.3.2 Description des cas d’utilisation

##### 5.3.2.1 CU-16 : Générer une facture

```
Table 5.2 – CU-16 : Générer une facture
Champ Contenu
Description Ce cas d’utilisation permet à l’administrateur de générer une
facture pour une intervention éligible.
Acteur principal Administrateur
Préconditions L’administrateur est authentifié ; une intervention curative
réalisée et hors couverture contractuelle existe.
Postconditions La facture est créée et enregistrée dans la base de données.
```
```
Règles d’éligibilité (trois conditions cumulatives) :
— Type de l’intervention = CURATIVE
— Statut de l’intervention = REALISEE
— Couverture contractuelle = false (couvertureContrat = false)
Scénario nominal :
```
1. L’administrateur accède à la liste des interventions éligibles à la facturation.
2. Il sélectionne une intervention répondant aux trois conditions.
3. Il saisit les lignes de détail de la facture (LigneFacture) : main-d’œuvre et matériel
    utilisé.
4. L’Interface transmet les données au Contrôleur.
5. Le Contrôleur vérifie les trois conditions d’éligibilité.
6. Le Contrôleur calcule le montant HT (somme des lignes), la TVA (19 %) et le mon-
    tant TTC.
7. La base de données enregistre la facture et ses lignes de détail.
8. La base confirme la création.
9. L’Interface affiche la facture générée.
    Règles de gestion :


Chapitre 5. Sprint 3 — Facturation et tableau de bord

— Les interventions préventives ne génèrent jamais de facture.
— Les interventions curatives couvertes par un contrat actif ne génèrent pas
de facture.
— La TVA est de 19 % : montantTTC = montantHT × 1,19.
— La monnaie est le Dinar Tunisien (TND).
— La facture est créée avec le statut IMPAYEE ou EN_ATTENTE.
Mise à jour du statut de paiement : Après génération, l’administrateur peut mettre à
jour l’état de paiement de la facture (passage au statut PAYEE).

##### 5.3.2.2 CU-17 : Consulter les factures

```
Table 5.3 – CU-17 : Consulter les factures
Champ Contenu
Description Ce cas d’utilisation offre la possibilité de visualiser les factures
en fonction des droits d’accès.
Acteurs Administrateur, Client
Préconditions L’utilisateur est authentifié.
Postconditions Les factures accessibles à l’utilisateur sont affichées en lecture
seule.
```
Scénario nominal : L’utilisateur accède au module des factures ; le système filtre
selon le rôle (toutes pour l’administrateur, uniquement les siennes pour le client) et affiche
les résultats avec les filtres disponibles.
Règles de gestion :
— Le client ne peut consulter que ses propres factures.
— La consultation est en lecture seule pour le client.
— L’administrateur peut appliquer des filtres par statut, client et date d’émission.


Chapitre 5. Sprint 3 — Facturation et tableau de bord

##### 5.3.2.3 CU-19 : Consulter le tableau de bord administrateur

```
Table 5.4 – CU-19 : Consulter le tableau de bord administrateur
Champ Contenu
Description Permet à l’administrateur de consulter les indicateurs globaux
du système SAV.
Acteur principal Administrateur
Préconditions L’administrateur est authentifié ; des données existent dans le
système.
Postconditions Les statistiques et graphiques sont affichés.
```
Contenu du tableau de bord : KPIs globaux (interventions, contrats, clients, équi-
pements), chiffre d’affaires mensuel, factures impayées, graphiques d’activité mensuelle et
répartition préventif/curatif.

##### 5.3.2.4 CU-20 : Consulter le tableau de bord technicien

```
Table 5.5 – CU-20 : Consulter le tableau de bord technicien
Champ Contenu
Description Permet au technicien de consulter son tableau de bord
personnel.
Acteur principal Technicien
Préconditions Le technicien est authentifié.
Postconditions Les indicateurs personnels et le planning du technicien sont
affichés.
```
Contenu du tableau de bord : Nombre d’interventions assignées, taux de réalisa-
tion, planning de la semaine en cours et dernières interventions réalisées.


Chapitre 5. Sprint 3 — Facturation et tableau de bord

##### 5.3.2.5 CU-21 : Consulter l’espace client

```
Table 5.6 – CU-21 : Consulter l’espace client
Champ Contenu
Description Permet au client de consulter un résumé de sa situation dans
le système.
Acteur principal Client
Préconditions Le client est authentifié.
Postconditions L’espace personnel du client est affiché.
```
Contenu de l’espace client : Équipements affectés, interventions en cours, pannes
ouvertes et factures en attente de paiement.

##### 5.3.2.6 CU-22 : Consulter l’historique des interventions

```
Table 5.7 – CU-22 : Consulter l’historique des interventions
Champ Contenu
Description Permet de consulter l’historique des interventions réalisées ou
annulées, filtré selon le rôle.
Acteurs Administrateur, Technicien, Client
Préconditions L’utilisateur est authentifié.
Postconditions L’historique filtré selon le rôle est affiché.
```
```
Scénario nominal :
```
1. L’utilisateur ouvre le module Historique.
2. Le Contrôleur filtre les interventions selon le rôle :
    — Administrateur → toutes les interventions avec statut REALISEE ou ANNULEE.
    — Technicien → uniquement ses interventions assignées avec ces statuts.
    — Client → uniquement les interventions liées à ses ClientEquipement.
3. Les résultats sont affichés avec filtres (date, type, statut, client, technicien selon le
    rôle).
Des filtres permettent de faciliter la consultation de l’historique et des tableaux de
bord.


Chapitre 5. Sprint 3 — Facturation et tableau de bord

### 5.4 Conception

#### 5.4.1 Diagramme de classes du Sprint 3

```
Figure 5.2 – Diagramme de classes du Sprint 3
```
Les entités impliquées dans ce sprint sont : Facture, LigneFacture, Intervention,
Contract, Client, User.


Chapitre 5. Sprint 3 — Facturation et tableau de bord

#### 5.4.2 Diagrammes de séquence

##### 5.4.2.1 Diagramme de séquence : Génération d’une facture

```
Figure 5.3 – Diagramme de séquence : Génération d’une facture
```

Chapitre 5. Sprint 3 — Facturation et tableau de bord

5.4.2.2 Diagramme de séquence : Consultation de l’historique côté client

```
Figure 5.4 – Diagramme de séquence : Consultation de l’historique côté client
```
### 5.5 Réalisation

```
Figure 5.5 – Capture d’écran de la gestion des factures
```

Chapitre 5. Sprint 3 — Facturation et tableau de bord

```
Figure 5.6 – Capture d’écran : tableau de bord technicien
```
```
Figure 5.7 – Capture d’écran : tableau de bord client
```
### Conclusion

Ce sprint a permis de finaliser le système SAV avec les fonctionnalités de pilotage :
génération des factures selon les règles d’éligibilité strictes (curative + réalisée + hors
contrat), calcul automatique de la TVA à 19 % en dinar tunisien, marquage des factures
payées, et des tableaux de bord différenciés pour l’administrateur, le technicien et le client.


## Conclusion Générale

Ce projet de fin d’études a conduit à la réalisation et à la création d’une application
web de gestion du service après-vente, axée sur la maintenance des climatiseurs et des
systèmes de surpression.
L’application propose une solution globale et unifiée pour numériser les processus de
service après-vente :
Un référentiel métier structuré : catalogue d’équipements indépendant des clients,
relation ClientEquipement pour représenter les équipement, gestion des contarts avec
création automatique du planning préventif.
Une gestion opérationnelle complète : durée de vie des interventions préventives
et curatives, déclaration de pannes avec pièces jointes, transformation panne → interven-
tion, contrôle de la disponibilité des techniciens.
Un suivi financier automatisé : facturation en fonction des conditions (curative
/ effectuée / hors contrat), calcul automatique de la TVA à 19 %, gestion des états de
paiement.
Des espaces différenciés par rôle : tableau de bord général pour l’administrateur,
tableau de bord individuel pour le technicien , espace client dédié.
Sur le plan technique, ce projet a permis de maîtriser une structure moderne en trois ni-
veaux.(Frontend Next.js/React, Backend API, base de données Prisma/MySQL) utilisant
Prisma ORM assurant la distinction des préoccupations et la cohérence transactionnelle
des données.
La méthodologie Scrum mise en œuvre a facilité un développement incrémental et
itératif, avec trois sprints progressifs englobant l’intégralité du périmètre opérationnel.
Ce projet établit une base robuste pour une production future, avec des prévisions
d’évolution tel que l’incorporation de notifications en temps réel, la création de rapports
d’activité avancés ou l’élargissement à d’autres types d’équipements de maintenance.


# Perspectives

```
Ce projet ouvre la voie à plusieurs perspectives d’amélioration et d’extension :
— Intégration d’un système de notifications en temps réel afin d’alerter les techniciens
et les administrateurs lors de nouvelles interventions ou pannes déclarées.
— Développement d’une application mobile dédiée permettant aux techniciens
d’accéder aux informations terrain directement depuis leurs appareils.
— Génération de rapports d’activité avancés et personnalisables pour un meilleur suivi
des performances du service après-vente.
— Optimisation automatique de la planification des interventions préventives grâce à
des algorithmes intelligents tenant compte de la disponibilité des techniciens et de
la charge de travail.
— Extension du système à d’autres types d’équipements techniques, au-delà des
climatiseurs et des systèmes de surpression.
```

# Webographie

```
https ://edi-solutions.tn/
https ://www.scrum.org/resources/what-is-a-product-owner
https ://www.scrum.org/resources/what-is-a-product-backlog
https ://www.scrum.org/resources/what-is-a-scrum-master
```

### Résumé

Dans le cadre de notre projet de fin d’études, nous avons développé une application
web appelée SAV Manager, dédiée à la gestion du service après-vente pour les systèmes
de climatisation et de surpression.
L’objectif de cette application est de centraliser et d’automatiser les principales opé-
rations telles que la gestion des clients et des équipements, les contrats de maintenance,
les interventions, les déclarations de pannes, la planification ainsi que la facturation.
Elle propose des interfaces adaptées selon les rôles (administrateur, technicien et
client), ce qui permet d’améliorer l’organisation, le suivi des opérations et la qualité du
service. Le projet a été développé à l’aide de technologies modernes telles que Next.js,
React, TypeScript, Tailwind CSS, and shadcn/ui, permettant la création d’une ap-
plication web réactive, conviviale et performante.
Mots-clés : Service après-vente, Maintenance, Gestion des interventions, Contrats de
maintenance,Next.js, React, Application web.

### Abstract

As part of our Final Year Project, we developed a web application called SAV Manager
for managing after-sales services for air conditioning and pressure boosting systems.
The application aims to centralize and automate key operations such as customer and
equipment management, maintenance contracts, interventions, fault reporting, scheduling,
and invoicing.
It provides role-based interfaces for administrators, technicians, and customers, im-
proving organization, tracking, and service quality.
The project was developed using modern technologies such as Next.js, React, Ty-
peScript, Tailwind CSS, and shadcn/ui, enabling the creation of a responsive, user-
friendly, and efficient web application.
Keywords : After-Sales Service, Maintenance Management, Interventions Manage-
ment, Maintenance Contracts, Next.js, React, Web Application.


