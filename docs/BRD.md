# 📋 BRD - Business Requirements Document

## Planora - Application SaaS de Gestion des Plannings avec IA

**Version :** 1.0  
**Date :** Décembre 2024  
**Statut :** En développement

---

## 🎯 EXECUTIVE SUMMARY

### Vision du produit

**Planora automatise la création de plannings mensuels grâce à l'IA**, transformant une tâche de 4-8h en un processus de 30 secondes. L'application génère des plannings optimisés en respectant automatiquement les contraintes légales et individuelles, puis permet une modification intuitive avec validation IA en temps réel.

### Problème résolu - La douleur des managers

Chaque mois, les managers passent **4 à 8 heures** à créer manuellement des plannings en jonglant avec :

- ⚖️ **Contraintes légales** : 35h/semaine FR, repos minimum, heures sup limitées
- 📝 **Contrats individuels** : Temps plein, temps partiel, heures maximales
- 📅 **Disponibilités** : "Pas dispo mercredi", "Préfère les matins"
- 🎯 **Compétences** : "Certifié bar", "Manager de service"
- ⏰ **Heures supplémentaires** : Calcul manuel complexe et source d'erreurs
- ⚡ **Équité** : Distribution équitable de la charge entre employés

**Résultat :** Stress, erreurs coûteuses, non-conformité légale, insatisfaction employés

### Solution Planora - 3 fonctionnalités clés

#### 🤖 1. Génération Automatique par IA (30 secondes)
L'IA analyse toutes les contraintes et génère un planning mensuel complet optimisé :
- Respect 100% des contraintes légales FR/LU
- Prise en compte de tous les contrats individuels
- Respect des disponibilités et préférences
- Optimisation équité et satisfaction
- **Calcul automatique des heures supplémentaires**

#### 📅 2. Visualisation Claire et Modification Intuitive
Interface calendrier premium avec vues multiples (mois/semaine/employé) :
- Visualisation claire de tout le planning
- Modification drag & drop ultra-intuitive
- **Validation IA instantanée** lors des modifications manuelles
- Alertes visuelles si non-conforme
- Suggestions automatiques d'ajustements

#### ⏰ 3. Suivi Automatique des Heures Supplémentaires
Tracking précis et alertes intelligentes :
- Calcul automatique selon législation FR/LU
- Alertes avant dépassement de contingent
- Export Excel pour la paie
- Historique complet et rapports détaillés

---

## 📖 GLOSSAIRE - Terminologie

Pour éviter toute confusion, voici les termes clés utilisés dans Planora :

### 📅 Planning
Le **planning** est l'organisation complète du travail sur une période (semaine, mois).
- Exemple : "Le planning du mois de janvier 2025"
- Contient toutes les périodes de travail de tous les employés

### ⏰ Période de travail / Horaire / Shift
Une **période de travail** (aussi appelée "horaire" ou "shift") est une plage horaire assignée à un employé.
- Exemples : Lundi 9h-17h, Mardi 14h-22h, Mercredi Repos, Jeudi 6h-14h (Matin)
- Types courants : Matin (6h-14h), Après-midi (14h-22h), Nuit (22h-6h), Journée (9h-17h)

### 👤 Contraintes employé
Les **contraintes** sont les limitations et préférences de chaque employé :
- Contraintes légales : Contrat (35h, 40h, temps partiel), repos minimum
- Disponibilités : "Pas disponible le mercredi", "Préfère les matins"
- Compétences : "Certifié serveur bar", "Manager de service"

### ⏱️ Heures supplémentaires
Les **heures supplémentaires** sont les heures travaillées au-delà du contrat normal.
- Exemple : Employé en 35h/semaine qui travaille 40h → 5h supplémentaires
- Règles : Contingent annuel, majorations, limites légales FR/LU

---

## 🏢 CONTEXTE BUSINESS

### Marché cible

- **PME et ETI** : 50-500 employés
- **Secteurs** : Retail, Hôtellerie, Services, Santé, Industrie
- **Géographies** : France, Luxembourg (Phase 1), Europe (Phase 2)

### Modèle économique

- **SaaS B2B** : Abonnement mensuel par employé
- **Freemium** : 5 employés gratuit, fonctionnalités limitées
- **Tiers** :
  - Starter : 9€/mois pour 5-25 employés
  - Business : 15€/mois pour 26-100 employés
  - Enterprise : 25€/mois pour 100+ employés

### Concurrents

- **Directs** : When I Work, Humanity, Deputy
- **Indirects** : Excel, Google Sheets, solutions internes
- **Avantage concurrentiel** : IA OpenAI pour optimisation automatique

---

## 👥 PERSONAS & UTILISATEURS

### 1. **Marie - Manager RH** (Utilisateur principal)

- **Âge** : 35-45 ans
- **Responsabilité** : Gestion 50-200 employés
- **Pain points** :
  - Passe 6h/mois sur les plannings
  - Stress des conflits et erreurs
  - Conformité légale complexe
- **Objectifs** : Gain de temps, zéro erreur, équité

### 2. **Thomas - Directeur Général** (Décideur)

- **Âge** : 45-55 ans
- **Responsabilité** : Performance globale
- **Pain points** :
  - Coûts de non-conformité
  - Turnover lié aux plannings
  - Manque de visibilité
- **Objectifs** : ROI, conformité, satisfaction employés

### 3. **Sarah - Employée** (Utilisateur final)

- **Âge** : 25-40 ans
- **Responsabilité** : Consulter planning, demander congés
- **Pain points** :
  - Plannings changeants
  - Difficulté à échanger ses shifts
  - Manque de transparence
- **Objectifs** : Stabilité, flexibilité, communication

### 4. **Admin IT** (Utilisateur technique)

- **Âge** : 30-45 ans
- **Responsabilité** : Configuration système
- **Pain points** : Intégration complexe, maintenance
- **Objectifs** : Simplicité, sécurité, intégrations

---

## 🚀 FONCTIONNALITÉS CLÉS

### 🤖 **1. GÉNÉRATION AUTOMATIQUE PAR IA**

**Priorité : CRITIQUE**

**Description :** Moteur IA utilisant OpenAI GPT-4 pour générer des plannings optimaux

**Fonctionnalités :**

- Prompt personnalisable par secteur d'activité
- Optimisation multi-critères (coûts, équité, satisfaction)
- Apprentissage des préférences d'équipe
- Génération en moins de 30 secondes
- Score de qualité du planning généré

**Critères d'acceptation :**

- [ ] Planning généré respecte 100% des contraintes légales
- [ ] Temps de génération < 30 secondes pour 100 employés
- [ ] Score de satisfaction > 85% sur les plannings générés
- [ ] Interface de configuration du prompt accessible

### 📊 **2. GESTION DES EMPLOYÉS**

**Priorité : CRITIQUE**

**Description :** CRUD complet pour la gestion des employés avec toutes leurs informations

**Fonctionnalités :**

- Fiche employé complète (contrat, compétences, disponibilités)
- Import/export CSV pour migration de données
- Calcul automatique des heures annuelles
- Gestion des types de contrats (35h, 40h, temps partiel)
- Historique des modifications

**Critères d'acceptation :**

- [ ] Import de 1000+ employés en moins de 2 minutes
- [ ] Validation en temps réel des contraintes
- [ ] Interface responsive mobile
- [ ] Export Excel compatible paie

### 📅 **3. INTERFACE PLANNING AVANCÉE**

**Priorité : CRITIQUE**

**Description :** Calendrier interactif pour visualiser et modifier les plannings

**Fonctionnalités :**

- Vue mensuelle/hebdomadaire/par employé
- Drag & Drop pour modifications rapides
- Codes couleur par type de shift
- Validation temps réel des contraintes
- Undo/Redo pour les modifications
- Mode sombre/clair

**Critères d'acceptation :**

- [ ] Interface fluide sur mobile et desktop
- [ ] Modifications sauvegardées automatiquement
- [ ] Alertes visuelles pour les conflits
- [ ] Performance < 2s pour charger 100 employés

### 🏖️ **4. GESTION DES CONGÉS**

**Priorité : IMPORTANTE**

**Description :** Workflow complet pour les demandes et validations de congés

**Fonctionnalités :**

- Demande de congés par l'employé
- Workflow de validation hiérarchique
- Calcul automatique des soldes
- Proposition automatique de remplaçants par IA
- Notifications automatiques

**Critères d'acceptation :**

- [ ] Workflow de validation en moins de 24h
- [ ] Remplaçants proposés avec score de compatibilité
- [ ] Calcul exact des soldes selon la législation
- [ ] Interface mobile pour les demandes

### 🔐 **5. MULTI-TENANT & SÉCURITÉ**

**Priorité : CRITIQUE**

**Description :** Isolation complète des données par entreprise avec sécurité renforcée

**Fonctionnalités :**

- Row Level Security (RLS) Supabase
- Rôles granulaires (Owner, Admin, Manager, Employee, Viewer)
- Audit trail complet des actions
- Conformité RGPD
- Backup automatique
- Configuration personnalisée par entreprise
- Branding et thème personnalisable

**Critères d'acceptation :**

- [ ] Zéro fuite de données entre entreprises
- [ ] Authentification MFA optionnelle
- [ ] Logs d'audit pour toutes les actions sensibles
- [ ] Conformité RGPD 100%
- [ ] Configuration entreprise isolée et sécurisée
- [ ] Personnalisation du thème par organisation

### 📈 **6. RAPPORTS & ANALYTICS**

**Priorité : IMPORTANTE**

**Description :** Dashboard et rapports pour le pilotage RH

**Fonctionnalités :**

- Rapport heures travaillées/prévues
- Indicateurs de conformité légale
- Statistiques d'utilisation des congés
- Prédictions de charge de travail
- Export automatique pour la paie

**Critères d'acceptation :**

- [ ] Génération de rapports < 5 secondes
- [ ] Export PDF automatique
- [ ] Alertes pour non-conformité
- [ ] Dashboard temps réel

---

## ⚖️ CONTRAINTES LÉGALES

### 🇫🇷 **France**

- **Temps de travail** : 35h/semaine maximum
- **Repos quotidien** : 11h consécutives minimum
- **Repos hebdomadaire** : 35h consécutives avec dimanche
- **Heures supplémentaires** : Contingent annuel respecté
- **Congés payés** : 2.5 jours par mois travaillé

### 🇱🇺 **Luxembourg**

- **Temps de travail** : 40h/semaine maximum
- **Repos quotidien** : 11h consécutives minimum
- **Repos hebdomadaire** : 44h consécutives
- **Heures supplémentaires** : 2h/jour max, 8h/semaine max
- **Congés payés** : 25 jours minimum

### ✅ **Validation automatique**

- Vérification en temps réel avant sauvegarde
- Alertes visuelles pour les violations
- Rapport de conformité mensuel
- Mise à jour automatique des règles

---

## 🛠️ CONTRAINTES TECHNIQUES

### **Performance**

- **Temps de chargement** : < 2 secondes
- **Génération IA** : < 30 secondes pour 100 employés
- **Disponibilité** : 99.9% uptime
- **Scalabilité** : 10,000 employés par entreprise

### **Sécurité**

- **Chiffrement** : AES-256 au repos, TLS 1.3 en transit
- **Authentification** : OAuth 2.0 + MFA optionnel
- **Authorization** : RBAC avec RLS
- **Audit** : Logs complets horodatés

### **Intégrations**

- **API REST** : Documentation OpenAPI 3.0
- **Webhooks** : Événements en temps réel
- **Export** : PDF, Excel, CSV
- **Import** : CSV, Excel (template fourni)

### **Compatibilité**

- **Browsers** : Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile** : iOS 13+, Android 8+
- **Responsive** : 320px à 2560px

### **Internationalisation**

- **Langues** : Français (priorité), Anglais
- **Formats** : Date/heure localisés par pays
- **Règles légales** : Extensible pour nouveaux pays
- **Devises** : Euro (€) par défaut, extensible

---

## 📊 MÉTRIQUES DE SUCCÈS

### **KPIs Business**

- **Adoption** : 80% des utilisateurs actifs mensuellement
- **Satisfaction** : NPS > 50
- **Rétention** : Churn < 5% par mois
- **Croissance** : +20% nouveaux clients par trimestre

### **KPIs Technique**

- **Performance** : Lighthouse score > 90
- **Disponibilité** : 99.9% uptime
- **Sécurité** : 0 faille critique
- **Qualité** : 0 bug critique en production

### **KPIs Utilisateur**

- **Gain de temps** : 80% de réduction du temps de création
- **Conformité** : 100% respect des règles légales
- **Satisfaction employés** : +30% sur les plannings
- **Erreurs** : -95% d'erreurs manuelles

---

## 🎯 ROADMAP & PRIORITÉS

### **Phase 1 - MVP (16 semaines)**

- ✅ Infrastructure & Setup (2 sem)
- 🔄 Base de données & Auth (2 sem)
- ❌ CRUD Employés (2 sem)
- ❌ Générateur IA basique (4 sem)
- ❌ Interface planning (4 sem)
- ❌ Tests & Déploiement (2 sem)

### **Phase 2 - V1.0 (8 semaines)**

- Gestion des congés
- Notifications avancées
- Rapports et analytics
- UI/UX premium

### **Phase 3 - V1.1 (4+ semaines)**

- Optimisations performance
- Fonctionnalités avancées IA (prédictions, recommandations)
- API publique pour intégrations tierces
- Applications mobiles natives (iOS/Android)
- Intégrations calendriers externes (Google Calendar, Outlook)
- Marketplace de plugins et extensions

---

## 💰 BUDGET & RESSOURCES

### **Coûts de développement**

- **Développement** : 1 développeur full-stack (16 sem)
- **Infrastructure** : Vercel Pro + Supabase Pro (~200€/mois)
- **Services tiers** : OpenAI API (~500€/mois en prod)
- **Total Phase 1** : ~15,000€

### **Coûts opérationnels mensuels**

- **Hosting** : 200€/mois (Vercel + Supabase)
- **IA** : 500-2000€/mois (selon usage)
- **Monitoring** : 50€/mois (Sentry + Analytics)
- **Support** : 300€/mois (documentation, support)

### **ROI projeté**

- **Break-even** : 6 mois après lancement
- **ARR objectif Year 1** : 100,000€
- **ARR objectif Year 2** : 500,000€

---

## ✅ CRITÈRES D'ACCEPTATION GLOBAUX

### **Fonctionnel**

- [ ] Génération automatique de planning en < 30s
- [ ] 100% conformité aux règles légales FR/LU
- [ ] Interface responsive mobile + desktop
- [ ] Multi-tenant avec isolation complète
- [ ] Import/export de données massives

### **Non-fonctionnel**

- [ ] Temps de chargement < 2 secondes
- [ ] Disponibilité 99.9%
- [ ] Sécurité niveau bancaire
- [ ] Support multi-langues (FR/EN)
- [ ] Accessibilité WCAG 2.1 AA

### **Business**

- [ ] Modèle SaaS opérationnel
- [ ] Onboarding interactif utilisateur < 10 minutes
- [ ] Documentation complète (utilisateur + technique)
- [ ] Support client réactif (< 2h response)
- [ ] Conformité RGPD
- [ ] Extensibilité pour nouveaux pays/législations
- [ ] Architecture modulaire pour nouvelles fonctionnalités

---

**Ce BRD définit la vision complète de Planora. Il servira de référence tout au long du développement pour s'assurer que le produit répond aux besoins business identifiés.**
