# 🗺️ ROADMAP EXÉCUTABLE - PLANORA

## Application SaaS de Gestion des Plannings avec IA

**État actuel :** Phase 1 partiellement complétée (T001-T008 ✅)
**Prochaine étape :** Finalisation infrastructure + ShadCN/UI

---

## 📋 LÉGENDE DES STATUTS

- ✅ **TERMINÉ** - Tâche complétée et fonctionnelle
- 🟡 **EN COURS** - Partiellement implémenté, à finaliser
- ❌ **À FAIRE** - Pas encore commencé
- 🔄 **DÉPENDANCE** - Attend une autre tâche

---

## 🏗️ PHASE 1 - INFRASTRUCTURE (SUITE)

### 1.1 État actuel des tâches infrastructures

- ✅ **T001** - Next.js 15.2.3+ avec TypeScript _(complété)_
- ✅ **T002** - ESLint + Prettier + Husky _(complété)_
- ✅ **T003** - Tailwind CSS configuré _(complété)_
- 🟡 **T004** - ShadCN/UI structure créée, composants à implémenter
- ❌ **T005** - Variables d'environnement (.env)
- ✅ **T006** - Structure dossiers _(complété)_
- ✅ **T007** - TypeScript strict _(complété)_
- ✅ **T008** - Git + .gitignore _(complété)_

### 1.2 Tâches immédiates à exécuter

**T005 - Configuration variables d'environnement**

```bash
# Créer les fichiers d'environnement
touch .env.local .env.example

# Variables nécessaires:
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY
# - SUPABASE_SERVICE_ROLE_KEY
# - OPENAI_API_KEY
# - NEXT_PUBLIC_APP_URL
```

**T004 - Finaliser ShadCN/UI**

```bash
# Installer ShadCN/UI CLI
npx shadcn@latest init

# Installer composants de base nécessaires
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add input
npx shadcn@latest add label
npx shadcn@latest add select
npx shadcn@latest add textarea
npx shadcn@latest add table
npx shadcn@latest add dialog
npx shadcn@latest add toast
npx shadcn@latest add form
```

---

## 🗄️ PHASE 2 - SUPABASE & BASE DE DONNÉES

### 2.1 Configuration Supabase

**T009 - Créer projet Supabase**

- Aller sur supabase.com
- Créer nouveau projet "planora-prod"
- Noter les clés API dans .env.local
- Configurer région (Europe pour RGPD)

**T010 - Connection Next.js ↔ Supabase**

```bash
npm install @supabase/supabase-js @supabase/ssr
```

Créer `src/lib/database/supabase.ts` :

```typescript
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```

**T011 - Setup authentification Supabase**

```bash
npm install @supabase/auth-ui-react @supabase/auth-ui-shared
```

### 2.2 Schéma de base de données (SQL à exécuter)

**T021-T034 - Création tables principales**

Exécuter dans l'éditeur SQL Supabase :

```sql
-- Extension UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table companies (multi-tenant)
CREATE TABLE companies (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR NOT NULL,
  country VARCHAR DEFAULT 'FR',
  industry VARCHAR,
  size VARCHAR,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Table users (avec rôles)
CREATE TABLE users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  first_name VARCHAR NOT NULL,
  last_name VARCHAR NOT NULL,
  role VARCHAR CHECK (role IN ('owner', 'admin', 'manager', 'employee', 'viewer')),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  avatar_url VARCHAR,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Table contract_types
CREATE TABLE contract_types (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR NOT NULL,
  weekly_hours INTEGER NOT NULL,
  max_daily_hours INTEGER DEFAULT 8,
  max_consecutive_days INTEGER DEFAULT 6,
  min_rest_hours INTEGER DEFAULT 11,
  is_part_time BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Table employees
CREATE TABLE employees (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  employee_number VARCHAR,
  first_name VARCHAR NOT NULL,
  last_name VARCHAR NOT NULL,
  email VARCHAR,
  phone VARCHAR,
  hire_date DATE NOT NULL,
  contract_type_id UUID REFERENCES contract_types(id),
  department VARCHAR,
  position VARCHAR,
  skills TEXT[],
  availability_preferences JSONB DEFAULT '{}',
  annual_hours_target INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Table shift_templates
CREATE TABLE shift_templates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  break_duration INTEGER DEFAULT 0,
  color VARCHAR DEFAULT '#3B82F6',
  required_skills TEXT[],
  min_employees INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- RLS (Row Level Security)
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE shift_templates ENABLE ROW LEVEL SECURITY;

-- Politiques RLS de base
CREATE POLICY "Users can only see their company data" ON companies
  FOR ALL USING (id IN (
    SELECT company_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Users can only access their company users" ON users
  FOR ALL USING (company_id IN (
    SELECT company_id FROM users WHERE id = auth.uid()
  ));
```

---

## 🔐 PHASE 3 - AUTHENTIFICATION

### 3.1 Middleware et protection des routes

**T046 - Middleware Next.js**

Créer `src/middleware.ts` :

```typescript
import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Logique de protection des routes
  // Redirection selon authentification
}
```

**T047 - Pages authentification**

Structure à créer :

- `src/app/(auth)/login/page.tsx`
- `src/app/(auth)/register/page.tsx`
- `src/app/(auth)/forgot-password/page.tsx`

---

## 📊 PHASE 4 - INTERFACES CRUD

### 4.1 Interface employés

**T061-T067 - CRUD Employés complet**

Composants à créer :

- `src/app/employees/page.tsx` (listing)
- `src/app/employees/new/page.tsx` (création)
- `src/app/employees/[id]/page.tsx` (détail)
- `src/app/employees/[id]/edit/page.tsx` (modification)

Hooks personnalisés :

- `src/hooks/useEmployees.ts`
- `src/hooks/useEmployee.ts`

---

## 🤖 PHASE 5 - INTÉGRATION IA

### 5.1 Setup OpenAI

**T095-T099 - Configuration OpenAI**

```bash
npm install openai
```

Créer `src/lib/ai/openai.ts` :

```typescript
import OpenAI from 'openai';

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
```

**T100-T105 - Moteur de génération planning**

Créer API route :

- `src/app/api/ai/generate-schedule/route.ts`

---

## 📅 PHASE 6 - INTERFACE PLANNING

### 6.1 Calendrier principal

**T116-T121 - Composant calendrier**

Installer dépendance calendrier :

```bash
npm install @tanstack/react-table date-fns
```

Composants à créer :

- `src/components/charts/schedule-calendar.tsx`
- `src/app/schedules/page.tsx`

---

## 🚦 ORDRE D'EXÉCUTION RECOMMANDÉ

### Phase Immédiate (Sprint 1-2)

1. **T005** - Variables environnement
2. **T004** - Finaliser ShadCN/UI
3. **T009-T011** - Setup Supabase
4. **T021-T034** - Schéma base de données
5. **T040-T043** - RLS et sécurité

### Phase Authentification (Sprint 3)

6. **T044-T050** - Système auth complet
7. **T051-T056** - Multi-tenant
8. **T046** - Middleware protection

### Phase CRUD (Sprint 4-5)

9. **T061-T067** - Interface employés
10. **T075-T078** - Types de contrats
11. **T079-T084** - Configuration postes

### Phase IA (Sprint 6-7)

12. **T095-T105** - Intégration OpenAI
13. **T100-T115** - Moteur génération

### Phase Interface (Sprint 8-9)

14. **T116-T134** - Calendrier et planning

---

## 📋 CHECKLIST AVANT CHAQUE PHASE

Avant de commencer une phase :

- [ ] Vérifier que `npm run build` passe
- [ ] Vérifier que `npm run type-check` passe
- [ ] Vérifier que `npm run lint` passe
- [ ] Tester les fonctionnalités existantes
- [ ] Backup base de données si applicable

---

## 🎯 DÉFINITION OF DONE

Pour qu'une tâche soit considérée comme terminée :

1. ✅ **Code implémenté** selon les spécifications
2. ✅ **Types TypeScript** définis et corrects
3. ✅ **Tests unitaires** si applicable
4. ✅ **Documentation** mise à jour
5. ✅ **Build** passe sans erreur
6. ✅ **Linting** sans warning
7. ✅ **Fonctionnalité testée** manuellement
8. ✅ **Commit** avec message clair

---

**Prochaine action recommandée :** Commencer par T005 (variables environnement) puis T004 (finaliser ShadCN/UI)
