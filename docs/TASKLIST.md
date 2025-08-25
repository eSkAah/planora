# 📝 TASKLIST PLANORA - Tâches de Développement

## 🔄 WORKFLOW GIT À SUIVRE

**Pour chaque tâche :**

1. `git checkout develop && git pull origin develop`
2. `git checkout -b feature/T00X-description-tache`
3. Développer la tâche complètement
4. Commit avec message clair
5. `gh pr create --title "feat: T00X - Description" --body "Détails de la tâche"`
6. Attendre validation pour merge

---

## 🚦 STATUT DES TÂCHES

- ✅ **TERMINÉ** - Tâche complétée et mergée
- 🟡 **EN COURS** - Actuellement en développement
- ❌ **À FAIRE** - Prêt à être développé
- 🔄 **BLOQUÉ** - Attend une autre tâche

---

## 📋 PHASE 1 - INFRASTRUCTURE (IMMÉDIAT)

### **T005 - Variables d'environnement** ✅

**Branch:** `feature/T005-environment-variables`  
**Description:** Configurer tous les fichiers d'environnement nécessaires  
**Tâches:**

- ✅ Créer `.env.local` et `.env.example`
- ✅ Ajouter variables Supabase, OpenAI, App URL
- ✅ Documenter les variables dans `docs/ENVIRONMENT.md`
- ✅ Créer utilitaire de validation d'environnement
- ✅ Tester la configuration

### **T004 - Finaliser ShadCN/UI** ❌

**Branch:** `feature/T004-complete-shadcn-setup`  
**Description:** Installer et configurer tous les composants ShadCN de base  
**Tâches:**

- `npx shadcn@latest init`
- Installer 10+ composants de base (button, card, input, etc.)
- Créer thème personnalisé Planora
- Tester tous les composants
- Mettre à jour `src/components/ui/index.ts`

---

## 📊 PHASE 2 - SUPABASE & BASE DE DONNÉES

### **T009 - Créer projet Supabase** ❌

**Branch:** `feature/T009-supabase-project-setup`  
**Description:** Créer et configurer le projet Supabase  
**Tâches:**

- Créer projet "planora-prod" sur supabase.com
- Configurer région Europe (RGPD)
- Noter les clés API dans .env.local
- Tester la connexion

### **T010 - Connection Next.js ↔ Supabase** ❌

**Branch:** `feature/T010-nextjs-supabase-integration`  
**Description:** Intégrer Supabase avec Next.js  
**Dépendances:** T009  
**Tâches:**

- `npm install @supabase/supabase-js @supabase/ssr`
- Créer `src/lib/database/supabase.ts`
- Créer client côté serveur et client
- Types TypeScript pour Supabase
- Tester la connexion

### **T011 - Setup authentification Supabase** ❌

**Branch:** `feature/T011-supabase-auth-setup`  
**Description:** Configurer l'authentification Supabase  
**Dépendances:** T010  
**Tâches:**

- `npm install @supabase/auth-ui-react @supabase/auth-ui-shared`
- Configurer les providers d'auth
- Créer hooks d'authentification
- Middleware de protection des routes

### **T021-T034 - Schéma base de données** ❌

**Branch:** `feature/T021-034-database-schema`  
**Description:** Créer toutes les tables principales  
**Dépendances:** T010  
**Tâches:**

- Exécuter SQL complet (companies, users, employees, etc.)
- Configurer Row Level Security (RLS)
- Créer les politiques de sécurité
- Tester l'isolation multi-tenant
- Créer les index de performance

---

## 🔐 PHASE 3 - AUTHENTIFICATION

### **T046 - Middleware protection routes** ❌

**Branch:** `feature/T046-auth-middleware`  
**Description:** Créer middleware Next.js pour protéger les routes  
**Dépendances:** T011  
**Tâches:**

- Créer `src/middleware.ts`
- Logique de redirection auth
- Protection routes sensibles
- Gestion des rôles utilisateur

### **T047 - Pages authentification** ❌

**Branch:** `feature/T047-auth-pages`  
**Description:** Créer toutes les pages d'authentification  
**Dépendances:** T046  
**Tâches:**

- `src/app/(auth)/login/page.tsx`
- `src/app/(auth)/register/page.tsx`
- `src/app/(auth)/forgot-password/page.tsx`
- Design premium avec ShadCN
- Validation côté client

### **T051-T056 - Gestion entreprises multi-tenant** ❌

**Branch:** `feature/T051-056-company-management`  
**Description:** Interface complète de gestion des entreprises  
**Dépendances:** T047  
**Tâches:**

- Page inscription entreprise
- Sélection pays et règles légales
- Configuration initiale entreprise
- Interface invitation utilisateurs
- Gestion permissions par entreprise

---

## 👥 PHASE 4 - GESTION EMPLOYÉS

### **T061 - Interface listing employés** ❌

**Branch:** `feature/T061-employees-listing`  
**Description:** Page de listing des employés avec pagination  
**Dépendances:** T051-T056  
**Tâches:**

- `src/app/employees/page.tsx`
- Table avec tri et filtres
- Pagination performante
- Actions bulk (export, etc.)
- Responsive mobile

### **T062 - Formulaire création employé** ❌

**Branch:** `feature/T062-employee-create-form`  
**Description:** Formulaire complet de création d'employé  
**Dépendances:** T061  
**Tâches:**

- `src/app/employees/new/page.tsx`
- Form avec validation Zod
- Upload avatar
- Gestion des contrats
- Preview avant sauvegarde

### **T063 - Page détail employé** ❌

**Branch:** `feature/T063-employee-detail`  
**Description:** Page de détail avec toutes les informations  
**Dépendances:** T062  
**Tâches:**

- `src/app/employees/[id]/page.tsx`
- Vue complète des données
- Historique des modifications
- Actions rapides
- Interface élégante

### **T064 - Formulaire modification employé** ❌

**Branch:** `feature/T064-employee-edit-form`  
**Description:** Interface de modification d'un employé  
**Dépendances:** T063  
**Tâches:**

- `src/app/employees/[id]/edit/page.tsx`
- Form pré-rempli
- Validation temps réel
- Gestion des changements
- Confirmation avant sauvegarde

### **T066-T067 - Import/Export employés** ❌

**Branch:** `feature/T066-067-employee-import-export`  
**Description:** Import CSV massif et export des données  
**Dépendances:** T064  
**Tâches:**

- Interface upload CSV/Excel
- Validation des données importées
- Mapping des colonnes
- Export dans différents formats
- Gestion des erreurs

### **T075-T078 - Types de contrats** ❌

**Branch:** `feature/T075-078-contract-types`  
**Description:** Configuration des types de contrats  
**Dépendances:** T066-T067  
**Tâches:**

- Interface CRUD contrats
- Validation contraintes légales
- Gestion temps partiel
- Templates par pays

---

## 🏢 PHASE 5 - CONFIGURATION POSTES

### **T079-T084 - Modèles de postes** ❌

**Branch:** `feature/T079-084-shift-templates`  
**Description:** Création et gestion des postes/shifts  
**Dépendances:** T075-T078  
**Tâches:**

- Interface création postes
- Configuration horaires flexibles
- Templates réutilisables
- Gestion des compétences requises
- Duplication et modification

### **T085-T089 - Contraintes métier** ❌

**Branch:** `feature/T085-089-business-constraints`  
**Description:** Configuration des règles métier  
**Dépendances:** T079-T084  
**Tâches:**

- Jours consécutifs max
- Temps repos minimum
- Rotations obligatoires/optionnelles
- Équipes minimales par créneau

### **T090-T094 - Contraintes légales par pays** ❌

**Branch:** `feature/T090-094-legal-constraints`  
**Description:** Implémentation des règles légales  
**Dépendances:** T085-T089  
**Tâches:**

- Règles France (35h, repos dominical)
- Règles Luxembourg (40h)
- Système extensible autres pays
- Validation automatique
- Alertes non-conformité

---

## 🤖 PHASE 6 - INTÉGRATION IA

### **T095-T099 - Configuration OpenAI** ❌

**Branch:** `feature/T095-099-openai-setup`  
**Description:** Setup complet OpenAI API  
**Dépendances:** T090-T094  
**Tâches:**

- `npm install openai`
- `src/lib/ai/openai.ts`
- Gestion sécurisée des clés
- Rate limiting et coûts
- Monitoring des appels

### **T100-T105 - Moteur génération IA** ❌

**Branch:** `feature/T100-105-ai-generation-engine`  
**Description:** Moteur IA de génération de plannings  
**Dépendances:** T095-T099  
**Tâches:**

- Prompt de base optimisé
- Intégration contraintes légales
- Optimisation multi-critères
- Score qualité planning
- Apprentissage préférences

### **T106-T110 - Interface génération IA** ❌

**Branch:** `feature/T106-110-ai-generation-ui`  
**Description:** Interface utilisateur pour la génération IA  
**Dépendances:** T100-T105  
**Tâches:**

- Interface paramètres génération
- Prompts personnalisables par secteur
- Prévisualisation avec score
- Système régénération partielle
- Historique et comparaisons

### **T111-T115 - Remplacement automatique** ❌

**Branch:** `feature/T111-115-automatic-replacement`  
**Description:** Algorithme de remplacement intelligent  
**Dépendances:** T106-T110  
**Tâches:**

- Calcul remplaçants disponibles
- Vérification heures annuelles
- Respect contraintes légales
- Notifications automatiques
- Interface validation

---

## 📅 PHASE 7 - INTERFACE PLANNING

### **T116-T121 - Calendrier principal** ❌

**Branch:** `feature/T116-121-main-calendar`  
**Description:** Composant calendrier interactif  
**Dépendances:** T111-T115  
**Tâches:**

- Calendrier mensuel élégant
- Vue par employé/poste
- Codes couleur par shift
- Navigation fluide
- Animations micro-interactions

### **T122-T126 - Fonctionnalités édition** ❌

**Branch:** `feature/T122-126-calendar-editing`  
**Description:** Édition avancée du planning  
**Dépendances:** T116-T121  
**Tâches:**

- Drag & Drop modifications
- Validation temps réel contraintes
- Undo/Redo
- Sauvegarde automatique
- Conflits et alertes

### **T127-T130 - Responsive et mobile** ❌

**Branch:** `feature/T127-130-mobile-responsive`  
**Description:** Optimisation mobile complète  
**Dépendances:** T122-T126  
**Tâches:**

- Interface tactile optimisée
- Gestures mobiles
- Mode sombre/clair
- Performance mobile
- Édition rapide tactile

---

## 🏖️ PHASE 8 - GESTION CONGÉS

### **T135-T138 - Types de congés** ❌

**Branch:** `feature/T135-138-leave-types`  
**Description:** Configuration des types de congés  
**Dépendances:** T127-T130  
**Tâches:**

- Types congés (CP, RTT, maladie, etc.)
- Règles par type
- Calcul soldes automatique
- Congés exceptionnels

### **T139-T142 - Demandes de congés** ❌

**Branch:** `feature/T139-142-leave-requests`  
**Description:** Workflow complet demandes congés  
**Dépendances:** T135-T138  
**Tâches:**

- Interface demande employé
- Workflow validation hiérarchique
- Notifications automatiques
- Historique décisions

### **T143-T146 - Gestion remplacements** ❌

**Branch:** `feature/T143-146-replacement-management`  
**Description:** Système intelligent de remplacements  
**Dépendances:** T139-T142  
**Tâches:**

- Analyse compétences requises
- Proposition remplaçants IA
- Validation un clic
- Remplacements urgence

---

## 🔔 PHASE 9 - NOTIFICATIONS

### **T147-T150 - Infrastructure notifications** ❌

**Branch:** `feature/T147-150-notification-infrastructure`  
**Description:** Système de notifications temps réel  
**Dépendances:** T143-T146  
**Tâches:**

- Notifications push app
- Templates email personnalisables
- Préférences utilisateur
- Système temps réel

### **T151-T155 - Notifications automatiques** ❌

**Branch:** `feature/T151-155-auto-notifications`  
**Description:** Notifications métier automatiques  
**Dépendances:** T147-T150  
**Tâches:**

- Rappel génération planning (15j)
- Alertes conflits automatiques
- Remplacements urgents
- Résumés managers

---

## 📊 PHASE 10 - RAPPORTS

### **T160-T163 - Rapports de base** ❌

**Branch:** `feature/T160-163-basic-reports`  
**Description:** Rapports essentiels pour managers  
**Dépendances:** T151-T155  
**Tâches:**

- Heures travaillées par employé
- Conformité légale
- Statistiques congés
- Coûts personnel

### **T164-T167 - Analytics avancées** ❌

**Branch:** `feature/T164-167-advanced-analytics`  
**Description:** Dashboard analytics pour décideurs  
**Dépendances:** T160-T163  
**Tâches:**

- Dashboard managers
- KPIs performance équipe
- Prédictions charge travail
- Analyse tendances absences

### **T168-T171 - Exports et intégrations** ❌

**Branch:** `feature/T168-171-exports-integrations`  
**Description:** Exports automatiques et API  
**Dépendances:** T164-T167  
**Tâches:**

- Export PDF automatique
- Export Excel paie
- API intégrations tierces
- Envoi automatique email

---

## 🎨 PHASE 11 - UI/UX PREMIUM

### **T172-T175 - Design system avancé** ❌

**Branch:** `feature/T172-175-premium-design-system`  
**Description:** Finalisation design system premium  
**Dépendances:** T168-T171  
**Tâches:**

- Design system complet
- Animations et micro-interactions
- Thème sombre/clair final
- Accessibilité ARIA complète

### **T176-T179 - Expérience utilisateur** ❌

**Branch:** `feature/T176-179-user-experience`  
**Description:** UX optimisée pour tous les utilisateurs  
**Dépendances:** T172-T175  
**Tâches:**

- Onboarding interactif
- Aide contextuelle
- Raccourcis clavier power users
- Recherche globale intelligente

---

## ⚙️ TÂCHES TRANSVERSALES

### **Hooks personnalisés** 🔄

- `useEmployees()`, `useEmployee(id)`
- `useSchedules()`, `useScheduleGeneration()`
- `useAuth()`, `useCompany()`
- `useNotifications()`, `useReports()`

### **Types TypeScript** 🔄

- Mise à jour continue des types
- Génération automatique depuis Supabase
- Validation avec Zod

### **Tests** 🔄

- Tests unitaires composants
- Tests intégration API
- Tests E2E parcours critiques

---

## 🎯 PROCHAINES TÂCHES RECOMMANDÉES

1. **T005** - Variables environnement (15 min)
2. **T004** - Finaliser ShadCN/UI (1h)
3. **T009** - Projet Supabase (30 min)
4. **T010** - Connection Next.js (1h)
5. **T011** - Auth Supabase (2h)

**Choisis une tâche et je la développe complètement !**
