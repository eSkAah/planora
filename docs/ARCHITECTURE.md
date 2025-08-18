# 🏗️ Architecture & Structure de Dossiers - Planora

Ce document décrit l'organisation et l'architecture du projet Planora.

## 📁 Structure de Dossiers

```
src/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Route group pour l'authentification
│   ├── dashboard/           # Tableau de bord principal
│   ├── employees/           # Gestion des employés
│   ├── schedules/           # Gestion des plannings
│   ├── settings/            # Paramètres de l'application
│   ├── admin/               # Interface d'administration
│   ├── globals.css          # Styles globaux
│   ├── layout.tsx           # Layout racine
│   └── page.tsx             # Page d'accueil
├── components/              # Composants React réutilisables
│   ├── ui/                  # Composants UI de base (ShadCN/UI)
│   ├── forms/               # Composants de formulaires
│   ├── charts/              # Composants de visualisation de données
│   ├── layout/              # Composants de mise en page
│   └── features/            # Composants métier spécifiques
├── lib/                     # Utilitaires et logique métier
│   ├── api/                 # Clients API et endpoints
│   ├── auth/                # Authentification et autorisation
│   ├── database/            # Couche base de données (Supabase)
│   ├── ai/                  # Intégration IA (OpenAI)
│   ├── utils/               # Fonctions utilitaires
│   ├── validations/         # Schémas de validation (Zod)
│   └── constants/           # Constantes et configuration
├── hooks/                   # Hooks React personnalisés
├── store/                   # Gestion d'état (Zustand + TanStack Query)
└── types/                   # Définitions TypeScript
```

## 🏛️ Principes Architecturaux

### 1. **Separation of Concerns**

- **Components** : Interface utilisateur pure
- **Lib** : Logique métier et utilitaires
- **Hooks** : Logique d'état et effets de bord
- **Store** : État global de l'application
- **Types** : Contrats de données

### 2. **Feature-Based Organization**

- Chaque fonctionnalité majeure a ses propres composants
- Réutilisation maximale des composants UI de base
- Isolation des préoccupations métier

### 3. **Layered Architecture**

```
┌─────────────────┐
│   Presentation  │ ← Components, Pages
├─────────────────┤
│    Business     │ ← Hooks, Store, Features
├─────────────────┤
│   Data Access   │ ← API, Database, External Services
├─────────────────┤
│   Infrastructure│ ← Utils, Constants, Config
└─────────────────┘
```

## 📦 Modules Principaux

### `/src/app` - Next.js App Router

- **Route Groups** : Organisation logique des routes
- **Layouts** : Mise en page par section
- **Server Components** : Rendu côté serveur
- **Client Components** : Interactivité côté client

### `/src/components` - Composants React

- **ui/** : Composants de base réutilisables (boutons, inputs, etc.)
- **forms/** : Formulaires complexes métier
- **charts/** : Visualisations de données
- **layout/** : Composants de structure (header, sidebar, etc.)
- **features/** : Composants métier spécialisés

### `/src/lib` - Logique Métier

- **api/** : Communication avec les services externes
- **auth/** : Authentification et autorisation
- **database/** : Accès aux données Supabase
- **ai/** : Intégration OpenAI pour la génération de plannings
- **validations/** : Validation des données avec Zod
- **constants/** : Configuration et constantes

### `/src/hooks` - Hooks Personnalisés

- Logique d'état réutilisable
- Intégration avec les APIs
- Gestion des effets de bord

### `/src/store` - Gestion d'État

- **Zustand** : État global léger
- **TanStack Query** : Cache et synchronisation des données
- Stores par domaine métier

### `/src/types` - Types TypeScript

- Modèles de données
- Interfaces API
- Props de composants
- Types utilitaires

## 🔄 Flux de Données

```
User Interaction → Component → Hook → Store/API → Database
                ↓
              UI Update ← State Change ← Response ← Query
```

### 1. **Lecture de Données**

```typescript
Component → useQuery (TanStack) → API Client → Supabase → Database
```

### 2. **Modification de Données**

```typescript
Component → useMutation → API Client → Validation → Supabase → Database
                                    ↓
                            Store Update → UI Refresh
```

### 3. **État Global**

```typescript
Component → Zustand Store → Persistent State → LocalStorage/SessionStorage
```

## 🎯 Conventions de Nommage

### Fichiers et Dossiers

- **kebab-case** : `employee-form.tsx`, `schedule-generator/`
- **PascalCase** : Composants React `EmployeeForm`
- **camelCase** : Fonctions et variables `getUserById`

### Composants

- **Suffixes** : `Form`, `Modal`, `Chart`, `Layout`
- **Préfixes** : `use` pour les hooks, `with` pour les HOCs

### Types

- **Interfaces** : `User`, `Employee`, `Schedule`
- **Types Union** : `UserRole`, `ScheduleStatus`
- **Props** : `ComponentNameProps`

## 🚀 Patterns de Développement

### 1. **Composition over Inheritance**

```typescript
// ✅ Bon
<EmployeeForm>
  <FormSection title="Personal Info">
    <Input name="firstName" />
    <Input name="lastName" />
  </FormSection>
</EmployeeForm>

// ❌ Éviter
<EmployeeFormWithPersonalInfo />
```

### 2. **Custom Hooks pour la Logique**

```typescript
// ✅ Bon
function useEmployees() {
  return useQuery({
    queryKey: ['employees'],
    queryFn: () => employeeApi.getAll(),
  });
}

// ❌ Éviter
function EmployeeList() {
  const [employees, setEmployees] = useState([]);
  useEffect(() => {
    // logique complexe dans le composant
  }, []);
}
```

### 3. **Validation Centralisée**

```typescript
// ✅ Bon
import { employeeSchema } from '@/lib/validations';

const form = useForm({
  schema: employeeSchema,
  // ...
});

// ❌ Éviter
// Validation inline dans chaque composant
```

## 🔒 Sécurité

### 1. **Row Level Security (RLS)**

- Isolation des données par entreprise
- Contrôle d'accès basé sur les rôles
- Validation côté serveur

### 2. **Authentification**

- Supabase Auth pour la gestion des sessions
- Middleware Next.js pour la protection des routes
- Validation des tokens JWT

### 3. **Validation des Données**

- Schémas Zod pour toutes les entrées
- Sanitisation des données utilisateur
- Validation côté client ET serveur

## 📊 Performance

### 1. **Optimisations React**

- React.memo pour les composants coûteux
- useMemo et useCallback pour les calculs
- Lazy loading des composants lourds

### 2. **Gestion des Données**

- TanStack Query pour le cache intelligent
- Pagination des listes importantes
- Optimistic updates pour l'UX

### 3. **Bundle Optimization**

- Code splitting par route
- Tree shaking automatique
- Compression des assets

## 🧪 Testing Strategy

### 1. **Tests Unitaires**

- Hooks personnalisés
- Fonctions utilitaires
- Logique métier

### 2. **Tests d'Intégration**

- Composants avec données
- Flux utilisateur complets
- API endpoints

### 3. **Tests E2E**

- Parcours utilisateur critiques
- Génération de plannings
- Processus d'authentification

## 📈 Évolutivité

### 1. **Modularité**

- Ajout facile de nouvelles fonctionnalités
- Composants réutilisables
- APIs extensibles

### 2. **Multi-tenant**

- Isolation des données par entreprise
- Configuration par organisation
- Personnalisation flexible

### 3. **Internationalisation**

- Support multi-langues prévu
- Formats de date/heure localisés
- Règles légales par pays

---

Cette architecture garantit une base solide, maintenable et évolutive pour Planora ! 🚀
