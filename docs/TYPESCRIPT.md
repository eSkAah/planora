# 🔷 Configuration TypeScript - Planora

Ce document décrit la configuration TypeScript stricte et les bonnes pratiques pour le projet Planora.

## 📋 Configuration Stricte

### Flags Activés

Notre `tsconfig.json` active tous les flags de vérification stricte :

```json
{
  "strict": true,
  "noImplicitAny": true,
  "strictNullChecks": true,
  "strictFunctionTypes": true,
  "strictBindCallApply": true,
  "strictPropertyInitialization": true,
  "noImplicitThis": true,
  "alwaysStrict": true,
  "noUnusedLocals": true,
  "noUnusedParameters": true,
  "exactOptionalPropertyTypes": true,
  "noImplicitReturns": true,
  "noFallthroughCasesInSwitch": true,
  "noUncheckedIndexedAccess": true,
  "noImplicitOverride": true
}
```

### Bénéfices

- **Sécurité** : Détection d'erreurs à la compilation
- **Maintenabilité** : Code plus prévisible et documenté
- **Performance** : Optimisations du compilateur
- **DX** : Meilleure auto-complétion et refactoring

## 🏗️ Architecture des Types

### Structure des Fichiers

```
src/types/
├── global.d.ts      # Types globaux et utilitaires
├── database.ts      # Entités de base de données
├── api.ts          # Types API et requêtes
└── index.ts        # Exports centralisés
```

### Types Globaux

```typescript
// Disponibles partout sans import
type UserRole = 'admin' | 'manager' | 'employee';
type LoadingState = 'idle' | 'loading' | 'success' | 'error';
type ThemeMode = 'light' | 'dark' | 'system';

// Types utilitaires
type DeepPartial<T> = { [P in keyof T]?: DeepPartial<T[P]> };
type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;
```

### Types de Base de Données

```typescript
interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
}

interface User extends BaseEntity {
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  company_id: string;
}
```

### Types API

```typescript
interface ApiResponse<T = any> {
  data: T;
  success: boolean;
  message?: string;
}

interface PaginatedResponse<T = any> {
  data: T[];
  pagination: {
    page: number;
    total: number;
    // ...
  };
}
```

## 🎯 Bonnes Pratiques

### 1. **Typage Strict des Props**

```typescript
// ✅ Bon - Props explicites
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'danger';
  size: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
  children: ReactNode;
}

function Button({ variant, size, disabled, onClick, children }: ButtonProps) {
  // ...
}

// ❌ Éviter - Props trop génériques
function Button(props: any) {
  // ...
}
```

### 2. **Union Types pour les États**

```typescript
// ✅ Bon - États explicites
type LoadingState = 'idle' | 'loading' | 'success' | 'error';

interface ComponentState {
  status: LoadingState;
  data: User | null;
  error: string | null;
}

// ❌ Éviter - Booléens multiples
interface ComponentState {
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  // Peut créer des états incohérents
}
```

### 3. **Génériques pour la Réutilisabilité**

```typescript
// ✅ Bon - Hook générique
function useApi<T>(endpoint: string): {
  data: T | null;
  loading: boolean;
  error: string | null;
} {
  // ...
}

// Usage typé
const { data, loading, error } = useApi<User[]>('/api/users');
// data est automatiquement typé comme User[] | null
```

### 4. **Validation avec Zod + TypeScript**

```typescript
import { z } from 'zod';

// Schéma Zod
const userSchema = z.object({
  email: z.string().email(),
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  role: z.enum(['admin', 'manager', 'employee']),
});

// Type automatique depuis le schéma
type User = z.infer<typeof userSchema>;

// Validation runtime + types compile-time
function createUser(data: unknown): User {
  return userSchema.parse(data);
}
```

### 5. **Typage des Hooks**

```typescript
// ✅ Bon - Hook typé
function useEmployees(): {
  employees: Employee[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
} {
  // ...
}

// ✅ Bon - Hook générique
function useResource<T>(
  key: string,
  fetcher: () => Promise<T>
): {
  data: T | null;
  loading: boolean;
  error: string | null;
} {
  // ...
}
```

### 6. **Types pour les Formulaires**

```typescript
// ✅ Bon - Types de formulaire stricts
interface EmployeeFormData {
  first_name: string;
  last_name: string;
  email: string;
  hire_date: string;
  contract_type_id: string;
}

interface EmployeeFormErrors {
  first_name?: string;
  last_name?: string;
  email?: string;
  hire_date?: string;
  contract_type_id?: string;
}

interface EmployeeFormState {
  data: EmployeeFormData;
  errors: EmployeeFormErrors;
  isSubmitting: boolean;
  isValid: boolean;
}
```

## 🚫 Anti-Patterns à Éviter

### 1. **Éviter `any`**

```typescript
// ❌ Éviter
function processData(data: any): any {
  return data.someProperty;
}

// ✅ Bon
function processData<T extends { someProperty: unknown }>(
  data: T
): T['someProperty'] {
  return data.someProperty;
}
```

### 2. **Éviter les Assertions de Type**

```typescript
// ❌ Éviter
const user = data as User;

// ✅ Bon - Validation runtime
function isUser(data: unknown): data is User {
  return (
    typeof data === 'object' &&
    data !== null &&
    'email' in data &&
    'first_name' in data
  );
}

if (isUser(data)) {
  // data est maintenant typé comme User
  console.log(data.email);
}
```

### 3. **Éviter les Types Trop Larges**

```typescript
// ❌ Éviter
interface ComponentProps {
  data: object;
  callback: Function;
}

// ✅ Bon
interface ComponentProps {
  data: { id: string; name: string };
  callback: (id: string) => void;
}
```

## 🔧 Outils et Scripts

### Scripts NPM

```bash
# Vérification des types
npm run type-check

# Build avec vérification
npm run build

# Lint avec types
npm run lint
```

### Configuration ESLint

```json
{
  "@typescript-eslint/no-explicit-any": "error",
  "@typescript-eslint/no-unused-vars": "error",
  "@typescript-eslint/prefer-nullish-coalescing": "error",
  "@typescript-eslint/prefer-optional-chain": "error"
}
```

### Configuration VS Code

```json
{
  "typescript.preferences.strictFunctionTypes": true,
  "typescript.preferences.strictNullChecks": true,
  "typescript.preferences.noImplicitAny": true
}
```

## 🎯 Workflow de Développement

### 1. **Développement Incrémental**

1. Écrire les types d'abord
2. Implémenter la logique
3. Vérifier avec `npm run type-check`
4. Tester le comportement

### 2. **Refactoring Sécurisé**

1. Modifier les types
2. Laisser TypeScript identifier les impacts
3. Corriger les erreurs de compilation
4. Valider les tests

### 3. **Ajout de Nouvelles Features**

1. Définir les types dans `/src/types/`
2. Créer les schémas Zod si nécessaire
3. Implémenter avec types stricts
4. Documenter les API publiques

## 📚 Ressources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [TypeScript Do's and Don'ts](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)
- [Zod Documentation](https://zod.dev/)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)

---

Cette configuration TypeScript garantit un code robuste, maintenable et sûr pour Planora ! 🚀
