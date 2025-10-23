# 🎯 PLANORA - TODO UNIFIÉ & PRIORISÉ

**Document créé :** 8 Octobre 2024
**Dernière mise à jour :** 10 Octobre 2025
**Status du projet :** Phase 1 - Infrastructure (70% complété)

---

## 🎯 MISSION DE PLANORA

**Planora automatise la création de plannings mensuels grâce à l'IA, en respectant les contraintes légales et individuelles de chaque employé.**

### Problème résolu
Les managers passent **4-8h/mois** à créer manuellement des plannings complexes en jonglant avec:
- Contraintes légales (35h/semaine FR, repos minimum)
- Contrats individuels (temps partiel, temps plein, heures max)
- Disponibilités et préférences des employés
- Compétences requises pour chaque poste
- Heures supplémentaires à comptabiliser
- Équité entre employés

### Solution
**Génération automatique en 30 secondes** de plannings optimisés + Modification intuitive avec validation IA + Suivi des heures supplémentaires

---

## 📖 GLOSSAIRE - Terminologie de l'application

Pour éviter toute confusion, voici les termes clés utilisés dans Planora :

### 📅 **Planning**
Le **planning** est l'organisation complète du travail sur une période (semaine, mois).
- **Exemple :** "Le planning du mois de janvier"
- **Contient :** Toutes les périodes de travail de tous les employés

### ⏰ **Période de travail / Horaire / Shift**
Une **période de travail** (aussi appelée "horaire" ou "shift") est une plage horaire assignée à un employé.
- **Exemples :**
  - Lundi 9h-17h
  - Mardi 14h-22h
  - Mercredi Repos
  - Jeudi 6h-14h (Matin)
- **Types courants :**
  - Matin : 6h-14h
  - Après-midi : 14h-22h
  - Nuit : 22h-6h
  - Journée : 9h-17h

### 👤 **Contraintes employé**
Les **contraintes** sont les limitations et préférences de chaque employé :
- **Contraintes légales :** Contrat (35h, 40h, temps partiel), repos minimum
- **Disponibilités :** "Pas disponible le mercredi", "Préfère les matins"
- **Compétences :** "Certifié serveur bar", "Manager de service"

### ⏱️ **Heures supplémentaires**
Les **heures supplémentaires** sont les heures travaillées au-delà du contrat normal.
- **Exemple :** Employé en 35h/semaine qui travaille 40h → 5h supplémentaires
- **Règles :** Contingent annuel, majorations, limites légales

### 🤖 **Génération automatique**
L'**IA génère** automatiquement tout le planning du mois en respectant toutes les contraintes.
- **Input :** Employés + Contraintes + Besoins opérationnels
- **Output :** Planning complet optimisé

### ✅ **Validation IA**
Lors de **modifications manuelles**, l'IA vérifie instantanément si ça reste conforme.
- **Exemple :** Manager déplace un horaire → IA vérifie conformité → Alerte si problème

---

## 📊 État actuel du projet (Décembre 2024)

### ✅ Fonctionnalités complétées et validées

#### Infrastructure & Tooling (FND)
- **FND-01** ✅ Base Next.js 15.4.6 avec App Router et Turbopack
- **FND-02** ✅ TypeScript strict mode (5.x) avec types exhaustifs
- **FND-03** ✅ Tooling complet (ESLint 9 + Prettier + Husky + lint-staged)
- **FND-04** ✅ Tailwind CSS v4 avec tokens de design premium
- **FND-05** ✅ Design System ShadCN/UI complet (18 composants configurés)
- **FND-06** ✅ Variables d'environnement avec validation (.env.example documenté)
- **FND-07** ✅ Module config & constantes centralisés
- **FND-09** ✅ Script `npm run verify` opérationnel

#### Base de données & Supabase (DAT)
- **DAT-01** ✅ Projet Supabase configuré (production)
- **DAT-02** ✅ Clients Supabase SSR + browser avec types
- **DAT-03** ✅ Schéma Prisma complet (companies, users, employees, schedules, contracts)
- **DAT-04** ✅ RLS (Row Level Security) avec politiques multi-tenant
- **DAT-06** ✅ Système de migrations Prisma opérationnel

#### Authentification (AUTH)
- **AUTH-01** ✅ Intégration Supabase Auth (SSR/CSR)
- **AUTH-02** ✅ Pages auth premium (login/signup avec design Apple)
- **AUTH-03** ✅ Middleware Next.js pour protection des routes

#### Tests & Qualité (QA)
- **QA-01** ✅ Tests unitaires Jest configurés (4 suites de tests)
- **QA-03** ✅ Tests E2E Playwright (5/5 tests passent : signup avec validations)

### 🟡 En cours / Partiellement complété

- **AUTH-04** 🟡 Onboarding entreprise - Page signup créée mais wizard incomplet
- **EMP-01** 🟡 Structure employés créée (`/employees/page.tsx`) mais pas de CRUD
- **DAT-05** 🟡 Seeds & fixtures - Structure DB prête mais pas de données seed

### ❌ Écart identifié vs documentation

**Incohérence détectée :**
- TASKLIST.md indique "Partiellement livré" pour Phase B (Données)
- ROADMAP.md liste T009-T034 comme "À FAIRE"
- **Réalité :** DAT-03 à DAT-06 sont effectivement complétés (schéma Prisma + migrations)

---

## 🚀 Prochaines étapes (Sprint actuel - P0)

### 🎯 Sprint Focus : Compléter l'authentification et démarrer le CRUD employés

#### P0-1 : Finaliser l'onboarding entreprise (2-3 jours)
**ID :** AUTH-04
**Objectif :** Wizard post-inscription pour créer l'entreprise
**Livrables :**
- Page `/onboarding` avec étapes (infos entreprise → paramètres pays → règles métier)
- Validation Zod pour chaque étape
- Création automatique du tenant dans `companies` avec RLS
- Redirection vers dashboard après complétion

**Critères d'acceptation :**
- Wizard 3 étapes fonctionnel
- Données entreprise sauvegardées avec RLS
- Test E2E du flow complet signup → onboarding → dashboard

**Dépendances :** AUTH-01, AUTH-02 ✅

---

#### P0-2 : Système d'invitations & rôles (2-3 jours)
**ID :** AUTH-05
**Objectif :** Permettre aux owners d'inviter des utilisateurs avec rôles
**Livrables :**
- API route `POST /api/invitations` avec validation RLS
- Page `/settings/team` pour gérer invitations
- Email d'invitation avec token sécurisé
- Page acceptation invitation avec auto-création compte
- Système de permissions par rôle (owner/admin/manager/employee/viewer)

**Critères d'acceptation :**
- Invitation envoyée par email
- Token expire après 7 jours
- Utilisateur créé avec bon rôle et company_id
- Tests E2E du flow complet

**Dépendances :** AUTH-04 (onboarding)

---

#### P0-3 : CRUD Employés - Backend & API (3-4 jours)
**ID :** EMP-01
**Objectif :** Server actions sécurisées pour CRUD employés
**Livrables :**
- Server actions dans `src/lib/actions/employees.ts`
  - `createEmployee(data: EmployeeInput)`
  - `updateEmployee(id: string, data: EmployeeInput)`
  - `deleteEmployee(id: string)`
  - `getEmployees(filters?: EmployeeFilters)`
  - `getEmployee(id: string)`
- Validations Zod strictes (email, phone, dates, contrat)
- Respect RLS (company_id automatique)
- Gestion des erreurs avec messages clairs

**Critères d'acceptation :**
- Tests unitaires pour chaque action (>80% coverage)
- RLS validé : impossible d'accéder aux employés d'une autre entreprise
- Performance : récupération de 100 employés <500ms

**Dépendances :** DAT-03, DAT-04 ✅

---

#### P0-4 : CRUD Employés - Interface (3-4 jours)
**ID :** EMP-02
**Objectif :** Interfaces managers pour gérer les employés
**Livrables :**
- Page `/employees` : listing avec recherche, filtres, tri, pagination
- Page `/employees/new` : formulaire création avec validation temps réel
- Page `/employees/[id]` : vue détail employé (infos + historique)
- Page `/employees/[id]/edit` : formulaire édition
- Composants réutilisables : EmployeeCard, EmployeeForm, EmployeeFilters

**Design :**
- Premium Apple-style cohérent avec auth pages
- Responsive mobile-first
- Skeleton loaders pendant chargements
- Toast notifications pour actions (succès/erreur)

**Critères d'acceptation :**
- Interface fluide et responsive 320px-2560px
- Recherche temps réel avec debounce 300ms
- Validation formulaire avec feedback immédiat
- Tests E2E du flow CRUD complet

**Dépendances :** EMP-01

---

#### P0-5 : Types de contrats & gestion (2 jours)
**ID :** EMP-04
**Objectif :** Module de gestion des types de contrats par entreprise
**Livrables :**
- Server actions pour CRUD contract_types
- Page `/settings/contracts` pour gérer les types
- Contrats par défaut (35h FR, 40h LU, temps partiel)
- Liaison employé ↔ type de contrat
- Validation des règles (heures hebdo, repos, etc.)

**Critères d'acceptation :**
- Contrats par défaut créés à l'onboarding
- Impossible de supprimer un contrat lié à des employés
- Règles légales FR/LU respectées

**Dépendances :** EMP-01

---

## 📋 Backlog MVP (Court terme - 2-4 semaines)

### 🔐 Sécurité & Gestion d'erreurs

#### MVP-1 : Gestion d'erreurs & logging (M - 2-3 jours)
**ID :** FND-08
**Priorité :** P1
**Objectif :** Logger structuré + error boundaries + pages erreur premium
**Livrables :**
- Logger serveur (pino) avec niveaux (info/warn/error)
- Logger client avec queue et envoi batch
- Error boundaries React avec fallback UI premium
- Pages erreur personnalisées (404, 500, 403)
- Intégration Sentry optionnelle

**Effort :** M (Medium - 2-3 jours)

---

#### MVP-2 : Sécurité baseline (M - 2 jours)
**ID :** FND-10
**Priorité :** P1
**Objectif :** Headers sécurisés + protections CSRF/CSP
**Livrables :**
- Configuration `next.config.js` avec headers sécurité
- CSP (Content Security Policy) strict
- Protection CSRF sur les mutations
- Validation OWASP Top 10

**Effort :** M

---

### 👥 Gestion Employés - Fonctionnalités avancées

#### MVP-3 : Import/Export employés (L - 3-4 jours)
**ID :** EMP-03
**Priorité :** P1
**Objectif :** Import massif CSV/Excel + export pour paie
**Livrables :**
- Page `/employees/import` avec drag & drop
- Parsing CSV/Excel avec mapping colonnes flexible
- Preview + validation avant import
- Gestion des erreurs ligne par ligne
- Export Excel/CSV avec filtres appliqués
- Template Excel téléchargeable

**Critères d'acceptation :**
- Import de 1000 employés en <2 min
- Rapport d'erreur détaillé
- Export compatible logiciels paie (PayFit, ADP)

**Effort :** L (Large - 3-4 jours)

---

#### MVP-4 : Compétences & certifications (M - 2-3 jours)
**ID :** EMP-05
**Priorité :** P1
**Objectif :** Tags compétences + certifications avec expirations
**Livrables :**
- Table `skills` et `employee_skills`
- Table `certifications` avec date d'expiration
- Interface de gestion dans fiche employé
- Filtrage planning par compétences
- Notifications rappel expiration certifications (30j/7j avant)

**Effort :** M

---

#### MVP-5 : Disponibilités & préférences (L - 3-4 jours)
**ID :** EMP-06
**Priorité :** P1
**Objectif :** Saisie disponibilités par employé
**Livrables :**
- Composant calendrier hebdomadaire drag & drop
- Stockage JSONB `availability_preferences`
- Récurrences (chaque lundi 9h-17h) + exceptions
- Interface employé pour saisir ses préférences
- Validation conflits lors de l'assignation

**Effort :** L

---

### 📅 Planning - Fondations

#### MVP-6 : Modèles de shifts (M - 2-3 jours)
**ID :** SCHED-01
**Priorité :** P1
**Objectif :** Templates réutilisables de shifts
**Livrables :**
- CRUD `shift_templates` avec validations
- Page `/settings/shifts` pour gérer les modèles
- Prévisualisation visuelle
- Champs : nom, horaires, pause, couleur, compétences requises
- Shifts par défaut (Matin 6h-14h, Après-midi 14h-22h, Nuit 22h-6h)

**Effort :** M

---

#### MVP-7 : Calendrier planning - Vue lecture (L - 4-5 jours)
**ID :** SCHED-02
**Priorité :** P1
**Objectif :** Calendrier interactif vue lecture seule
**Livrables :**
- Page `/schedules` avec calendrier
- Vues : mensuelle / hebdomadaire / par employé
- Affichage shifts avec codes couleur
- Filtres : employé, département, type shift
- Performance : chargement <2s pour 100 employés

**Technologies :** `@tanstack/react-table` ou `react-big-calendar`

**Effort :** L

---

### ⚖️ Conformité légale - Moteur de base

#### MVP-8 : Moteur règles légales FR/LU (XL - 5-6 jours)
**ID :** COM-01
**Priorité :** P1
**Objectif :** Catalogue de règles par pays avec validation
**Livrables :**
- Module `src/lib/compliance/rules/` avec règles FR et LU
- Service `ComplianceValidator` pour valider un planning
- Règles implémentées :
  - Temps de travail max (35h FR / 40h LU)
  - Repos quotidien (11h minimum)
  - Repos hebdomadaire (35h FR / 44h LU)
  - Heures sup max
  - Travail consécutif max
- Tests unitaires exhaustifs (>90% coverage)

**Effort :** XL (Extra Large - 5-6 jours)

---

#### MVP-9 : Validation temps réel (M - 2-3 jours)
**ID :** COM-02
**Priorité :** P1
**Objectif :** Utiliser ComplianceValidator dans l'UI
**Livrables :**
- Hook `useComplianceValidation(schedule)`
- Validation à chaque modification de shift
- Alertes visuelles (rouge pour violation, orange pour warning)
- Blocage sauvegarde si violation critique
- Messages d'erreur explicites en français

**Dépendances :** COM-01

**Effort :** M

---

## 🎨 Backlog V1 (Moyen terme - 1-2 mois)

### 🤖 FONCTIONNALITÉ CLÉ #1 : Génération Automatique de Planning par IA

**🎯 Objectif principal :** Remplacer la création manuelle mensuelle (4-8h) par une génération automatique en 30 secondes

#### V1-1 : Configuration OpenAI (S - 1 jour)
**ID :** AI-01
**Priorité :** P2
**Objectif :** SDK OpenAI configuré et prêt
**Livrables :**
- Module `src/lib/ai/openai.ts` avec client configuré
- Variable `OPENAI_MODEL` (défaut: gpt-4)
- Fonction helper `callOpenAI()` avec retry et error handling

**Effort :** S (Small - 1 jour)

---

#### V1-2 : Prompt engineering sectoriel (M - 2-3 jours)
**ID :** AI-02
**Priorité :** P2
**Objectif :** Prompts optimisés par secteur pour génération de plannings
**Livrables :**
- Prompts versionnés dans `src/lib/ai/prompts/`
- Secteurs : Retail, Hôtellerie, Santé, Industrie, Générique
- Variables dynamiques :
  - Contraintes légales (35h FR, 40h LU, repos min)
  - Contrats individuels (temps plein, temps partiel, heures max)
  - Disponibilités et préférences des employés
  - Compétences requises par poste
  - Heures supplémentaires actuelles
- Documentation d'usage

**Effort :** M

---

#### V1-3 : 🔥 Moteur de Génération Automatique de Planning (XL - 6-8 jours)
**ID :** AI-03
**Priorité :** P2 (CRITIQUE pour la valeur différenciante)
**Objectif :** Génération automatique de plannings mensuels optimisés

**Ce que fait l'IA :**
1. **Analyse** les contraintes légales (35h/semaine, repos, heures max)
2. **Prend en compte** les contrats individuels de chaque employé
3. **Respecte** les disponibilités et préférences saisies
4. **Optimise** l'équité et la répartition de charge
5. **Génère** un planning mensuel complet en <30s
6. **Calcule** automatiquement les heures supplémentaires prévisionnelles

**Livrables :**
- API route `POST /api/ai/generate-schedule`
- Input :
  - Période (mois/semaine)
  - Liste employés avec contrats et contraintes
  - Besoins opérationnels (nombre de personnes par jour/créneau)
  - Préférences et disponibilités
- Appel OpenAI avec prompt sectoriel + validation conformité
- Output : Planning JSON optimisé avec:
  - Assignations complètes par employé
  - Calcul des heures par employé
  - Heures supplémentaires détectées
  - Score de qualité et conformité
- Queue si génération >30s (BullMQ ou équivalent)
- Logs détaillés des générations

**Critères d'acceptation :**
- Génération <30s pour 100 employés
- Conformité 100% aux règles légales
- Score qualité >85%
- Calcul automatique des heures supplémentaires
- Génération complète du mois sans intervention manuelle

**Effort :** XL (6-8 jours)

---

#### V1-4 : Interface de Génération Automatique (M - 3 jours)
**ID :** AI-04
**Priorité :** P2
**Objectif :** UI intuitive pour déclencher la génération automatique
**Livrables :**
- Bouton "Générer le planning du mois" dans `/schedules`
- Modal de configuration :
  - Sélection période (ex: Janvier 2025)
  - Sélection secteur d'activité
  - Configuration besoins opérationnels
  - Contraintes spécifiques optionnelles
- Loading state avec progression (analyse, génération, validation)
- Preview du planning généré avec statistiques:
  - Heures par employé
  - Heures supplémentaires détectées
  - Score de conformité
  - Alertes éventuelles
- Actions: Valider / Regénérer / Ajuster manuellement

**Dépendances :** AI-03

**Effort :** M

---

#### V1-5 : 🔥 Validation IA lors des Modifications Manuelles (M - 3 jours)
**ID :** AI-05 (NOUVEAU - PRIORITAIRE)
**Priorité :** P2 (IMPORTANT)
**Objectif :** Analyser en temps réel si les modifications manuelles restent conformes

**Ce que fait l'analyse IA :**
1. Lors de la modification d'horaires d'un employé
2. Vérifier instantanément si :
   - Les heures totales respectent le contrat
   - Les heures supplémentaires sont dans les limites
   - Le repos quotidien/hebdomadaire est respecté
   - La charge de travail reste équitable
3. Afficher alertes visuelles si non-conforme
4. Suggérer des ajustements automatiques

**Livrables :**
- Hook `useScheduleValidation()` pour validation temps réel
- Service d'analyse IA des modifications
- Alertes visuelles dans l'interface de planning:
  - 🟢 Vert : Conforme
  - 🟠 Orange : Warning (heures sup approchant limite)
  - 🔴 Rouge : Non-conforme (bloquer sauvegarde)
- Messages explicites en français
- Suggestions d'ajustements automatiques

**Critères d'acceptation :**
- Validation <500ms après modification
- Détection 100% des non-conformités
- Messages clairs pour l'utilisateur
- Blocage sauvegarde si violation critique

**Effort :** M (3 jours)

**Dépendances :** AI-03, SCHED-03

---

### 📅 FONCTIONNALITÉ CLÉ #2 : Visualisation et Modification Intuitive du Planning

**🎯 Objectif :** Interface claire pour visualiser le planning mensuel/hebdomadaire et le modifier intuitivement avec validation IA en temps réel

#### MVP-7 : Calendrier Planning - Vue Mensuelle/Hebdomadaire (L - 4-5 jours)
**ID :** SCHED-02
**Priorité :** P1 (CRITIQUE)
**Objectif :** Visualisation claire du planning avec vues multiples

**Livrables :**
- Page `/schedules` avec calendrier interactif
- **Vues principales :**
  - 📅 Vue Mensuelle : Tout le mois en un coup d'œil
  - 📆 Vue Hebdomadaire : Détail semaine par semaine
  - 👤 Vue Par Employé : Planning individuel
- Affichage des périodes de travail avec:
  - Horaires (ex: Lundi 9h-17h, Mardi 14h-22h)
  - Codes couleur par type d'horaire
  - Indicateurs visuels (heures sup, repos, congés)
- Filtres : employé, département, type d'horaire
- **Statistiques en temps réel :**
  - Heures totales par employé
  - Heures supplémentaires cumulées
  - Alertes de conformité
- Performance : chargement <2s pour 100 employés

**Technologies :** `@tanstack/react-table` ou `react-big-calendar`

**Effort :** L

---

#### V1-6 : 🔥 Modification Intuitive avec Validation IA (L - 4-5 jours)
**ID :** SCHED-03
**Priorité :** P2 (IMPORTANT)
**Objectif :** Modification drag & drop avec validation IA instantanée

**Fonctionnalités principales :**
1. **Modification intuitive :**
   - Drag & drop des périodes de travail dans le calendrier
   - Redimensionnement des horaires (étirer pour ajuster)
   - Double-clic pour édition rapide
   - Copier-coller d'une journée à l'autre
   - Duplication rapide (Ctrl+D)
   - Undo/Redo (historique 20 actions)

2. **Validation IA en temps réel :**
   - Lors de chaque modification, analyse instantanée :
     - Conformité avec le contrat de l'employé
     - Détection heures supplémentaires
     - Respect repos quotidien/hebdomadaire
     - Équité de charge entre employés
   - Alertes visuelles immédiates :
     - 🟢 Modification valide
     - 🟠 Attention (heures sup)
     - 🔴 Bloquant (non-conforme)
   - Suggestions automatiques d'ajustements

3. **Interface intelligente :**
   - Tooltip avec détails employé au survol
   - Calcul automatique des heures lors du déplacement
   - Preview avant validation
   - Confirmation pour modifications importantes

**Technologies :** `@dnd-kit/core` + Hook `useScheduleValidation()`

**Critères d'acceptation :**
- Modification fluide sans lag
- Validation <500ms après modification
- Sauvegarde automatique toutes les 30s
- Undo/Redo fonctionnel
- Détection 100% des non-conformités

**Effort :** L

**Dépendances :** SCHED-02, AI-05

---

### ⏰ FONCTIONNALITÉ CLÉ #3 : Suivi des Heures Supplémentaires

**🎯 Objectif :** Calcul automatique et suivi précis des heures supplémentaires pour chaque employé

#### V1-7 : 🔥 Module de Suivi des Heures Supplémentaires (M - 3 jours)
**ID :** OVERTIME-01 (NOUVEAU - PRIORITAIRE)
**Priorité :** P2 (IMPORTANT)
**Objectif :** Calcul et tracking automatique des heures supplémentaires

**Fonctionnalités :**
1. **Calcul automatique :**
   - Lors de la génération IA : détection automatique des heures sup
   - Lors des modifications : recalcul instantané
   - Respect des règles légales :
     - France : Contingent annuel, majorations
     - Luxembourg : 2h/jour max, 8h/semaine max
   - Différenciation heures sup normales vs heures sup majorées

2. **Visualisation :**
   - Badge sur le planning : "⏰ +5h" si heures sup détectées
   - Page `/overtime` avec tableau détaillé :
     - Heures sup par employé
     - Heures sup par semaine/mois
     - Cumul annuel vs contingent
     - Taux de majoration appliqué
   - Graphiques d'évolution mensuelle
   - Export Excel pour la paie

3. **Alertes intelligentes :**
   - 🟠 Warning : Approche limite contingent (80%)
   - 🔴 Critique : Limite atteinte ou dépassée
   - Notification manager + RH
   - Blocage automatique si dépassement non autorisé

4. **Intégration planning :**
   - Affichage temps réel dans le calendrier
   - Coloration spéciale des journées avec heures sup
   - Tooltip détaillé au survol
   - Filtre "Employés avec heures sup"

**Livrables :**
- Service `OvertimeCalculator` avec règles FR/LU
- Hook `useOvertimeTracking(employeeId, period)`
- Composant `OvertimeWidget` pour le planning
- Page `/overtime` avec rapports détaillés
- Export Excel compatible paie
- API endpoint `GET /api/overtime/:employeeId`

**Critères d'acceptation :**
- Calcul exact selon législation FR/LU
- Performance : calcul <100ms pour 1 mois
- Historique complet des heures sup
- Export validé par comptable
- Alertes automatiques fonctionnelles

**Effort :** M (3 jours)

**Dépendances :** SCHED-02, COM-01 (moteur règles légales)

---

#### V1-8 : Versioning & publication (M - 3 jours)
**ID :** SCHED-04
**Priorité :** P2
**Objectif :** Gestion statuts brouillon/publié
**Livrables :**
- Statuts : DRAFT → PUBLISHED → ARCHIVED
- Historique des versions avec diff visuel
- Rollback vers version précédente
- Notifications automatiques à la publication
- Commentaires sur versions

**Effort :** M

---

#### V1-7 : Workflow échange de shifts (L - 4 jours)
**ID :** SCHED-05
**Priorité :** P2
**Objectif :** Employés peuvent échanger leurs shifts
**Livrables :**
- Interface employé : proposer un échange
- Recherche employés compatibles (compétences + disponibilités)
- Workflow : demande → validation manager → confirmation
- Notifications à chaque étape
- Historique des échanges

**Effort :** L

---

### 🏖️ Congés & Remplacements

#### V1-8 : Demande de congés (M - 3 jours)
**ID :** LEAVE-01
**Priorité :** P2
**Objectif :** Interface employé pour demander des congés
**Livrables :**
- Page `/time-off/request` (employé)
- Formulaire : dates, type (CP/RTT/maladie), motif, pièces jointes
- Affichage solde disponible
- Mobile-friendly
- Validation dates (chevauchements, solde suffisant)

**Effort :** M

---

#### V1-9 : Workflow d'approbation (M - 2-3 jours)
**ID :** LEAVE-02
**Priorité :** P2
**Objectif :** Managers valident les demandes
**Livrables :**
- Page `/time-off/approvals` (manager)
- Liste demandes en attente avec filtres
- Actions : approuver / refuser / demander info
- SLA 24h avec rappels automatiques
- Historique décisions avec justifications

**Effort :** M

---

#### V1-10 : Calcul soldes & accrual (M - 3 jours)
**ID :** LEAVE-03
**Priorité :** P2
**Objectif :** Calcul automatique des soldes congés
**Livrables :**
- Règles accrual par pays (2.5j/mois FR, 25j/an LU)
- Calcul RTT automatique selon convention
- Historique mouvements (acquis/pris/soldés)
- Ajustements manuels avec justification
- Export pour paie

**Effort :** M

---

#### V1-11 : Suggestions remplaçants IA (L - 4 jours)
**ID :** LEAVE-04
**Priorité :** P2
**Objectif :** IA propose des remplaçants optimaux
**Livrables :**
- Algorithme de scoring (disponibilité + compétences + charge actuelle)
- Lors d'une demande de congé : affichage top 3 remplaçants
- Assignation automatique optionnelle
- Historique des remplacements

**Dépendances :** AI-01

**Effort :** L

---

### 📢 Notifications & Communication

#### V1-12 : Infrastructure email (M - 2-3 jours)
**ID :** NOT-01
**Priorité :** P2
**Objectif :** Emails transactionnels brandés
**Livrables :**
- Intégration Resend ou SendGrid
- Templates email premium (React Email ou MJML)
- Configuration SPF/DKIM
- Logs d'envoi et taux de délivrabilité

**Effort :** M

---

#### V1-13 : Centre notifications in-app (M - 2-3 jours)
**ID :** NOT-02
**Priorité :** P2
**Objectif :** Notifications persistantes dans l'app
**Livrables :**
- Table `notifications` avec RLS
- Composant NotificationCenter (icône cloche + panneau)
- Types : info / success / warning / error
- État lu/non-lu
- Actions directes depuis notifications

**Effort :** M

---

#### V1-14 : Temps réel avec Supabase Realtime (M - 2-3 jours)
**ID :** NOT-03
**Priorité :** P2
**Objectif :** Updates temps réel du planning
**Livrables :**
- Configuration Supabase Realtime sur tables critiques
- Hook `useRealtimeSubscription(table, filters)`
- Updates automatiques UI (planning, congés, swaps)
- Optimistic updates avec rollback si erreur

**Effort :** M

---

### 📊 Analytics & Rapports

#### V1-15 : Dashboard manager (L - 4-5 jours)
**ID :** AN-01
**Priorité :** P2
**Objectif :** KPIs pour managers
**Livrables :**
- Page `/dashboard` avec graphiques
- KPIs :
  - Heures planifiées vs réalisées
  - Taux de conformité
  - Taux de remplissage shifts
  - Coût masse salariale
  - Satisfaction employés (sondage)
- Filtres : période, département, employé
- Graphiques : line, bar, pie (recharts ou chart.js)

**Effort :** L

---

#### V1-16 : Rapports opérationnels (M - 3 jours)
**ID :** AN-02
**Priorité :** P2
**Objectif :** Rapports exportables pour RH
**Livrables :**
- Rapports prédéfinis :
  - Heures par employé (mensuel)
  - Heures supplémentaires
  - Congés pris/restants
  - Coût par département
- Export PDF automatique avec branding
- Export Excel pour analyse
- Planification envoi automatique (hebdo/mensuel)

**Effort :** M

---

### 🎨 UX & Internationalisation

#### V1-17 : Layout application & navigation (M - 2-3 jours)
**ID :** UX-02
**Priorité :** P2
**Objectif :** Navigation cohérente et intuitive
**Livrables :**
- Sidebar rétractable avec icônes
- Breadcrumbs automatiques
- User menu (avatar + dropdown)
- Navigation rapide (Cmd+K search)
- Max 3 clics vers features principales

**Effort :** M

---

#### V1-18 : Site marketing & landing page (L - 4-5 jours)
**ID :** UX-04
**Priorité :** P2
**Objectif :** Pages publiques pour acquisition
**Livrables :**
- Landing page : hero + features + pricing + FAQ + CTA
- Page `/features` : détails fonctionnalités
- Page `/pricing` : grille tarifs avec comparaisons
- Page `/about` : vision + équipe
- SEO optimisé (meta tags, sitemap, structured data)
- Lighthouse score >90

**Effort :** L

---

#### V1-19 : Internationalisation FR/EN (M - 3 jours)
**ID :** UX-07
**Priorité :** P2
**Objectif :** Support français et anglais
**Livrables :**
- Intégration `next-intl`
- Traductions complètes UI + marketing
- Détection automatique langue navigateur
- Switcher de langue dans header
- Formats locaux (dates, heures, devises)

**Effort :** M

---

#### V1-20 : Onboarding interactif (M - 2-3 jours)
**ID :** UX-08
**Priorité :** P2
**Objectif :** Aide contextuelle pour nouveaux utilisateurs
**Livrables :**
- Checklist onboarding (<10 min)
- Tooltips contextuels (première visite)
- Centre d'aide intégré (search + articles)
- Vidéos tutoriels embarquées
- Progress tracking

**Effort :** M

---

## 💡 V2 & Optimisations (Long terme - 3+ mois)

### 🔌 Intégrations & API

#### V2-1 : API publique REST (XL - 6-8 jours)
**ID :** INT-01
**Priorité :** P3
**Objectif :** API pour intégrations tierces
**Livrables :**
- Endpoints sécurisés (employees, schedules, time-off)
- Authentification API keys + rate limiting
- Documentation OpenAPI 3.0 interactive (Swagger UI)
- SDK JavaScript/TypeScript
- Webhooks pour événements

**Effort :** XL

---

#### V2-2 : Synchronisation calendriers (M - 3-4 jours)
**ID :** INT-03
**Priorité :** P3
**Objectif :** Export vers Google Calendar & Outlook
**Livrables :**
- OAuth Google & Microsoft
- Export ICS automatique
- Sync bidirectionnelle (lecture seule)
- Configuration par utilisateur

**Effort :** M

---

#### V2-3 : Exports paie & RH (M - 3 jours)
**ID :** INT-04
**Priorité :** P3
**Objectif :** Templates pour logiciels paie
**Livrables :**
- Templates CSV/Excel (PayFit, ADP, Sage)
- Mapping colonnes personnalisable
- Automatisation envoi (SFTP/email)
- Validation comptable

**Effort :** M

---

### 💳 Monétisation & Billing

#### V2-4 : Facturation Stripe (L - 4-5 jours)
**ID :** BILL-01
**Priorité :** P3
**Objectif :** Abonnements SaaS opérationnels
**Livrables :**
- Intégration Stripe Billing
- Plans : Freemium (5 emp) / Starter (9€) / Business (15€) / Enterprise (25€)
- Facturation mensuelle/annuelle
- Gestion des paiements et factures
- Portal client Stripe

**Effort :** L

---

#### V2-5 : Feature flags & limites (M - 2-3 jours)
**ID :** BILL-02
**Priorité :** P3
**Objectif :** Restrictions par plan
**Livrables :**
- Système feature flags
- Limites : nombre employés, génération IA, exports
- Modal upgrade quand limite atteinte
- Tracking conversion

**Dépendances :** BILL-01

**Effort :** M

---

### 🔒 Sécurité & Conformité avancées

#### V2-6 : MFA & sécurité avancée (M - 2-3 jours)
**ID :** AUTH-07
**Priorité :** P3
**Objectif :** Authentification multi-facteurs
**Livrables :**
- TOTP (Google Authenticator, Authy)
- SMS backup optionnel
- Recovery codes
- Enforcement par entreprise (optionnel)

**Effort :** M

---

#### V2-7 : Interface audit trail (M - 2-3 jours)
**ID :** AUTH-08
**Priorité :** P3
**Objectif :** Vue admin des logs d'audit
**Livrables :**
- Page `/audit` (admins seulement)
- Filtres : entité, action, utilisateur, période
- Export logs
- Recherche <1s

**Effort :** M

---

#### V2-8 : Conformité RGPD complète (L - 4-5 jours)
**ID :** OPS-06
**Priorité :** P3
**Objectif :** Conformité RGPD 100%
**Livrables :**
- DPA (Data Processing Agreement) template
- Registre des traitements
- Droit à l'oubli automatisé
- Export données personnelles
- Consentements tracés
- Anonymisation historique

**Effort :** L

---

### 🚀 Performance & Ops

#### V2-9 : Optimisations performance (L - 4-5 jours)
**ID :** DAT-08
**Priorité :** P3
**Objectif :** Performance <100ms sur requêtes critiques
**Livrables :**
- Index Postgres ciblés
- Vues matérialisées pour analytics
- Cache Redis (sessions, queries fréquentes)
- Pagination côté serveur
- Lazy loading images

**Effort :** L

---

#### V2-10 : Pipeline CI/CD (M - 2-3 jours)
**ID :** OPS-01
**Priorité :** P3
**Objectif :** Déploiement automatisé
**Livrables :**
- GitHub Actions workflow
- Jobs : lint → type-check → test → build → deploy
- Preview deployments sur PR (Vercel)
- Auto-deploy main → production
- Rollback automatique si erreur

**Effort :** M

---

#### V2-11 : Monitoring & alerting (M - 2-3 jours)
**ID :** OPS-02
**Priorité :** P3
**Objectif :** Visibilité production
**Livrables :**
- Sentry pour errors
- Vercel Analytics pour perf
- Supabase logs et metrics
- Alertes Slack/email
- Dashboard ops interne

**Effort :** M

---

### 📱 Mobile & Extensions

#### V2-12 : Applications mobiles natives (XL - 8-10 semaines)
**ID :** V2-MOBILE (nouveau)
**Priorité :** P3
**Objectif :** Apps iOS/Android natives
**Livrables :**
- React Native ou Flutter
- Features prioritaires : planning, congés, notifications
- Push notifications
- Mode offline basique
- App Store & Play Store

**Effort :** XL (projet dédié)

---

#### V2-13 : Marketplace plugins (XL - 6-8 semaines)
**ID :** V2-MARKETPLACE (nouveau)
**Priorité :** P3
**Objectif :** Écosystème extensible
**Livrables :**
- Architecture plugins
- Marketplace web
- Plugins officiels (intégrations populaires)
- SDK développeurs tiers
- Revenue share model

**Effort :** XL (projet dédié)

---

## 🔄 Mapping avec anciens documents

### Correspondance TASKLIST ↔ ROADMAP ↔ TODO

| TASKLIST ID | ROADMAP ID | TODO ID | Titre | Statut réel |
|-------------|------------|---------|-------|-------------|
| FND-01 | T001 | ✅ | Next.js 15 setup | DONE |
| FND-02 | T007 | ✅ | TypeScript strict | DONE |
| FND-03 | T002 | ✅ | Tooling (ESLint/Prettier) | DONE |
| FND-04 | T003 | ✅ | Tailwind CSS | DONE |
| FND-05 | T004 | ✅ | ShadCN/UI | DONE |
| FND-06 | T005 | ✅ | Variables d'environnement | DONE |
| FND-07 | T006 | ✅ | Config & constantes | DONE |
| FND-08 | - | MVP-1 | Gestion erreurs | TODO (P1) |
| FND-09 | - | ✅ | Scripts CI locaux | DONE |
| FND-10 | - | MVP-2 | Sécurité baseline | TODO (P1) |
| DAT-01 | T009 | ✅ | Projet Supabase | DONE |
| DAT-02 | T010 | ✅ | Clients Supabase | DONE |
| DAT-03 | T021-T027 | ✅ | Schéma DB complet | DONE |
| DAT-04 | T040-T043 | ✅ | RLS multi-tenant | DONE |
| DAT-05 | - | 🟡 | Seeds & fixtures | PARTIAL |
| DAT-06 | - | ✅ | Migrations Prisma | DONE |
| DAT-07 | - | - | Triggers & audit | DEFER V2 |
| DAT-08 | - | V2-9 | Optimisations perf | V2 (P3) |
| AUTH-01 | T011, T044-T045 | ✅ | Supabase Auth | DONE |
| AUTH-02 | T047-T050 | ✅ | Pages auth premium | DONE |
| AUTH-03 | T046 | ✅ | Middleware & guards | DONE |
| AUTH-04 | T051-T056 | P0-1 | Onboarding entreprise | TODO (P0) |
| AUTH-05 | - | P0-2 | Invitations & rôles | TODO (P0) |
| AUTH-06 | - | - | Settings entreprise | DEFER V1.1 |
| AUTH-07 | - | V2-6 | MFA | V2 (P3) |
| AUTH-08 | - | V2-7 | Audit trail UI | V2 (P3) |
| AUTH-09 | - | - | Tests isolation | DEFER post-MVP |
| EMP-01 | T061-T063 | P0-3 | API CRUD employés | TODO (P0) |
| EMP-02 | T064-T067 | P0-4 | UI CRUD employés | TODO (P0) |
| EMP-03 | - | MVP-3 | Import/Export | TODO (P1) |
| EMP-04 | T075-T078 | P0-5 | Types de contrats | TODO (P0) |
| EMP-05 | - | MVP-4 | Compétences | TODO (P1) |
| EMP-06 | - | MVP-5 | Disponibilités | TODO (P1) |
| EMP-07 | - | - | Recherche avancée | DEFER V1.1 |
| SCHED-01 | T079-T084 | MVP-6 | Modèles de shifts | TODO (P1) |
| SCHED-02 | T116-T118 | MVP-7 | Calendrier planning | TODO (P1) |
| SCHED-03 | T119-T121 | V1-5 | Drag & drop | V1 (P2) |
| SCHED-04 | - | V1-6 | Versioning | V1 (P2) |
| SCHED-05 | - | V1-7 | Échange shifts | V1 (P2) |
| SCHED-06 | - | - | Suivi heures sup | DEFER V1.1 |
| AI-01 | T095-T096 | V1-1 | Config OpenAI | V1 (P2) |
| AI-02 | T097-T098 | V1-2 | Prompts sectoriels | V1 (P2) |
| AI-03 | T100-T105 | V1-3 | Service génération | V1 (P2) |
| AI-04 | T106-T109 | V1-4 | Interface IA | V1 (P2) |
| AI-05 | - | - | Monitoring coûts IA | DEFER V1.1 |
| COM-01 | - | MVP-8 | Moteur règles légales | TODO (P1) |
| COM-02 | - | MVP-9 | Validation temps réel | TODO (P1) |
| COM-03 | - | - | Rapports conformité | DEFER V1.1 |
| COM-04 | - | - | Framework extension pays | DEFER V2 |
| LEAVE-01 | - | V1-8 | Demande congés | V1 (P2) |
| LEAVE-02 | - | V1-9 | Workflow approbation | V1 (P2) |
| LEAVE-03 | - | V1-10 | Calcul soldes | V1 (P2) |
| LEAVE-04 | - | V1-11 | Remplaçants IA | V1 (P2) |
| NOT-01 | - | V1-12 | Infrastructure email | V1 (P2) |
| NOT-02 | - | V1-13 | Notifications in-app | V1 (P2) |
| NOT-03 | - | V1-14 | Temps réel | V1 (P2) |
| NOT-04 | - | - | Préférences notif | DEFER V1.1 |
| NOT-05 | - | - | Templates métier | DEFER V1.1 |
| AN-01 | - | V1-15 | Dashboard manager | V1 (P2) |
| AN-02 | - | V1-16 | Rapports opérationnels | V1 (P2) |
| AN-03 | - | - | Prédictions charge | DEFER V2 |
| AN-04 | - | - | KPIs business | DEFER V2 |
| INT-01 | - | V2-1 | API publique | V2 (P3) |
| INT-02 | - | - | Webhooks | DEFER V2 |
| INT-03 | - | V2-2 | Sync calendriers | V2 (P3) |
| INT-04 | - | V2-3 | Exports paie | V2 (P3) |
| INT-05 | - | - | Slack/Teams | HOLD |
| BILL-01 | - | V2-4 | Stripe | V2 (P3) |
| BILL-02 | - | V2-5 | Feature flags | V2 (P3) |
| UX-01 | - | - | Design tokens doc | DONE (implicit) |
| UX-02 | - | V1-17 | Layout & navigation | V1 (P2) |
| UX-03 | - | - | Responsive | ONGOING |
| UX-04 | - | V1-18 | Site marketing | V1 (P2) |
| UX-05 | - | - | Micro-interactions | DEFER V1.1 |
| UX-06 | - | - | Accessibilité WCAG | DEFER V1.1 |
| UX-07 | - | V1-19 | i18n FR/EN | V1 (P2) |
| UX-08 | - | V1-20 | Onboarding interactif | V1 (P2) |
| OPS-01 | - | V2-10 | CI/CD | V2 (P3) |
| OPS-02 | - | V2-11 | Monitoring | V2 (P3) |
| OPS-06 | - | V2-8 | RGPD complet | V2 (P3) |

---

## 💭 Recommandations & Challenges

### 🎯 Priorisation stratégique

#### ✅ Points forts actuels
1. **Fondations solides** : Infrastructure Next.js + TypeScript + ShadCN est excellente
2. **Sécurité first** : RLS Supabase + auth SSR bien implémentés
3. **Qualité** : Tests E2E dès le début = excellent réflexe
4. **Documentation** : BRD, TASKLIST, ROADMAP très détaillés

#### 🚨 Challenges identifiés

**1. Sur-planification vs exécution (CRITIQUE)**
- **Constat** : 3 documents de planning (BRD, TASKLIST, ROADMAP) mais peu de code métier
- **Impact** : Risque de passer trop de temps à planifier au lieu de coder
- **Recommandation** : Ce TODO.md remplace les 3 documents. Se concentrer sur l'exécution des P0.

**2. Scope creep potentiel**
- **Constat** : 134 tâches dans ROADMAP, beaucoup sont "nice-to-have"
- **Impact** : MVP jamais livré si on veut tout faire
- **Recommandation** : Se concentrer uniquement sur les P0-P1. Différer 60% des features en V2.

**3. Incohérences entre documents**
- **Constat** : ROADMAP dit "T009-T034 À FAIRE" alors que DB est créée
- **Impact** : Confusion sur l'état réel du projet
- **Recommandation** : Ce TODO.md est la source de vérité. Archiver ROADMAP et TASKLIST.

**4. Features sur-engineered détectées**
- **GOV-01** (Harmonisation dark mode) : Pas prioritaire, supprimer ou différer V2
- **AI-05** (Monitoring coûts IA) : Peut attendre V1.1
- **AUTH-09** (Tests isolation) : Couvert par RLS Supabase + tests E2E existants
- **DAT-07** (Triggers audit) : Peut être simplifié avec audit basique
- **COM-04** (Framework extension pays) : YAGNI pour MVP, attendre vraie demande
- **INT-05** (Slack/Teams) : HOLD justifié, supprimer du MVP
- **UX-05** (Micro-interactions) : Polish, pas MVP

**Recommandation** : Supprimer/différer ces 7 tâches. Gain : ~15 jours de dev.

---

### 🔍 Optimisations proposées

#### 1. Grouper certaines tâches pour efficacité

**Proposition : Fusionner AUTH-04 + AUTH-05**
- **Pourquoi** : Onboarding et invitations sont liés (owner invite équipe après onboarding)
- **Gain** : 1 jour (pas besoin de refaire UI settings)
- **Nouveau ID** : P0-1-2 (3-4 jours au lieu de 5-6)

**Proposition : Fusionner SCHED-01 + SCHED-02**
- **Pourquoi** : Créer modèles de shifts sans les afficher n'a pas de sens
- **Gain** : 1 jour (éviter double setup calendrier)
- **Nouveau ID** : MVP-6-7 (5-6 jours au lieu de 6-8)

**Proposition : Créer EMP-07 + COM-02 ensemble**
- **Pourquoi** : Recherche employés utilise la validation conformité
- **Gain** : Cohérence fonctionnelle
- **Nouveau ID** : MVP-9-EXT (3 jours au lieu de 5)

---

#### 2. Features manquantes critiques

**⚠️ CRITIQUE : Gestion des paramètres entreprise (AUTH-06)**
- **Manque actuel** : Pas de page `/settings` pour configurer entreprise
- **Impact** : Impossible de changer pays, fuseau, heures légales
- **Recommandation** : Ajouter AUTH-06 dans P0 après onboarding
- **Effort** : M (2 jours)

**⚠️ IMPORTANT : Seeds & fixtures (DAT-05)**
- **Manque actuel** : Pas de données de démo
- **Impact** : Impossible de tester rapidement / faire des démos
- **Recommandation** : Créer seed script avec 2 entreprises + 30 employés
- **Effort** : S (1 jour)

**⚠️ IMPORTANT : Error boundaries & pages erreur (FND-08)**
- **Manque actuel** : Pas de gestion d'erreurs globale
- **Impact** : Expérience utilisateur dégradée en cas d'erreur
- **Recommandation** : Créer maintenant pour éviter debug douloureux plus tard
- **Effort** : M (2 jours)

---

#### 3. Quick wins identifiés

Ces tâches apportent beaucoup de valeur avec peu d'effort :

**Quick Win 1 : Seeds de démonstration (1 jour)**
- Permet tests rapides et démos clients
- Facilite le développement (pas besoin de recréer data manuellement)

**Quick Win 2 : Pages erreur premium (1 jour)**
- Améliore significativement l'UX
- Facile à implémenter avec ShadCN existant

**Quick Win 3 : Composants réutilisables UI (1 jour)**
- `EmployeeCard`, `EmployeeFilters`, `LoadingSkeleton`, `EmptyState`
- Accélère développement futur de 30%

**Quick Win 4 : Script de vérification complète (0.5 jour)**
- Étendre `npm run verify` avec checks DB, env vars, etc.
- Évite erreurs runtime stupides

**Total Quick Wins : 3.5 jours → Impact majeur sur productivité**

---

#### 4. Simplifications possibles

**Simplification 1 : Remplaçants IA (LEAVE-04)**
- **Actuellement** : Scoring complexe avec ML
- **Proposition** : Algorithme heuristique simple (disponibilité + compétences)
- **Gain** : 2 jours, résultat similaire
- **Différer ML** : V2 quand on aura vraiment besoin

**Simplification 2 : Versioning planning (SCHED-04)**
- **Actuellement** : Diff visuel + rollback
- **Proposition** : Historique simple avec snapshots JSON
- **Gain** : 1 jour
- **Différer diff visuel** : V1.1

**Simplification 3 : Notifications (NOT-01-05)**
- **Actuellement** : 5 tâches séparées
- **Proposition** : Commencer avec emails uniquement (NOT-01), ajouter in-app après
- **Gain** : Se concentrer sur l'essentiel
- **Phasing** : Email MVP → In-app V1 → Realtime V1 → Préférences V1.1

**Simplification 4 : Analytics (AN-01-02)**
- **Actuellement** : Prédictions + ML
- **Proposition** : Dashboard simple avec KPIs basiques
- **Gain** : 3 jours
- **Différer ML** : V2

**Total gains simplifications : ~7 jours**

---

### 🎲 Stratégie de dérisquage

#### Risque 1 : Complexité IA (AI-03)
- **Probabilité** : Haute
- **Impact** : Critique (feature différenciante)
- **Mitigation** :
  - Commencer par prompts simples et itérer
  - Prévoir fallback : génération algorithmique si OpenAI fail
  - Budget OpenAI : 500€/mois max en dev, alertes à 80%
  - Tests avec petits datasets (10 employés) avant 100

#### Risque 2 : Performance calendrier (SCHED-02)
- **Probabilité** : Moyenne
- **Impact** : Haute (UX dégradée)
- **Mitigation** :
  - Pagination côté serveur dès le début
  - Virtual scrolling pour grandes listes
  - Benchmark à 50/100/500 employés
  - Cache Supabase + React Query

#### Risque 3 : Conformité légale (COM-01)
- **Probabilité** : Faible (on contrôle)
- **Impact** : Critique (légal)
- **Mitigation** :
  - Tests unitaires exhaustifs (>95% coverage)
  - Validation légale par juriste (budget 1000€)
  - Documentation des sources légales
  - Mise à jour annuelle obligatoire

#### Risque 4 : Multi-tenant leaks (DAT-04)
- **Probabilité** : Faible (RLS Supabase fiable)
- **Impact** : Catastrophique
- **Mitigation** :
  - Tests E2E isolation dès maintenant
  - Audit sécurité externe avant production (budget 2000€)
  - Monitoring logs d'accès
  - Bug bounty post-launch

---

### 📈 Métriques de succès sprint

Pour valider qu'on avance efficacement :

**Métriques Dev :**
- Vélocité : 1 tâche P0 complétée tous les 3 jours
- Qualité : 0 régression détectée par tests E2E
- Couverture tests : maintenir >70%

**Métriques Produit :**
- Features complétées vs plannifiées : >80%
- Dette technique : <5 TODOs critiques dans le code
- Temps build : <2 min

**Métriques Business :**
- Démo fonctionnelle possible : Oui dès P0 terminé
- Feedback beta : Collecter après chaque sprint
- Time-to-value : Utilisateur productif en <30 min

---

### 🎯 Roadmap visuelle simplifiée

```
MAINTENANT (P0) - 2 semaines
└── Auth complète + CRUD Employés basique
    → Livrable : Démo fonctionnelle

MVP (P1) - 4 semaines
└── Planning manuel + Conformité + Imports
    → Livrable : Produit utilisable sans IA

V1 (P2) - 8 semaines
└── IA + Congés + Notifications + Analytics
    → Livrable : Produit différenciant complet

V2 (P3) - 12+ semaines
└── API + Billing + Mobile + Marketplace
    → Livrable : Plateforme extensible
```

---

### 🚀 Prochaine action immédiate

**Action #1 : Nettoyer les documents obsolètes**
- [ ] Archiver `docs/ROADMAP.md` → `docs/archive/ROADMAP-OLD.md`
- [ ] Archiver `docs/TASKLIST.md` → `docs/archive/TASKLIST-OLD.md`
- [ ] Mettre TODO.md comme source de vérité dans README

**Action #2 : Compléter Quick Win 4 (0.5j)**
- [ ] Étendre script `npm run verify` avec checks DB + env

**Action #3 : Démarrer P0-1 (Onboarding)**
- [ ] Créer branche `feature/P0-1-onboarding-wizard`
- [ ] Designer wireframes 3 étapes
- [ ] Coder page `/onboarding` avec stepper

---

## 📝 Notes de maintenance

**Ce document doit être :**
- ✅ Mis à jour chaque semaine (vendredi EOD)
- ✅ Référencé dans les commits (ex: `feat: P0-1 Onboarding wizard (#TODO)`)
- ✅ Source de vérité pour les sprints
- ✅ Synchronisé avec Linear/Jira si adoption future

**Changelog du document :**
- **2024-12-08** : Création initiale après analyse BRD + TASKLIST + ROADMAP
- **2024-12-08** : Priorisation P0/P1/P2/P3 et simplifications

---

**🎯 Objectif global : Livrer un MVP fonctionnel en 6 semaines, puis itérer rapidement avec feedback utilisateurs.**

**Philosophie : "Done is better than perfect. Ship early, ship often."**
