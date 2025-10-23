# E2E Tests - Planora

## Vue d'ensemble

Les tests E2E de Planora utilisent Playwright pour tester l'ensemble du parcours utilisateur, de la création de compte à l'utilisation des fonctionnalités.

**🎯 Caractéristiques principales :**

- ✅ Tests isolés et indépendants
- ✅ Nettoyage automatique après chaque exécution
- ✅ Suppression complète des données de test (DB + Auth)
- ✅ Scripts de vérification et statistiques

## Structure des tests

```
e2e/
├── auth/           # Tests d'authentification et création de compte
├── dashboard/      # Tests du tableau de bord
├── employees/      # Tests de gestion des employés
├── forms/          # Tests de validation de tous les formulaires
├── leaves/         # Tests de gestion des congés
├── onboarding/     # Tests du processus d'onboarding
├── planning/       # Tests de la planification
├── schedules/      # Tests des horaires
├── settings/       # Tests des paramètres
├── workflow/       # Tests des workflows complets
└── global-teardown.ts  # Script de nettoyage automatique
```

## Nettoyage automatique des données de test

### Fonctionnement

Après chaque exécution des tests E2E, un script de **global teardown** nettoie automatiquement toutes les données de test créées.

Le script identifie les entreprises de test par leurs noms qui contiennent :

- `Test`
- `E2E`
- `Workflow`
- `Dashboard`
- `Planning`
- `Leaves`
- `Schedule`
- `Form`
- Etc.

### Ordre de suppression

Pour respecter les contraintes de clés étrangères, les données sont supprimées dans cet ordre :

1. **Shifts** (postes de travail)
2. **Leave Requests** (demandes de congé)
3. **Schedules** (plannings)
4. **Employees** (employés)
5. **Users** (utilisateurs)
6. **Companies** (entreprises)

### Configuration

Le nettoyage automatique est configuré dans `playwright.config.ts` :

```typescript
globalTeardown: require.resolve('./e2e/global-teardown'),
```

## Nettoyage manuel

Si vous avez besoin de nettoyer manuellement les données de test (par exemple, après un échec de test) :

```bash
# Nettoyage automatique avec confirmation
npm run test:e2e:clean

# Ou directement avec tsx
npx tsx scripts/cleanTestData.ts
```

Le script manuel offre :

- ✅ Confirmation avant suppression (si exécuté manuellement)
- ✅ Rapport détaillé des suppressions
- ✅ Suppression des utilisateurs dans Supabase Auth
- ✅ Gestion des erreurs

### Option --yes

Pour forcer le nettoyage sans confirmation (utile en CI/CD) :

```bash
npx tsx scripts/cleanTestData.ts --yes
```

## Vérification du nettoyage

Pour vérifier que toutes les données de test ont bien été supprimées :

```bash
npm run test:e2e:verify
```

Ce script va :

- ✅ Analyser la base de données pour trouver des données de test restantes
- ✅ Afficher un rapport détaillé si des données restent
- ✅ Suggérer la commande de nettoyage si nécessaire

### Exemple de sortie

**Si la base est propre :**

```
🔍 Verifying E2E test data cleanup...

✅ SUCCESS: Database is clean! No test data found.
```

**Si des données restent :**

```
🔍 Verifying E2E test data cleanup...

⚠️  WARNING: Found 2 test companies remaining:

❌ Company: Test Company 1234567890 (ID: abc-123)
   - Users: 1
   - Employees: 0
   - Contracts: 0
   - Schedules: 0
   - Schedule Assignments: 0
   - Shift Templates: 0

💡 Run cleanup script to remove remaining test data:
   npm run test:e2e:clean
```

## Bonnes pratiques

### Nommage des comptes de test

Tous les tests doivent créer des comptes avec des noms contenant l'un des patterns de test :

```typescript
// ✅ Bon - sera nettoyé automatiquement
const companyName = `Test Company ${timestamp}`;
const companyName = `E2E Test ${timestamp}`;
const companyName = `Dashboard Test ${timestamp}`;

// ❌ Mauvais - ne sera pas nettoyé
const companyName = `My Company ${timestamp}`;
const companyName = `Acme Corp ${timestamp}`;
```

### Utilisation de timestamps

Utilisez toujours des timestamps pour éviter les conflits :

```typescript
const timestamp = Date.now();
const userEmail = `test${timestamp}@example.com`;
const companyName = `Test Company ${timestamp}`;
```

### Isolation des tests

Chaque test doit :

1. Créer son propre compte
2. Tester ses fonctionnalités
3. Ne pas dépendre de données créées par d'autres tests

## Exécution des tests

```bash
# Tous les tests (nettoyage automatique à la fin)
npm run test:e2e

# Interface graphique
npm run test:e2e:ui

# Mode headed (voir le navigateur)
npm run test:e2e:headed

# Mode debug
npm run test:e2e:debug

# Nettoyage manuel
npm run test:e2e:clean

# Vérifier l'état de la DB
npm run test:e2e:verify
npm run db:stats
```

## Rapports de nettoyage

Après chaque exécution, le teardown affiche un rapport :

```
🧹 Starting E2E test cleanup...
📊 Found 14 test companies to delete:
   1. Test Company 1234567890 (ID: abc-123)
   2. Dashboard Test 1234567891 (ID: def-456)
   ...

🗑️  Deleting test data...

✅ Cleanup completed successfully!
📈 Deletion summary:
   - Companies: 14
   - Users: 14
   - Employees: 28
   - Shifts: 120
   - Leave Requests: 45
   - Schedules: 10
```

## Dépannage

### Les données de test ne sont pas nettoyées

1. Vérifiez que le nom de l'entreprise contient un pattern de test
2. Vérifiez que `globalTeardown` est bien configuré dans `playwright.config.ts`
3. Exécutez le nettoyage manuel : `npm run test:e2e:clean`

### Erreurs de clés étrangères

Si vous obtenez des erreurs de contrainte de clé étrangère :

1. Vérifiez l'ordre de suppression dans `global-teardown.ts`
2. Assurez-vous que toutes les relations sont gérées

### Base de données saturée de données de test

Si la base de données contient beaucoup de données de test anciennes :

```bash
# Nettoyage complet
npm run test:e2e:clean
```

## Variables d'environnement

Pour le nettoyage des utilisateurs Supabase Auth (script manuel uniquement) :

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Maintenance

### Ajouter de nouveaux patterns de test

Si vous ajoutez de nouveaux types de tests, mettez à jour les patterns dans :

- `e2e/global-teardown.ts`
- `scripts/cleanTestData.ts`

```typescript
const testCompanyPatterns = [
  // ... patterns existants
  '%NewPattern%', // Ajouter ici
];
```
