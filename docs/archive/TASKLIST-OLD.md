# Planora Tasklist – Vue Codex Structurée

## 1. Mode d'emploi

- **Cible** : Project manager + développeur senior.
- **Statuts** : `DONE`, `WIP`, `TODO`, `HOLD`.
- **Cycle de travail** : ouvrir branche `feature/<id>-slug`, livrer code + tests + docs, valider `npm run lint && npm run type-check && npm run build` avant PR.
- **Traçabilité** : toute décision ou écart doit être consigné dans `docs/`.

---

## 2. Vue d'ensemble des phases

| Phase                        | Objectif principal                          | Statut global       | Impact clé                      |
| ---------------------------- | ------------------------------------------- | ------------------- | ------------------------------- |
| A. Fondations & Tooling      | Base Next.js, tooling, design system        | Partiellement livré | Qualité du code et cohérence UI |
| B. Données & Supabase        | Schéma multi-tenant, sécurité RLS           | TODO                | Stockage et conformité          |
| C. Auth & Multi-tenant       | Auth Supabase, rôles, onboarding entreprise | TODO                | Accès sécurisé                  |
| D. Gestion Employés          | CRUD, imports, contrats, disponibilités     | TODO                | Cœur métier RH                  |
| E. Planning & Temps          | Calendrier interactif, workflow shifts      | TODO                | Expérience planning             |
| F. IA & Conformité           | Génération IA, règles légales FR/LU         | TODO                | Différenciation produit         |
| G. Congés & Remplacements    | Congés + remplaçants IA                     | TODO                | Complétude RH                   |
| H. Notifications             | Emails, in-app, temps réel, consentement    | TODO                | Engagement utilisateurs         |
| I. Analytics & Insights      | Dashboards, rapports, prédictions           | TODO                | Pilotage décisionnel            |
| J. Intégrations & Billing    | API, webhooks, calendriers, Stripe          | TODO                | Monétisation & écosystème       |
| K. UX & Internationalisation | Layout, responsive, i18n, onboarding        | TODO                | Adoption & conversion           |
| L. Qualité & Tests           | Tests unitaires → E2E, perf, sécurité       | TODO                | Fiabilité                       |
| M. Ops & Conformité          | CI/CD, monitoring, RGPD, SLA                | TODO                | Exploitation                    |
| N. Documentation & Lancement | Docs, support, go-to-market                 | TODO                | Mise sur le marché              |

---

## 3. Détails par phase

### Phase A – Fondations & Tooling (Partiellement livré)

- **Objectif** : disposer d’un socle Next.js/TypeScript, d’un design system cohérent et de scripts qualité.
- **Décisions clés** : respecter `docs/DESIGN.md`, `docs/ARCHITECTURE.md`, `docs/TYPESCRIPT.md`.

#### FND-01 – Base Next.js 15 + repo propre (DONE)

- **Livrables** : projet Next.js 15.2+, initialisation Git, architecture conforme.
- **Acceptation** : build initial OK, structure `src/` validée.

#### FND-02 – TypeScript strict (DONE)

- **Livrables** : `tsconfig.json` strict, ESLint anti-`any`, script `npm run type-check`.
- **Acceptation** : exécution sans erreur.

#### FND-03 – Tooling lint/format (DONE)

- **Livrables** : ESLint + Prettier + Husky + lint-staged.
- **Acceptation** : `npm run lint` & `npm run format:check` passent, hooks actifs.

#### FND-04 – Tailwind & tokens de base (DONE)

- **Livrables** : Tailwind v4 + Turbopack, palette alignée design.
- **Acceptation** : build OK, tokens conformes.

#### FND-05 – Design system ShadCN (DONE)

- **Livrables** : init `shadcn@latest`, composants base (button, card, input, select, textarea, table, dialog, toast, form) stylés Planora.
- **Acceptation** : exports centralisés, couleurs & radius 12-30px, hover 300ms ease-in-out, documentation d’usage.

#### FND-06 – Gestion des variables d’environnement (DONE)

- **Livrables** : `.env.local`, `.env.example`, validation runtime (Zod) couvrant Supabase/OpenAI/NextAuth/SMTP/analytics.
- **Acceptation** : démarrage bloque si variable manquante, doc alignée avec `docs/ENVIRONMENT.md`.

#### FND-07 – Module config & constantes (DONE)

- **Livrables** : `src/lib/constants/`, `src/lib/config.ts` centralisant la configuration.
- **Acceptation** : import unique des constantes, tests unitaires simples.

#### FND-08 – Gestion d’erreurs & journalisation (TODO)

- **Livrables** : logger serveur/client (pino ou wrapper), error boundaries, pages d’erreur premium.
- **Acceptation** : logs structurés, design conforme, instrumentation Sentry prête.

#### FND-09 – Scripts CI locaux (DONE)

- **Livrables** : script `npm run verify` regroupant lint/type-check/build/test.
- **Acceptation** : un seul script pour validation locale avant PR.

#### FND-10 – Sécurité baseline (TODO)

- **Livrables** : headers sécurisés, protections CSRF/CSP.
- **Acceptation** : audit OWASP basique sans criticité.

---

### Phase B – Plateforme Données & Supabase (Partiellement livré)

- **Objectif** : implémenter la couche données multi-tenant sécurisée.

- **DAT-01 – Projets Supabase (prod + sandbox)** (DONE)
  - Livrables : projet EU, clés dans `.env`, configuration Vercel.
  - Acceptation : connexion réussie depuis Next.

- **DAT-02 – Clients Supabase SSR + client** (DONE)
  - Livrables : `supabase-server.ts`, `supabase-browser.ts` typés `Database`.
  - Acceptation : utilisables dans server actions et hooks.

- **DAT-03 – Schéma relationnel complet** (DONE)
  - Livrables : migrations SQL (companies, users, employees, schedules, entries, versions, availability, time_off_requests, notifications, analytics_snapshots, audit_logs).
  - Acceptation : migrations Supabase appliquées, contraintes FK & index validés.

- **DAT-04 – Politiques RLS multi-rôle** (DONE)
  - Livrables : politiques owner/admin/manager/employee/viewer par table.
  - Acceptation : tests automatisés garantissant isolation par company.

- **DAT-05 – Seeds & fixtures multi-tenant** (DONE)
  - Livrables : script Supabase CLI (2 entreprises, 30 employés).
  - Acceptation : données prêtes pour démos et tests.

- **DAT-06 – Gestion migrations & génération types** (DONE)
  - Livrables : intégration Supabase CLI, script `supabase gen types`.
  - Acceptation : `src/types/supabase.ts` toujours synchronisé.

- **DAT-07 – Triggers & audit**
  - Livrables : triggers `updated_at`, audit_logs, agrégats heures.
  - Acceptation : audit trail automatique, analytics rapides.

- **DAT-08 – Optimisations performance**
  - Livrables : index ciblés, vues materialisées, quotas.
  - Acceptation : requêtes critiques <100ms.

---

### Phase C – Authentification & Multi-tenant (Partiellement livré)

- **Objectif** : sécuriser l’accès, gérer les rôles et l’onboarding entreprise.

- **AUTH-01 – Intégration Supabase Auth** (DONE)
  - Livrables : sessions SSR/CSR, helpers auth, cookies sécurisés.
  - Acceptation : login persistant, state partagé.

- **AUTH-02 – Pages auth premium** (DONE)
  - Livrables : pages login/register/forgot/reset dans `(auth)` respectant design.
  - Acceptation : responsive, CTA jaune, FR/EN.

- **AUTH-03 – Middleware & guards** (DONE)
  - Livrables : `src/middleware.ts`, hooks d’autorisation.
  - Acceptation : redirections rôle → dashboard approprié.

- **AUTH-04 – Onboarding Owner & création entreprise**
  - Livrables : wizard post-inscription (infos société, pays, règles).
  - Acceptation : tenant complet après onboarding.

- **AUTH-05 – Invitations & gestion des rôles**
  - Livrables : flux invitation email, acceptation, changement rôle.
  - Acceptation : historique invitations, aucune élévation illégitime.

- **AUTH-06 – Paramètres entreprise & personnalisation**
  - Livrables : page `/settings` (fuseau, horaires, couleurs limitées, logos).
  - Acceptation : paramètres isolés par tenant, respect design.

- **AUTH-07 – MFA & sécurité avancée (HOLD)**
  - Livrables : décision sur TOTP/passkeys, implémentation si validée.
  - Acceptation : décision documentée.

- **AUTH-08 – Interface audit trail**
  - Livrables : vue admin audit_logs (filtres entité/action/utilisateur).
  - Acceptation : recherche <1s, historique complet.

- **AUTH-09 – Tests isolation multi-tenant**
  - Livrables : tests unitaires & E2E sur RLS et API.
  - Acceptation : fuite inter-entreprise détectée immédiatement.

---

### Phase D – Gestion Employés (TODO)

- **Objectif** : fournir l’ensemble des fonctionnalités RH décrites dans le BRD.

- **EMP-01 – API/actions CRUD employés**
  - Livrables : server actions/API sécurisées, validations Zod.
  - Acceptation : tests unitaires, RLS respecté.

- **EMP-02 – Interfaces manager employés**
  - Livrables : pages listing, détail, création, édition, historique.
  - Acceptation : UI premium, responsive, accessibilité clavier.

- **EMP-03 – Import/Export employés**
  - Livrables : upload CSV/Excel avec mapping, export Excel & PDF.
  - Acceptation : import 1000 employés <2 min, retours d’erreur précis.

- **EMP-04 – Gestion types de contrats**
  - Livrables : module `contract_types`, liaison employés.
  - Acceptation : règles 35h/40h appliquées.

- **EMP-05 – Compétences & certifications**
  - Livrables : tags compétences, rappels expiration.
  - Acceptation : filtrage planning par compétences.

- **EMP-06 – Disponibilités & préférences**
  - Livrables : UI drag & drop hebdomadaire + exceptions.
  - Acceptation : stockage structuré, conflits signalés.

- **EMP-07 – Recherche & filtres avancés**
  - Livrables : recherche globale, filtres multi-critères, export filtré.
  - Acceptation : réponse <500ms sur dataset seed.

---

### Phase E – Planning & Temps de travail (TODO)

- **Objectif** : offrir une interface planning performante et conforme légalement.

- **SCHED-01 – Modèles de shifts**
  - Livrables : CRUD `shift_templates`, preview visuelle.
  - Acceptation : validations Zod, tests unitaires.

- **SCHED-02 – Calendrier interactif**
  - Livrables : calendrier (hebdo/mensuel/employé) managers & employés.
  - Acceptation : chargement <2s pour 100 employés, mobile friendly.

- **SCHED-03 – Drag & drop + conflits temps réel**
  - Livrables : interactions shifts, calcul repos & conformité instantané.
  - Acceptation : alertes visuelles, blocage des sauvegardes si violation.

- **SCHED-04 – Versioning & publication**
  - Livrables : statuts brouillon→publié, diff entre versions, rollback.
  - Acceptation : historique complet, logs audit.

- **SCHED-05 – Workflow échange de shifts**
  - Livrables : demande employé, validation manager, notifications.
  - Acceptation : compatibilité compétences respectée.

- **SCHED-06 – Suivi heures sup & limites**
  - Livrables : calcul heures/semaine/mois, alertes dépassements.
  - Acceptation : conformité 35h/40h, rapports précis.

---

### Phase F – IA & Conformité (TODO)

- **Objectif** : générer des plannings optimisés tout en garantissant la conformité légale.

- **AI-01 – Configuration OpenAI**
  - Livrables : SDK, client partagé, paramètre `OPENAI_MODEL`.
  - Acceptation : secret géré, client réutilisable.

- **AI-02 – Prompt engineering sectoriel**
  - Livrables : prompts par secteur (Retail, Hôtellerie, Santé, Industrie).
  - Acceptation : personnalisation UI, versionnement.

- **AI-03 – Service génération planning**
  - Livrables : route `POST /api/ai/generate-schedule`, queue si nécessaire.
  - Acceptation : génération <30s pour 100 employés, logs détaillés.

- **AI-04 – Score qualité & feedback**
  - Livrables : score >85%, collecte feedback manager.
  - Acceptation : feedback stocké et exploité pour amélioration.

- **AI-05 – Monitoring coûts IA**
  - Livrables : dashboard usage, alertes budget.
  - Acceptation : alertes avant dépassement, suivi journalier.

- **COM-01 – Moteur règles légales FR/LU**
  - Livrables : catalogue règles par pays, versionnées.
  - Acceptation : validation 100% contraintes, tests unitaires.

- **COM-02 – Validation temps réel**
  - Livrables : service côté serveur utilisé par employees/planning.
  - Acceptation : messages précis, blocage si non-conformité.

- **COM-03 – Rapports conformité mensuels**
  - Livrables : PDF/Excel, historique violations.
  - Acceptation : génération <5s, distribution managers.

- **COM-04 – Framework extension pays**
  - Livrables : doc + architecture pour nouveaux pays.
  - Acceptation : ajout d’un pays en <1 sprint documenté.

---

### Phase G – Congés & Remplacements (TODO)

- **Objectif** : gérer congés et remplacements avec assistance IA.

- **LEAVE-01 – Demande de congés employé**
  - Livrables : formulaire mobile-friendly, pièces jointes.
  - Acceptation : demande en <3 clics, validations claires.

- **LEAVE-02 – Workflow d’approbation**
  - Livrables : chaîne manager→RH, SLA 24h, notifications.
  - Acceptation : historique décisions, respect SLA.

- **LEAVE-03 – Calcul soldes & accrual**
  - Livrables : accrual FR (2.5j/mois), LU (25j/an), RTT.
  - Acceptation : soldes exacts après import historique.

- **LEAVE-04 – Suggestions remplaçants IA**
  - Livrables : score compatibilité (disponibilités + compétences).
  - Acceptation : top 3 proposés en <5s.

---

### Phase H – Notifications & Communication (TODO)

- **Objectif** : informer utilisateurs via email, in-app, temps réel.

- **NOT-01 – Infrastructure email**
  - Livrables : provider SMTP/Resend, templates premium.
  - Acceptation : SPF/DKIM validés, emails brandés.

- **NOT-02 – Centre notifications in-app**
  - Livrables : toasts, panneau historique, catégories.
  - Acceptation : état lu/non-lu persistant.

- **NOT-03 – Temps réel & synchro**
  - Livrables : Supabase Realtime ou Pusher, canaux multi-tenant.
  - Acceptation : updates instantanées planning/congés/shifts.

- **NOT-04 – Préférences & consentement**
  - Livrables : page paramètres par canal, stockage RGPD.
  - Acceptation : opt-in/out respecté, audit consentement.

- **NOT-05 – Templates métier**
  - Livrables : notifications planning publié, conflit, congé, swap, rappels.
  - Acceptation : couverture 100% scénarios BRD.

---

### Phase I – Analytics & Insights (TODO)

- **Objectif** : fournir KPIs managers, rapports et prédictions.

- **AN-01 – Dashboard manager**
  - Livrables : KPIs heures planifiées/réalisées, conformité, satisfaction.
  - Acceptation : chargement <2s, données temps réel.

- **AN-02 – Rapports opérationnels**
  - Livrables : heures par employé, dépassements, congés, coûts.
  - Acceptation : export PDF/Excel <5s, filtres période.

- **AN-03 – Prédictions charge & tendances**
  - Livrables : modèle saisonnalité + historique.
  - Acceptation : projection 4 semaines, visualisation claire.

- **AN-04 – Instrumentation produit & KPIs business**
  - Livrables : tracking adoption, churn, temps generation IA, NPS.
  - Acceptation : dashboard interne partagé, seuils alertes.

---

### Phase J – Intégrations & Billing (TODO)

- **Objectif** : ouvrir la plateforme et activer la monétisation.

- **INT-01 – API publique REST**
  - Livrables : endpoints sécurisés, tokens service, spec OpenAPI 3.0.
  - Acceptation : documentation exploitable, tests intégration.

- **INT-02 – Webhooks événementiels**
  - Livrables : webhooks planning/congé/swap, UI configuration, signatures HMAC.
  - Acceptation : retries gérés, journal des livraisons.

- **INT-03 – Synchronisation calendriers externes**
  - Livrables : OAuth Google & Outlook, export ICS.
  - Acceptation : synchronisation quotidienne fiable.

- **INT-04 – Exports paie & RH**
  - Livrables : templates CSV/Excel (PayFit, ADP), automatisation.
  - Acceptation : validation comptable, conformité légale.

- **INT-05 – Connecteurs Slack/Teams (HOLD)**
  - Livrables : étude besoin roadmap V1.1.
  - Acceptation : décision documentée.

- **BILL-01 – Facturation Stripe**
  - Livrables : plans Freemium/Starter/Business/Enterprise, facturation par employé.
  - Acceptation : paiements test réussis, limites respectées.

- **BILL-02 – Gestion freemium & upsell**
  - Livrables : feature flags par plan, upgrade/downgrade, trial.
  - Acceptation : restrictions appliquées, conversion mesurée.

---

### Phase K – UX & Internationalisation (TODO)

- **Objectif** : maximiser adoption et cohérence UI.

- **UX-01 – Design tokens & documentation**
  - Livrables : tokens couleur/typo/espacement centralisés, documentation mise à jour.
  - Acceptation : réutilisation 100%, cohérence UI.

- **UX-02 – Layout application & navigation**
  - Livrables : sidebar rétractable, header, breadcrumbs.
  - Acceptation : max 3 clics vers features clés, animations 300ms.

- **UX-03 – Responsive & mobile-first**
  - Livrables : breakpoints 320–2560px, gestuelle mobile.
  - Acceptation : tests Safari iOS + Chrome Android validés.

- **UX-04 – Site marketing & pages publiques**
  - Livrables : landing hero, features, pricing, FAQ, CTA essais.
  - Acceptation : design premium, Lighthouse >90.

- **UX-05 – Micro-interactions & animations**
  - Livrables : hover, transitions sidebar, scroll doux.
  - Acceptation : animations 300ms, fluides.

- **UX-06 – Accessibilité WCAG 2.1 AA**
  - Livrables : focus visible, contrastes, navigation clavier.
  - Acceptation : audit axe sans erreur grave, checklist AA signée.

- **UX-07 – Internationalisation FR/EN**
  - Livrables : `next-intl` (ou équivalent), traductions marketing + app.
  - Acceptation : détection langue, formats locaux.

- **UX-08 – Onboarding interactif & aide**
  - Livrables : checklist <10 min, bulles d’aide, centre d’aide intégré.
  - Acceptation : taux complétion >80%.

- **GOV-01 – Harmonisation doc design vs produit**
  - Livrables : décision sur dark mode vs design guidelines, doc mise à jour.
  - Acceptation : alignement clair, docs synchronisées.

---

### Phase L – Qualité & Tests (TODO)

- **Objectif** : garantir la fiabilité de bout en bout.

- **QA-01 – Tests unitaires** : Vitest/Jest sur utils, hooks, services (couverture >70%).
- **QA-02 – Tests intégration** : API, components, validations (mocks Supabase via MSW).
- **QA-03 – Tests E2E** : Playwright/Cypress (auth, CRUD, IA, planning, congés).
- **QA-04 – Tests performance** : bench 100 employés (chargement <2s, génération IA <30s).
- **QA-05 – Tests sécurité** : audit OWASP, scan dépendances, pentest ciblé.
- **QA-06 – Audit accessibilité** : rapport axe, corrections, validation AA.

---

### Phase M – Ops & Conformité (TODO)

- **Objectif** : industrialiser le déploiement et assurer conformité légale.

- **OPS-01 – Pipeline CI/CD GitHub Actions** : build/lint/tests sur PR, déploiement Vercel (preview + prod).
- **OPS-02 – Monitoring & alerting** : Sentry, analytics, traçage request-id.
- **OPS-03 – Journalisation structurée** : logger JSON, corrélation requêtes.
- **OPS-04 – Sauvegardes & reprise** : backups automatiques Supabase, tests restauration (RPO <1h).
- **OPS-05 – Pilotage coûts** : dashboards OpenAI/Supabase, alertes budget.
- **OPS-06 – Conformité RGPD** : DPA, registre traitements, droit à l’oubli, anonymisation.
- **OPS-07 – SLA & support** : process support <2h, outil ticketing, escalade incidents.

---

### Phase N – Documentation & Lancement (TODO)

- **Objectif** : préparer l’adoption externe et interne.

- **DOC-01 – Documentation technique** : guide onboarding dev, architecture, conventions commit.
- **DOC-02 – Guides utilisateur** : tutoriels manager/employé, vidéos, FAQ.
- **DOC-03 – Documentation API** : portail Swagger/OpenAPI, exemples TS/Python.
- **DOC-04 – Base de connaissances support** : articles résolution, checklist RGPD.
- **DOC-05 – Changelog & release notes** : process release, communication clients.
- **LAUNCH-01 – Programme beta & feedback** : pilotes, boucle feedback (Notion/Linear).
- **LAUNCH-02 – Go-to-market plan** : stratégie marketing, contenu blog, campagnes.
- **LAUNCH-03 – Onboarding customer success** : playbook, checklists kickoff.
- **LAUNCH-04 – Boucle amélioration continue** : NPS trimestriel, roadmap publique.

---

## 4. Rappels transverses

- Toujours exécuter `npm run lint`, `npm run type-check`, `npm run build` avant PR.
- Synchroniser les types Supabase après chaque migration (`supabase gen types ...`).
- Respecter strictement `docs/DESIGN.md`, `docs/ARCHITECTURE.md`, `docs/TYPESCRIPT.md`.
- Documenter toute décision majeure ou déviation par rapport au BRD.
