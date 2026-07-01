# Guide de préparation — Soutenance technique SAV Manager

## Contexte

Ce document est le **livrable final** demandé (pas un plan de code). Il a été construit en lisant le code réel du projet (routes API, composants, `prisma/schema.prisma`, `prisma/seed.ts`) plutôt qu'en supposant depuis CLAUDE.md. Deux écarts importants ont été trouvés entre CLAUDE.md et le code réel — ils sont signalés en section E pour éviter une réponse fausse devant le jury :
- **Les formulaires n'utilisent PAS react-hook-form/Zod** (vérifié par grep : aucun match). Ils sont écrits à la main (`useState` + fonction `validateForm()` maison).
- **Le dashboard n'utilise PAS Recharts** (vérifié par grep : aucun match dans `app/dashboard/`). Il affiche des `StatCard` (cartes chiffrées), pas de graphiques. `recharts` n'est importé que par un composant shadcn scaffold inutilisé (`components/ui/chart.tsx`).

Aucun fichier n'a été modifié. Aucune commande destructive n'a été lancée.

---

## A. Carte de l'architecture du projet

```
app/
  api/                  → routes backend (route.ts par dossier)
    auth/login/         → POST unique : vérifie identifiants
    users/, clients/, equipements/, client-equipements/
    contracts/          → GET/POST, génère les interventions préventives à la création
    interventions/      → + assign/, status/, close/ (sous-routes)
    pannes/              → + convert/ (sous-route)
    factures/            → + pay/ (sous-route)
    dashboard/, historique/
  <page>/page.tsx        → une page par route (clients, contrats, interventions, pannes,
                            factures, historique, dashboard, utilisateurs, equipements,
                            login, parametres, profil)
components/
  ui/                   → primitives shadcn/Radix — ne pas éditer (select.tsx, button.tsx, ...)
  forms/                → ClientForm, ContractForm, EquipmentForm, InterventionForm,
                            PanneForm, UserForm, ClientEquipementAssignForm
                            (useState + validation maison, PAS react-hook-form/Zod)
  shared/                → dialogs, tables, badges (AssignTechnicianDialog,
                            GenerateInvoiceDialog, AdminOnly, SortableHeader, TablePagination...)
  layout/                → AppLayout, AppSidebar, AppHeader, navItems.tsx
  dashboard/              → StatCard
lib/
  auth.ts                → session localStorage (sav_session)
  interventions.ts        → couche LEGACY/mock utilisée par certains composants UI
                            (PAS la source de vérité DB — voir note ci-dessous)
  constants.ts            → labels, ROLES, listes de villes, etc.
  table.ts                → sortData, paginateData, toggleSort, getPaginationInfo
  utils.ts                → cn(), getClientDisplayName(), formatDate()
  prisma.ts               → PrismaClient singleton
hooks/
  useAuth.ts               → expose user/session/role/logout
  useToast.tsx             → showSuccess/showError/showInfo (Sonner)
types/index.ts             → tous les types partagés (UserRole, AuthSession, etc.)
prisma/
  schema.prisma            → modèle de données MySQL
  seed.ts                   → données de démo
  migrations/
data/mock-*.ts              → fallback/démo uniquement, pas la source de vérité runtime
```

**Point important à comprendre pour la soutenance** : `lib/interventions.ts` contient une logique dupliquée à des fins d'aperçu côté client (ex. `AssignTechnicianDialog`, aperçu de génération de planning préventif dans le formulaire de contrat) basée sur des tableaux mock. **La logique qui fait réellement foi côté base de données est ré-implémentée indépendamment, en Prisma, dans les routes API** (`app/api/contracts/route.ts`, `app/api/interventions/[id]/assign/route.ts`, `app/api/interventions/[id]/close/route.ts`, `app/api/pannes/[id]/convert/route.ts`). Les deux versions appliquent la même règle métier, mais ne partagent pas de fonction commune. Si le jury demande "pourquoi cette duplication ?", la réponse honnête : `lib/interventions.ts` sert de couche d'aperçu instantané côté UI (pas d'aller-retour réseau) avant confirmation, la route API revalide tout côté serveur au moment de l'écriture.

---

## B. Questions/Réponses techniques

### 1. Comment changer le nom d'un champ ?

Il faut distinguer trois niveaux, du plus superficiel au plus profond :

**a) Changement purement visuel (libellé UI seulement)** — aucune donnée touchée.
- Le texte affiché ("Téléphone" → "Numéro de téléphone") est une chaîne en dur dans le JSX de la page/formulaire, ou dans `lib/constants.ts` si c'est un libellé partagé (statut, type...).
- Fichiers à vérifier : le composant de formulaire concerné (`components/forms/*.tsx`, chercher le `<Label>`), la colonne de tableau correspondante (`<SortableHeader label="...">` dans `app/<module>/page.tsx`), et `lib/constants.ts` si le libellé est centralisé.
- Aucun impact sur Prisma, l'API, ou la base — c'est du texte pur.

**b) Changement du nom d'une clé côté frontend uniquement** (renommer une prop/variable JS sans toucher la DB) — plus risqué, à éviter en live sauf demande explicite, car il faut retrouver tous les usages.

**c) Vrai renommage de champ en base de données** — le plus lourd, chaîne complète :
1. `prisma/schema.prisma` — renommer le champ dans le modèle.
2. `pnpm exec prisma generate` (régénère le client Prisma avec le nouveau nom).
3. `pnpm exec prisma db push` (ou `migrate dev --name rename-x` pour garder une migration nommée).
4. `prisma/seed.ts` — mettre à jour toute référence à l'ancien nom de champ.
5. `types/index.ts` — renommer le champ dans l'interface TypeScript correspondante.
6. La route API concernée (`app/api/<module>/route.ts`) — la fonction de mapping Prisma→frontend (ex. `mapContract()`) référence le champ.
7. Le formulaire (`components/forms/*.tsx`) — `formData.<champ>`.
8. L'affichage tableau/détail (`app/<module>/page.tsx`).
9. Vérification finale : `pnpm exec prisma generate && pnpm tsc --noEmit && pnpm build` — TypeScript signalera tout endroit oublié.

**Conseil pour la démo live** : rester sur le cas (a), c'est rapide, sûr, et démontre qu'on sait où chercher sans toucher à la DB.

### 2. Comment fonctionne un Select dans le projet ?

- Le composant `components/ui/select.tsx` est un wrapper fin autour de `@radix-ui/react-select` (`Select`, `SelectTrigger`, `SelectValue`, `SelectContent`, `SelectItem`), stylé avec `cn()`. On ne le modifie jamais directement — on l'utilise tel quel dans les formulaires/pages.
- **Règle constante dans tout le projet : `value` d'un `Select` (Radix) doit être une `string`. Comme les IDs métier sont des `Int` côté Prisma, ils sont toujours stockés en `string` dans le state React, convertis en `String(id)` pour `SelectItem value=`, puis reconvertis avec `Number(...)` juste avant l'appel API.** C'est nécessaire car Radix Select ne supporte que des valeurs string en interne.

Exemples réels :
- **Select client (formulaire contrat)** — `components/forms/ContractForm.tsx:245-262` :
  ```tsx
  <Select value={formData.clientId} onValueChange={(value) =>
    setFormData({ ...formData, clientId: value, clientEquipementIds: [] })}>
    {clients.map((client) => (
      <SelectItem key={client.id} value={String(client.id)}>...
  ```
  State initialisé en string (`clientId: contract?.clientId ? String(contract.clientId) : ''`), reconverti en `Number(formData.clientId)` au submit.
- **Select ClientEquipement** — `components/forms/ClientEquipementAssignForm.tsx:195-216` : même schéma, `value={formData.equipementId}` / `SelectItem value={String(eq.id)}` / `Number(formData.equipementId)` au submit.
- **Select technicien** — `components/shared/AssignTechnicianDialog.tsx:100-111` : `value={technicienId}` (string), `SelectItem value={String(tech.id)}`, reconverti avec `Number(technicienId)` pour appeler `isTechnicianAvailable(...)`.
- **Filtre statut (page Pannes)** — `app/pannes/page.tsx` (~ligne 438/560) : ici pas de conversion numérique nécessaire, les valeurs sont directement les chaînes de l'enum Prisma (`"EN_ATTENTE"`, `"PRISE_EN_CHARGE"`, `"CONVERTIE"`, `"ANNULEE"`, `"all"`).

### 3. Comment ajouter ou supprimer un bouton ?

- `components/ui/button.tsx` est la primitive shadcn (`<Button variant="..." size="...">`).
- Il n'existe **pas** de composant partagé "colonne d'actions" — chaque page écrit ses boutons d'action directement en JSX à l'intérieur d'une `<TableCell className="text-right">` de sa boucle `.map()`.
- Dans une dialog/formulaire : les boutons de soumission/annulation sont dans le composant de formulaire lui-même, en bas du JSX, à côté de `<DialogFooter>`.
- Affichage conditionnel : combiner condition de **rôle** (`isAdmin`, `isTechnician`, calculés une fois en haut du composant page via `user?.role === ROLES.ADMIN`) et/ou condition de **statut métier** (`panne.statut === 'EN_ATTENTE'`).
- Pour supprimer/désactiver proprement : soit retirer le bloc JSX conditionnel, soit ajouter `disabled={condition}` sur le `<Button>` existant plutôt que le supprimer (préférable en live demo, réversible visuellement).

Exemples réels :
- **"Prendre en charge" (Pannes)** — `app/pannes/page.tsx:616` : `{panne.statut === 'EN_ATTENTE' && (<Button onClick={() => handlePrendreEnCharge(panne.id)}>Prendre en charge</Button>)}`. Gated par statut ; le bloc entier est dans la branche admin/technicien de la page (la page se sépare en deux vues via `currentUser?.role === 'client'`).
- **"Générer une facture" (Factures)** — `app/factures/page.tsx:298-306` : `{isAdmin && (<Button onClick={() => setIsGenerateOpen(true)}>Générer une facture</Button>)}`, et la `GenerateInvoiceDialog` elle-même est aussi conditionnée par `isAdmin` (lignes 472-482).
- **"Démarrer" / "Clôturer" (Interventions)** — `app/interventions/page.tsx` (~834-845) : condition double rôle + statut :
  ```tsx
  {isTechnician && intervention.statut === 'PLANIFIEE' && (
    <DropdownMenuItem onClick={onStart}>Démarrer intervention</DropdownMenuItem>)}
  {isTechnician && intervention.statut === 'EN_COURS' && (
    <DropdownMenuItem onClick={onClose}>Clôturer intervention</DropdownMenuItem>)}
  ```
- **Boutons réservés admin** — soit via `<AdminOnly>` (`components/shared/AdminOnly.tsx`) qui protège une page entière (ex. `app/utilisateurs/page.tsx`), soit via un `if (role === ROLES.ADMIN)` inline pour un simple bouton/colonne (ex. colonne "Technicien" visible seulement si `isAdmin` dans `app/interventions/page.tsx`).

### 4. Comment se déroule un appel API dans le projet ?

Chemin complet : Page (state React) → `fetch('/api/...')` → route handler Next.js (`app/api/.../route.ts`) → validation manuelle du body/params → requête(s) Prisma (parfois dans `prisma.$transaction`) → fonction `map<Entity>()` qui convertit le record Prisma en type frontend (`types/index.ts`) → `NextResponse.json(...)` → la page reçoit le JSON et met à jour son `useState`.

Exemples réels :
- **Login** — `app/api/auth/login/route.ts` (POST unique, 89 lignes) : body `{identifier, password}` → cherche d'abord dans `User` (admin/technicien) via `findFirst({OR:[{email},{telephone}]})`, vérifie `actif`, compare `bcrypt.compare(password, passwordHash)` → sinon cherche dans `Client` → construit et renvoie un objet `AuthSession` JSON (`role`, `displayName`, `userId` ou `clientId`, etc.). Le frontend stocke ce JSON tel quel dans `localStorage['sav_session']`.
- **Contrats** — `app/api/contracts/route.ts` (195 lignes) : `GET` fait un `findMany` avec `include` (client, équipements, `_count.interventions`), calcule `statut` dynamiquement (`ACTIF`/`BIENTOT_EXPIRE`/`EXPIRE`) via une fonction `computeContractStatut(dateFin)`. `POST` valide dates/clientId/équipements, génère la référence `CTR-XXX` (scan du plus grand suffixe numérique existant, cohérent avec le seed `CTR-001..003`) si aucune n'est fournie, puis dans une transaction crée le contrat **et** génère automatiquement les interventions préventives (voir Q24 pour le détail du correctif).
- **Conversion panne → intervention** — `app/api/pannes/[id]/convert/route.ts` (165 lignes) : rejette si panne déjà `CONVERTIE`/`ANNULEE`, vérifie dispo technicien si fourni, calcule la couverture contrat, crée l'`Intervention` (CURATIVE) et met à jour la `Panne` (`CONVERTIE`, `interventionId`) — le tout en transaction.
- **Génération facture** — `app/api/factures/route.ts` `POST` (lignes 116-187) : exige `interventionId` + `lignes[]`, vérifie les 3 règles d'éligibilité (voir Q13), calcule `montantHT`/`tva`(19%)/`montantTTC`, génère `numero` `FAC-{année}-{seq}`, crée `Facture` + `lignes` imbriquées.

### 5. Comment fonctionne la session / "token" dans le projet ?

**Il n'y a pas de JWT, pas de cookie HttpOnly.** C'est une session de démonstration :
1. `POST /api/auth/login` vérifie l'identifiant (email ou téléphone 8 chiffres) contre `User` puis `Client` via Prisma.
2. Le mot de passe est vérifié avec `bcrypt.compare(password, user.passwordHash)`.
3. En cas de succès, la route renvoie un objet JSON conforme au type `AuthSession` (`types/index.ts:200-211` — `isAuthenticated`, `loginTime`, `role`, `displayName`, `email`, `telephone?`, `userId?` ou `clientId?`).
4. Le frontend stocke cet objet **tel quel** dans `localStorage` sous la clé `sav_session` (`lib/auth.ts`, avec une migration automatique depuis une ancienne clé `sav-manager-auth`).
5. `lib/auth.ts` expose `getAuthSession()`, `setAuthSession()`, `clearAuthSession()`, `isAuthenticated()`, `getCurrentUserRole()`, `isValidSession()` (garde de type runtime).
6. `hooks/useAuth.ts` lit la session au montage (`useEffect`), reconstruit un objet `User` synthétique en splittant `displayName` (pas de requête Prisma côté client), et expose `{user, session, isAuthenticated, role, userId, clientId, displayName, logout}`.
7. `components/layout/AppLayout.tsx` : si `!isLoading && !isAuthenticated`, redirige vers `/login` (`router.push`).
8. **Limites à énoncer clairement au jury** : pas de JWT signé, pas de cookie HttpOnly (donc vulnérable au XSS en théorie), pas d'expiration serveur de session, le rôle est "fait confiance" côté client une fois stocké — c'est un choix assumé pour un projet de démonstration/PFE, pas une architecture de prod.

### 6. Comment naviguer dans l'architecture du projet ?

Voir la carte en section A. Résumé rapide "où aller si le jury demande..." → voir le **tableau en section C**, il répond directement à ce point avec les 9 cas listés par l'utilisateur (interface, formulaire, logique API, modèle DB, données démo, navigation/sidebar, authentification, stats dashboard, règle métier).

### 7. Comment ajouter une nouvelle page ?

1. Créer `app/nouvelle-page/page.tsx` (composant client `'use client'` si elle utilise des hooks React).
2. Ajouter l'entrée dans `components/layout/navItems.tsx`, dans le tableau retourné par `getNavItems(role)` pour le(s) rôle(s) concerné(s) (lignes 22-57 : trois branches `admin`/`technician`/`client`).
3. Protéger selon le rôle : soit envelopper le contenu dans `<AdminOnly>` si réservé admin, soit faire un `if (role === '...')` inline, soit simplement ne pas l'ajouter à `getNavItems` pour les rôles non concernés (la page reste accessible par URL directe sauf garde explicite — donc ajouter aussi une vérification de rôle dans la page si c'est sensible).
4. Charger des données : suivre le pattern des autres pages — `useEffect` au montage qui `fetch('/api/...')` et stocke le résultat en `useState`.

### 8. Comment ajouter une nouvelle route API ?

1. Créer `app/api/example/route.ts`.
2. Exporter `export async function GET(request: Request) {...}` et/ou `POST`.
3. Parser et valider le body (`await request.json()`, vérifications manuelles `typeof`, présence des champs requis — pas de Zod utilisé dans ce projet, validation à la main comme dans les routes existantes).
4. Utiliser `prisma` importé depuis `lib/prisma.ts` pour la requête.
5. Mapper le résultat Prisma vers le type frontend si nécessaire (suivre le pattern `map<Entity>()` des autres routes).
6. Retourner `NextResponse.json({...})` (succès) ou `NextResponse.json({error: '...'}, {status: 4xx})` (erreur).

### 9. Comment ajouter un nouveau champ à une entité ? (chaîne complète full-stack)

1. `prisma/schema.prisma` — ajouter le champ au modèle.
2. `pnpm exec prisma generate` — régénère le client Prisma.
3. `pnpm exec prisma db push` (ou `migrate dev --name add-<champ>` si on veut garder une migration nommée et versionnée).
4. `prisma/seed.ts` — ajouter une valeur de démo pour ce champ si pertinent, puis reseed.
5. `types/index.ts` — ajouter le champ à l'interface TypeScript correspondante.
6. La route API du module — ajouter le champ dans le `select`/`include` Prisma si nécessaire, dans la fonction `map<Entity>()`, et dans la validation du `POST`/`PATCH` si le champ est modifiable.
7. Le formulaire (`components/forms/*.tsx`) — ajouter le `<Label>` + input, la clé dans le `useState` initial, et la ligne dans `validateForm()` si le champ est requis.
8. L'affichage — colonne de tableau (`<SortableHeader>` + `<TableCell>`) et/ou panneau de détail.
9. Vérification : `pnpm exec prisma generate && pnpm tsc --noEmit && pnpm build`.

### 10. Comment modifier une règle métier ?

**Point clé à retenir : la logique DB qui fait foi est dans les routes API, pas dans `lib/interventions.ts`** (qui est une couche d'aperçu client basée sur des mocks — voir note en section A). Localisation par règle :

| Règle | Version DB (source de vérité) | Version UI/aperçu (mock) |
|---|---|---|
| Éligibilité facture | `app/api/factures/route.ts` (POST, lignes ~140-152) | `components/shared/GenerateInvoiceDialog.tsx` (~lignes 99-109) |
| Disponibilité technicien | `app/api/interventions/[id]/assign/route.ts` (~41-51) + dupliqué dans `app/api/pannes/[id]/convert/route.ts` (~74-82) | `lib/interventions.ts` `isTechnicianAvailable()` (299-322), utilisée par `AssignTechnicianDialog.tsx` |
| Couverture contrat | `app/api/interventions/[id]/close/route.ts` (~44-55) et `app/api/pannes/[id]/convert/route.ts` (~86-96) | `lib/interventions.ts` `findActiveContractForClientEquipement()`/`getContractCoverageForClientEquipement()` (120-149) |
| Génération planning préventif | inline dans `app/api/contracts/route.ts` (POST, ~118-134) | `lib/interventions.ts` `generatePreventiveInterventionPreviews()` (200-259) |

Pour changer une règle **réellement appliquée en base**, modifier la version DB (route API). Modifier uniquement `lib/interventions.ts` ne changera que l'aperçu affiché avant confirmation, pas ce qui est réellement enregistré.

### 11. Comment fonctionne la génération automatique du planning préventif ?

Dans `app/api/contracts/route.ts`, POST handler (~lignes 118-134), pour chaque `ClientEquipement` du contrat :
```ts
let cur = new Date(start)          // start = dateDebut du contrat
while (cur <= end) {               // end = dateFin du contrat
  intRows.push({ ceId: ce.id, datePrevue: new Date(cur) })
  const next = new Date(cur)
  next.setMonth(next.getMonth() + intervalMonths)   // intervalMonths selon periodicite
  cur = next
}
```
`periodicite` (enum Prisma) → mois d'intervalle : `MENSUELLE`=1, `TRIMESTRIELLE`=3, `SEMESTRIELLE`=6, `ANNUELLE`=12 (table `PERIODICITE_MONTHS`, dupliquée dans les deux fichiers).

**Pourquoi trimestriel entre `2026-07-02` et `2026-12-31` donne exactement 2 dates** : la boucle est inclusive (`cur <= end`).
- Itération 1 : `cur = 2026-07-02` ≤ 2026-12-31 → ajoutée. `next = 2026-10-02`.
- Itération 2 : `cur = 2026-10-02` ≤ 2026-12-31 → ajoutée. `next = 2027-01-02`.
- Itération 3 : `cur = 2027-01-02` > 2026-12-31 → boucle stoppée.

Résultat : **2026-07-02 et 2026-10-02** exactement, une intervention par équipement du contrat à chaque date. Cela correspond au contrat `CTR-001` du seed (lignes ~142-147), qui génère `INT-2026-001` (2026-07-02) et `INT-2026-002` (2026-10-02) — commenté explicitement dans `seed.ts` (~175-177).

### 12. Comment fonctionne la vérification d'indisponibilité d'un technicien ?

Version serveur (source de vérité), `app/api/interventions/[id]/assign/route.ts:41-51` :
```ts
const conflict = await prisma.intervention.findFirst({
  where: {
    technicienId,
    datePrevue: dayBounds(intervention.datePrevue),   // bornes 00:00:00–23:59:59 du même jour
    statut: { not: InterventionStatus.ANNULEE },        // les interventions annulées sont exclues
    id: { not: id },                                    // exclusion de soi-même (réaffectation)
  },
})
```
Le même bloc est dupliqué dans `app/api/pannes/[id]/convert/route.ts:74-82` (affectation d'un technicien au moment de convertir une panne).
Côté UI, `lib/interventions.ts` `isTechnicianAvailable()` (299-322) fait le même contrôle sur des données mock pour donner un retour instantané dans `components/shared/AssignTechnicianDialog.tsx`, avant confirmation côté serveur.

**Exemple démo** : le technicien Mohamed Trabelsi (`User id=2`, `tech@sav.com`) est indisponible le `2026-07-02` — pas via un enregistrement de congé dédié (ce modèle n'existe pas dans le schéma), mais **parce qu'il est déjà affecté à `INT-2026-001` ce jour-là** (`prisma/seed.ts` ~184-190, commentaire explicite ligne 181). C'est donc une conséquence émergente de la règle de conflit du même jour, pas une donnée d'indisponibilité stockée séparément — bon point à clarifier si le jury pose la question "où est stockée l'indisponibilité ?".

### 13. Comment fonctionne la facturation ?

**Règle d'éligibilité** (appliquée côté serveur, `app/api/factures/route.ts` POST ~140-152) :
```ts
if (intervention.type !== 'CURATIVE')        → 422 "Seules les interventions curatives..."
if (intervention.statut !== 'REALISEE')      → 422 "L'intervention doit être réalisée..."
if (intervention.couvertureContrat)          → 422 "Cette intervention est couverte par contrat..."
if (intervention.facture)                    → 409 "Une facture existe déjà pour cette intervention."
```
Donc : CURATIVE + REALISEE + hors contrat + aucune facture existante — exactement la règle demandée.

- **TVA** : 19% codé en dur (pas de constante configurable) à deux endroits : `app/api/factures/route.ts:163` (`Math.round(montantHT * 0.19 * 100) / 100`) et côté aperçu `components/shared/GenerateInvoiceDialog.tsx:35` (`TVA_RATE = 0.19`).
- **`LigneFacture`** (`prisma/schema.prisma:252-260`) : `id`, `factureId` (FK cascade delete), `description`, `quantite` (Float), `prixUnitaire` (Float), `montant` (Float). Relation `Facture` (1) → `LigneFacture` (N).
- **Relation Intervention/Facture** : `Facture.interventionId Int? @unique` — relation **1-1 optionnelle**, donc au maximum une facture par intervention.
- **`Facture.tva` stocke un montant en TND, pas un taux** — commentaire explicite dans le schéma (`schema.prisma:245`).
- **État démo actuel** : `FAC-2026-001` (seed, `clientId:1`, liée à `INT-2026-004`, `montantHT:180`, `tva:34.2`, `montantTTC:214.2`, `statut: PAYEE`). `INT-2026-003` est CURATIVE + REALISEE + `couvertureContrat:false` + aucune facture → **éligible garanti** pour une démonstration live dans `GenerateInvoiceDialog`. Toute facture générée en live à partir d'elle prendrait le numéro **`FAC-2026-002`** (le prochain numéro disponible pour l'année).

### 14. Comment fonctionne la déclaration et conversion d'une panne ?

1. **Déclaration** : le client remplit `components/forms/PanneForm.tsx` (affiché depuis `app/pannes/page.tsx:684`), soumis via `fetch('/api/pannes', {method:'POST'})` (`app/pannes/page.tsx:228-229`) → `app/api/pannes/route.ts` POST (82-139).
2. **Prise en charge admin** : bouton "Prendre en charge" (visible seulement si `panne.statut === 'EN_ATTENTE'`), appelle `handlePrendreEnCharge` (`app/pannes/page.tsx:261-274`) → `PATCH /api/pannes/${id}` avec `{statut: 'PRISE_EN_CHARGE'}` → `app/api/pannes/[id]/route.ts` PATCH (49-77), qui rejette si déjà `CONVERTIE`.
3. **Conversion en intervention curative** : `POST /api/pannes/[id]/convert` → `app/api/pannes/[id]/convert/route.ts`. Dans le même appel : calcule la couverture contrat (recherche d'un `Contract` du client dont la fenêtre de dates couvre l'intervention et dont les `equipements` incluent ce `ClientEquipement`), et affecte optionnellement un technicien si fourni dans le body (avec le même contrôle de conflit du même jour que Q12). Le tout en `prisma.$transaction` : crée l'`Intervention` (`type: CURATIVE`, `statut: PLANIFIEE`) et met à jour la `Panne` (`statut: CONVERTIE`, `interventionId`).
4. **Clôture de l'intervention** : `PATCH /api/interventions/[id]/close/route.ts` passe `statut → REALISEE`, fixe `dateRealisation`, et **recalcule** `couvertureContrat` pour les interventions curatives (même requête de couverture qu'à l'étape 3). C'est précisément ce recalcul qui "débloque" ou non l'éligibilité à la facturation.
5. **Facture générée si hors contrat** : une fois `statut=REALISEE` et `couvertureContrat=false`, la règle de Q13 rend l'intervention éligible à `POST /api/factures`.

### 15. Comment fonctionne le RBAC / rôles ?

- **Navigation** : `components/layout/navItems.tsx` `getNavItems(role)` retourne des entrées différentes pour `admin` (tout), `technician` (ses interventions/planning), `client` (ses pannes/interventions/factures).
- **`<AdminOnly>`** (`components/shared/AdminOnly.tsx`) : vérifie `role !== ROLES.ADMIN` (constante dans `lib/constants.ts`), affiche un écran "Accès non autorisé" sinon rend `children`. Utilisé pour protéger des pages entières (ex. `app/utilisateurs/page.tsx`).
- **Contrôles inline** (plus fréquents que `<AdminOnly>`) : `isAdmin`/`isTechnician` calculés une fois en haut d'une page via `user?.role === ROLES.ADMIN` etc., puis réutilisés pour conditionner boutons/colonnes (voir Q2/Q3).
- **Scoping côté API** : le filtrage par rôle est fait **côté frontend**, transmis en query string à l'API — ex. `app/historique/page.tsx:93-96` construit `/api/historique?role=${role}&userId=${id}` (technicien) ou `&clientId=${clientId}` (client) ; `app/api/interventions/route.ts:104-118` lit `technicienId`/`clientId` depuis `searchParams` et les injecte dans le `where` Prisma.
- **Limite à énoncer** : la sécurité repose sur la confiance du client à envoyer le bon `role`/`clientId` — il n'y a pas de vérification serveur indépendante de l'identité (pas de session serveur signée), cohérent avec la limite déjà énoncée en Q5. À assumer clairement comme un choix de portée PFE/démo si le jury pousse sur ce point.

### 16. Comment ajouter/supprimer un statut ou changer un libellé ?

- Les **libellés affichés** (ex. "En attente", "Prise en charge") sont centralisés dans `lib/constants.ts` (à vérifier au cas par cas, mapping enum→libellé français).
- Les **valeurs d'enum stockées en base** sont définies dans `prisma/schema.prisma` (`InterventionStatus`, `PanneStatus`, `ContractStatus`, `FactureStatus`, etc.). Ajouter/retirer une valeur d'enum nécessite `prisma generate` + `db push`/`migrate dev`, et met à jour toute donnée existante qui utiliserait l'ancienne valeur.
- Les **types TypeScript** correspondants sont dans `types/index.ts` — à garder synchronisés avec le schéma Prisma (sinon `tsc --noEmit` échoue).
- Les **options de filtre/Select** (ex. filtre statut sur la page Pannes, `app/pannes/page.tsx`) listent les valeurs d'enum en dur dans le JSX — à mettre à jour manuellement si un statut est ajouté/retiré.

### 17. Comment modifier les données de démonstration ?

- Éditer `prisma/seed.ts`.
- Reset + reseed :
  ```powershell
  pnpm exec prisma db push --force-reset   # DESTRUCTIF — supprime toutes les données
  pnpm exec prisma db seed
  ```
- Après un reset, **supprimer `sav_session` du localStorage** dans les DevTools du navigateur, sinon une session périmée (référencant un `userId`/`clientId` qui n'existe plus) peut provoquer un état d'authentification incohérent.
- **Ne jamais faire `--force-reset` sur une base de production** — uniquement en environnement de démo/dev local.

### 18. Que faire si `prisma generate` est bloqué ?

- Cause typique sur Windows : le serveur `pnpm dev` a un verrou sur la DLL du client Prisma généré (`node_modules/.prisma/client/query_engine-windows.dll.node`), empêchant la régénération.
- Solution : arrêter le serveur dev (`Ctrl+C`), puis relancer `pnpm exec prisma generate`. Redémarrer `pnpm dev` ensuite.

### 19. Quelles commandes de vérification utiliser ?

```powershell
pnpm exec prisma generate
pnpm tsc --noEmit
pnpm build
```
À exécuter dans cet ordre après tout changement de schéma, de type, ou de dépendance (checklist officielle du CLAUDE.md du projet).

### 20. Recettes de modification en direct

Voir section D ci-dessous — regroupées séparément car ce sont des séquences d'actions, pas des explications.

> **Mise à jour post-audit** : les questions 21 et 22 documentent des correctifs de code réellement appliqués après la rédaction initiale de ce document (contrairement au reste, issu d'un audit en lecture seule — voir section « Vérification effectuée »).

### 21. Pourquoi les modales de modification n'affichaient pas les données existantes ?

**Symptôme observé** : cliquer sur "Modifier" pour un client/utilisateur/équipement/contrat ouvrait la modale, mais les champs restaient vides ou affichaient les valeurs de l'élément précédemment édité.

**Cause racine** : les dialogs d'édition (`ClientForm`, `UserForm`, `EquipmentForm`, `ContractForm`, `ClientEquipementAssignForm`, `AssignTechnicianDialog`, `ChangeStatusDialog`) restent **montés en permanence** — la page parente ne les démonte jamais et ne leur passe pas de prop `key` liée à l'id de l'entité. Or `formData` était initialisé avec `useState(() => ({...entity}))` (ou `useState({...entity})`), et **l'initialiseur d'un `useState` ne s'exécute qu'au tout premier montage du composant**. Résultat : cliquer "Modifier" sur un enregistrement B après avoir déjà ouvert la modale pour un enregistrement A ne redéclenchait jamais cette initialisation — React réutilisait la même instance de composant avec l'ancien état.

**Correctif appliqué** : chaque formulaire/dialog concerné reçoit désormais un effet de réhydratation :
```tsx
useEffect(() => {
  if (!open) return;
  setFormData({ /* même forme que l'initialiseur useState d'origine */ });
  setErrors({});
}, [open, entity /* + dépendances additionnelles si besoin */]);
```
Cet effet se redéclenche à chaque fois que `open` passe à `true` ou que la référence de l'entité change — donc à chaque clic sur "Modifier", même sans démontage. `InterventionForm` avait déjà ce pattern (c'est le modèle de référence copié pour les autres formulaires). Quand l'entité est `undefined`/`null` (mode création), l'effet retombe sur les mêmes valeurs vides que l'initialiseur `useState` d'origine — le mode création n'est donc pas cassé. Cas particulier : `UserForm` réinitialise toujours `password` à `''` dans cet effet, y compris en mode édition (on ne préremplit jamais un mot de passe).

**Explication orale courte** : "Les modales restent montées en mémoire pour éviter de tout recréer à chaque clic ; mais `useState` ne relit ses props qu'une seule fois, au montage. Il fallait donc un `useEffect` qui réagit explicitement à l'ouverture de la modale et à l'entité sélectionnée pour resynchroniser l'état local à chaque fois."

### 22. Comment la validation `dateInstallation >= dateAchat` a-t-elle été ajoutée ?

**Règle métier** : lors de l'affectation d'un équipement à un client (`ClientEquipement`), la date d'installation doit être égale ou postérieure à la date d'achat — on ne peut pas installer un équipement avant de l'avoir acheté.

**Validation frontend** — `components/forms/ClientEquipementAssignForm.tsx` :
- La fonction `validate()` (appelée au submit) bloque si `dateInstallation < dateAchat` et pose l'erreur sur le champ `dateInstallation` avec le message `"La date d'installation doit être égale ou postérieure à la date d'achat."`.
- Deux handlers (`handleDateAchatChange`/`handleDateInstallationChange`) recalculent cette erreur **en direct**, à chaque changement de l'une ou l'autre date, pas seulement au submit.
- Le champ `dateInstallation` porte un attribut `min={formData.dateAchat}` pour guider le sélecteur de date natif.
- Un seul composant couvre les deux sens d'affectation (équipement→client depuis la fiche client, client→équipement depuis la fiche équipement), donc une seule correction suffit pour les deux entrées.

**Validation API** (`app/api/client-equipements/route.ts` en `POST`, `app/api/client-equipements/[id]/route.ts` en `PATCH`) — **la même règle est revalidée côté serveur**, avec le même message d'erreur, renvoyé en `400`. Pour le `PATCH` (mise à jour partielle), la route recalcule la paire de dates *effective* en fusionnant les champs envoyés dans le body avec les valeurs existantes en base, pour ne pas laisser passer une combinaison invalide quand un seul des deux champs est modifié.

**Pourquoi la validation serveur est indispensable, même si le frontend valide déjà** : le frontend peut être contourné (appel direct à l'API via `curl`/Postman, bug JS, extension navigateur, DevTools). Le principe appliqué dans tout le projet est de ne jamais faire confiance uniquement au client — la route API est la seule source de vérité pour ce qui est réellement enregistré en base (cohérent avec la réponse à la Q10 sur les règles métier).

### 23. Pourquoi l'image jointe à une panne ne s'affichait pas après l'enregistrement ?

**Symptôme observé** : en déclarant une panne avec une image jointe, le formulaire montrait bien un aperçu de l'image avant l'envoi, mais après l'enregistrement (et à la réouverture de la panne), l'image jointe n'apparaissait plus.

**Cause racine** : ce n'était pas un problème d'interface. Le formulaire générait déjà un aperçu base64 avec `FileReader`, et le composant de détail savait déjà afficher une image à partir de cette donnée. Le vrai problème était la **persistance** : la colonne `PieceJointe.url` était un `VARCHAR(191)` par défaut en MySQL, beaucoup trop court pour une data URL base64 (qui fait facilement plusieurs dizaines de milliers de caractères pour une image) — la valeur était donc rejetée ou tronquée à l'enregistrement.

**Correctif appliqué** :
- `prisma/schema.prisma` : `PieceJointe.url` est passé de `String` (implicitement `VARCHAR(191)`) à `String @db.LongText`.
- `app/api/pannes/route.ts` : le filtre appliqué aux pièces jointes à la création est passé de `.filter((pj) => pj.filename && pj.url)` à `.filter((pj) => pj.filename)`, pour que les pièces jointes non-image (PDF, audio) avec un `url: ''` ne soient plus écartées et restent affichées comme fichiers génériques.

**Limite assumée** : il n'y a toujours pas de vrai stockage de fichiers (disque ou cloud) — c'est une simulation pour la démo : les images sont conservées en base64 pour la prévisualisation, les autres fichiers gardent uniquement leurs métadonnées.

**Explication orale courte** : "Le problème ne venait pas de l'interface mais de la taille de la colonne en base. L'image était convertie en base64, mais la colonne VARCHAR(191) la tronquait. Je l'ai remplacée par LongText, et j'ai gardé les fichiers non-image comme métadonnées."

### 24. Pourquoi la référence du contrat n'est-elle plus saisie manuellement ?

**Avant** : le formulaire `ContractForm.tsx` affichait un champ `Référence` éditable et obligatoire, alors que `app/api/contracts/route.ts` savait déjà générer une référence de repli quand le champ envoyé était vide — l'utilisateur devait donc taper une référence que l'API pouvait de toute façon produire elle-même, avec un risque de doublon ou de faute de saisie.

**Correctif appliqué** :
- `components/forms/ContractForm.tsx` : le champ `Référence` est désormais **toujours désactivé** (`disabled`), avec le placeholder `Généré automatiquement à la création` en mode création ; en mode édition, il affiche simplement la référence existante en lecture seule. La validation `validateForm()` ne bloque plus sur ce champ.
- `app/api/contracts/route.ts` : la génération de repli a été réécrite pour rechercher la référence `CTR-` la plus élevée existante (`orderBy: { reference: 'desc' }`, extraction du suffixe numérique, incrémentation, complétion sur 3 chiffres), ce qui produit `CTR-004` après les contrats seedés `CTR-001`/`CTR-002`/`CTR-003` — au lieu de l'ancienne logique basée sur un simple comptage (`count()`) associée à l'année, qui ne correspondait pas au format seedé.

**Bénéfice** : plus de doublon possible côté saisie utilisateur, plus d'erreur de format — la référence est une donnée métier calculée par le système, pas une information que l'utilisateur devrait connaître ou inventer.

**Explication orale courte** : "La référence du contrat est une donnée métier générée par le système. L'utilisateur ne la saisit pas pour éviter les doublons ; l'API calcule le prochain numéro CTR-XXX."

### 25. Comment le technicien choisi dans le planning préventif est-il affecté ?

**Avant** : `ContractForm.tsx` permettait déjà de choisir un technicien par ligne dans l'aperçu du planning préventif (`PreventiveInterventionPreviewTable`), et envoyait bien ce choix dans le payload de soumission (`preventiveInterventions: previewRows`). Mais ce choix était perdu en route : `app/contrats/page.tsx` ne transmettait que la partie `contract` du payload à l'API, et `app/api/contracts/route.ts` régénérait lui-même les lignes d'intervention préventive sans jamais lire de `technicienId` — la colonne restait donc `NULL` pour toutes les interventions générées.

**Correctif appliqué** (chaîne complète) :
1. `ContractForm.tsx` construit les lignes d'aperçu (`previewRows`), chacune avec un `technicienId` optionnel — **inchangé**, déjà correct.
2. `app/contrats/page.tsx` `handleAddContract` déstructure désormais aussi `preventiveInterventions` du payload et les transmet dans le corps de `POST /api/contracts` (`clientEquipementId`, `datePrevue`, `technicienId` par ligne).
3. `app/api/contracts/route.ts` lit ce tableau optionnel, construit une correspondance par clé `clientEquipementId + date` pour rattacher chaque `technicienId` à la ligne d'intervention générée côté serveur (les deux algorithmes de génération de dates étant identiques, les clés correspondent).
4. Avant de créer quoi que ce soit, l'API valide que chaque technicien référencé existe et a le rôle `TECHNICIAN`, puis vérifie l'absence de conflit de disponibilité — à la fois entre les lignes du même lot généré et contre les interventions déjà existantes en base (même jour, statut différent de `ANNULEE`). En cas de conflit, la création du contrat est intégralement rejetée (aucune donnée partielle créée).
5. Les interventions préventives créées reçoivent enfin `technicienId: row.technicienId ?? null`.

**Explication orale courte** : "Le choix du technicien dans la prévisualisation n'est pas seulement visuel : il est transmis à l'API, validé, puis enregistré dans les interventions préventives générées."

### 26. Pourquoi la date de clôture d'une intervention ne peut pas être dans le passé ?

**Règle métier** : la clôture d'une intervention (`statut → REALISEE`) représente un événement qui se produit à partir d'aujourd'hui — il n'était auparavant pas interdit de saisir une date de réalisation passée, et la valeur saisie n'était même pas transmise à l'API (qui retombait silencieusement sur `intervention.dateRealisation ?? new Date()`).

**Correctif appliqué** :
- `components/shared/CloseInterventionDialog.tsx` : le champ date `dateRealisation` porte désormais `min={todayStr}` (calculé via le helper existant `getTodayDateInputValue()`, qui évite le bug de décalage de fuseau horaire de `toISOString()`), et `validate()` rejette explicitement toute date antérieure à aujourd'hui avec le message `"La date de réalisation doit être aujourd'hui ou une date future."`.
- `app/interventions/page.tsx` `handleClose` transmet désormais `dateRealisation` dans le corps de la requête `PATCH /api/interventions/[id]/close`.
- `app/api/interventions/[id]/close/route.ts` lit `body.dateRealisation` si présent, le parse avec la convention `T12:00:00` du projet (évite le décalage de date lié au fuseau horaire), rejette une date invalide ou antérieure à aujourd'hui avec un `400`, et ne retombe sur l'ancien comportement de repli que si le champ est absent.
- L'annulation (`statut: 'ANNULEE'`) passe par une route séparée (`/status`) et n'est pas concernée par cette validation — comportement inchangé.

**Explication orale courte** : "La clôture représente une réalisation à partir du jour courant. La règle est validée côté interface pour guider l'utilisateur et côté API pour garantir l'intégrité des données."

---

## C. Tableau "Si le jury demande X → ouvrir Y → modifier Z"

| Demande du jury | Fichier(s) à ouvrir | Ce qu'on modifie |
|---|---|---|
| Changer l'interface (layout, style) | `app/<page>/page.tsx`, `components/layout/AppLayout.tsx`, `components/ui/*` (à éviter d'éditer) | JSX/Tailwind dans la page ou le composant `shared` concerné |
| Changer un formulaire | `components/forms/<X>Form.tsx` | Champ `useState`, `<Label>`/input JSX, fonction `validateForm()` |
| Changer une logique API | `app/api/<module>/route.ts` (+ sous-routes `assign/`, `status/`, `close/`, `convert/`, `pay/`) | Validation, requête Prisma, fonction `map<Entity>()` |
| Changer le modèle de base de données | `prisma/schema.prisma` | Champ/modèle/enum, puis `prisma generate` + `db push`/`migrate dev` |
| Changer les données de démonstration | `prisma/seed.ts` | Valeurs seedées, puis `db push --force-reset` + `db seed` |
| Changer la navigation/sidebar | `components/layout/navItems.tsx` | `getNavItems(role)` — ajouter/retirer une entrée pour un rôle |
| Changer le comportement d'authentification | `app/api/auth/login/route.ts`, `lib/auth.ts`, `hooks/useAuth.ts`, `components/layout/AppLayout.tsx` | Logique de vérification, clé de session, redirection |
| Changer les statistiques dashboard | `app/api/dashboard/route.ts` (agrégation Prisma), `components/dashboard/StatCard.tsx` (affichage), `app/dashboard/page.tsx` (fetch + rendu) | `Promise.all` des `count`/`aggregate` Prisma, ou le rendu des cartes |
| Changer une règle métier | Voir tableau détaillé Q10 — route API pour la version qui fait foi, `lib/interventions.ts` pour l'aperçu UI | Condition métier dans la route ou dans la fonction de `lib/interventions.ts` |

---

## D. Recettes de modification en direct

**1. Changer un libellé** — ouvrir la page/formulaire concerné, remplacer la chaîne JSX en dur (ou l'entrée dans `lib/constants.ts` si centralisée). Rafraîchir le navigateur (Fast Refresh suffit, pas besoin de relancer). *Le plus sûr et rapide en démo live.*

**2. Ajouter un bouton** — dans la page/tableau concerné, ajouter un `<Button onClick={...}>` dans la `<TableCell>` de la ligne, ou dans le `<DialogFooter>`/JSX du formulaire. Réutiliser un handler existant si la fonctionnalité existe déjà côté API.

**3. Cacher un bouton selon le rôle** — envelopper le JSX existant dans `{isAdmin && (...)}` (ou `isTechnician`/condition de statut), en réutilisant la variable de rôle déjà calculée en haut du composant page.

**4. Modifier une option de Select** — ajouter/retirer un `<SelectItem value="...">...</SelectItem>` dans le JSX du filtre ou du formulaire concerné. Si la valeur correspond à un enum Prisma, s'assurer qu'elle existe dans `schema.prisma`.

**5. Ajouter une colonne dans un tableau** — trois modifications synchronisées dans la même page :
   a. Ajouter `<SortableHeader label="..." sortKey="monChamp" sortConfig={sortConfig} onSort={handleSort} />` dans l'en-tête.
   b. Ajouter le cas correspondant dans la fonction `getSortValue` utilisée par `sortData()`.
   c. Ajouter `<TableCell>{item.monChamp}</TableCell>` dans la boucle `.map()` des lignes.

**6. Changer le message de validation des dates** — chercher la fonction `validateForm()`/`validate()` dans le formulaire concerné (ex. `ContractForm.tsx`), modifier la chaîne d'erreur française retournée dans le `Record<string,string>` d'erreurs.

**7. Ajouter une donnée dans le seed** — éditer `prisma/seed.ts`, ajouter l'enregistrement dans le tableau/objet correspondant, puis `pnpm exec prisma db push --force-reset && pnpm exec prisma db seed` (⚠️ destructif — à annoncer avant de lancer, idéalement préparer/tester avant la soutenance, pas en live si évitable).

**8. Ajouter une ligne facture par défaut** — dans `components/shared/GenerateInvoiceDialog.tsx`, le state des lignes est un tableau ; ajouter un objet `{description, quantite, prixUnitaire}` par défaut à l'initialisation, ou ajouter une ligne au tableau `lignes` avant `POST /api/factures`.

**9. Changer la règle d'indisponibilité technicien** — modifier le bloc `where` dans `app/api/interventions/[id]/assign/route.ts:41-51` (version qui fait foi) — et pour cohérence visuelle, appliquer le même changement dans `lib/interventions.ts` `isTechnicianAvailable()` (aperçu UI) et dans `app/api/pannes/[id]/convert/route.ts` (dupliqué).

**10. Changer la règle de validation des dates d'un contrat** — dans `app/api/contracts/route.ts` (POST), chercher les vérifications `dateFin > dateDebut` / `dateDebut >= aujourd'hui` et ajuster la condition + le message d'erreur renvoyé.

**11. Corriger un scrollbar horizontal dans une modale** — ne jamais toucher `components/ui/dialog.tsx`/`components/ui/table.tsx` (primitives shadcn). Corriger dans le composant métier lui-même :
   a. Sur `<DialogContent>`, ajouter une largeur responsive (`max-w-[95vw]` en plus du `sm:max-w-*` déjà présent) et `overflow-x-hidden`.
   b. Si un tableau est en cause, passer `<Table className="table-fixed w-full">`, donner des largeurs fixes courtes aux colonnes étroites (quantité, prix, montant), laisser la colonne la plus large sans largeur fixe (elle récupère l'espace restant), et ajouter `whitespace-normal break-words` sur ses cellules pour qu'elles retournent à la ligne au lieu de forcer un débordement.
   Référence appliquée : `components/shared/GenerateInvoiceDialog.tsx` (tableau d'aperçu de facture).

---

## E. Changements risqués à éviter pendant la soutenance

- **`pnpm exec prisma db push --force-reset`** — supprime toutes les données. Ne jamais lancer devant le jury sans avoir prévenu, et jamais si la démo dépend de l'état actuel des données seedées (ex. `INT-2026-003` éligible, `Mohamed Trabelsi` indisponible le 2026-07-02).
- **Renommer un vrai champ Prisma en live** — chaîne à 9 étapes (Q1c), trop long et risqué pour un direct ; rester sur un changement de libellé visuel si le jury demande un "renommage" en démonstration.
- **Modifier `schema.prisma` sans relancer `prisma generate`** — le client Prisma généré ne sera plus synchronisé avec le schéma, source d'erreurs TypeScript confuses (`tsc --noEmit` doit toujours suivre).
- **Répondre que les formulaires utilisent react-hook-form + Zod** — c'est ce qu'affirme CLAUDE.md, mais **le code réel n'utilise ni l'un ni l'autre** (grep vérifié : aucun match). Les formulaires sont en `useState` + validation manuelle. Dire la vérité si la question arrive : la dépendance est installée mais inutilisée (`components/ui/form.tsx` est un scaffold shadcn jamais importé ailleurs).
- **Répondre que le dashboard utilise Recharts** — également affirmé par CLAUDE.md, également faux en pratique (grep vérifié : aucun import `recharts` dans `app/dashboard/`). Le dashboard affiche des `StatCard` (chiffres), pas de graphiques. `recharts` n'est importé que par un composant shadcn scaffold inutilisé.
- **Confondre `lib/interventions.ts` avec la logique DB réelle** — c'est une couche d'aperçu mock côté UI ; la logique qui écrit réellement en base est dupliquée indépendamment dans les routes API (voir tableau Q10). Ne pas présenter `lib/interventions.ts` comme "le" centre de la logique métier si le jury demande où elle est appliquée en base.
- **Modifier `components/ui/*`** — ce sont des primitives shadcn/Radix générées, à ne jamais éditer directement (le CLAUDE.md du projet le précise).
- **Toute commande git destructive** (reset --hard, force push, suppression de branche) — sans rapport direct avec le code mais à éviter absolument en session live.

---

## F. Checklist des commandes sûres

```powershell
pnpm dev                              # démarrer le serveur dev (ne modifie rien)
pnpm tsc --noEmit                     # vérification de types, sans écrire de fichier
pnpm build                            # build de production, détecte les erreurs
pnpm exec prisma generate             # régénère le client Prisma (sûr, pas destructif)
pnpm exec prisma db push              # pousse le schéma SANS supprimer de données existantes
pnpm exec prisma studio               # ouvre une interface graphique en lecture/écriture sur la DB — utile pour montrer les données au jury sans coder
```

Commande à n'utiliser qu'en connaissance de cause, jamais improvisée en direct :
```powershell
pnpm exec prisma db push --force-reset   # DESTRUCTIF
pnpm exec prisma db seed                 # à lancer seulement après un reset volontaire
```

---

## G. Explications orales très courtes à mémoriser

- **"Pourquoi pas de JWT ?"** → Projet de démonstration PFE ; la session est un objet JSON stocké dans `localStorage['sav_session']` après vérification bcrypt côté `/api/auth/login`. Limite assumée : pas de cookie HttpOnly, pas d'expiration serveur.
- **"Pourquoi les IDs sont des strings dans les Select ?"** → Radix UI `Select` n'accepte que des valeurs `string`. On convertit avec `String(id)` à l'affichage et `Number(...)` juste avant l'appel API.
- **"Où est la vraie logique métier ?"** → Dans les routes API (`app/api/**/route.ts`), en Prisma. `lib/interventions.ts` n'est qu'un aperçu instantané côté UI basé sur des données mock, revalidé côté serveur à l'écriture.
- **"Pourquoi 2 dates pour un contrat trimestriel du 2 juillet au 31 décembre 2026 ?"** → Boucle inclusive `cur <= end`, pas de 3 mois : 2 juillet, puis 2 octobre ; la 3e échéance (2 janvier 2027) dépasse la fin du contrat.
- **"Comment sait-on qu'un technicien est indisponible ?"** → Pas de table de congés dédiée ; c'est déduit dynamiquement : une intervention `ANNULEE` n'est pas un conflit, toute autre intervention du même technicien le même jour l'est.
- **"Quand une intervention devient-elle facturable ?"** → À sa clôture (`close`), si `type=CURATIVE`, `statut=REALISEE`, `couvertureContrat=false`, et qu'aucune facture n'existe déjà (relation 1-1 `Facture.interventionId`).
- **"Le RBAC est-il sécurisé côté serveur ?"** → Partiellement : la navigation/l'UI sont filtrées côté client, et certaines routes API scopent leurs requêtes via `role`/`clientId`/`userId` passés en query string — mais il n'y a pas de session serveur signée indépendante pour re-vérifier l'identité. Limite assumée pour un projet de démonstration.
- **"tva stocke un taux ou un montant ?"** → Un **montant en TND**, pas un pourcentage — commenté explicitement dans `schema.prisma`.
- **"Pièces jointes panne ?"** → Images en base64 LongText pour la démo, autres fichiers en métadonnées, pas de stockage fichier réel.
- **Référence contrat** : générée automatiquement au format CTR-XXX.
- **Planning préventif** : le technicien choisi est enregistré après validation de disponibilité.
- **Clôture intervention** : date de réalisation aujourd'hui ou future uniquement.
- **Interventions** : affichage par défaut du plus récent au plus ancien.

---

## Vérification effectuée

Toutes les affirmations ci-dessus proviennent d'une lecture directe du code (routes API, composants, `schema.prisma`, `seed.ts`) via trois explorations parallèles en lecture seule, complétées par deux `grep` de vérification personnelle (absence de `react-hook-form`/`zod` dans `components/forms/`, absence de `recharts` dans `app/dashboard/`). Aucun fichier n'a été modifié, aucune commande destructive n'a été exécutée.
